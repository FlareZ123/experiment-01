'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {inspectNativeCoheldDenialCanPlay,VERSION}=
  require('../simulation/twinleaf/agent41-native-coheld-denial-canplay.cjs');

function fixture(seat=1){
  const hand=[
    {fullName:'Plumeria BUS',canPlay:()=>true},
    {fullName:'Team Flare Grunt XY',canPlay:()=>true},
    {fullName:'Psychic Energy SVE 5',canPlay:()=>false},
    {fullName:'Plumeria BUS',canPlay:()=>false}
  ];
  const owner={hand:{cards:hand},supporterTurn:0};
  const other={hand:{cards:[]},supporterTurn:0};
  const state={activePlayer:seat,
    players:seat===0?[owner,other]:[other,owner]};
  const store={state};
  const view={
    decisionKind:'owner-root',globalTurn:4,
    ownHand:hand.map(c=>c.fullName),
    ownTurnResources:{supporterPlayLocked:false,supporterPlayedTurn:0},
    ownPublic:{publicTurnRestrictions:{}},
    opponentPublic:{active:{energies:['Psychic Energy SVE 5']}}
  };
  let observations=0;
  const observe=()=>{
    observations++;
    return {hand:[...view.ownHand],publicEnergy:
      [...view.opponentPublic.active.energies],
      quota:owner.supporterTurn};
  };
  return {view,state,store,owner,hand,observe,
    get observations(){return observations;}};
}

for(const seat of [0,1]){
  test('native coheld gate inspects physical owner copies at seat '+seat,()=>{
    const x=fixture(seat);
    const result=inspectNativeCoheldDenialCanPlay(
      x.view,x.state,x.store,seat,17,x.observe);
    assert.equal(result.version,VERSION);
    assert.equal(result.seat,seat);
    assert.equal(result.rootOrdinal,17);
    assert.deepEqual(result.plumeria.map(c=>c.handIndex),[0,3]);
    assert.deepEqual(result.plumeria.map(c=>c.nativePlayable),[true,false]);
    assert.deepEqual(result.teamFlare.map(c=>c.handIndex),[1]);
    assert.equal(result.bothHaveNativePlayablePhysicalCopy,true);
    assert.equal(result.physicalPaymentPairsPerPlumeriaCopy,3);
    assert.equal(x.observations,6);
    assert.equal(x.owner.supporterTurn,0);
    assert.equal(result.nativeActionDispatched,false);
    assert.equal(result.nativeStateOwnDataMutationGuardPassed,true);
    assert.equal(result.outcomeUnverified,true);
  });
}

test('coheld with a native canPlay rejection is retained as a negative',()=>{
  const x=fixture(0);
  x.hand[1].canPlay=()=>false;
  const result=inspectNativeCoheldDenialCanPlay(
    x.view,x.state,x.store,0,1,x.observe);
  assert.equal(result.bothHaveNativePlayablePhysicalCopy,false);
  assert.equal(result.teamFlare[0].nativePlayable,false);
});

test('a thrown native canPlay is recorded while other copies are inspected',()=>{
  const x=fixture();
  x.hand[0].canPlay=()=>{throw Error('controlled card.canPlay error');};
  const result=inspectNativeCoheldDenialCanPlay(
    x.view,x.state,x.store,1,2,x.observe);
  assert.match(result.plumeria[0].error,/controlled card.canPlay error/);
  assert.equal(result.plumeria[0].nativePlayable,null);
  assert.equal(result.teamFlare[0].nativePlayable,true);
});

test('no coheld opportunity cannot call native card checks',()=>{
  const x=fixture();
  x.view.ownHand[1]='Other card';
  const result=inspectNativeCoheldDenialCanPlay(
    x.view,x.state,x.store,1,1,()=>{throw Error('should not inspect');});
  assert.equal(result,null);
});

test('a native canPlay probe that mutates owner-visible state fails closed',()=>{
  const x=fixture();
  x.hand[0].canPlay=()=>{x.owner.supporterTurn=4;return true;};
  assert.throws(()=>inspectNativeCoheldDenialCanPlay(
    x.view,x.state,x.store,1,3,x.observe),/observation|quota/);
});

test('native canPlay concealed deck mutation is rejected despite unchanged actor view',()=>{
  const x=fixture(1);
  x.state.players[0].privateDeck={cards:[{name:'Unrevealed'}]};
  x.hand[0].canPlay=()=>{
    x.state.players[0].privateDeck.cards[0].name='Rewritten';
    return true;
  };
  assert.throws(()=>inspectNativeCoheldDenialCanPlay(
    x.view,x.state,x.store,1,6,x.observe),
  /native hidden or public own-data State/);
  assert.deepEqual(x.observe(),{
    hand:x.view.ownHand,publicEnergy:x.view.opponentPublic.active.energies,
    quota:x.owner.supporterTurn
  });
});
