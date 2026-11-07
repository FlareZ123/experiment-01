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
 * @param {boolean} [options.paperGameTie] A separately proved simultaneous paper tie during the end-call sequence
 * @returns {object}
 */
function adjudicateAtPrescribedEnd({
  stage,prizesRemaining,secondPlayerTurnFinished,paperGameWinner=null,paperGameTie=false
}) {
  const rules=stageRules(stage);
  checkPrizes(prizesRemaining);
  assert.ok(typeof secondPlayerTurnFinished==='boolean');
  assert.ok(paperGameWinner===null||paperGameWinner===0||paperGameWinner===1);
  assert.ok(typeof paperGameTie==='boolean');
  assert.ok(!(paperGameTie&&paperGameWinner!==null),'A simultaneous tie cannot have a unique normal winner');
  const base={schema:VERSION,stage,clockLimitMinutes:rules.minutes,
    observation:'conditional-on-real-end-call-and-valid-paper-state',
    evidenceRequired:[
      'official end-call point and elapsed match-clock provenance',
      'real first-player identity, call-turn owner, and permitted turn completion',
      'final second-starting-player turn ended before its Pokemon Checkup',
      'independently paper-validated normal win, Prizes and rule effects'
    ],competitiveAdmission:false,externalIndependentReviewRequired:true};
  if(paperGameTie)
    return {...base,status:rules.elimination?'TIEBREAKER_REQUIRED_SIX_PRIZE':'SWISS_BOTH_LOSE',
      conditionalWinnerSeat:null,tieResolvedByClockRules:!rules.elimination};
  if(paperGameWinner!==null)
    return {...base,status:'NORMAL_PAPER_GAME_WIN',
      conditionalWinnerSeat:paperGameWinner};
  if(prizesRemaining.includes(0))
    return {...base,status:'PAPER_OUTCOME_CONFLICT_ZERO_PRIZE',
      conditionalWinnerSeat:null,
      missing:['independent-normal-win-or-simultaneous-tie-ruling']};
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
 * @param {boolean} [options.paperGameTie]
 * @returns {object}
 */
function adjudicateExtension({
  extensionRule,prizesRemaining,paperGameWinner=null,paperGameTie=false
}) {
  assert.ok(extensionRule==='tied-low'||extensionRule==='both-high');
  checkPrizes(prizesRemaining);
  assert.ok(paperGameWinner===null||paperGameWinner===0||paperGameWinner===1);
  assert.ok(typeof paperGameTie==='boolean');
  assert.ok(!(paperGameTie&&paperGameWinner!==null),'A simultaneous tie cannot have a unique normal winner');
  const result={schema:VERSION,extensionRule,
    evaluation:'requires-complete-ordered-paper-state-transition-ledger',
    conditionalWinnerSeat:null,competitiveAdmission:false};
  if(paperGameTie)
    return {...result,status:'TIEBREAKER_REQUIRED_SIX_PRIZE',
      conditionalWinnerSeat:null};
  if(paperGameWinner!==null)
    return {...result,status:'NORMAL_PAPER_GAME_WIN',
      conditionalWinnerSeat:paperGameWinner};
  if(prizesRemaining.includes(0))
    return {...result,status:'PAPER_OUTCOME_CONFLICT_ZERO_PRIZE',
      conditionalWinnerSeat:null};
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
/**
 * Classify a six-Prize knockout tiebreaker after independent paper outcome review.
 * A simultaneous paper tie requires a fresh tiebreaker; equal Prize counts alone
 * cannot establish that a tiebreaker game is still in progress.
 *
 * @param {[number,number]} prizesRemaining
 * @param {{paperGameWinner?: 0|1|null, paperGameTie?: boolean}} [paperOutcome]
 * @returns {object}
 */
function classifyTiebreaker(prizesRemaining, {paperGameWinner=null,paperGameTie=false}={}) {
  checkPrizes(prizesRemaining);
  assert.ok(paperGameWinner===null||paperGameWinner===0||paperGameWinner===1,
    'Expected a paper-validated tiebreaker winner seat');
  assert.ok(typeof paperGameTie==='boolean','Expected a paper tie boolean');
  assert.ok(!(paperGameTie&&paperGameWinner!==null),
    'A simultaneous tie cannot have a unique normal winner');
  const [a,b]=prizesRemaining;
  const base={schema:VERSION,startingPrizeCount:6,conditionalWinnerSeat:null,
    competitiveAdmission:false,requireCompletePaperAndClockReview:true};
  if(paperGameTie)
    return {...base,status:'TIEBREAKER_RESTART_REQUIRED_SIX_PRIZE'};
  if(paperGameWinner!==null)
    return {...base,status:'TIEBREAKER_NORMAL_PAPER_GAME_WIN',conditionalWinnerSeat:paperGameWinner};
  if(a===0||b===0)
    return {...base,status:'TIEBREAKER_PAPER_OUTCOME_REVIEW_REQUIRED',
      missing:['independent-normal-win-or-simultaneous-tie-ruling']};
  return {...base,status:a===b?'TIEBREAKER_CONTINUES':'TIEBREAKER_PRIZE_LEAD',
    conditionalWinnerSeat:a===b?null:a<b?0:1};
}


/**
 * Fail-closed evidence-shape gate for the event-specific classifier.
 * The fields are externally supplied claims and need independent source review.
 * No self-asserted boolean or receipt string certifies a paper match by itself.
 *
 * @param {object} packet
 * @returns {object}
 */
function auditTimeCallPacket(packet) {
  assert.ok(packet && typeof packet === 'object');
  const turns=requiredTurnsAfterCall({stage:packet.stage,
    firstPlayerSeat:packet.firstPlayerSeat,
    turnOwnerWhenCalled:packet.turnOwnerWhenCalled});
  const missing=[];
  const nonempty=x=>typeof x==='string'&&x.trim().length>0;
  if(packet.officialEndCallObserved!==true)
    missing.push('official-end-call-not-observed');
  if(!nonempty(packet.officialClockEvidenceRef))
    missing.push('official-clock-source-not-cited');
  if(!nonempty(packet.firstPlayerEvidenceRef))
    missing.push('original-first-player-source-missing');
  if(!nonempty(packet.turnOwnerWhenCalledEvidenceRef))
    missing.push('end-call-turn-owner-source-missing');
  if(!nonempty(packet.turnSequenceEvidenceRef))
    missing.push('final-turn-sequence-source-missing');
  if(!nonempty(packet.independentPaperStateEvidenceRef))
    missing.push('independent-paper-state-source-missing');
  if(packet.paperStateIndependentlyReviewed!==true)
    missing.push('paper-state-independent-review-pending');
  checkPrizes(packet.prizesRemaining);
  const winner=packet.paperGameWinner??null;
  const tie=packet.paperGameTie??false;
  assert.ok(winner===null||winner===0||winner===1);
  assert.ok(typeof tie==='boolean');
  assert.ok(!(tie&&winner!==null),'A simultaneous tie cannot have a unique normal winner');
  // A verified ordinary game win or genuine simultaneous tie ends overtime.
  if(winner===null&&!tie){
    if(packet.finalPermittedTurnFinished!==true)
      missing.push('prescribed-second-starting-player-turn-unfinished');
    if(packet.observedFinalTurnSeat!==turns.lastTurnSeat)
      missing.push('final-turn-custody-not-second-starting-player');
    if(packet.observedExtraSecondTurns!==turns.additionalSecondPlayerTurns)
      missing.push('additional-second-player-turn-count-mismatch');
    if(packet.trailingPokemonCheckupWasExcluded!==true)
      missing.push('trailing-pokemon-checkup-must-be-excluded');
  }
  if(missing.length)return {schema:VERSION,status:'INSUFFICIENT_OFFICIAL_TIME_EVIDENCE',
    missing,stage:packet.stage,clockLimitMinutes:turns.clockLimitMinutes,
    conditionalWinnerSeat:null,competitiveAdmission:false,
    externalIndependentReviewRequired:true};
  const result=adjudicateAtPrescribedEnd({stage:packet.stage,
    prizesRemaining:packet.prizesRemaining,
    secondPlayerTurnFinished:packet.finalPermittedTurnFinished===true,
    paperGameWinner:winner,paperGameTie:tie});
  return {...result,
    officialEndCallEvidenceShapeComplete:true,
    evidenceFieldsRemainExternallyAsserted:true,
    competitiveAdmission:false,externalIndependentReviewRequired:true};
}


/**
 * Check the ordered shape of an independently reviewed Aichi knockout extension ledger.
 * The reviewer must attest that every relevant transition is present. This helper
 * checks sequence continuity and applies the entry-defined rule at each supplied state;
 * it cannot authenticate the source or prove that an omitted transition does not exist.
 *
 * @param {object} packet
 * @param {object} packet.timeCallPacket
 * @param {string} packet.extensionLedgerEvidenceRef
 * @param {boolean} packet.extensionLedgerIndependentlyReviewed
 * @param {Array<{sequence:number,beforePrizes:[number,number],afterPrizes:[number,number],transitionEvidenceRef:string,paperGameWinner?:0|1|null,paperGameTie?:boolean}>} packet.transitions
 * @returns {object}
 */
function auditExtensionLedger(packet) {
  assert.ok(packet&&typeof packet==='object');
  assert.ok(packet.timeCallPacket&&typeof packet.timeCallPacket==='object');
  const timeCall=auditTimeCallPacket(packet.timeCallPacket);
  const base={schema:VERSION,stage:packet.timeCallPacket.stage,
    competitiveAdmission:false,externalIndependentReviewRequired:true,
    evidenceFieldsRemainExternallyAsserted:true};
  if(timeCall.status==='INSUFFICIENT_OFFICIAL_TIME_EVIDENCE')
    return {...base,status:'INSUFFICIENT_OFFICIAL_TIME_EVIDENCE',
      missing:timeCall.missing};
  if(timeCall.status==='PAPER_OUTCOME_CONFLICT_ZERO_PRIZE')
    return {...base,status:'EXTENSION_LEDGER_BLOCKED_BY_PAPER_OUTCOME_CONFLICT',
      timeCallStatus:timeCall.status};
  if(timeCall.extensionRule!=='tied-low'&&timeCall.extensionRule!=='both-high')
    return {...base,status:'EXTENSION_LEDGER_NOT_REQUIRED',
      timeCallStatus:timeCall.status};
  const missing=[];
  const nonempty=x=>typeof x==='string'&&x.trim().length>0;
  if(!nonempty(packet.extensionLedgerEvidenceRef))
    missing.push('extension-ledger-source-not-cited');
  if(packet.extensionLedgerIndependentlyReviewed!==true)
    missing.push('extension-ledger-independent-review-pending');
  if(!Array.isArray(packet.transitions)||packet.transitions.length===0)
    missing.push('extension-transition-ledger-empty');
  if(missing.length)
    return {...base,status:'INSUFFICIENT_EXTENSION_LEDGER_EVIDENCE',
      extensionRule:timeCall.extensionRule,missing};
  const validPrizes=p=>Array.isArray(p)&&p.length===2&&
    p.every(n=>Number.isInteger(n)&&n>=0&&n<=6);
  const samePrizes=(a,b)=>a[0]===b[0]&&a[1]===b[1];
  let previous=packet.timeCallPacket.prizesRemaining;
  for(let i=0;i<packet.transitions.length;i++) {
    const transition=packet.transitions[i];
    if(!transition||typeof transition!=='object'||
       transition.sequence!==i+1||
       !validPrizes(transition.beforePrizes)||
       !validPrizes(transition.afterPrizes)||
       !samePrizes(transition.beforePrizes,previous)) {
      return {...base,status:'INVALID_EXTENSION_LEDGER_SHAPE',
        extensionRule:timeCall.extensionRule,
        missing:['extension-transition-sequence-or-prize-chain-invalid'],
        failedSequence:i+1};
    }
    if(!nonempty(transition.transitionEvidenceRef))
      return {...base,status:'INSUFFICIENT_EXTENSION_LEDGER_EVIDENCE',
        extensionRule:timeCall.extensionRule,
        missing:['extension-transition-source-not-cited'],
        failedSequence:i+1};
    const paperGameWinner=transition.paperGameWinner??null;
    const paperGameTie=transition.paperGameTie??false;
    if((paperGameWinner!==null&&paperGameWinner!==0&&paperGameWinner!==1)||
       typeof paperGameTie!=='boolean'||
       (paperGameTie&&paperGameWinner!==null)) {
      return {...base,status:'INVALID_EXTENSION_LEDGER_SHAPE',
        extensionRule:timeCall.extensionRule,
        missing:['extension-paper-outcome-invalid'],
        failedSequence:i+1};
    }
    const result=adjudicateExtension({extensionRule:timeCall.extensionRule,
      prizesRemaining:transition.afterPrizes,paperGameWinner,paperGameTie});
    if(result.status==='PAPER_OUTCOME_CONFLICT_ZERO_PRIZE')
      return {...base,status:'EXTENSION_LEDGER_ZERO_PRIZE_WITHOUT_PAPER_OUTCOME',
        extensionRule:timeCall.extensionRule,failedSequence:i+1,
        missing:['independent-normal-win-or-simultaneous-tie-ruling']};
    if(result.status!=='EXTENSION_CONTINUES') {
      if(i!==packet.transitions.length-1)
        return {...base,status:'EXTENSION_LEDGER_POST_TERMINAL_TRANSITION',
          extensionRule:timeCall.extensionRule,terminalSequence:i+1,
          extraTransitions:packet.transitions.length-i-1,
          conditionalWinnerSeat:null};
      return {...base,status:'EXTENSION_LEDGER_TERMINAL',
        extensionRule:timeCall.extensionRule,terminalStatus:result.status,
        terminalSequence:i+1,conditionalWinnerSeat:result.conditionalWinnerSeat,
        requiresSixPrizeTiebreaker:result.status==='TIEBREAKER_REQUIRED_SIX_PRIZE',
        extensionLedgerShapeComplete:true};
    }
    previous=transition.afterPrizes;
  }
  return {...base,status:'EXTENSION_LEDGER_INCOMPLETE',
    extensionRule:timeCall.extensionRule,lastSequence:packet.transitions.length,
    lastPrizes:previous,conditionalWinnerSeat:null,
    extensionLedgerShapeComplete:true};
}

module.exports={VERSION,STAGES,stageRules,requiredTurnsAfterCall,
  adjudicateAtPrescribedEnd,adjudicateExtension,classifyTiebreaker,auditTimeCallPacket,auditExtensionLedger};
