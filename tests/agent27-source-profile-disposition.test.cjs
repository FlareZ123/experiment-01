'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {sourceCanaryDisposition}=require(
  '../simulation/evaluation/agent27-source-profile-disposition.cjs');

const profile={
  schema:'agent27-original-source-min2-canary-profile-v1',
  seedCases:[{seed:12,seatRanks:[10,1]},{seed:13,seatRanks:[1,10]}]
};
function caseWith(seed,seatRanks){
  return {seed,seatRanks,sameRegisteredOriginalSixties:true,
    sameInitialFullPhysicalDeal:true,
    repaired:{
      failure:null,
      nativeMinimumAttachActionReceipts:[{
        nativeStoreActionAccepted:true,twoDistinctPhysicalCards:true,
        bothOriginalSourceCards:true,bothAttachedToOriginalActive:true
      }],
      sourceNativeEnergyAttackContinuation:{
        promptEpisodes:[{
          status:'native-settled-source-attack-with-opponent-root',
          opponentReply:{actions:[{action:'PassTurnAction'}]}
        }]
      }
    }
  };
}
test('selected both-seat source canary reports narrow native proof and broader release veto',()=>{
  const result=sourceCanaryDisposition(profile,[
    caseWith(12,[10,1]),caseWith(13,[1,10])]);
  assert.equal(result.CONFIG_FROZEN,true);
  assert.equal(result.BOTH_SEATS_EXECUTED,true);
  assert.equal(result.PAPER_PAYMENT_VERIFIED,'LOCAL_MIN2_ATTACH_ONLY');
  assert.equal(result.SOURCE_PAYOFF_WITNESSED,'CELESTIAL_ROAR_RESOURCE_ATTACK_SETTLED');
  assert.equal(result.OPPONENT_CONTINUATION_WITNESSED,'ACTUAL_ROOTS_ONLY');
  assert.equal(result.acceptedOriginalPhysicalTwoCardTransfers,2);
  assert.equal(result.competitiveGameQualified,false);
  assert.equal(result.firstUnverifiedGate,
    'BROAD_PAPER_RULES_AND_OPPONENT_COMPETENCE_UNVERIFIED');
});
test('rejected or unmatched physical payment fails closed',()=>{
  const a=caseWith(12,[10,1]),b=caseWith(13,[1,10]);
  b.repaired.nativeMinimumAttachActionReceipts[0].bothAttachedToOriginalActive=false;
  const out=sourceCanaryDisposition(profile,[a,b]);
  assert.equal(out.PAPER_PAYMENT_VERIFIED,'NOT_VERIFIED');
  assert.equal(out.SOURCE_PAYOFF_WITNESSED,'NOT_VERIFIED');
  assert.equal(out.OPPONENT_CONTINUATION_WITNESSED,'NOT_VERIFIED');
  assert.equal(out.firstUnverifiedGate,'LOCAL_MANDATORY_ATTACHMENT_NOT_PROVEN');
});
test('missing opponent root cannot be promoted to a completed continuation',()=>{
  const a=caseWith(12,[10,1]),b=caseWith(13,[1,10]);
  b.repaired.sourceNativeEnergyAttackContinuation.promptEpisodes[0]={
    status:'native-settled-source-attack-no-opponent-root',
    opponentReply:null
  };
  const out=sourceCanaryDisposition(profile,[a,b]);
  assert.equal(out.SOURCE_PAYOFF_WITNESSED,'CELESTIAL_ROAR_RESOURCE_ATTACK_SETTLED');
  assert.equal(out.OPPONENT_CONTINUATION_WITNESSED,'NOT_VERIFIED');
  assert.equal(out.firstUnverifiedGate,'OPPONENT_ROOT_MISSING');
});
