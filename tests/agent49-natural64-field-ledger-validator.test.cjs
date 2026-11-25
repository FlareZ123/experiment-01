'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateNatural64FieldLedger,
  validateNatural64SlotAttempts,
  evaluateNatural64StoppingRule,
  findRepeatedRandomizationMaterialGroups,
  validateRandomizationUniqueness,
  NATURAL64_DECISION_SCHEDULES
} = require('../scripts/agent49-natural64-field-ledger-validator.cjs');
const {evidenceBundleSha256: canonicalSha256} =
  require('../simulation/evaluation/canonical-evidence-json.cjs');
const {PROTOCOL: RNG_PROTOCOL, randomMaterialCommitment} =
  require('../simulation/evaluation/agent37-independent-rng-v1.cjs');
const {
  createSetupCoinChoiceEvidence,
  RECEIPT_SCHEMA,
  RUNNER_EVIDENCE_SCHEMA,
  ADJUDICATOR_EVIDENCE_SCHEMA,
  SETUP_RECEIPT_VERSION,
  RESULT_TO_STATUS
} = require('../scripts/2026-11/shared/terminal-adjudication-receipt.cjs');

const hash = ch => ch.repeat(64);
const gitHash = ch => ch.repeat(40);
function slot(slotId, sequenceIndex, rank, seat) {
  return {slotId, sequenceIndex, roundIndex: 0, rank, seat};
}
function execution({
  attemptId, slotId, sequenceIndex, rank, seat,
  attemptNumber = 1, retryOfAttemptId = null,
  status = 'paper-qualified-win'
}) {
  const preGame = status === 'pre-game-failure';
  return {
    attemptId, trialId: attemptId, slotId, sequenceIndex, roundIndex: 0,
    rank, seat, attemptNumber, retryOfAttemptId, status,
    gameStarted: !preGame, terminalReached: !preGame,
    ...(preGame ? {
      failureClass: 'pre-game-harness-failure',
      failureCriteriaSha256: hash('a'),
      failureEvidenceSha256: hash('b')
    } : {})
  };
}

test('only the preregistered two-look schedule is admitted', () => {
  assert.equal(NATURAL64_DECISION_SCHEDULES.has('two-look-1216-1280'), true);
  assert.equal(NATURAL64_DECISION_SCHEDULES.has('fixed-1280'), false);
});

test('a pre-game failure retries the same stable slot with a new linked attempt id', () => {
  const roster = new Map([
    ['slot-0', slot('slot-0', 0, 1, 0)],
    ['slot-1', slot('slot-1', 1, 1, 1)],
    ['slot-2', slot('slot-2', 2, 2, 0)]
  ]);
  const attempts = [
    execution({attemptId:'a1',slotId:'slot-0',sequenceIndex:0,rank:1,seat:0,status:'pre-game-failure'}),
    execution({attemptId:'a2',slotId:'slot-0',sequenceIndex:0,rank:1,seat:0,attemptNumber:2,retryOfAttemptId:'a1'}),
    execution({attemptId:'a3',slotId:'slot-1',sequenceIndex:1,rank:1,seat:1,status:'paper-qualified-loss'}),
    execution({attemptId:'a4',slotId:'slot-2',sequenceIndex:2,rank:2,seat:0,status:'paper-qualified-no-winner'})
  ];
  const problems = new Set();
  const result = validateNatural64SlotAttempts(attempts,roster,{maxPreGameRetriesPerSlot:1,preGameFailureCriteriaSha256:hash('a')},problems);
  assert.equal(problems.size,0,[...problems].join(','));
  assert.equal(result.preGameFailureCount,1);
  assert.equal(result.completedSlotCount,3);
  assert.deepEqual(result.playedAttempts.map(a=>a.attemptId),['a2','a3','a4']);
});

test('a pre-game failure cannot be silently skipped in favor of the next slot', () => {
  const roster = new Map([
    ['slot-0', slot('slot-0',0,1,0)],
    ['slot-1', slot('slot-1',1,1,1)]
  ]);
  const attempts = [
    execution({attemptId:'a1',slotId:'slot-0',sequenceIndex:0,rank:1,seat:0,status:'pre-game-failure'}),
    execution({attemptId:'a2',slotId:'slot-1',sequenceIndex:1,rank:1,seat:1})
  ];
  const problems = new Set();
  validateNatural64SlotAttempts(attempts,roster,{maxPreGameRetriesPerSlot:1,preGameFailureCriteriaSha256:hash('a')},problems);
  assert.ok(problems.has('pre-game-retry-skipped-before-next-slot'));
});

test('a played terminal cannot be replayed as a retry of the same slot', () => {
  const roster = new Map([['slot-0',slot('slot-0',0,1,0)]]);
  const attempts = [
    execution({attemptId:'a1',slotId:'slot-0',sequenceIndex:0,rank:1,seat:0}),
    execution({attemptId:'a2',slotId:'slot-0',sequenceIndex:0,rank:1,seat:0,attemptNumber:2,retryOfAttemptId:'a1'})
  ];
  const problems = new Set();
  validateNatural64SlotAttempts(attempts,roster,{maxPreGameRetriesPerSlot:1,preGameFailureCriteriaSha256:hash('a')},problems);
  assert.ok(problems.has('retry-after-played-terminal-or-out-of-order'));
});

test('an exhausted pre-game retry budget invalidates the slot rather than dropping it', () => {
  const roster = new Map([['slot-0',slot('slot-0',0,1,0)]]);
  const attempts = [
    execution({attemptId:'a1',slotId:'slot-0',sequenceIndex:0,rank:1,seat:0,status:'pre-game-failure'}),
    execution({attemptId:'a2',slotId:'slot-0',sequenceIndex:0,rank:1,seat:0,attemptNumber:2,retryOfAttemptId:'a1',status:'pre-game-failure'})
  ];
  const problems = new Set();
  validateNatural64SlotAttempts(attempts,roster,{maxPreGameRetriesPerSlot:1,preGameFailureCriteriaSha256:hash('a')},problems);
  assert.ok(problems.has('pre-game-retry-budget-exhausted'));
});

test('no-winner is counted as a nonwin in the sequential futility rule', () => {
  const wins = [
    {attemptId:'w1',status:'paper-qualified-win'},
    {attemptId:'w2',status:'paper-qualified-win'}
  ];
  const played = [
    ...wins,
    {attemptId:'l1',status:'paper-qualified-loss'},
    {attemptId:'t1',status:'paper-qualified-tie'},
    {attemptId:'n1',status:'paper-qualified-no-winner'}
  ];
  const problems = new Set();
  const result = evaluateNatural64StoppingRule(played,played,{decisionSchedule:'two-look-1216-1280'},problems);
  assert.equal(result.disposition,'FUTILITY_STOP');
  assert.equal(result.met,false);
  assert.deepEqual(result.counts,{wins:2,losses:1,ties:1,noWinners:1});
  assert.equal(problems.size,0);
});

test('the two-look all-win pass stops at exactly 1216 played games', () => {
  const played = Array.from({length:1216},(_,i)=>({attemptId:'w'+i,status:'paper-qualified-win'}));
  const problems = new Set();
  const result = evaluateNatural64StoppingRule(played,played,{decisionSchedule:'two-look-1216-1280'},problems);
  assert.equal(result.disposition,'PASS_EARLY_ALL_WIN');
  assert.equal(result.met,true);
  assert.equal(problems.size,0);
});

test('any execution after the 1216 all-win early pass invalidates the stopping rule', () => {
  const played = Array.from({length:1217},(_,i)=>({attemptId:'w'+i,status:'paper-qualified-win'}));
  const problems = new Set();
  const result = evaluateNatural64StoppingRule(played,played,{decisionSchedule:'two-look-1216-1280'},problems);
  assert.equal(result.disposition,'INVALID_STOP');
  assert.ok(problems.has('two-look-continued-after-early-pass'));
});

test('third nonwin must be the final raw execution, including no pre-game retry afterward', () => {
  const played = [
    {attemptId:'w1',status:'paper-qualified-win'},
    {attemptId:'l1',status:'paper-qualified-loss'},
    {attemptId:'t1',status:'paper-qualified-tie'},
    {attemptId:'n1',status:'paper-qualified-no-winner'}
  ];
  const raw = [...played,{attemptId:'late-retry',status:'pre-game-failure'}];
  const problems = new Set();
  const result = evaluateNatural64StoppingRule(raw,played,{decisionSchedule:'two-look-1216-1280'},problems);
  assert.equal(result.disposition,'INVALID_STOP');
  assert.ok(problems.has('futility-stop-not-immediate'));
});

test('repeated exact RNG material is identified for structural rejection', () => {
  const attempts = [
    {attemptId:'a1',rngMaterialCommitment:hash('a')},
    {attemptId:'a2',rngMaterialCommitment:hash('a')},
    {attemptId:'a3',rngMaterialCommitment:hash('b')}
  ];
  const groups = findRepeatedRandomizationMaterialGroups(attempts);
  assert.equal(groups.length,1);
  assert.equal(groups[0].commitment,hash('a'));
  assert.deepEqual(groups[0].attemptIds,['a1','a2']);
});


test('duplicate exact RNG material invalidates the structural ledger; seed labels are irrelevant', () => {
  const commitment = hash('a');
  const problems = new Set();
  const groups = validateRandomizationUniqueness([
    {attemptId:'a1',seed:'same-label',rngMaterialCommitment:commitment},
    {attemptId:'a2',seed:'same-label',rngMaterialCommitment:commitment}
  ],problems);
  assert.equal(groups.length,1);
  assert.ok(problems.has('independent-rng-material-replayed-across-attempts'));
  const independent = new Set();
  const distinct = validateRandomizationUniqueness([
    {attemptId:'b1',seed:'same-label',rngMaterialCommitment:hash('b')},
    {attemptId:'b2',seed:'same-label',rngMaterialCommitment:hash('c')}
  ],independent);
  assert.equal(distinct.length,0);
  assert.equal(independent.size,0);
});

test('pre-game failure evidence must bind the preregistered abort criteria digest', () => {
  const roster = new Map([['slot-0',slot('slot-0',0,1,0)]]);
  const attempt = execution({
    attemptId:'a1',slotId:'slot-0',sequenceIndex:0,rank:1,seat:0,
    status:'pre-game-failure'
  });
  attempt.failureCriteriaSha256 = hash('c');
  const problems = new Set();
  validateNatural64SlotAttempts(
    [attempt],roster,
    {maxPreGameRetriesPerSlot:1,preGameFailureCriteriaSha256:hash('a')},
    problems
  );
  assert.ok(problems.has('pre-game-failure-evidence-invalid'));
});


function makePublicPolicyCore() {
  const ranks = Array.from({length:32},(_,index)=>{
    const rank=index+1;
    return {
      rank,sourceStatus:'authenticated',
      deckSha256:hash((index+1).toString(16)[0]),
      policySha256:hash((index+2).toString(16)[0]),
      entryManifestSha256:hash((index+3).toString(16)[0]),
      challengeSuiteSha256:hash((index+4).toString(16)[0]),
      policyProducerId:'opponent-policy-author-'+rank
    };
  });
  return {
    schema:'aichi-policy-plan-core-v1',
    comparisonMode:'candidate-vs-field',
    candidate:{
      deckSha256:hash('c'),policySha256:hash('d'),
      entryManifestSha256:hash('e'),challengeSuiteSha256:hash('f'),
      policyProducerId:'candidate-policy-author'
    },
    opponentPolicyBundle:{schema:'aichi-opponent-policy-bundle-v1',ranks},
    constraints:{
      observationSurface:{ownerVisible:true,publicState:true},
      hiddenInformationBoundary:{forbidOpponentPrivateHand:true,forbidDeckOrder:true},
      decisionBudget:{maxNodes:128,deadlineMs:250},
      timeoutPolicy:{maxTimeouts:0,fallback:'safe-legal-action'},
      randomizationProtocol:{algorithm:'seeded-prng',seed:'synthetic-test-only'},
      publicHistoryWindow:{scope:'full-match'},
      resourceAccounting:{energyZones:true,oncePerTurn:true}
    }
  };
}

function makePublicEntryFixture() {
  const policyPlanCore=makePublicPolicyCore();
  const candidate=policyPlanCore.candidate;
  const policyPlanSha256=canonicalSha256(policyPlanCore);
  const opponentPolicyBundleSha=canonicalSha256(policyPlanCore.opponentPolicyBundle);
  const originalSources=policyPlanCore.opponentPolicyBundle.ranks.map(entry=>({
    rank:entry.rank,source60Sha:entry.deckSha256,authenticatedSource60:true
  }));
  const engineAndHooksSha=hash('9');
  const enginePin=gitHash('a');
  const runnerRevision=gitHash('b');
  const adjudicationProtocol={
    schema:'aichi-natural64-adjudication-protocol-v1',
    rules:[{
      ruleId:'engine-winner',
      reason:'engine-winner',
      terminalClass:'engine-winner',
      allowedResults:['candidate-win','candidate-loss'],
      clockMode:'clock-free-game-win'
    }]
  };
  const adjudicationProtocolSha256=canonicalSha256(adjudicationProtocol);
  const slots=Array.from({length:1280},(_,sequenceIndex)=>{
    const roundIndex=Math.floor(sequenceIndex/64);
    const cell=sequenceIndex%64;
    return {
      slotId:'slot-'+sequenceIndex,
      sequenceIndex,
      roundIndex,
      rank:Math.floor(cell/2)+1,
      seat:cell%2
    };
  });
  const manifest={
    schema:'aichi-natural64-field-registration-v4',
    samplingModel:'balanced-natural-64-strata-v1',
    target:0.995,
    confidence:0.95,
    registeredSlotCount:1280,
    gamesPerStratum:20,
    decisionSchedule:'two-look-1216-1280',
    look1GameCount:1216,
    maxNonwins:2,
    stopAfterThirdNonwin:true,
    preGameFailureDisposition:'retry-registered-budget-then-invalidate-batch',
    maxPreGameRetriesPerSlot:1,
    preGameFailureCriteriaSha256:hash('a'),
    clockMode:'clock-free-game-win',
    adjudicationProtocolSha256,
    adjudicationProtocol,
    randomizationProtocol:RNG_PROTOCOL,
    unbiasedShuffleMethod:'fisher-yates-bounded-rejection-v1',
    rngProtocolModuleSha:gitHash('c'),
    candidate60Sha:candidate.deckSha256,
    candidatePolicySha:candidate.policySha256,
    engineAndHooksSha,
    opponentPolicyBundleSha,
    policyPlanSha256,
    twinleafPin:enginePin,
    runnerRevision,
    registeredAt:'2026-11-25T11:59:00Z',
    originalSources:originalSources.map(({rank,source60Sha})=>({rank,source60Sha})),
    slots
  };
  const registrationSha=canonicalSha256(manifest);
  const attemptId='attempt-0';
  const slotId='slot-0';
  const trialId=attemptId;
  const policyRegistrationSha256=hash('7');
  const policyAttestationBundleSha256=hash('8');
  const opponent=policyPlanCore.opponentPolicyBundle.ranks[0];
  const policyPanelReceipt={
    trialId,
    policyRegistrationSha256,
    policyPlanSha256,
    policyAttestationBundleSha256,
    opponentRank:1,
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
    candidateSeat:0,
    opponentSeat:1,
    firstPlayerSeat:0,
    policySha256BySeat:[candidate.policySha256,opponent.policySha256],
    enginePin,
    runnerRevision,
    policyConstraintsSha256:canonicalSha256(policyPlanCore.constraints),
    decisionTraceSha256:hash('6'),
    timeoutStatus:'none',
    opponentPolicyBundleSha256:opponentPolicyBundleSha
  };
  policyPanelReceipt.receiptSha256=canonicalSha256(policyPanelReceipt);

  const rngMaterial={
    schema:'aichi-independent-rng-material-v1',
    algorithm:'hmac-sha256-counter-v1',
    streams:{
      shuffleSeat0:hash('1'),
      shuffleSeat1:hash('2'),
      coin:hash('3'),
      engine:hash('4'),
      policySeat0:hash('5'),
      policySeat1:hash('6')
    }
  };
  const rngMaterialCommitmentValue=randomMaterialCommitment(rngMaterial);
  const effectiveMatchOptions={
    rngProtocol:RNG_PROTOCOL,
    physicalShuffleRandomIsolation:true,
    aichiFieldPaperShuffleRandomIsolation:true,
    aichiFieldPaperShuffleRandomIsolationHooks:[
      'Gladion CIN','Hisuian Heavy Ball ASR','Marnie SSH','Iono PAL'
    ],
    unbiasedShuffleMethod:'fisher-yates-bounded-rejection-v1',
    hisuianHeavyBallPrizeShuffleCorrection:true,
    coinRandomIsolation:true,
    engineRandomIsolation:true
  };
  const randomizationPayload={
    schema:'aichi-natural64-rng-receipt-v1',
    trialId,
    rngProtocol:RNG_PROTOCOL,
    rngMaterialCommitment:rngMaterialCommitmentValue,
    observedRngProtocol:RNG_PROTOCOL,
    observedRngMaterialCommitment:rngMaterialCommitmentValue,
    coinWinnerSeat:0,
    unbiasedShuffleMethod:effectiveMatchOptions.unbiasedShuffleMethod,
    effectiveMatchOptions
  };
  const setupReceipt={
    version:SETUP_RECEIPT_VERSION,
    status:'consistent-accepted-native-setup-and-first-draw',
    coin:{ordinal:1,resolution:'accepted-native-prompt',heads:true,coinWinnerSeat:0},
    choice:{ordinal:2,resolution:'accepted-native-prompt',choiceOwnerSeat:0,choseFirst:true},
    firstSeatFromAcceptedSetup:0,
    firstSeatFromVerifiedDraw:0,
    nativeFirstDrawVerified:true,
    firstSetupOnly:true,
    malformedNativeSetupEvents:0,
    fullGamePolicyCertified:false,
    officialCoinChoiceRuleCertified:false,
    competitiveGameQualified:false
  };
  const setupCoinChoiceEvidence=createSetupCoinChoiceEvidence({
    attemptId,trialId,slotId,receipt:setupReceipt
  });
  const attempt={
    attemptId,trialId,slotId,sequenceIndex:0,roundIndex:0,
    attemptNumber:1,retryOfAttemptId:null,
    rank:1,seat:0,opponentSeat:1,
    firstPlayerSeat:0,actualFirstPlayerSeat:0,
    coinWinnerSeat:0,chooserSeat:0,goFirstResponse:'yes',hostOverride:false,
    physicalDealId:'deal-0',paperReceiptId:'paper-0',
    status:'paper-qualified-win',gameStarted:true,terminalReached:true,
    source60Sha:originalSources[0].source60Sha,
    candidate60Sha:candidate.deckSha256,
    candidatePolicySha:candidate.policySha256,
    engineAndHooksSha,
    opponentPolicyBundleSha,
    adjudicationProtocolSha256,
    registrationSha,
    enginePin,runnerRevision,
    startedAt:'2026-11-25T12:00:00Z',
    endedAt:'2026-11-25T12:01:00Z',
    policyPlanSha256,
    policyRegistrationSha256,
    policyAttestationBundleSha256,
    policyApplicationReceiptSha256:policyPanelReceipt.receiptSha256,
    rngMaterial,
    rngMaterialCommitment:rngMaterialCommitmentValue,
    observedRngProtocol:RNG_PROTOCOL,
    observedRngMaterialCommitment:rngMaterialCommitmentValue,
    effectiveMatchOptions,
    randomizationReceiptSha256:canonicalSha256(randomizationPayload),
    setupCoinChoiceReceiptSha256:setupCoinChoiceEvidence.receiptSha256,
    setupCoinChoiceEvidenceSha256:setupCoinChoiceEvidence.evidenceSha256
  };
  const runnerEvidence={
    schema:RUNNER_EVIDENCE_SCHEMA,
    attemptId,slotId,enginePin,runnerRevision,
    gameStarted:true,terminalReached:true,
    terminalEventSha256:hash('e'),
    engineTerminalSha256:hash('f'),
    capturedAt:'2026-11-25T12:01:01Z'
  };
  runnerEvidence.evidenceSha256=canonicalSha256(runnerEvidence);
  const protocolRule=adjudicationProtocol.rules[0];
  const adjudicationEvidence={
    schema:ADJUDICATOR_EVIDENCE_SCHEMA,
    attemptId,slotId,
    adjudicationProtocolSha256,
    protocolRuleId:protocolRule.ruleId,
    protocolRuleSha256:canonicalSha256(protocolRule),
    runnerEvidenceSha256:runnerEvidence.evidenceSha256,
    terminalEventSha256:runnerEvidence.terminalEventSha256,
    engineTerminalSha256:runnerEvidence.engineTerminalSha256,
    clockMode:'clock-free-game-win',
    adjudicatorId:'synthetic-adjudicator',
    adjudicatedAt:'2026-11-25T12:01:02Z',
    terminalClass:'engine-winner',
    adjudicationReason:'engine-winner',
    adjudicatedCandidateResult:'candidate-win',
    attestationSha256:hash('d')
  };
  adjudicationEvidence.evidenceSha256=canonicalSha256(adjudicationEvidence);
  const terminalReceipt={
    schema:RECEIPT_SCHEMA,
    attemptId,trialId,slotId,paperReceiptId:attempt.paperReceiptId,
    registrationSha,rank:1,candidatePhysicalSeat:0,actualStarterSeat:0,
    firstPlayerSeat:0,coinWinnerSeat:0,chooserSeat:0,goFirstResponse:'yes',
    physicalDealId:attempt.physicalDealId,
    source60Sha:attempt.source60Sha,
    candidate60Sha:attempt.candidate60Sha,
    candidatePolicySha:attempt.candidatePolicySha,
    engineAndHooksSha,opponentPolicyBundleSha,
    adjudicationProtocolSha256,
    protocolRuleId:protocolRule.ruleId,
    protocolRuleSha256:canonicalSha256(protocolRule),
    clockMode:'clock-free-game-win',
    rngMaterialCommitmentSha256:rngMaterialCommitmentValue,
    setupCoinChoiceReceiptSha256:setupCoinChoiceEvidence.receiptSha256,
    setupCoinChoiceEvidenceSha256:setupCoinChoiceEvidence.evidenceSha256,
    runnerEvidenceSha256:runnerEvidence.evidenceSha256,
    adjudicationEvidenceSha256:adjudicationEvidence.evidenceSha256,
    terminalEventSha256:runnerEvidence.terminalEventSha256,
    engineTerminalSha256:runnerEvidence.engineTerminalSha256,
    adjudicatorAttestationSha256:adjudicationEvidence.attestationSha256,
    adjudicatorId:adjudicationEvidence.adjudicatorId,
    adjudicatedAt:adjudicationEvidence.adjudicatedAt,
    terminalClass:'engine-winner',
    adjudicationReason:'engine-winner',
    adjudicatedCandidateResult:'candidate-win',
    statisticalStatus:'paper-qualified-win',
    gameStarted:true,terminalReached:true,adjudicationStatus:'determinate'
  };
  terminalReceipt.receiptSha256=canonicalSha256(terminalReceipt);
  attempt.terminalAdjudicationReceipt=terminalReceipt;
  attempt.terminalAdjudicationReceiptSha256=terminalReceipt.receiptSha256;

  return {
    target:0.995,confidence:0.95,registeredSlotCount:1280,
    stratumSamplingModel:'balanced-natural-64-strata-v1',
    originalSources,attempts:[attempt],
    registrationSha,
    fieldSamplingRegistration:manifest,
    policyPlanCore,policyPlanSha256,
    policyPanelReceipts:[policyPanelReceipt],
    runnerTerminalEvidence:[runnerEvidence],
    adjudicationEvidence:[adjudicationEvidence],
    setupCoinChoiceEvidence:[setupCoinChoiceEvidence]
  };
}

test('public natural64 validator composes a complete registered field with one synthetic played attempt', () => {
  const request=makePublicEntryFixture();
  const result=validateNatural64FieldLedger(request);
  assert.equal(result.status,'INCOMPLETE');
  assert.deepEqual(result.rejectionReasons,[]);
  assert.equal(result.registeredSlotCount,1280);
  assert.equal(result.playedGameCount,1);
  assert.equal(result.winCount,1);
  assert.equal(result.designThresholdMet,null);
  assert.equal(result.samplingModelRegistrationValid,true);
});

test('public natural64 validator rejects missing adjudicator evidence for a played attempt', () => {
  const request=makePublicEntryFixture();
  request.adjudicationEvidence=[];
  const result=validateNatural64FieldLedger(request);
  assert.equal(result.status,'INVALID');
  assert.ok(result.rejectionReasons.includes('adjudicator-evidence-count-mismatch'));
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-independent-adjudicator-evidence-missing'));
});

test('public natural64 validator rejects a terminal receipt whose statistical status disagrees with the attempt', () => {
  const request=makePublicEntryFixture();
  request.attempts[0].status='paper-qualified-loss';
  const result=validateNatural64FieldLedger(request);
  assert.equal(result.status,'INVALID');
  assert.ok(result.rejectionReasons.includes('terminal-adjudication-result-status-mismatch'));
});
