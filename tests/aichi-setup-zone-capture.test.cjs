'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {openingSetupZones,cardCopyMultisetDigest,openingInventoriesMatch}=
  require('../simulation/twinleaf/opening-setup-zones.cjs');
const {captureSourceSetup}=require('../simulation/evaluation/aichi-setup-zone-capture.cjs');
const {captureSetupOnly}=require('../simulation/evaluation/aichi-setup-only-capture.cjs');

/** @param {string[]} names */
const zone=names=>({cards:names.map(fullName=>({fullName}))});
const player=id=>({
  id,hand:zone(['Hand-'+id]),active:zone(['Active-'+id]),
  bench:[zone(['Bench-'+id])],
  prizes:Array.from({length:6},(_,i)=>zone(['Prize-'+id+'-'+i])),
  deck:zone(['Deck-'+id])
});

test('real-turn setup observer captures detached hidden zones without inferring initial seven',()=>{
  const state={turn:1,activePlayer:1,players:[player(101),player(202)]};
  const observation=openingSetupZones(state);
  assert.equal(observation.schema,'pinned-root-postsetup-zones-v1');
  assert.equal(observation.firstTurnSlot,1);
  assert.equal(observation.originalStartingSevenReconstructed,false);
  assert.equal(observation.containsUnrevealedPrizeIdentities,true);
  assert.deepEqual(observation.seats[0].prizes[3],['Prize-101-3']);
  state.players[0].hand.cards[0].fullName='Mutated';
  assert.deepEqual(observation.seats[0].hand,['Hand-101']);
  assert.equal(openingSetupZones({...state,turn:0}),null);
  assert.throws(()=>openingSetupZones({...state,activePlayer:2}),/Store layout/);
});

test('source Store wrapper captures first turn once and restores dispatch on success and exception',()=>{
  class MockStore {
    constructor(){this.state={turn:0,activePlayer:0,players:[player(101),player(202)]};}
    dispatch(action) {
      if(action==='start')this.state.turn=1;
      if(action==='later')this.state.players[0].hand.cards[0].fullName='Later';
      return action;
    }
  }
  const original=MockStore.prototype.dispatch;
  const {game,setupZones}=captureSourceSetup(MockStore,()=>{
    const store=new MockStore();
    store.dispatch('start');
    store.dispatch('later');
    return {finished:false};
  });
  assert.equal(game.finished,false);
  assert.deepEqual(setupZones.seats[0].hand,['Hand-101']);
  assert.equal(MockStore.prototype.dispatch,original);
  assert.throws(()=>captureSourceSetup(MockStore,()=>{throw new Error('Probe failed');}),
    /Probe failed/);
  assert.equal(MockStore.prototype.dispatch,original);
});

test('short source root sampler stops at first turn and restores Store dispatch',()=>{
  class MockStore{
    constructor(){this.state={turn:0,activePlayer:0,players:[player(101),player(202)]};}
    dispatch(action){
      if(action==='turn1')this.state.turn=1;
      if(action==='should-not-run')throw Error('Sampler ran policy action');
    }
  }
  const original=MockStore.prototype.dispatch;
  const observed=captureSetupOnly(MockStore,()=>{
    const store=new MockStore();
    store.dispatch('turn1');
    store.dispatch('should-not-run');
  });
  assert.equal(observed.stoppedAtFirstTurn,true);
  assert.deepEqual(observed.setupZones.seats[1].hand,['Hand-202']);
  assert.equal(MockStore.prototype.dispatch,original);
  const noTurn=captureSetupOnly(MockStore,()=>{
    const store=new MockStore();store.dispatch('setup-only');
  });
  assert.equal(noTurn.stoppedAtFirstTurn,false);
  assert.equal(noTurn.setupZones,null);
  assert.equal(MockStore.prototype.dispatch,original);
  assert.throws(()=>captureSetupOnly(MockStore,()=>{throw Error('Real failure');}),
    /Real failure/);
  assert.equal(MockStore.prototype.dispatch,original);
});

test('headless root dispatch Error.cause preserves only exact first-turn stop token',()=>{
  class WrappedStore{
    constructor(){this.state={turn:0,activePlayer:0,players:[player(101),player(202)]};}
    dispatch(action){
      if(action==='first')this.state.turn=1;
      return action;
    }
  }
  const native=WrappedStore.prototype.dispatch;
  const captured=captureSetupOnly(WrappedStore,()=>{
    const store=new WrappedStore();
    try{
      store.dispatch('first');
    }catch(cause){
      throw new Error('Twinleaf dispatch failed: undefined',{cause});
    }
  });
  assert.equal(captured.stoppedAtFirstTurn,true);
  assert.equal(captured.setupZones.firstTurnSlot,0);
  assert.equal(WrappedStore.prototype.dispatch,native);
  assert.throws(()=>captureSetupOnly(WrappedStore,()=>{
    throw new Error('Twinleaf dispatch failed: undefined',{
      cause:new Error('real engine failure')
    });
  }),/Twinleaf dispatch failed/);
  assert.equal(WrappedStore.prototype.dispatch,native);
});

test('opening conservation rejects a missing or replaced source printing copy',()=>{
  const players=[player(101),player(202)];
  for(const p of players){
    p.deck=zone(Array.from({length:51},(_,i)=>'Deck-'+p.id+'-'+i));
  }
  const snapshot=openingSetupZones({
    turn:1,activePlayer:0,players
  });
  const physicalSourceDecks=snapshot.seats.map(seat=>[
    ...seat.hand,...seat.active,...seat.bench.flat(),
    ...seat.prizes.flat(),
    ...Array.from({length:51},(_,i)=>'Deck-'+seat.playerId+'-'+i)
  ]);
  assert.deepEqual(snapshot.seats.map(seat=>seat.openingCopyCount),[60,60]);
  assert.equal(openingInventoriesMatch(snapshot.seats,physicalSourceDecks),true);
  assert.equal(openingInventoriesMatch(snapshot.seats,
    physicalSourceDecks.map(cards=>[...cards].reverse())),true);
  assert.equal(cardCopyMultisetDigest(physicalSourceDecks[0]),
    cardCopyMultisetDigest([...physicalSourceDecks[0]].reverse()));
  const replaced=physicalSourceDecks.map(cards=>[...cards]);
  replaced[0][0]='Different-Card';
  assert.equal(openingInventoriesMatch(snapshot.seats,replaced),false);
  assert.equal(openingInventoriesMatch(snapshot.seats,[
    physicalSourceDecks[0].slice(1),physicalSourceDecks[1]
  ]),false);
  assert.equal(openingInventoriesMatch(snapshot.seats,[
    physicalSourceDecks[1],physicalSourceDecks[0]
  ]),false);
  assert.equal(openingInventoriesMatch(null,physicalSourceDecks),false);
});
