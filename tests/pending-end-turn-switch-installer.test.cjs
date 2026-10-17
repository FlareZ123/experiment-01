'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {installPendingEndTurnSwitchCleanup}=
  require('../simulation/twinleaf/pending-end-turn-switch-cleanup.cjs');

class AddPlayerAction {}
class Store {dispatch(action){return action;}}
class Player {
  constructor(id) {
    this.id=id;
    this.active={id:'active'};
    this.bench=[{id:'bench'}];
    this.pendingEndOfTurnEffects=[
      {type:'knock_out',attack:{name:'Pale Moon-GX'},
        sourceCard:{fullName:'Trevenant & Dusknoir-GX SMP'},target:this.active},
      {type:'damage',target:this.bench[0]}
    ];
  }
  switchPokemon(target) {
    const index=this.bench.indexOf(target);
    if(index<0)return;
    const previous=this.active;
    this.active=target;
    this.bench[index]=previous;
  }
}

test('installer distinguishes real root cleanup from hypothetical Store cleanup and restores methods',()=>{
  const originalDispatch=Store.prototype.dispatch;
  const originalSwitch=Player.prototype.switchPokemon;
  const hook=installPendingEndTurnSwitchCleanup({Store,Player});
  const root=new Store(),rootPlayer=new Player(101);
  const speculative=new Store(),speculativePlayer=new Player(202);
  let evidence;
  try {
    root.dispatch(new AddPlayerAction());
    rootPlayer.switchPokemon(rootPlayer.bench[0],root,{});
    speculativePlayer.switchPokemon(speculativePlayer.bench[0],speculative,{});
    evidence=hook.evidence();
  } finally {
    hook.restore();
  }
  assert.equal(evidence.removedFromRoot,1);
  assert.equal(evidence.removedFromSimulatedStores,1);
  assert.deepEqual(evidence.rootEvents,[{
    playerId:101,benchIndex:0,effectsRemoved:[{
      type:'knock_out',attack:'Pale Moon-GX',
      source:'Trevenant & Dusknoir-GX SMP'
    }]
  }]);
  assert.equal(rootPlayer.pendingEndOfTurnEffects.length,1);
  assert.equal(speculativePlayer.pendingEndOfTurnEffects.length,1);
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
  assert.strictEqual(Player.prototype.switchPokemon,originalSwitch);
});

test('installer restores methods when enclosing experiment fails',()=>{
  const originalDispatch=Store.prototype.dispatch;
  const originalSwitch=Player.prototype.switchPokemon;
  const hook=installPendingEndTurnSwitchCleanup({Store,Player});
  try {
    assert.throws(()=>{throw Error('staged failure');},/staged failure/);
  } finally {
    hook.restore();
  }
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
  assert.strictEqual(Player.prototype.switchPokemon,originalSwitch);
});
