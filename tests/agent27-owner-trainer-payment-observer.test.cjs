'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {summarizeOwnerHandPayment,summarizeNativePaymentRoots}=
  require('../simulation/twinleaf/agent27-owner-trainer-payment-observer.cjs');

function fixture(hand,indices){
  return [{decisionKind:'owner-root',actorSeat:1,globalTurn:4,
      ownHand:Object.freeze([...hand])},
    indices.map(i=>({handIndex:i,printing:hand[i],type:'Item',
      publicBlocker:null}))];
}
test('real owner-view projection preserves repeated paid printings separately',()=>{
  const [v,rows]=fixture(['Ultra Ball MEG','Ultra Ball MEG','Energy A','Energy B'],
    [0,1]);
  const r=summarizeOwnerHandPayment(v,rows);
  assert.equal(r.supportedTrainerCopies,2);
  assert.equal(r.paidVariantsUnblocked,2);
  assert.equal(r.physicallyAffordablePaidVariants,2);
  assert.equal(r.sameHandContestedPaidPairs,1);
  assert.deepEqual(r.coveredCopyCosts.map(x=>x.handIndex),[0,1]);
  assert.equal(r.coveredCopyCosts[0].physicalPaymentWays,'3');
  assert.equal(r.policyReadOnly,true);
  assert.equal(r.paperTargetVerified,false);
});
test('unknown Trainer stays unknown and no hidden cards are read',()=>{
  const [v,rows]=fixture(['Unknown Trainer FOO','Secret Box TWM','A','B'],[0,1]);
  const r=summarizeOwnerHandPayment(v,rows);
  assert.equal(r.heldTrainerCopies,2);
  assert.equal(r.supportedTrainerCopies,1);
  assert.equal(r.unsupportedTrainerCopies,1);
  assert.equal(r.physicallyUnaffordablePaidVariants,0);
  assert.equal(r.physicallyAffordablePaidVariants,1);
  assert.equal(r.sameHandContestedPaidPairs,0);
});
test('strategic protected physical cards alter only protected affordability',()=>{
  const [v,rows]=fixture(['Secret Box TWM','A','B','C'],[0]);
  const r=summarizeOwnerHandPayment(v,rows,new Set([1,2,3]));
  assert.equal(r.coveredCopyCosts[0].physicallyAffordable,true);
  assert.equal(r.coveredCopyCosts[0].affordablePreservingProtected,false);
  assert.equal(r.coveredCopyCosts[0].forcedProtectedSacrifices,3);
});
test('exact native root correlation is reported per genuine physical seat',()=>{
  const [v,rows]=fixture(['Ultra Ball MEG','Ultra Ball MEG','Energy A','Energy B'],
    [0,1]);
  const root={seat:1,ownerPaymentSummary:summarizeOwnerHandPayment(v,rows)};
  const x=summarizeNativePaymentRoots([root,{seat:1,ownerPaymentSummary:null}]);
  assert.equal(x.auditedRoots,1);
  assert.equal(x.bySeat[1].roots,1);
  assert.equal(x.bySeat[1].contested,1);
  assert.equal(x.bySeat[0].roots,0);
  assert.equal(x.qualifiedCompetitiveGames,0);
});

test('verified VS Seeker PHF has zero owner-hand discard cost only',()=>{
  const [v,rows]=fixture(['VS Seeker PHF','Secret Box TWM','A','B'],[0,1]);
  const r=summarizeOwnerHandPayment(v,rows);
  assert.equal(r.supportedTrainerCopies,2);
  assert.equal(r.unsupportedTrainerCopies,0);
  assert.equal(r.coveredCopyCosts.find(x=>x.printing==='VS Seeker PHF')
    .discards,0);
  assert.equal(r.paperTargetVerified,false);
  assert.equal(r.gamePerformanceQualified,false);
});
