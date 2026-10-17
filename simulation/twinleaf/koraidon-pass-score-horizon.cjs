'use strict';

const assert=require('node:assert/strict');
const {observableState,hash}=require('./source-state-continuity.cjs');

/**
 * Evaluate the normally implicit PassTurnAction at the same source-dealt
 * Koraidon decision as the printed Retribution Strike score. This captures a
 * missing option in the upstream tactic's score comparison. The selected
 * original action is always returned unchanged.
 *
 * The extra speculative evaluation may consume policy RNG or, in the pinned
 * Simulator profile, mutate the physical source State. Both limitations are
 * reported rather than calling this instrumentation noninterfering.
 *
 * @template T
 * @param {{Store:Function,AttackTactic:Function,PassTurnAction:Function}} types
 * @param {()=>T} work
 * @returns {{result:T,observations:object[]}}
 */
function withKoraidonPassScore(types,work) {
  const {Store,AttackTactic,PassTurnAction}=types;
  const storeDesc=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const tacticDesc=Object.getOwnPropertyDescriptor(AttackTactic.prototype,'useTactic');
  assert.equal(typeof storeDesc?.value,'function');
  assert.equal(typeof tacticDesc?.value,'function');
  let root=null;
  const observations=[];
  const dispatch=function(...args) {
    if(root===null && args[0]?.constructor?.name==='AddPlayerAction') root=this;
    return storeDesc.value.apply(this,args);
  };
  const tactic=function(state,player) {
    const action=tacticDesc.value.call(this,state,player);
    if(!root || state!==root.state || state.turn!==5 ||
       player.active.getPokemonCard()?.fullName!=='Koraidon ex TEF' ||
       !player.active.energies.cards.some(c=>c.fullName==='Double Dragon Energy ROS')) {
      return action;
    }
    const start=observableState(state);
    const initialScore=this.getStateScore(state,player.id);
    const hypotheticalScore=this.evaluateAction(state,player.id,
      new PassTurnAction(player.id));
    const finish=observableState(state);
    observations.push({
      turn:state.turn,actorId:player.id,originalAction:action?.constructor?.name||'implicit-pass',
      attackSelectionThreshold:initialScore-this.options.scores.tactics.attackBonus,
      immediateScore:initialScore,hypotheticalEndTurnPassScore:hypotheticalScore??null,
      liveStateChangedDuringProbe:hash(start)!==hash(finish)
    });
    return action;
  };
  Object.defineProperty(Store.prototype,'dispatch',{...storeDesc,value:dispatch});
  Object.defineProperty(AttackTactic.prototype,'useTactic',{...tacticDesc,value:tactic});
  let result;
  try {result=work();}
  finally {
    Object.defineProperty(AttackTactic.prototype,'useTactic',tacticDesc);
    Object.defineProperty(Store.prototype,'dispatch',storeDesc);
  }
  return {result,observations};
}
module.exports={withKoraidonPassScore};
