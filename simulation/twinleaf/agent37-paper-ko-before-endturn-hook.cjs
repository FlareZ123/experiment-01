'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent37-paper-ko-before-e21-endturn-v1';
const PINNED='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(BASE,name));

/**
 * Reversible research-owned guard around actual pinned Store.reduceEffect.
 * Attack KO, Prize and promotion are completed through native checkState
 * (including its async prompt continuations) before the EndTurnEffect that
 * activates Powerglass. Terminal KOs suppress optional end-turn processing.
 *
 * The intervention is scoped to attacks: unsuccessful attack-cancel cases
 * that end a turn without entering ATTACK retain native behavior. It is
 * an exploratory paper-order fix, not a certified global engine patch.
 *
 * @template T
 * @param {()=>T} execute Synchronous native workload that settles its prompts.
 * @returns {{result:T,audit:object}}
 */
function withPaperKoBeforeEndTurn(execute){
  assert.equal(typeof execute,'function');
  const {Store}=native('game/store/store');
  const {EndTurnEffect}=native('game/store/effects/game-phase-effects');
  const {GamePhase}=native('game/store/state/state');
  const {checkState}=native('game/store/effect-reducers/check-effect');
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'reduceEffect');
  assert.equal(typeof descriptor?.value,'function');
  const original=descriptor.value;
  const audit={
    version:VERSION,pinnedTwinleaf:PINNED,attackEndTurnIntercepts:0,
    checkedCallbacks:0,terminalEndTurnsSuppressed:0,
    completedAttackEndTurns:0,callbackBeforeReturn:0,
    originalStoreMethodRestored:false,competitiveGamesQualified:0,
    trace:[]
  };
  /** @this {any} @param {any} state @param {any} effect */
  function paperReduceEffect(state,effect){
    if(effect instanceof EndTurnEffect && state.phase===GamePhase.ATTACK){
      const store=this;
      audit.attackEndTurnIntercepts++;
      audit.trace.push({
        when:'begin-KO-before-endturn',phase:state.phase,
        pending:state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name),
        actorActive:effect.player.active.getPokemonCard()?.fullName??null,
        otherActive:state.players.find(p=>p!==effect.player)?.active
          .getPokemonCard()?.fullName??null
      });
      let didReturn=false;
      const result=checkState(store,state,()=>{
        audit.checkedCallbacks++;
        audit.trace.push({
          when:'after-KO-before-endturn',phase:state.phase,
          pending:state.prompts.filter(p=>p.result===undefined)
            .map(p=>p.constructor.name),
          actorPrizes:effect.player.prizes.filter(p=>p.cards.length>0).length,
          otherActive:state.players.find(p=>p!==effect.player)?.active
            .getPokemonCard()?.fullName??null
        });
        if(!didReturn)audit.callbackBeforeReturn++;
        if(state.phase===GamePhase.FINISHED){
          audit.terminalEndTurnsSuppressed++;
          return;
        }
        audit.completedAttackEndTurns++;
        original.call(store,state,effect);
      });
      didReturn=true;
      audit.trace.push({
        when:'returned-preKO-check',phase:state.phase,
        pending:state.prompts.filter(p=>p.result===undefined)
          .map(p=>p.constructor.name)
      });
      return result;
    }
    return original.call(this,state,effect);
  }
  Object.defineProperty(Store.prototype,'reduceEffect',
    {...descriptor,value:paperReduceEffect});
  try{
    const result=execute();
    return {result,audit};
  }finally{
    assert.strictEqual(Store.prototype.reduceEffect,paperReduceEffect);
    Object.defineProperty(Store.prototype,'reduceEffect',descriptor);
    audit.originalStoreMethodRestored=
      Store.prototype.reduceEffect===original;
  }
}

module.exports={VERSION,PINNED,withPaperKoBeforeEndTurn};
