'use strict';

const assert = require('node:assert/strict');

/**
 * Source: official Pokémon Card Game 2026 CL Aichi (May), OPEN LEAGUE,
 * https://www.pokemon-card.com/info/005445.html
 *
 * This is a read-only conditional adjudication model. It neither measures
 * elapsed physical match time nor establishes paper game correctness.
 */
const VERSION = 'agent27-2026-aichi-open-official-time-v1';
const STAGES = Object.freeze({
  'open-swiss': Object.freeze({minutes:25, elimination:false}),
  'open-top32': Object.freeze({minutes:25, elimination:true}),
  'open-final': Object.freeze({minutes:35, elimination:true})
});

/** @param {string} stage */
function stageRules(stage) {
  assert.ok(Object.hasOwn(STAGES, stage), 'Unknown Aichi Open event stage');
  return {stage, ...STAGES[stage], source:
    'https://www.pokemon-card.com/info/005445.html', schema:VERSION};
}

/**
 * After the official end call, finish through the second-starting player's
 * current/next turn. Exclude Pokémon Checkup after that final second turn.
 * No three-extra-turn Play! Pokemon rule is imported from other regions.
 *
 * @param {object} options
 * @param {string} options.stage
 * @param {0|1} options.firstPlayerSeat
 * @param {0|1} options.turnOwnerWhenCalled
 * @returns {object}
 */
function requiredTurnsAfterCall({stage,firstPlayerSeat,turnOwnerWhenCalled}) {
  const rules=stageRules(stage);
  assert.ok(firstPlayerSeat===0||firstPlayerSeat===1);
  assert.ok(turnOwnerWhenCalled===0||turnOwnerWhenCalled===1);
  const secondPlayerSeat=1-firstPlayerSeat;
  const needExtraSecondTurn=turnOwnerWhenCalled===firstPlayerSeat;
  return {
    schema:VERSION,stage,clockLimitMinutes:rules.minutes,
    firstPlayerSeat,secondPlayerSeat,turnOwnerWhenCalled,
    finishCurrentTurn:true,
    additionalSecondPlayerTurns:needExtraSecondTurn?1:0,
    lastTurnSeat:secondPlayerSeat,
    applyPokemonCheckupAfterLastTurn:false,
    postCallRequiredObservation:needExtraSecondTurn?
      'finish-current-first-player-turn-then-second-player-turn':
      'finish-current-second-player-turn',
    qualifyingGameEvidence:false
  };
}

/** @param {unknown} prizes */
function checkPrizes(prizes) {
  assert.ok(Array.isArray(prizes)&&prizes.length===2,
    'Both physical seats must have remaining Prize counts');
  assert.ok(prizes.every(p=>Number.isSafeInteger(p)&&p>=0&&p<=6),
    'Expected each player to have 0 through 6 remaining Prizes');
}

/**
 * Conditional result after real 2026 Aichi Open end call AND after finishing
 * the second-starting player's final prescribed turn, before its Checkup.
 * Independent reviewer must supply trustworthy paper state and actual clock.
 *
 * @param {object} options
 * @param {string} options.stage
 * @param {[number,number]} options.prizesRemaining
 * @param {boolean} options.secondPlayerTurnFinished
 * @param {0|1|null} [options.paperGameWinner] A separately proved normal win
 * @returns {object}
 */
function adjudicateAtPrescribedEnd({
  stage,prizesRemaining,secondPlayerTurnFinished,paperGameWinner=null
}) {
  const rules=stageRules(stage);
  checkPrizes(prizesRemaining);
  assert.ok(typeof secondPlayerTurnFinished==='boolean');
  assert.ok(paperGameWinner===null||paperGameWinner===0||paperGameWinner===1);
  const base={schema:VERSION,stage,clockLimitMinutes:rules.minutes,
    observation:'conditional-on-real-end-call-and-valid-paper-state',
    evidenceRequired:[
      'official end-call point and elapsed match-clock provenance',
      'real first-player identity, call-turn owner, and permitted turn completion',
      'final second-starting-player turn ended before its Pokemon Checkup',
      'independently paper-validated normal win, Prizes and rule effects'
    ],competitiveAdmission:false,externalIndependentReviewRequired:true};
  if(paperGameWinner!==null)
    return {...base,status:'NORMAL_PAPER_GAME_WIN',
      conditionalWinnerSeat:paperGameWinner};
  if(!secondPlayerTurnFinished)
    return {...base,status:'AWAITING_PRESCRIBED_SECOND_TURN',
      conditionalWinnerSeat:null};
  if(!rules.elimination)
    return {...base,status:'SWISS_BOTH_LOSE',
      conditionalWinnerSeat:null};
  const [a,b]=prizesRemaining;
  if(Math.min(a,b)<=2) {
    if(a<b)return {...base,status:'ELIMINATION_PRIZE_LEAD',
      conditionalWinnerSeat:0};
    if(b<a)return {...base,status:'ELIMINATION_PRIZE_LEAD',
      conditionalWinnerSeat:1};
    return {...base,status:'EXTENSION_REQUIRED_TIED_LOW',
      conditionalWinnerSeat:null,extensionRule:'tied-low'};
  }
  return {...base,status:'EXTENSION_REQUIRED_BOTH_HIGH',
    conditionalWinnerSeat:null,extensionRule:'both-high'};
}

/**
 * At each continuously audited state transition in an Aichi Top32 extension,
 * check the *entry-defined* condition. Caller is responsible for recording all
 * intervening relevant states; a selected late snapshot is not enough.
 *
 * @param {object} options
 * @param {'tied-low'|'both-high'} options.extensionRule
 * @param {[number,number]} options.prizesRemaining
 * @param {0|1|null} [options.paperGameWinner]
 * @returns {object}
 */
function adjudicateExtension({
  extensionRule,prizesRemaining,paperGameWinner=null
}) {
  assert.ok(extensionRule==='tied-low'||extensionRule==='both-high');
  checkPrizes(prizesRemaining);
  assert.ok(paperGameWinner===null||paperGameWinner===0||paperGameWinner===1);
  const result={schema:VERSION,extensionRule,
    evaluation:'requires-complete-ordered-paper-state-transition-ledger',
    conditionalWinnerSeat:null,competitiveAdmission:false};
  if(paperGameWinner!==null)
    return {...result,status:'NORMAL_PAPER_GAME_WIN',
      conditionalWinnerSeat:paperGameWinner};
  const [a,b]=prizesRemaining;
  if(extensionRule==='tied-low') {
    if(a<b)return {...result,status:'EXTENSION_WIN',
      conditionalWinnerSeat:0};
    if(b<a)return {...result,status:'EXTENSION_WIN',
      conditionalWinnerSeat:1};
  } else {
    if(a<=2&&a<b)return {...result,status:'EXTENSION_WIN',
      conditionalWinnerSeat:0};
    if(b<=2&&b<a)return {...result,status:'EXTENSION_WIN',
      conditionalWinnerSeat:1};
  }
  return {...result,status:'EXTENSION_CONTINUES'};
}

/**
 * Independently paper-declared tied knockout games use six-Prize tiebreakers.
 * As soon as either player has fewer Prizes remaining, the tiebreaker winner
 * is provisionally that seat, subject to prior normal win conditions.
 *
 * @param {[number,number]} prizesRemaining
 * @returns {object}
 */
function classifyTiebreaker(prizesRemaining) {
  checkPrizes(prizesRemaining);
  const [a,b]=prizesRemaining;
  return {schema:VERSION,startingPrizeCount:6,
    status:a===b?'TIEBREAKER_CONTINUES':'TIEBREAKER_PRIZE_LEAD',
    conditionalWinnerSeat:a===b?null:a<b?0:1,
    competitiveAdmission:false,
    requireCompletePaperAndClockReview:true};
}

module.exports={VERSION,STAGES,stageRules,requiredTurnsAfterCall,
  adjudicateAtPrescribedEnd,adjudicateExtension,classifyTiebreaker};
