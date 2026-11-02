'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {
  projectPendingReplayPrizes,projectPendingOrdinaryPrizes,
  compareNativePendingPrizeWinner
}=require('../simulation/evaluation/agent24-pending-replay-prize-disposition.cjs');

/** @param {object[]} koEntitlements @param {object} [extra] */
function project(koEntitlements,extra={}){
  return projectPendingReplayPrizes({
    authenticatedReplayEpoch:true,singleSettledResolutionBatch:true,
    physicalRemaining:[6,6],koEntitlements,...extra
  });
}
/** @param {0|1} victimSeat @param {number} prizeCount */
function ko(victimSeat,prizeCount){
  return {victimSeat,prizeCount,preventDefault:false,
    alternatePrizeDestination:false};
}

test('one unretrieved two-Prize KO projects a tiebreak first lead',()=>{
  const receipt=project([ko(0,2)]);
  assert.equal(receipt.status,'PENDING_KO_PRIZES_STRICT_LEAD');
  assert.deepEqual(receipt.pendingPrizesByClaimant,[0,2]);
  assert.deepEqual(receipt.projectedRemainingPrizes,[6,4]);
  assert.equal(receipt.projectedLeaderSeat,1);
  assert.equal(receipt.paperWinnerSeat,null);
  assert.equal(receipt.paperGameOutcomeQualified,false);
});

test('two simultaneous two-Prize KOs retain tied Prize totals regardless of processing order',()=>{
  const a=project([ko(0,2),ko(1,2)]);
  const b=project([ko(1,2),ko(0,2)]);
  for(const result of [a,b]){
    assert.equal(result.status,'PENDING_KO_PRIZES_NO_STRICT_LEAD');
    assert.deepEqual(result.pendingPrizesByClaimant,[2,2]);
    assert.deepEqual(result.projectedRemainingPrizes,[4,4]);
    assert.equal(result.projectedLeaderSeat,null);
    assert.equal(result.paperWinnerSeat,null);
  }
});

test('simultaneous unequal Prize rewards project the true leading seat',()=>{
  const a=project([ko(0,2),ko(1,3)]);
  assert.deepEqual(a.projectedRemainingPrizes,[3,4]);
  assert.equal(a.projectedLeaderSeat,0);
  const b=project([ko(1,2),ko(0,3)]);
  assert.deepEqual(b.projectedRemainingPrizes,[4,3]);
  assert.equal(b.projectedLeaderSeat,1);
});

test('no replay proof, altered reward destination or skipped KO vetoes classification',()=>{
  for(const extra of [
    {authenticatedReplayEpoch:false},
    {singleSettledResolutionBatch:false},
    {physicalRemaining:[6]},
    {koEntitlements:[{...ko(0,2),preventDefault:true}]},
    {koEntitlements:[{...ko(0,2),alternatePrizeDestination:true}]},
    {koEntitlements:[{...ko(0,2),prizeCount:0}]},
    {koEntitlements:[]}
  ]){
    const receipt=project([ko(0,2)],extra);
    assert.equal(receipt.projectedLeaderSeat,null);
    assert.equal(receipt.paperGameOutcomeQualified,false);
    assert.match(receipt.status,/UNVERIFIED$/);
  }
});

/**
 * @param {object} projection
 * @param {0|1|null} winner
 * @param {object} [extra]
 */
function compare(projection,winner,extra={}){
  return compareNativePendingPrizeWinner({
    projection,nativeWinnerSeat:winner,nativeFinished:true,
    nativeEndReason:'engine-game-end',...extra
  });
}

test('recorded equal pending KOs do not establish a native Prize-winning lead',()=>{
  const receipt=compare(project([ko(0,2),ko(1,2)]),0);
  assert.equal(receipt.status,'NATIVE_WINNER_WITHOUT_PENDING_PRIZE_LEAD');
  assert.equal(receipt.projectedPrizeLeaderSeat,null);
  assert.equal(receipt.prizeOnlyCompatible,false);
  assert.equal(receipt.paperGameOutcomeQualified,false);
  assert.equal(receipt.competingWinConditionsExcluded,false);
});

test('three-Prize reward to seat 1 contradicts a native seat-0 winner on Prize-only comparison',()=>{
  const receipt=compare(project([ko(0,3),ko(1,2)]),0);
  assert.equal(receipt.status,'NATIVE_WINNER_OPPOSES_PENDING_PRIZE_LEAD');
  assert.equal(receipt.projectedPrizeLeaderSeat,1);
  assert.equal(receipt.prizeOnlyCompatible,false);
  assert.equal(receipt.paperGameOutcomeQualified,false);
});

test('a matching strict pending lead is not a qualified game result',()=>{
  const receipt=compare(project([ko(0,2),ko(1,3)]),0);
  assert.equal(receipt.status,'NATIVE_WINNER_MATCHES_PENDING_PRIZE_LEAD');
  assert.equal(receipt.projectedPrizeLeaderSeat,0);
  assert.equal(receipt.prizeOnlyCompatible,true);
  assert.equal(receipt.paperGameOutcomeQualified,false);
});

test('missing settled KO proof and non-engine native terminals are not promoted',()=>{
  for(const r of [
    compare(project([ko(0,3)],{authenticatedReplayEpoch:false}),0),
    compare(project([ko(0,3)]),0,{nativeFinished:false}),
    compare(project([ko(0,3)]),0,{nativeEndReason:'action-limit'}),
    compare(project([ko(0,3)]),null)
  ]){
    assert.match(r.status,/UNVERIFIED$/);
    assert.equal(r.paperGameOutcomeQualified,false);
  }
});

/**
 * @param {object[]} receipts
 * @param {object} [extra]
 * @returns {object} Ordinary source-owner Prize-only projection.
 */
function projectOrdinary(receipts,extra={}){
  return projectPendingOrdinaryPrizes({
    authenticatedOrdinaryEpoch:true,
    singleSettledResolutionBatch:true,
    physicalRemaining:[2,2],
    koEntitlements:receipts,...extra
  });
}

test('ordinary simultaneous two-Prize KOs at 2/2 project both Prizes empty',()=>{
  const p=projectOrdinary([ko(0,2),ko(1,2)]);
  assert.equal(p.status,'PENDING_KO_PRIZES_NO_STRICT_LEAD');
  assert.deepEqual(p.pendingPrizesByClaimant,[2,2]);
  assert.deepEqual(p.projectedRemainingPrizes,[0,0]);
  assert.equal(p.projectedBothPrizeEmpty,true);
  assert.equal(p.projectedLeaderSeat,null);
  const n=compare(p,0);
  assert.equal(n.status,'NATIVE_WINNER_WITHOUT_PENDING_PRIZE_LEAD');
  assert.equal(n.paperGameOutcomeQualified,false);
  assert.equal(n.competingWinConditionsExcluded,false);
});

test('ordinary unilateral final Prize still has a strict projected leader',()=>{
  const p=projectOrdinary([ko(0,2)]);
  assert.deepEqual(p.projectedRemainingPrizes,[2,0]);
  assert.equal(p.projectedLeaderSeat,1);
  assert.equal(p.projectedBothPrizeEmpty,false);
  assert.equal(compare(p,1).status,
    'NATIVE_WINNER_MATCHES_PENDING_PRIZE_LEAD');
});

test('ordinary Prize gate cannot be passed with a replay epoch declaration',()=>{
  const p=projectOrdinary([ko(0,2)],{
    authenticatedOrdinaryEpoch:false,authenticatedReplayEpoch:true
  });
  assert.equal(p.status,'KO_RESOLUTION_EPOCH_UNVERIFIED');
  assert.equal(compare(p,1).status,'PENDING_PRIZE_PROJECTION_UNVERIFIED');
  assert.equal(p.paperGameOutcomeQualified,false);
});

test('ordinary Prize projection still rejects partial or exceptional receipts',()=>{
  for(const extra of [
    {singleSettledResolutionBatch:false},
    {physicalRemaining:[2,-1]},
    {koEntitlements:[{...ko(0,2),preventDefault:true}]},
    {koEntitlements:[{...ko(0,2),alternatePrizeDestination:true}]}
  ]){
    const p=projectOrdinary([ko(0,2),ko(1,2)],extra);
    assert.match(p.status,/UNVERIFIED$/);
    assert.equal(p.paperGameOutcomeQualified,false);
  }
});
