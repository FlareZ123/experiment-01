'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent37-instance-scoped-ko-before-e21-v1';
const PINNED='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const native=modulePath=>require(path.join(BASE,modulePath));

/**
 * Intercept the existing pinned Store instance's EndTurnEffect, keeping other
 * native Stores unchanged. The caller must complete all prompts synchronously.
 * Genuine attack KO, Prize, promotion and winning-condition checks occur first.
 *
 * @template T
 * @param {any} store Actual already-created pinned Twinleaf Store.
 * @param {()=>T} execute Synchronous game transaction, including its prompts.
 * @returns {{result:T,audit:object}} Execution result and bounded hook audit.
 */
function withInstanceScopedPaperKoBeforeEndTurn(store,execute){
  assert.equal(typeof execute,'function');
  const {Store}=native('game/store/store');
  const {EndTurnEffect}=native('game/store/effects/game-phase-effects');
  const {GamePhase}=native('game/store/state/state');
  const {checkState}=native('game/store/effect-reducers/check-effect');
  assert.ok(store instanceof Store,'Use the actual pinned Store');
  assert.equal(Object.hasOwn(store,'reduceEffect'),false,
    'Store must not already be overridden on this instance');
  const original=store.reduceEffect;
  assert.equal(typeof original,'function');
  const neighbor=new Store({onStateChange(){}});
  assert.equal(neighbor.reduceEffect,original,
    'An unrelated game should initially use the original Store method');
  const audit={
    version:VERSION,pinnedTwinleaf:PINNED,
    intercepted:0,completed:0,terminalSuppressed:0,
    deferredAtCheckReturn:0,callbacks:0,
    otherStoresUnmodified:true,
    originalRestored:false,paperQualifiedGames:0
  };
  /** @this {any} @param {any} state @param {any} effect */
  function paperReduceEffect(state,effect){
    if(this!==store)
      throw Error('PAPER_KO_HOOK_WRONG_STORE');
    if(effect instanceof EndTurnEffect && state.phase===GamePhase.ATTACK){
      audit.intercepted++;
      let didComplete=false;
      const result=checkState(store,state,()=>{
        audit.callbacks++;
        didComplete=true;
        if(state.phase===GamePhase.FINISHED){
          audit.terminalSuppressed++;
          return;
        }
        audit.completed++;
        original.call(store,state,effect);
      });
      if(!didComplete)
        audit.deferredAtCheckReturn++;
      return result;
    }
    return original.call(store,state,effect);
  }
  Object.defineProperty(store,'reduceEffect',{
    configurable:true,writable:true,value:paperReduceEffect
  });
  assert.strictEqual(neighbor.reduceEffect,original,
    'A second independent Store must not inherit the single-instance repair');
  try{
    const result=execute();
    audit.otherStoresUnmodified=neighbor.reduceEffect===original;
    assert.equal(audit.otherStoresUnmodified,true);
    assert.equal(audit.callbacks,audit.intercepted,
      'All KO-first native completion callbacks must finish before unhooking');
    assert.equal(store.hasPrompts(),false,
      'All native Store prompt chains must finish before restoring instance hook');
    assert.equal(store.state.prompts.filter(p=>p.result===undefined).length,0,
      'No unresolved native Store prompt is permitted');
    return {result,audit};
  }finally{
    assert.strictEqual(store.reduceEffect,paperReduceEffect);
    delete store.reduceEffect;
    audit.originalRestored=!Object.hasOwn(store,'reduceEffect')&&
      store.reduceEffect===original;
  }
}
module.exports={VERSION,PINNED,withInstanceScopedPaperKoBeforeEndTurn};
