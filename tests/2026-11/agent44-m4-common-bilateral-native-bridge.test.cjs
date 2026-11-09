'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runDevelopment}=
  require('../../simulation/evaluation/agent41-bilateral-v2-development.cjs');

const registration=[
  {rank:5,repeat:4405,candidateSlot:'A',seed:20261109,
    candidateId:'champion-reference',id:'5:4405:A:champion-reference'},
  {rank:5,repeat:4405,candidateSlot:'B',seed:20261110,
    candidateId:'champion-reference',id:'5:4405:B:champion-reference'}
];

/**
 * Short bounded original-source match integration fixture, not an Aichi
 * win-rate or legally certified complete-game sample.
 */
test('common bilateral runner forwards all three M4 hooks on both physical seats',()=>{
  const data=runDevelopment({
    registeredTrials:registration,
    registeredFrameName:'agent44-M4-rank5-both-seat-48root-integration-test',
    allowSingleCandidatePerGroup:true,
    allowAdditionalOriginalSourceRanks:true,
    nativeRootActionLimit:48,
    specialRedCardPaperPreselection:true,
    specialRedCardPaperCorrection:true,
    specialRedCardPaperSpeculativeShuffle:true,
    isolatePolicyRandomness:true,
    isolatePhysicalShuffleRandomnessAfterSetup:true
  });
  assert.equal(data.rows.length,2);
  assert.equal(data.specialRedCardPaperPreselectionOptIn,true);
  assert.equal(data.specialRedCardPaperCorrectionOptIn,true);
  assert.equal(data.specialRedCardPaperSpeculativeShuffleOptIn,true);
  for(const row of data.rows){
    assert.equal(row.specialRedCardPaperPreselection,true,
      'Genuine native rank5 root must carry owner-root M4 screen');
    assert.equal(row.specialRedCardPaperCorrection,true,
      'Real Store must use paper hand shuffle and empty-hand veto');
    assert.equal(row.specialRedCardPaperSpeculativeShuffle,true,
      'Native bot clone must use independent paper hand shuffle');
    assert.equal(row.specialRedCardPaperPreselectionVersion,
      'agent44-m4-owner-root-preselection-v2-policy-rng-clone-shuffle');
    assert.equal(row.specialRedCardPaperShuffleProtocol,
      'exact-M4-opponent-hand-fisher-yates-real-store-physical-prng-v1');
    assert.equal(row.specialRedCardPaperSpeculativeShuffleProtocol,
      'exact-M4-opponent-hand-fisher-yates-policy-clone-prng-v1');
    assert.ok(Array.isArray(row.specialRedCardPaperPreselectionAudits));
    assert.equal(row.policyRandomIsolation,true);
    assert.equal(row.physicalShuffleRandomIsolationAfterSetup,true);
    assert.equal(row.trial.rank,5);
    assert.ok(['A','B'].includes(row.trial.candidateSlot));
    console.log('AGENT44_BILATERAL_M4_COMMON_NATIVE',JSON.stringify({
      trial:row.trial.id,
      m4OwnerRoots:row.specialRedCardPaperPreselectionAudits.length,
      outcome:row.status??null,
      validatedFlagPassThrough:true,
      competitivelyQualifiedGames:0
    }));
  }
});

test('common runner rejects incomplete opt-in M4 profiles before playing',()=>{
  assert.throws(()=>runDevelopment({
    specialRedCardPaperCorrection:true
  }),/Shared M4 paper Store correction requires owner-root preselection/);
  assert.throws(()=>runDevelopment({
    specialRedCardPaperPreselection:true,
    specialRedCardPaperCorrection:true,
    specialRedCardPaperSpeculativeShuffle:true
  }),/M4 speculative clone requires both paper hooks and both RNG isolation domains/);
});
