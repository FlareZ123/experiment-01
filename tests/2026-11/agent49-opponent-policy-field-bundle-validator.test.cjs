'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {validateFieldLedger,validateOpponentPolicyFieldBundle}=require('../../scripts/agent12-balanced-field-ledger-validator.cjs');
const {assessPerfectField}=require('../../scripts/agent12-balanced-perfect-field-bound.cjs');
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

function makeV3Ledger(perStratum=1) {
  const policyPlanCore=makeCore();
  const candidate=policyPlanCore.candidate;
  const policyPlanSha256=sha256(policyPlanCore);
  const opponentPolicyBundleSha256=sha256(policyPlanCore.opponentPolicyBundle);
  const originalSources=policyPlanCore.opponentPolicyBundle.ranks.map(entry=>({
    rank:entry.rank,source60Sha:entry.deckSha256,authenticatedSource60:true
  }));
  const attempts=[];
  const policyPanelReceipts=[];
  const registrationSha=hash(9001);
  let sequence=0;

  for(const opponent of policyPlanCore.opponentPolicyBundle.ranks) {
    for(const seat of [0,1]) {
      for(const firstPlayerSeat of [0,1]) {
        for(let sample=0; sample<perStratum; sample++) {
          const id=opponent.rank+'/'+seat+'/'+firstPlayerSeat+'/'+sample;
        const receipt=makeReceipt(policyPlanCore,opponent.rank);
        receipt.trialId='trial/'+id;
        receipt.candidateSeat=seat;
        receipt.opponentSeat=1-seat;
        receipt.firstPlayerSeat=firstPlayerSeat;
        receipt.policyRegistrationSha256=hash(8000+sequence);
        receipt.policyPlanSha256=policyPlanSha256;
        receipt.policyAttestationBundleSha256=hash(7002);
        receipt.opponentPolicyBundleSha256=opponentPolicyBundleSha256;
        receipt.policySha256BySeat=seat===0 ?
          [candidate.policySha256,opponent.policySha256] :
          [opponent.policySha256,candidate.policySha256];
        receipt.decisionTraceSha256=hash(10000+sequence);
        receipt.receiptSha256=sha256(receipt);
        policyPanelReceipts.push(receipt);

        attempts.push({
          rank:opponent.rank,seat,firstPlayerSeat,
          trialId:receipt.trialId,
          physicalDealId:'deal/'+id,
          paperReceiptId:'paper/'+id,
          status:'paper-qualified-win',
          source60Sha:opponent.deckSha256,
          candidate60Sha:candidate.deckSha256,
          candidatePolicySha:candidate.policySha256,
          registrationSha,
          engineAndHooksSha:hash(9002),
          opponentPolicyBundleSha:opponentPolicyBundleSha256,
          adjudicationProtocolSha:hash(9003),
          policyPlanSha256,
          policyRegistrationSha256:receipt.policyRegistrationSha256,
          policyAttestationBundleSha256:receipt.policyAttestationBundleSha256,
          policyApplicationReceiptSha256:receipt.receiptSha256
        });
        sequence++;
        }
      }
    }
  }
  return {
    originalSources,attempts,registeredAttemptCount:attempts.length,
    registrationSha,target:0.995,confidence:0.95,
    policyPlanCore,policyPlanSha256,policyPanelReceipts
  };
}

test('the 128-stratum outcome ledger joins each trial to its exact V3 rank policy receipt',()=>{
  const request=makeV3Ledger();
  const valid=validateFieldLedger(request,['paper-qualified-win'],'unqualified');
  assert.deepEqual(valid.rejectionReasons,[]);
  assert.equal(valid.totalAttempts,128);
  assert.equal(valid.attemptsPerRankSeatAndFirstPlayer,1);

  const wrongCell=makeV3Ledger();
  wrongCell.attempts[0].firstPlayerSeat=1;
  const cellMismatch=validateFieldLedger(wrongCell,['paper-qualified-win'],'unqualified');
  assert.ok(cellMismatch.rejectionReasons.includes(
    'v3-policy-receipt-outcome-mismatch'));

  const missingReceipt=makeV3Ledger();
  missingReceipt.policyPanelReceipts.pop();
  const incomplete=validateFieldLedger(
    missingReceipt,['paper-qualified-win'],'unqualified');
  assert.ok(incomplete.rejectionReasons.includes(
    'v3-policy-panel-attempt-count-mismatch'));
  assert.ok(incomplete.rejectionReasons.includes(
    'v3-policy-receipt-missing-for-outcome'));

  const wrongPolicy=makeV3Ledger();
  const receipt=wrongPolicy.policyPanelReceipts[0];
  receipt.opponentPolicySha256=hash(9999);
  delete receipt.receiptSha256;
  receipt.receiptSha256=sha256(receipt);
  const policyMismatch=validateFieldLedger(wrongPolicy,['paper-qualified-win'],'unqualified');
  assert.ok(policyMismatch.rejectionReasons.includes('v3-policy-panel-invalid'));
});

test('synthetic 640-win V3 ledger clears the conditional 99.5% all-win bound',()=>{
  const result=assessPerfectField(makeV3Ledger(5));
  assert.deepEqual(result.rejectionReasons,[]);
  assert.equal(result.totalAttempts,640);
  assert.equal(result.attemptsPerRankSeatAndFirstPlayer,5);
  assert.equal(result.requiredPerRankSeatAndFirstPlayer,5);
  assert.equal(result.conditionalStatisticalThresholdMet,true);
  assert.ok(result.conditionalLowerBound>=0.995);
  assert.equal(result.externalPaperAndIndependenceAuditRequired,true);
});

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


function makeCurrentExpandedFieldMatrixCore() {
  const core=makeCore([23,25,28]);
  const incompatibleRanks=[3,6,7,24,29];
  core.candidateFormat='Expanded';
  core.gameRuleset='Expanded';
  core.opponentSourceEventFormat='Japanese Extra';
  core.formatReviewStatus='independently-reviewed';
  core.candidate.formatStatus='legal';
  core.candidate.formatStatusEvidenceRef=
    'reviews/candidate-expanded-legality-2026-11-13.json';
  Object.assign(core.constraints,{
    candidateFormat:'Expanded',
    gameRuleset:'Expanded',
    opponentSourceEventFormat:'Japanese Extra',
    formatReviewStatus:'independently-reviewed',
    expandedLegalityAsOf:'2026-11-13',
    eventDate:null
  });
  for(const rank of core.opponentPolicyBundle.ranks) {
    if(rank.sourceStatus==='source-unavailable') continue;
    rank.formatStatus=incompatibleRanks.includes(rank.rank) ?
      'incompatible' : 'unverified';
    rank.policySha256=null;
    rank.entryManifestSha256=null;
    rank.challengeSuiteSha256=null;
    rank.policyProducerId=null;
    rank.formatStatusEvidenceRef=rank.formatStatus==='incompatible' ?
      'results/aichi-2026/2026-11/agent3/format-contract-player-ceremony-20261112.md' :
      null;
  }
  return core;
}

test('the current Aichi Expanded field matrix has zero legal available ranks',()=>{
  const policyPlanCore=makeCurrentExpandedFieldMatrixCore();
  const result=validateOpponentPolicyFieldBundle({
    policyPlanCore,
    expectedPolicyPlanSha256:sha256(policyPlanCore)
  });
  const expectedUnverified=Array.from({length:32},(_,index)=>index+1)
    .filter(rank=>![3,6,7,23,24,25,28,29].includes(rank));
  assert.equal(expectedUnverified.length,24);
  assert.equal(result.status,'INCOMPLETE_FIELD');
  assert.deepEqual(result.availableRanks,[]);
  assert.deepEqual(result.formatIncompatibleRanks,[3,6,7,24,29]);
  assert.deepEqual(result.formatUnverifiedRanks,expectedUnverified);
  assert.deepEqual(result.unavailableRanks,[23,25,28]);
  assert.deepEqual(result.rejectionReasons.sort(),[
    'field-format-incompatible','field-format-unverified','field-incomplete'
  ].sort());

  const incompatibleReceipt=validateOpponentPolicyFieldBundle({
    policyPlanCore,gameReceipts:[makeReceipt(policyPlanCore,3)]
  });
  assert.equal(incompatibleReceipt.status,'INVALID');
  assert.ok(incompatibleReceipt.rejectionReasons.includes(
    'game-against-format-incompatible-rank'));

  const unverifiedReceipt=validateOpponentPolicyFieldBundle({
    policyPlanCore,gameReceipts:[makeReceipt(policyPlanCore,1)]
  });
  assert.equal(unverifiedReceipt.status,'INVALID');
  assert.ok(unverifiedReceipt.rejectionReasons.includes(
    'game-against-format-unverified-rank'));
});

test('per-game fixture markers must be boolean and match the field validation mode',()=>{
  const policyPlanCore=makeCore();
  const expectedPolicyPlanSha256=sha256(policyPlanCore);

  const fixtureReceipt=makeReceipt(policyPlanCore,7);
  fixtureReceipt.fixtureOnly=true;
  const fixtureMismatch=validateOpponentPolicyFieldBundle({
    policyPlanCore,expectedPolicyPlanSha256,gameReceipts:[fixtureReceipt]
  });
  assert.equal(fixtureMismatch.status,'INVALID');
  assert.ok(fixtureMismatch.rejectionReasons.includes('game-fixture-marker-mismatch'));

  const malformedReceipt=makeReceipt(policyPlanCore,7);
  malformedReceipt.fixtureOnly='true';
  const malformed=validateOpponentPolicyFieldBundle({
    policyPlanCore,expectedPolicyPlanSha256,gameReceipts:[malformedReceipt]
  });
  assert.equal(malformed.status,'INVALID');
  assert.ok(malformed.rejectionReasons.includes('game-fixture-marker-type-invalid'));

  const explicitFalseReceipt=makeReceipt(policyPlanCore,7);
  explicitFalseReceipt.fixtureOnly=false;
  const explicitFalse=validateOpponentPolicyFieldBundle({
    policyPlanCore,expectedPolicyPlanSha256,gameReceipts:[explicitFalseReceipt]
  });
  assert.equal(explicitFalse.status,'VALID');
});
