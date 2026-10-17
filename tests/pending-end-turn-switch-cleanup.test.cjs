'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {withPendingEndTurnSwitchCleanup}=require('../simulation/twinleaf/pending-end-turn-switch-cleanup.cjs');
class Store {dispatch(a){return a;}}
class AddPlayerAction {}
class Player {constructor(){this.id=202;this.active={};this.bench=[{}];this.pendingEndOfTurnEffects=[{target:this.active,type:'knock_out'},{target:this.bench[0],type:'damage'}];}switchPokemon(target){const i=this.bench.indexOf(target);if(i>=0){const old=this.active;this.active=target;this.bench[i]=old;}}}
test('root effect cleanup',()=>{const s=new Store(),p=new Player();const old=Player.prototype.switchPokemon;const x=withPendingEndTurnSwitchCleanup({Store,Player},()=>{s.dispatch(new AddPlayerAction());p.switchPokemon(p.bench[0],s,{});});assert.equal(x.removedFromRoot,1);assert.equal(p.pendingEndOfTurnEffects.length,1);assert.equal(Player.prototype.switchPokemon,old);});
test('reversibility',()=>{const old=Store.prototype.dispatch;assert.throws(()=>withPendingEndTurnSwitchCleanup({Store,Player},()=>{throw Error('fixture');}));assert.equal(Store.prototype.dispatch,old);});

const {audit:verifyEvolutionQueue}=
  require('../simulation/twinleaf/pale-moon-evolution-queue-audit.cjs');
test('evolving an affected Active clears Pale Moon delayed target queue',()=>{
  const data=verifyEvolutionQueue();
  assert.equal(data.baseline.pendingTargetQueueAfter.length,1);
  assert.equal(data.corrected.pendingTargetQueueAfter.length,0);
  assert.equal(data.corrected.queueRemoved,1);
  assert.equal(data.qualifiedForCompetitiveInference,false);
});
