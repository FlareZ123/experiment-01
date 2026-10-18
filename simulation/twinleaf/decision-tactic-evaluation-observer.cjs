'use strict';

const path=require('node:path');
const {sourceZoneSnapshot,zoneSnapshotDigest}=
  require('./source-zone-checkpoint.cjs');

/**
 * Read-only, synchronous trace of one real SimpleTacticsAi decision's score
 * candidate calculations and final validity checks. Every original method is
 * called exactly once; this observer never constructs a Simulator on its own.
 *
 * @param {Function} BotClass Pinned SimpleTacticsAi class or test constructor.
 * @param {Function} TacticClass Pinned SimpleTactic base or test constructor.
 * @param {number} targetOrdinal Positive ordinal across bot calls.
 * @returns {{report:object,restore:()=>void}}
 */
function observeOneDecisionTacticEvaluations(
  BotClass,TacticClass,targetOrdinal
) {
  if(!Number.isSafeInteger(targetOrdinal)||targetOrdinal<1) {
    throw new RangeError('Decision ordinal must be a positive safe integer');
  }
  const bot=BotClass.prototype,tactic=TacticClass.prototype;
  const originalDecision=Object.getOwnPropertyDescriptor(bot,'decodeNextAction');
  const originalEvaluate=Object.getOwnPropertyDescriptor(tactic,'evaluateAction');
  const originalValid=Object.getOwnPropertyDescriptor(bot,'isValidAction');
  const originalScore=Object.getOwnPropertyDescriptor(tactic,'getStateScore');
  if(typeof originalDecision?.value!=='function'||
     typeof originalEvaluate?.value!=='function'||
     typeof originalValid?.value!=='function'||
     typeof originalScore?.value!=='function') {
    throw new TypeError('Expected pinned bot/tactic method descriptors');
  }
  let active=false,ordinal=0;
  const report={
    protocol:'source-ranked-single-decision-tactic-evaluation-v1',
    requestedOrdinal:targetOrdinal,
    decisionsObserved:0,
    selectedDecision:null
  };
  /** @param {object} action @param {object} state */
  function actionEvidence(action,state) {
    const cards=state.players[state.activePlayer]?.hand?.cards||[];
    return {
      action:action?.constructor?.name??'<undefined>',
      name:action?.name??null,
      handIndex:Number.isInteger(action?.handIndex)?action.handIndex:null,
      handPrinting:Number.isInteger(action?.handIndex)?
        cards[action.handIndex]?.fullName??null:null,
      playerId:action?.playerId??null
    };
  }
  function scored(state,playerId,action,passTurnScore) {
    const score=originalEvaluate.value.call(this,state,playerId,action,passTurnScore);
    if(active)report.selectedDecision.evaluations.push({
      tactic:this.constructor.name,
      action:actionEvidence(action,state),
      score:score??null,
      passTurnScore:passTurnScore??null
    });
    return score;
  }
  function baseScore(state,playerId) {
    const score=originalScore.value.call(this,state,playerId);
    if(active)report.selectedDecision.baseScores.push({
      tactic:this.constructor.name,score
    });
    return score;
  }
  function valid(state,action) {
    const accepted=originalValid.value.call(this,state,action);
    if(active)report.selectedDecision.validations.push({
      action:actionEvidence(action,state),accepted
    });
    return accepted;
  }
  function observed(state) {
    const index=++ordinal;
    if(index!==targetOrdinal)return originalDecision.value.call(this,state);
    if(active)throw new Error('Nested target bot decision');
    const snapshot=sourceZoneSnapshot(state);
    report.selectedDecision={
      index,turn:state.turn,actorSeat:state.activePlayer,
      predecisionZoneDigest:zoneSnapshotDigest(snapshot),
      ownHand:state.players[state.activePlayer].hand.cards.map(c=>c.fullName),
      ownActive:state.players[state.activePlayer].active.getPokemonCard()?.fullName??null,
      ownEnergy:state.players[state.activePlayer].active.energies.cards.map(c=>c.fullName),
      evaluations:[],baseScores:[],validations:[],selected:null
    };
    active=true;
    try {
      const result=originalDecision.value.call(this,state);
      report.selectedDecision.selected=actionEvidence(result,state);
      return result;
    } finally {active=false;}
  }
  Object.defineProperty(bot,'decodeNextAction',{
    ...originalDecision,value:observed
  });
  Object.defineProperty(bot,'isValidAction',{...originalValid,value:valid});
  Object.defineProperty(tactic,'evaluateAction',{
    ...originalEvaluate,value:scored
  });
  Object.defineProperty(tactic,'getStateScore',{
    ...originalScore,value:baseScore
  });
  return {
    report,
    restore(){
      if(bot.decodeNextAction!==observed||bot.isValidAction!==valid||
         tactic.evaluateAction!==scored||tactic.getStateScore!==baseScore){
        throw new Error('Tactic observer lost method ownership');
      }
      Object.defineProperty(bot,'decodeNextAction',originalDecision);
      Object.defineProperty(bot,'isValidAction',originalValid);
      Object.defineProperty(tactic,'evaluateAction',originalEvaluate);
      Object.defineProperty(tactic,'getStateScore',originalScore);
      report.decisionsObserved=ordinal;
    }
  };
}

/** @param {number} targetOrdinal */
function installPinnedTacticEvaluationObserver(targetOrdinal) {
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(root,'simple-bot/simple-tactics-ai'));
  const {SimpleTactic}=require(path.join(root,'simple-bot/simple-tactics/simple-tactics'));
  return observeOneDecisionTacticEvaluations(SimpleTacticsAi,SimpleTactic,targetOrdinal);
}

module.exports={
  observeOneDecisionTacticEvaluations,installPinnedTacticEvaluationObserver
};
