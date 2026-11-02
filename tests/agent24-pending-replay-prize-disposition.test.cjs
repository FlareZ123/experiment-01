'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {projectPendingReplayPrizes}=
  require('../simulation/evaluation/agent24-pending-replay-prize-disposition.cjs');

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
