'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {createOwnerDeckKnowledgeEpoch}=require(
  '../simulation/twinleaf/owner-deck-knowledge-epoch.cjs');
const {snapshotPrizeCardIdentities,invalidateAfterRootHiddenPrizeIngress}=
  require('../simulation/twinleaf/root-prize-knowledge-observer.cjs');

const c=name=>({name});
const player=(id,items,secret=true)=>({
  id,prizes:items.map(card=>({isSecret:secret,cards:[card]}))
});
const tracked=()=>{const x=createOwnerDeckKnowledgeEpoch();
  x.observeOwnerDeckSearch();return x;};

test('actual hidden Prize ingress revokes K1 and subsequent own search restores it',()=>{
  const p=player(101,[c('knownPrize')]);
  const state={players:[p]};
  const epochs=new Map([[101,tracked()]]);
  const before=snapshotPrizeCardIdentities(state);
  p.prizes=[{isSecret:true,cards:[c('newUnknownPrize')]}];
  assert.deepEqual(invalidateAfterRootHiddenPrizeIngress(before,state,epochs),[101]);
  assert.deepEqual(epochs.get(101).snapshot(),{
    exactMembership:false,epoch:2,liveSearches:1,hiddenPrizeRedeals:1
  });
  epochs.get(101).observeOwnerDeckSearch();
  assert.equal(epochs.get(101).exactMembershipKnown(),true);
});

test('taking, reordering, and reusing the existing Prizes retain K1',()=>{
  const a=c('a'),b=c('b');
  const p=player(101,[a,b]),state={players:[p]};
  const epochs=new Map([[101,tracked()]]);
  let before=snapshotPrizeCardIdentities(state);
  p.prizes.reverse();
  assert.deepEqual(invalidateAfterRootHiddenPrizeIngress(before,state,epochs),[]);
  before=snapshotPrizeCardIdentities(state);
  p.prizes.pop();
  assert.deepEqual(invalidateAfterRootHiddenPrizeIngress(before,state,epochs),[]);
  assert.equal(epochs.get(101).exactMembershipKnown(),true);
});

test('a visible replacement does not revoke deck membership',()=>{
  const p=player(101,[c('old')]),state={players:[p]};
  const epochs=new Map([[101,tracked()]]);
  const before=snapshotPrizeCardIdentities(state);
  p.prizes=[{isSecret:false,cards:[c('newVisible')]}];
  assert.deepEqual(invalidateAfterRootHiddenPrizeIngress(before,state,epochs),[]);
  assert.equal(epochs.get(101).exactMembershipKnown(),true);
});

test('root observer invalidates only the affected owner and never K0',()=>{
  const a=player(101,[c('oldA')]),b=player(202,[c('oldB')]);
  const state={players:[a,b]};
  const known=tracked(),stillK0=createOwnerDeckKnowledgeEpoch();
  const epochs=new Map([[101,known],[202,stillK0]]);
  const before=snapshotPrizeCardIdentities(state);
  b.prizes=[{isSecret:true,cards:[c('newB')]}];
  assert.deepEqual(invalidateAfterRootHiddenPrizeIngress(before,state,epochs),[]);
  assert.equal(stillK0.snapshot().hiddenPrizeRedeals,0);
  const second=snapshotPrizeCardIdentities(state);
  a.prizes=[{isSecret:true,cards:[c('newA')]}];
  assert.deepEqual(invalidateAfterRootHiddenPrizeIngress(second,state,epochs),[101]);
  assert.equal(known.exactMembershipKnown(),false);
});
