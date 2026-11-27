'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createOwnerPrizeCompositionGuard,
  advanceOwnerK1
} = require('../simulation/twinleaf/owner-k1-prize-knowledge.cjs');

function hiddenCard(tag) {
  return Object.defineProperty({tag}, 'fullName', {
    get() { throw new Error('Face-down Prize identity must never be read'); }
  });
}
function fixture(ownerSeat=0) {
  const a=hiddenCard('a'), b=hiddenCard('b'), c=hiddenCard('c');
  const mine={prizes:[{cards:[a]},{cards:[b]},{cards:[]},{cards:[]}]};
  const theirs={prizes:[{cards:[hiddenCard('opponent')]}]};
  const state={players:ownerSeat===0?[mine,theirs]:[theirs,mine]};
  return {state,mine,a,b,c,ownerSeat};
}
function certifiedSnapshot(ownerSeat) {
  return {ownerSeat,epoch:1,exactMembershipKnown:true,
    deckMembershipStale:false,registeredPrintings:[
      {printing:'A SET',copies:1},{printing:'B SET',copies:59}
    ],knownPrized:[{printing:'A SET',copies:1},{printing:'B SET',copies:1}],
    prizeInferenceCertified:true,observedOwnPrizeCount:2};
}
test('an unchanged physical Prize multiset survives ordinary Store actions without face reads',()=>{
  for(const ownerSeat of [0,1]) {
    const f=fixture(ownerSeat);
    const guard=createOwnerPrizeCompositionGuard(f.state,ownerSeat);
    assert.ok(guard);
    assert.equal(guard.unchanged(f.state),true);
    // Changing own hand/deck/board without touching Prizes retains custody.
    f.mine.hand={cards:[hiddenCard('new-hand')]};
    f.mine.deck={cards:[hiddenCard('new-deck')]};
    assert.equal(guard.unchanged(f.state),true);
    // Reorder same face-down Prize physical cards: multiset unchanged.
    [f.mine.prizes[0].cards,f.mine.prizes[1].cards]=
      [f.mine.prizes[1].cards,f.mine.prizes[0].cards];
    assert.equal(guard.unchanged(f.state),true);
    const updated=advanceOwnerK1(certifiedSnapshot(ownerSeat),{
      currentOwnPrizeCount:2,deckMayHaveChanged:true,
      prizeCompositionMayHaveChanged:!guard.unchanged(f.state)
    });
    assert.equal(updated.prizeInferenceCertified,true);
    assert.equal(updated.knownPrized[0].printing,'A SET');
  }
});
test('an unchanged Prize count with changed physical composition revokes K1',()=>{
  for(const ownerSeat of [0,1]){
    const f=fixture(ownerSeat);
    const guard=createOwnerPrizeCompositionGuard(f.state,ownerSeat);
    // A hidden swap can leave the count unchanged.
    f.mine.prizes[1].cards=[f.c];
    assert.equal(guard.unchanged(f.state),false);
    const updated=advanceOwnerK1(certifiedSnapshot(ownerSeat),{
      currentOwnPrizeCount:2,deckMayHaveChanged:true,
      prizeCompositionMayHaveChanged:!guard.unchanged(f.state)
    });
    assert.equal(updated.prizeInferenceCertified,false);
    assert.equal(updated.knownPrized,null);
  }
});
test('state cloning, replaced player state, duplicate native references and unreadable zones fail closed',()=>{
  const f=fixture(1),guard=createOwnerPrizeCompositionGuard(f.state,1);
  assert.equal(guard.unchanged({...f.state}),false);
  const owner=f.mine;
  f.state.players[1]={...owner};
  assert.equal(guard.unchanged(f.state),false);
  f.state.players[1]=owner;
  owner.prizes[1].cards=[f.a];
  assert.equal(guard.unchanged(f.state),false);
  owner.prizes[1].cards=[f.b];
  Object.defineProperty(owner.prizes[1], 'cards', {
    configurable:true,
    get() { throw Error('unreadable Prize-zone geometry'); }
  });
  assert.equal(guard.unchanged(f.state),false);
});
test('missing/ambiguous Prize-card geometry cannot mint a custody witness',()=>{
  const f=fixture();
  f.mine.prizes[1].cards=[f.a];
  assert.equal(createOwnerPrizeCompositionGuard(f.state,0),null);
  f.mine.prizes[1].cards=[f.b,f.c];
  assert.equal(createOwnerPrizeCompositionGuard(f.state,0),null);
  f.mine.prizes[1].cards={length:1};
  assert.equal(createOwnerPrizeCompositionGuard(f.state,0),null);
  f.mine.prizes=null;
  assert.equal(createOwnerPrizeCompositionGuard(f.state,0),null);
  assert.throws(()=>createOwnerPrizeCompositionGuard(f.state,3),/Invalid owner seat/);
});
