'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {frozenBilateralEvidenceMatrix}=
  require('../simulation/evaluation/agent41-frozen-bilateral-evidence-matrix.cjs');

test('all attempted arms remain in denominator despite native errors and caps',()=>{
  const common={rank:6,repeat:0,candidateSlot:'A',seed:1729};
  const a={trial:{...common,id:'6:0:A:champion-reference',
      candidateId:'champion-reference'},
    status:'censored',sourceSeat:1,actualStarterSeat:1,
    sourceDealFingerprint:'physical-source-1',
    nativeSetupCoinChoiceReceipt:{
      status:'consistent-accepted-native-setup-and-first-draw'},
    physicalZoneQualification:{status:'SETTLED_PHYSICAL_INTEGRITY_PASSED'},
    attackDeclarations:{source:2,candidate:1},
    actorOnlyDecisionCoverage:{detailedComponentAudits:{
      root:{sameRootProposalChoice:{changedRoots:3}}}}};
  const b={trial:{...common,id:'6:0:A:new-moon-lockbreaker-v1',
      candidateId:'new-moon-lockbreaker-v1'},
    status:'engine-error',
    physicalZoneQualification:{status:'ENGINE_PHYSICAL_INVALID'},
    sourceDealFingerprint:'physical-source-1'};
  const r=frozenBilateralEvidenceMatrix({
    version:'fixed',expectedAttempts:32,attemptedComplete:false,rows:[a,b]
  });
  assert.equal(r.preservedAttemptRows,2);
  assert.equal(r.declaredAttempts,32);
  assert.equal(r.allAttemptRowsPresent,false);
  assert.equal(r.nativeOutcomes.censored,1);
  assert.equal(r.nativeOutcomes['engine-error'],1);
  assert.equal(r.physicalIntegrityOutcomes.ENGINE_PHYSICAL_INVALID,1);
  assert.equal(r.engineTerminals,0);
  assert.equal(r.sourceAttackDeclarations,2);
  assert.equal(r.observedSameRootChanges,3);
  assert.equal(r.physicalPairs,1);
  assert.equal(r.completePairs,1);
  assert.equal(r.matchingInitialSourceDeals,1);
  assert.equal(r.matchingActualFirstPlayers,0);
  assert.equal(r.byArm[1].sourceFirst,null);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('a pair with different native first players remains unqualified',()=>{
  const rows=[
    {trial:{id:'6:0:A:champion-reference',rank:6,repeat:0,
      candidateSlot:'A',seed:123,candidateId:'champion-reference'},
      sourceSeat:1,actualStarterSeat:1,
      sourceDealFingerprint:'a',
      nativeSetupCoinChoiceReceipt:{
        status:'consistent-accepted-native-setup-and-first-draw'}},
    {trial:{id:'6:0:A:new-moon-lockbreaker-v1',rank:6,repeat:0,
      candidateSlot:'A',seed:123,candidateId:'new-moon-lockbreaker-v1'},
      sourceSeat:1,actualStarterSeat:0,
      sourceDealFingerprint:'b',
      nativeSetupCoinChoiceReceipt:{
        status:'consistent-accepted-native-setup-and-first-draw'}}
  ];
  const r=frozenBilateralEvidenceMatrix({
    expectedAttempts:2,attemptedComplete:true,rows
  });
  assert.equal(r.allAttemptRowsPresent,true);
  assert.equal(r.matchingInitialSourceDeals,0);
  assert.equal(r.matchingActualFirstPlayers,0);
  assert.equal(r.byPhysicalSeedPair[0].bothCandidateArmsPresent,true);
});
