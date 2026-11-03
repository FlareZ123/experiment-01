'use strict';
const assert = require('node:assert/strict');

const OFFICIAL_SOURCE = 'https://www.pokemon-card.com/info/005445.html';
const STAGES = Object.freeze({
  'open-swiss': Object.freeze({minutes:25,cut:false}),
  'open-top32': Object.freeze({minutes:25,cut:true}),
  'open-final': Object.freeze({minutes:35,cut:true})
});

/** Official Aichi 2026 Open League stage; a match clock cannot be simulated by action count. */
function stageRules(stage) {
  assert.ok(Object.hasOwn(STAGES,stage), `Unknown Aichi Open stage: ${stage}`);
  return STAGES[stage];
}

/** The second player's last turn must finish; no later Pokemon Checkup occurs. */
function timeCall(stage, actorIsFirstPlayer) {
  const rules=stageRules(stage);
  assert.equal(typeof actorIsFirstPlayer,'boolean');
  return {
    status:'CONTINUE_TO_SECOND_PLAYER_TURN_END',
    stage,regulationMinutes:rules.minutes,
    nextRequiredTurn:actorIsFirstPlayer?'SECOND_PLAYER_ADDITIONAL_TURN':
      'COMPLETE_CURRENT_SECOND_PLAYER_TURN',
    pokemonCheckupAfterFinalTurn:false,
    cannotInferWinnerAtCall:true
  };
}

function prizes(first,second) {
  assert.ok(Number.isInteger(first)&&first>=1&&first<=6,'Invalid first-player remaining prizes');
  assert.ok(Number.isInteger(second)&&second>=1&&second<=6,'Invalid second-player remaining prizes');
}
function standardOutcome(outcome) {
  assert.ok([null,'first','second','tie'].includes(outcome),
    'Unknown standard game outcome');
}

/**
 * Apply the official Open League rules after the *second player's* final
 * regulation turn. A separate clock model is responsible for when this runs.
 */
function regulationDecision(stage, first, second, normalResult=null) {
  const rules=stageRules(stage);
  standardOutcome(normalResult);
  if(normalResult==='first'||normalResult==='second')
    return {status:'WINNER',winner:normalResult,reason:'NORMAL_GAME_CONDITION'};
  if(normalResult==='tie')
    return rules.cut?
      {status:'NEW_SIX_PRIZE_TIEBREAKER',reason:'ORDINARY_TIED_GAME'}:
      {status:'SWISS_TIE_NEEDS_SEPARATE_RULING',reason:'ORDINARY_TIED_GAME'};
  prizes(first,second);
  if(!rules.cut)return {status:'BOTH_LOSE',reason:'SWISS_TIME_WITHOUT_WINNER'};
  if(first<=2||second<=2) {
    if(first!==second)return {status:'WINNER',winner:first<second?'first':'second',
      reason:'TOP32_CUTOFF_FEWER_PRIZES_TO_WIN'};
    return {status:'OVERTIME',mode:'FIRST_PRIZE_LEAD',
      reason:'TOP32_CUTOFF_EQUAL_PRIZES_TWO_OR_LESS'};
  }
  return {status:'OVERTIME',mode:'REACH_TWO_AND_LEAD',
    reason:'TOP32_CUTOFF_BOTH_AT_LEAST_THREE'};
}

/** Apply the *registered* overtime branch, after any single game-state update. */
function overtimeDecision(mode,first,second,normalResult=null) {
  assert.ok(mode==='FIRST_PRIZE_LEAD'||mode==='REACH_TWO_AND_LEAD');
  standardOutcome(normalResult);
  if(normalResult==='first'||normalResult==='second')
    return {status:'WINNER',winner:normalResult,reason:'NORMAL_GAME_CONDITION'};
  if(normalResult==='tie')
    return {status:'NEW_SIX_PRIZE_TIEBREAKER',reason:'ORDINARY_TIED_GAME'};
  prizes(first,second);
  if(first===second)return {status:'CONTINUE_OVERTIME',mode};
  const earlier=first<second?'first':'second';
  if(mode==='FIRST_PRIZE_LEAD'||Math.min(first,second)<=2)
    return {status:'WINNER',winner:earlier,
      reason:mode==='FIRST_PRIZE_LEAD'?'OVERTIME_FIRST_PRIZE_LEAD':
        'OVERTIME_REACHED_TWO_WITH_LEAD'};
  return {status:'CONTINUE_OVERTIME',mode};
}

module.exports={OFFICIAL_SOURCE,STAGES,stageRules,timeCall,
  regulationDecision,overtimeDecision};
