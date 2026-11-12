'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {validateOpponentPolicyFieldBundle}=require('../../scripts/agent12-balanced-field-ledger-validator.cjs');
const {sha256}=require('../../simulation/evaluation/2026-11/agent36-4410-policy-provenance.cjs');

const hash=n=>n.toString(16).padStart(64,'0');

function makeCore(unavailable=[]) {
  const ranks=Array.from({length:32},(_,index)=>{
    const rank=index+1;
    if(unavailable.includes(rank)) return {
      rank,sourceStatus:'source-unavailable',
      deckSha256:null,policySha256:null,entryManifestSha256:null,
      challengeSuiteSha256:null,policyProducerId:null
    };
    return {
      rank,sourceStatus:'authenticated',
      deckSha256:hash(1000+rank),policySha256:hash(2000+rank),
      entryManifestSha256:hash(3000+rank),
      challengeSuiteSha256:hash(4000+rank),
      policyProducerId:`opponent-policy-author-${rank}`
    };
  });
  return {
    schema:'aichi-policy-plan-core-v1',
    comparisonMode:'candidate-vs-field',
    candidate:{
      deckSha256:hash(9001),policySha256:hash(9002),
      entryManifestSha256:hash(9003),challengeSuiteSha256:hash(9004),
      policyProducerId:'candidate-policy-author'
    },
    opponentPolicyBundle:{
      schema:'aichi-opponent-policy-bundle-v1',ranks
    },
    constraints:{
      observationSurface:{ownerVisible:true,publicState:true},
      hiddenInformationBoundary:{forbidOpponentPrivateHand:true,forbidDeckOrder:true},
      decisionBudget:{maxNodes:128,deadlineMs:250},
      timeoutPolicy:{maxTimeouts:0,fallback:'safe-legal-action'},
      randomizationProtocol:{algorithm:'seeded-prng',seed:'fixed-preregistration-seed'},
      publicHistoryWindow:{scope:'full-match'},
      resourceAccounting:{energyZones:true,oncePerTurn:true}
    }
  };
}

function makeReceipt(core,rank=1) {
  const candidate=core.candidate;
  const opponent=core.opponentPolicyBundle.ranks[rank-1];
  return {
    trialId:`trial-${rank}`,
    policyRegistrationSha256:hash(7001),
    policyPlanSha256:sha256(core),
    policyAttestationBundleSha256:hash(7002),
    opponentRank:rank,
    candidateDeckSha256:candidate.deckSha256,
    candidatePolicySha256:candidate.policySha256,
    candidateEntryManifestSha256:candidate.entryManifestSha256,
    candidateChallengeSuiteSha256:candidate.challengeSuiteSha256,
    candidatePolicyProducerId:candidate.policyProducerId,
    opponentDeckSha256:opponent.deckSha256,
    opponentPolicySha256:opponent.policySha256,
    opponentEntryManifestSha256:opponent.entryManifestSha256,
    opponentChallengeSuiteSha256:opponent.challengeSuiteSha256,
    opponentPolicyProducerId:opponent.policyProducerId,
    candidateSeat:0,opponentSeat:1,
    policySha256BySeat:[candidate.policySha256,opponent.policySha256],
    enginePin:'a'.repeat(40),runnerRevision:'b'.repeat(40),
    policyConstraintsSha256:sha256(core.constraints),
    decisionTraceSha256:hash(7003),timeoutStatus:'none',
    opponentPolicyBundleSha256:sha256(core.opponentPolicyBundle)
  };
}

test('valid 32-rank policy plan core has a canonical digest and fixed bundle identity',()=>{
  const policyPlanCore=makeCore();
  const digest=sha256(policyPlanCore);
  const result=validateOpponentPolicyFieldBundle({
    policyPlanCore,expectedPolicyPlanSha256:digest
  });
  assert.equal(result.status,'VALID');
  assert.equal(result.policyPlanSha256,digest);
  assert.equal(result.opponentPolicyBundleSha256,sha256(policyPlanCore.opponentPolicyBundle));
  assert.deepEqual(result.availableRanks,Array.from({length:32},(_,i)=>i+1));
  assert.deepEqual(result.unavailableRanks,[]);
  assert.deepEqual(result.rejectionReasons,[]);
});

test('explicit unavailable ranks remain visible and block a complete 32-rank field result',()=>{
  const policyPlanCore=makeCore([23,25,28]);
  const result=validateOpponentPolicyFieldBundle({
    policyPlanCore,expectedPolicyPlanSha256:sha256(policyPlanCore)
  });
  assert.equal(result.status,'INCOMPLETE_FIELD');
  assert.deepEqual(result.unavailableRanks,[23,25,28]);
  assert.deepEqual(result.rejectionReasons,['field-incomplete']);
});

test('candidate and authenticated rank policy producers are required; unavailable ranks have none',()=>{
  const missingCandidate=makeCore();
  delete missingCandidate.candidate.policyProducerId;
  assert.ok(validateOpponentPolicyFieldBundle({policyPlanCore:missingCandidate})
    .rejectionReasons.includes('candidate-policy-producer-unverified'));

  const missingOpponent=makeCore();
  delete missingOpponent.opponentPolicyBundle.ranks[4].policyProducerId;
  assert.ok(validateOpponentPolicyFieldBundle({policyPlanCore:missingOpponent})
    .rejectionReasons.includes('opponent-rank-policy-producer-unverified'));

  const unavailableWithProducer=makeCore([23]);
  unavailableWithProducer.opponentPolicyBundle.ranks[22].policyProducerId=
    'unavailable-opponent-policy-author';
  assert.ok(validateOpponentPolicyFieldBundle({policyPlanCore:unavailableWithProducer})
    .rejectionReasons.includes('unavailable-rank-has-identity'));
});

test('rank order, duplicate identities and source-status payloads fail closed',()=>{
  const reordered=makeCore();
  [reordered.opponentPolicyBundle.ranks[0],reordered.opponentPolicyBundle.ranks[1]]=
    [reordered.opponentPolicyBundle.ranks[1],reordered.opponentPolicyBundle.ranks[0]];
  assert.ok(validateOpponentPolicyFieldBundle({policyPlanCore:reordered})
    .rejectionReasons.includes('opponent-rank-order-invalid'));

  const duplicated=makeCore();
  duplicated.opponentPolicyBundle.ranks[1].rank=1;
  assert.ok(validateOpponentPolicyFieldBundle({policyPlanCore:duplicated})
    .rejectionReasons.includes('opponent-rank-duplicate'));

  const falseUnavailable=makeCore([23]);
  falseUnavailable.opponentPolicyBundle.ranks[22].deckSha256=hash(9999);
  assert.ok(validateOpponentPolicyFieldBundle({policyPlanCore:falseUnavailable})
    .rejectionReasons.includes('unavailable-rank-has-identity'));

  const unauthenticated=makeCore();
  unauthenticated.opponentPolicyBundle.ranks[4].policySha256=null;
  assert.ok(validateOpponentPolicyFieldBundle({policyPlanCore:unauthenticated})
    .rejectionReasons.includes('opponent-rank-identity-unverified'));
});

test('per-game receipt must match the exact rank-specific deck and policy entry',()=>{
  const policyPlanCore=makeCore();
  const good=validateOpponentPolicyFieldBundle({
    policyPlanCore,expectedPolicyPlanSha256:sha256(policyPlanCore),
    gameReceipts:[makeReceipt(policyPlanCore,7)]
  });
  assert.equal(good.status,'VALID');
  assert.equal(good.receiptCount,1);

  const ledgerShaped=makeReceipt(policyPlanCore,7);
  ledgerShaped.rank=ledgerShaped.opponentRank;
  delete ledgerShaped.opponentRank;
  ledgerShaped.candidate60Sha=ledgerShaped.candidateDeckSha256;
  delete ledgerShaped.candidateDeckSha256;
  ledgerShaped.candidatePolicySha=ledgerShaped.candidatePolicySha256;
  delete ledgerShaped.candidatePolicySha256;
  ledgerShaped.source60Sha=ledgerShaped.opponentDeckSha256;
  delete ledgerShaped.opponentDeckSha256;
  ledgerShaped.seat=ledgerShaped.candidateSeat;
  delete ledgerShaped.candidateSeat;
  delete ledgerShaped.opponentSeat;
  ledgerShaped.opponentPolicyBundleSha=ledgerShaped.opponentPolicyBundleSha256;
  delete ledgerShaped.opponentPolicyBundleSha256;
  assert.equal(validateOpponentPolicyFieldBundle({
    policyPlanCore,gameReceipts:[ledgerShaped]
  }).status,'VALID');

  const wrongPolicy=makeReceipt(policyPlanCore,7);
  wrongPolicy.opponentPolicySha256=hash(9998);
  assert.ok(validateOpponentPolicyFieldBundle({
    policyPlanCore,gameReceipts:[wrongPolicy]
  }).rejectionReasons.includes('game-opponent-policy-mismatch'));

  const wrongDeck=makeReceipt(policyPlanCore,7);
  wrongDeck.opponentDeckSha256=hash(9997);
  assert.ok(validateOpponentPolicyFieldBundle({
    policyPlanCore,gameReceipts:[wrongDeck]
  }).rejectionReasons.includes('game-opponent-deck-mismatch'));
});

test('per-game receipt binds candidate and rank-specific policy producer identities',()=>{
  const policyPlanCore=makeCore();

  const wrongCandidateProducer=makeReceipt(policyPlanCore,7);
  wrongCandidateProducer.candidatePolicyProducerId='other-candidate-author';
  assert.ok(validateOpponentPolicyFieldBundle({
    policyPlanCore,gameReceipts:[wrongCandidateProducer]
  }).rejectionReasons.includes('game-candidate-policy-producer-mismatch'));

  const wrongOpponentProducer=makeReceipt(policyPlanCore,7);
  wrongOpponentProducer.opponentPolicyProducerId='wrong-rank-author';
  assert.ok(validateOpponentPolicyFieldBundle({
    policyPlanCore,gameReceipts:[wrongOpponentProducer]
  }).rejectionReasons.includes('game-opponent-policy-producer-mismatch'));
});

test('no game receipt may be admitted against a source-unavailable rank',()=>{
  const policyPlanCore=makeCore([23,25,28]);
  const receipt=makeReceipt(policyPlanCore,23);
  const result=validateOpponentPolicyFieldBundle({
    policyPlanCore,gameReceipts:[receipt]
  });
  assert.equal(result.status,'INVALID');
  assert.ok(result.rejectionReasons.includes('game-against-source-unavailable-rank'));
});

test('distinct per-game registration digests are allowed while policy attestations stay field-constant',()=>{
  const policyPlanCore=makeCore();
  const first=makeReceipt(policyPlanCore,7);
  first.trialId='trial-7-seat-0';
  first.policyRegistrationSha256=hash(8001);

  const second=makeReceipt(policyPlanCore,7);
  second.trialId='trial-7-seat-1';
  second.policyRegistrationSha256=hash(8002);
  second.candidateSeat=1;
  second.opponentSeat=0;
  second.policySha256BySeat=[
    policyPlanCore.opponentPolicyBundle.ranks[6].policySha256,
    policyPlanCore.candidate.policySha256
  ];

  const valid=validateOpponentPolicyFieldBundle({
    policyPlanCore,
    expectedPolicyPlanSha256:sha256(policyPlanCore),
    gameReceipts:[first,second]
  });
  assert.equal(valid.status,'VALID');
  assert.deepEqual(valid.rejectionReasons,[]);

  second.policyAttestationBundleSha256=hash(8003);
  const changedAttestation=validateOpponentPolicyFieldBundle({
    policyPlanCore,
    expectedPolicyPlanSha256:sha256(policyPlanCore),
    gameReceipts:[first,second]
  });
  assert.ok(changedAttestation.rejectionReasons.includes(
    'game-policy-attestation-bundle-changed'));
});

test('candidate seat hash, constraints, engine, runner and plan digests bind each receipt',()=>{
  const policyPlanCore=makeCore();
  const wrongSeat=makeReceipt(policyPlanCore);
  wrongSeat.policySha256BySeat=[wrongSeat.policySha256BySeat[1],wrongSeat.policySha256BySeat[0]];
  assert.ok(validateOpponentPolicyFieldBundle({
    policyPlanCore,gameReceipts:[wrongSeat]
  }).rejectionReasons.includes('game-candidate-seat-policy-mismatch'));

  const wrongConstraints=makeReceipt(policyPlanCore);
  wrongConstraints.policyConstraintsSha256=hash(9996);
  assert.ok(validateOpponentPolicyFieldBundle({
    policyPlanCore,gameReceipts:[wrongConstraints]
  }).rejectionReasons.includes('game-policy-constraints-mismatch'));

  const wrongEngine=makeReceipt(policyPlanCore);
  wrongEngine.enginePin='not-a-git-commit';
  assert.ok(validateOpponentPolicyFieldBundle({
    policyPlanCore,gameReceipts:[wrongEngine]
  }).rejectionReasons.includes('game-engine-pin-unverified'));

  const wrongRunner=makeReceipt(policyPlanCore);
  wrongRunner.runnerRevision='not-a-git-commit';
  assert.ok(validateOpponentPolicyFieldBundle({
    policyPlanCore,gameReceipts:[wrongRunner]
  }).rejectionReasons.includes('game-runner-revision-unverified'));

  const wrongPlan=makeReceipt(policyPlanCore);
  wrongPlan.policyPlanSha256=hash(9995);
  assert.ok(validateOpponentPolicyFieldBundle({
    policyPlanCore,gameReceipts:[wrongPlan]
  }).rejectionReasons.includes('game-policy-plan-digest-mismatch'));
});

test('changing any core identity invalidates a previously frozen plan digest',()=>{
  const policyPlanCore=makeCore();
  const oldDigest=sha256(policyPlanCore);
  policyPlanCore.opponentPolicyBundle.ranks[0].policySha256=hash(8888);
  const result=validateOpponentPolicyFieldBundle({
    policyPlanCore,expectedPolicyPlanSha256:oldDigest
  });
  assert.ok(result.rejectionReasons.includes('policy-plan-digest-mismatch'));
});

test('policy plan core cannot include its own digest or post-deal attestation fields',()=>{
  const selfDigest=makeCore();
  selfDigest.policyPlanSha256=hash(1);
  assert.ok(validateOpponentPolicyFieldBundle({policyPlanCore:selfDigest})
    .rejectionReasons.includes('policy-plan-core-mixes-attestation-or-outcome-data'));

  const attested=makeCore();
  attested.candidatePolicyAttestation={signature:'not-in-core'};
  assert.ok(validateOpponentPolicyFieldBundle({policyPlanCore:attested})
    .rejectionReasons.includes('policy-plan-core-mixes-attestation-or-outcome-data'));
});
