'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateNatural64FieldLedger,
  validateNatural64SlotAttempts,
  evaluateNatural64StoppingRule,
  findRepeatedRandomizationMaterialGroups,
  findRepeatedRandomizationStreamKeyGroups,
  validatePhysicalDealUniqueness,
  validateAdjudicationProtocol,
  PRE_GAME_FAILURE_EVIDENCE_SCHEMA,
  NATURAL64_DECISION_SCHEDULES
} = require('../../scripts/agent12-natural64-field-ledger-validator.cjs');
const {evidenceBundleSha256: canonicalSha256} =
  require('../../simulation/evaluation/canonical-evidence-json.cjs');
const {PROTOCOL: RNG_PROTOCOL, randomMaterialCommitment} =
  require('../../simulation/evaluation/agent37-independent-rng-v1.cjs');
const {
  createSetupCoinChoiceEvidence,
  RECEIPT_SCHEMA,
  RUNNER_EVIDENCE_SCHEMA,
  ADJUDICATOR_EVIDENCE_SCHEMA,
  SETUP_RECEIPT_VERSION,
  RESULT_TO_STATUS,
  NO_WINNER_STATUS,
  TERMINAL_CLASS_ALLOWED_RESULTS
} = require('../../scripts/2026-11/shared/terminal-adjudication-receipt.cjs');

const hash = ch => ch.repeat(64);
function seal(record, field) {
  const payload = {...record};
  delete payload[field];
  record[field] = canonicalSha256(payload);
  return record;
}
const gitHash = ch => ch.repeat(40);
const hexHash = n => n.toString(16).padStart(64,'0');
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

test('repeated exact RNG material is identified for audit, not structural rejection', () => {
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


test('duplicate exact RNG material is preserved and identified as a collision; seed labels are irrelevant', () => {
  const commitment = hash('a');
  const groups = findRepeatedRandomizationMaterialGroups([
    {attemptId:'a1',seed:'same-label',rngMaterialCommitment:commitment},
    {attemptId:'a2',seed:'same-label',rngMaterialCommitment:commitment}
  ]);
  assert.equal(groups.length,1);
  assert.deepEqual(groups[0].attemptIds,['a1','a2']);
  const distinct = findRepeatedRandomizationMaterialGroups([
    {attemptId:'b1',seed:'same-label',rngMaterialCommitment:hash('b')},
    {attemptId:'b2',seed:'same-label',rngMaterialCommitment:hash('c')}
  ]);
  assert.equal(distinct.length,0);
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
      deckSha256:hexHash(1000+rank),
      policySha256:hexHash(2000+rank),
      entryManifestSha256:hexHash(3000+rank),
      challengeSuiteSha256:hexHash(4000+rank),
      policyProducerId:'opponent-policy-author-'+rank
    };
  });
  return {
    schema:'aichi-policy-plan-core-v1',
    comparisonMode:'candidate-vs-field',
    candidate:{
      deckSha256:hexHash(9001),policySha256:hexHash(9002),
      entryManifestSha256:hexHash(9003),challengeSuiteSha256:hexHash(9004),
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
    schema:'aichi-natural64-adjudication-protocol-v2',
    rules:[
      {ruleId:'engine-winner',reason:'engine-winner',terminalClass:'engine-winner',
        allowedResults:['candidate-win','candidate-loss'],clockMode:'clock-free-game-win'},
      {ruleId:'opponent-forfeit',reason:'opponent-forfeit',terminalClass:'opponent-forfeit',
        allowedResults:['candidate-win'],clockMode:'clock-free-game-win'},
      {ruleId:'opponent-concession',reason:'opponent-concession',terminalClass:'opponent-concession',
        allowedResults:['candidate-win'],clockMode:'clock-free-game-win'},
      {ruleId:'opponent-timeout',reason:'opponent-timeout',terminalClass:'opponent-timeout',
        allowedResults:['candidate-win'],clockMode:'clock-free-game-win'},
      {ruleId:'candidate-forfeit',reason:'candidate-forfeit',terminalClass:'candidate-forfeit',
        allowedResults:['candidate-loss'],clockMode:'clock-free-game-win'},
      {ruleId:'candidate-illegal-action',reason:'candidate-illegal-action',terminalClass:'candidate-illegal-action',
        allowedResults:['candidate-loss'],clockMode:'clock-free-game-win'},
      {ruleId:'candidate-timeout',reason:'candidate-timeout',terminalClass:'candidate-timeout',
        allowedResults:['candidate-loss'],clockMode:'clock-free-game-win'},
      {ruleId:'draw',reason:'draw',terminalClass:'draw',
        allowedResults:['genuine-tie'],clockMode:'clock-free-game-win'},
      {ruleId:'ambiguous-played-terminal',reason:'ambiguous-played-terminal',terminalClass:'no-winner',
        allowedResults:[null],clockMode:'clock-free-game-win'},
      {ruleId:'top32-prize-tiebreaker',reason:'top32-prize-tiebreaker',
        terminalClass:'top32-prize-tiebreaker',
        allowedResults:['candidate-win','candidate-loss'],clockMode:'aichi-top32-event-clock'}
    ]
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
    schema:'aichi-natural64-field-registration-v6',
    rngBundleSampling:'independent-with-replacement',
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
    isolatePolicyRandomness:true,
    physicalShuffleRandomIsolation:true,
    aichiFieldPaperShuffleRandomIsolation:true,
    aichiFieldPaperShuffleRandomIsolationHooks:[
      'Gladion CIN','Hisuian Heavy Ball ASR','Marnie SSH','Iono PAL'
    ],
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
    unbiasedShuffleMethod:manifest.unbiasedShuffleMethod,
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
    rngProtocol:RNG_PROTOCOL,
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
    setupCoinChoiceEvidence:[setupCoinChoiceEvidence],
    preGameFailureEvidence:[]
  };
}

function setPublicOutcome(request, ruleId) {
  const attempt = request.attempts[0];
  const rule = request.fieldSamplingRegistration.adjudicationProtocol.rules
    .find(item => item.ruleId === ruleId);
  if (!rule) throw new Error('Unknown fixture rule: ' + ruleId);
  const result = rule.allowedResults[0];
  const adjudication = request.adjudicationEvidence[0];
  Object.assign(adjudication, {
    protocolRuleId: rule.ruleId,
    protocolRuleSha256: canonicalSha256(rule),
    terminalClass: rule.terminalClass,
    adjudicationReason: rule.reason,
    adjudicatedCandidateResult: result
  });
  seal(adjudication, 'evidenceSha256');

  const receipt = attempt.terminalAdjudicationReceipt;
  Object.assign(receipt, {
    protocolRuleId: rule.ruleId,
    protocolRuleSha256: canonicalSha256(rule),
    adjudicationEvidenceSha256: adjudication.evidenceSha256,
    adjudicatorAttestationSha256: adjudication.attestationSha256,
    adjudicatorId: adjudication.adjudicatorId,
    adjudicatedAt: adjudication.adjudicatedAt,
    terminalClass: rule.terminalClass,
    adjudicationReason: rule.reason,
    adjudicatedCandidateResult: result,
    statisticalStatus: result === null ? null : RESULT_TO_STATUS[result]
  });
  seal(receipt, 'receiptSha256');
  attempt.terminalAdjudicationReceiptSha256 = receipt.receiptSha256;
  attempt.status = result === null ? NO_WINNER_STATUS : RESULT_TO_STATUS[result];
  return request;
}

function makePreGameRetryFixture() {
  const request = makePublicEntryFixture();
  const played = request.attempts[0];
  const failed = JSON.parse(JSON.stringify(played));
  failed.attemptId = 'attempt-pre-game-failure';
  failed.trialId = failed.attemptId;
  failed.attemptNumber = 1;
  failed.retryOfAttemptId = null;
  failed.status = 'pre-game-failure';
  failed.gameStarted = false;
  failed.terminalReached = false;
  failed.failureClass = 'pre-game-harness-failure';
  failed.failureCriteriaSha256 =
    request.fieldSamplingRegistration.preGameFailureCriteriaSha256;
  failed.paperReceiptId = null;
  failed.policyApplicationReceiptSha256 = null;
  failed.terminalAdjudicationReceipt = null;
  failed.terminalAdjudicationReceiptSha256 = null;
  failed.startedAt = '2026-11-25T11:59:30Z';
  failed.endedAt = '2026-11-25T11:59:45Z';
  for (const field of [
    'setupCoinChoiceReceiptSha256', 'setupCoinChoiceEvidenceSha256',
    'rngProtocol', 'rngMaterial', 'rngMaterialCommitment',
    'observedRngProtocol', 'observedRngMaterialCommitment',
    'effectiveMatchOptions', 'randomizationReceiptSha256',
    'coinWinnerSeat', 'chooserSeat', 'goFirstResponse', 'hostOverride',
    'firstPlayerSeat', 'actualFirstPlayerSeat', 'physicalDealId'
  ]) delete failed[field];

  const evidence = {
    schema: PRE_GAME_FAILURE_EVIDENCE_SCHEMA,
    attemptId: failed.attemptId,
    trialId: failed.trialId,
    slotId: failed.slotId,
    failureClass: failed.failureClass,
    failureCriteriaSha256: failed.failureCriteriaSha256,
    enginePin: request.fieldSamplingRegistration.twinleafPin,
    runnerRevision: request.fieldSamplingRegistration.runnerRevision,
    gameStarted: false,
    terminalReached: false,
    failureDisposition: 'unqualified-pre-game-failure',
    observedAt: '2026-11-25T11:59:46Z'
  };
  seal(evidence, 'evidenceSha256');
  failed.failureEvidenceSha256 = evidence.evidenceSha256;
  played.attemptNumber = 2;
  played.retryOfAttemptId = failed.attemptId;
  request.attempts = [failed, played];
  request.preGameFailureEvidence = [evidence];
  return request;
}

test('manifest must explicitly register with-replacement v2 bundle sampling', () => {
  const request = makePublicEntryFixture();
  delete request.fieldSamplingRegistration.rngBundleSampling;
  const result = validateNatural64FieldLedger(request);
  assert.equal(result.status, 'INVALID');
  assert.ok(result.rejectionReasons.includes('randomization-protocol-unverified'));
});

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


test('opponent forfeit, concession and timeout are candidate wins', () => {
  for (const ruleId of ['opponent-forfeit', 'opponent-concession', 'opponent-timeout']) {
    const request = setPublicOutcome(makePublicEntryFixture(), ruleId);
    const result = validateNatural64FieldLedger(request);
    assert.equal(result.status, 'INCOMPLETE', ruleId);
    assert.deepEqual(result.rejectionReasons, [], ruleId);
    assert.equal(result.winCount, 1, ruleId);
    assert.equal(result.nonWinCount, 0, ruleId);
  }
});

test('candidate forfeit, illegal action and timeout are candidate losses', () => {
  for (const ruleId of [
    'candidate-forfeit', 'candidate-illegal-action', 'candidate-timeout'
  ]) {
    const request = setPublicOutcome(makePublicEntryFixture(), ruleId);
    const result = validateNatural64FieldLedger(request);
    assert.equal(result.status, 'INCOMPLETE', ruleId);
    assert.deepEqual(result.rejectionReasons, [], ruleId);
    assert.equal(result.winCount, 0, ruleId);
    assert.equal(result.lossCount, 1, ruleId);
    assert.equal(result.nonWinCount, 1, ruleId);
    if (ruleId === 'candidate-timeout') {
      assert.equal(request.policyPanelReceipts[0].timeoutStatus, 'none');
    }
  }
});

test('draw is a genuine tie and ambiguous played terminal is a distinct nonwin', () => {
  const draw = validateNatural64FieldLedger(
    setPublicOutcome(makePublicEntryFixture(), 'draw'));
  assert.equal(draw.status, 'INCOMPLETE');
  assert.deepEqual(draw.rejectionReasons, []);
  assert.equal(draw.tieCount, 1);
  assert.equal(draw.winCount, 0);

  const ambiguous = validateNatural64FieldLedger(
    setPublicOutcome(makePublicEntryFixture(), 'ambiguous-played-terminal'));
  assert.equal(ambiguous.status, 'INCOMPLETE');
  assert.deepEqual(ambiguous.rejectionReasons, []);
  assert.equal(ambiguous.noWinnerTerminalCount, 1);
  assert.equal(ambiguous.nonWinCount, 1);
  assert.equal(ambiguous.winCount, 0);
  assert.equal(ambiguous.playedGameCount, 1);
});

test('pre-game exception requires separate no-start evidence and retries the same slot', () => {
  const request = makePreGameRetryFixture();
  const result = validateNatural64FieldLedger(request);
  assert.equal(result.status, 'INCOMPLETE');
  assert.deepEqual(result.rejectionReasons, []);
  assert.equal(result.preGameFailureCount, 1);
  assert.equal(result.playedGameCount, 1);
  assert.equal(result.completedSlotCount, 1);
  assert.equal(request.policyPanelReceipts.length, 1);

  request.preGameFailureEvidence = [];
  const missing = validateNatural64FieldLedger(request);
  assert.equal(missing.status, 'INVALID');
  assert.ok(missing.rejectionReasons.includes(
    'pre-game-failure-independent-evidence-invalid'));
});

test('duplicate physical deal IDs are rejected across distinct attempts', () => {
  const problems = new Set();
  const duplicates = validatePhysicalDealUniqueness([
    {attemptId: 'a1', physicalDealId: 'same-deal'},
    {attemptId: 'a2', physicalDealId: 'same-deal'}
  ], problems);
  assert.deepEqual(duplicates, ['same-deal']);
  assert.ok(problems.has('physical-deal-id-replayed-across-attempts'));
});

test('reusing one stream key across games is flagged, not rejected, under with-replacement sampling', () => {
  const makeMaterial = (keys) => ({
    schema: 'aichi-independent-rng-material-v1',
    algorithm: 'hmac-sha256-counter-v1',
    streams: {
      shuffleSeat0: keys[0], shuffleSeat1: keys[1], coin: keys[2],
      engine: keys[3], policySeat0: keys[4], policySeat1: keys[5]
    }
  });
  const first = makeMaterial(['1','2','3','4','5','6'].map(hash));
  const second = makeMaterial(['7','8','3','9','a','b'].map(hash));
  const groups = findRepeatedRandomizationStreamKeyGroups([
    {attemptId: 'a1', rngMaterial: first},
    {attemptId: 'a2', rngMaterial: second}
  ]);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].attemptIds, ['a1', 'a2']);
  assert.notEqual(randomMaterialCommitment(first), randomMaterialCommitment(second));
});

test('natural64 protocol requires fixed result semantics and explicit Top32 event clock', () => {
  const protocol = {
    schema: 'aichi-natural64-adjudication-protocol-v2',
    rules: [{
      ruleId: 'top32',
      reason: 'top32-prize-tiebreaker',
      terminalClass: 'top32-prize-tiebreaker',
      allowedResults: ['candidate-win', 'candidate-loss'],
      clockMode: 'aichi-top32-event-clock'
    }]
  };
  const validProblems = new Set();
  validateAdjudicationProtocol(protocol, canonicalSha256(protocol), validProblems);
  assert.equal(validProblems.size, 0);

  const wrongClock = JSON.parse(JSON.stringify(protocol));
  wrongClock.rules[0].clockMode = 'clock-free-game-win';
  const wrongClockProblems = new Set();
  validateAdjudicationProtocol(
    wrongClock, canonicalSha256(wrongClock), wrongClockProblems);
  assert.ok(wrongClockProblems.has('adjudication-protocol-rule-invalid'));

  const wrongOutcome = JSON.parse(JSON.stringify(protocol));
  wrongOutcome.rules[0].allowedResults.push('genuine-tie');
  const wrongOutcomeProblems = new Set();
  validateAdjudicationProtocol(
    wrongOutcome, canonicalSha256(wrongOutcome), wrongOutcomeProblems);
  assert.ok(wrongOutcomeProblems.has('adjudication-protocol-rule-invalid'));
});

test('protocol content changes without a new digest are rejected', () => {
  const protocol = {
    schema: 'aichi-natural64-adjudication-protocol-v2',
    rules: [{
      ruleId: 'engine-winner',
      reason: 'engine-winner',
      terminalClass: 'engine-winner',
      allowedResults: ['candidate-win', 'candidate-loss'],
      clockMode: 'clock-free-game-win'
    }]
  };
  const oldDigest = canonicalSha256(protocol);
  protocol.rules[0].reason = 'tampered';
  const problems = new Set();
  validateAdjudicationProtocol(protocol, oldDigest, problems);
  assert.ok(problems.has('adjudication-protocol-content-digest-mismatch'));
});

test('public ledger rejects a forged receipt result and a mismatched engine terminal digest', () => {
  const forgedResult = makePublicEntryFixture();
  forgedResult.attempts[0].terminalAdjudicationReceipt.adjudicatedCandidateResult =
    'candidate-loss';
  const resultMismatch = validateNatural64FieldLedger(forgedResult);
  assert.equal(resultMismatch.status, 'INVALID');
  assert.ok(resultMismatch.rejectionReasons.includes(
    'terminal-adjudication-result-status-mismatch'));
  assert.ok(resultMismatch.rejectionReasons.includes(
    'terminal-adjudication-receipt-digest-invalid'));

  const terminalMismatch = makePublicEntryFixture();
  const adjudication = terminalMismatch.adjudicationEvidence[0];
  adjudication.engineTerminalSha256 = hash('c');
  seal(adjudication, 'evidenceSha256');
  const receipt = terminalMismatch.attempts[0].terminalAdjudicationReceipt;
  receipt.adjudicationEvidenceSha256 = adjudication.evidenceSha256;
  seal(receipt, 'receiptSha256');
  terminalMismatch.attempts[0].terminalAdjudicationReceiptSha256 =
    receipt.receiptSha256;
  const terminalResult = validateNatural64FieldLedger(terminalMismatch);
  assert.equal(terminalResult.status, 'INVALID');
  assert.ok(terminalResult.rejectionReasons.includes(
    'terminal-adjudication-adjudicator-terminal-binding-mismatch'));
});

test('public ledger rejects unknown protocol rule IDs', () => {
  const request = makePublicEntryFixture();
  request.adjudicationEvidence[0].protocolRuleId = 'unknown-rule';
  seal(request.adjudicationEvidence[0], 'evidenceSha256');
  const result = validateNatural64FieldLedger(request);
  assert.equal(result.status, 'INVALID');
  assert.ok(result.rejectionReasons.includes('adjudication-protocol-rule-missing'));
});

test('natural64 roster rejects duplicate or missing rank-seat cells', () => {
  const duplicate = makePublicEntryFixture();
  duplicate.fieldSamplingRegistration.slots[0].seat = 1;
  const duplicateResult = validateNatural64FieldLedger(duplicate);
  assert.ok(duplicateResult.rejectionReasons.includes(
    'field-sampling-round-cell-duplicate'));

  const missing = makePublicEntryFixture();
  missing.fieldSamplingRegistration.slots.pop();
  const missingResult = validateNatural64FieldLedger(missing);
  assert.ok(missingResult.rejectionReasons.includes(
    'field-sampling-slot-roster-invalid'));
});


test('pre-game evidence and attempts cannot smuggle terminal, deal, setup or RNG metadata', () => {
  const terminalEvidence = makePreGameRetryFixture();
  terminalEvidence.preGameFailureEvidence[0].terminalEventSha256 = hash('f');
  seal(terminalEvidence.preGameFailureEvidence[0], 'evidenceSha256');
  const terminalResult = validateNatural64FieldLedger(terminalEvidence);
  assert.equal(terminalResult.status, 'INVALID');
  assert.ok(terminalResult.rejectionReasons.includes(
    'pre-game-failure-independent-evidence-invalid'));

  const rngEvidence = makePreGameRetryFixture();
  rngEvidence.attempts[0].rngMaterial = rngEvidence.attempts[1].rngMaterial;
  const rngResult = validateNatural64FieldLedger(rngEvidence);
  assert.equal(rngResult.status, 'INVALID');
  assert.ok(rngResult.rejectionReasons.includes(
    'pre-game-failure-has-played-game-evidence'));

  const evidenceRng = makePreGameRetryFixture();
  evidenceRng.preGameFailureEvidence[0].rngMaterialCommitment = hash('e');
  seal(evidenceRng.preGameFailureEvidence[0], 'evidenceSha256');
  const evidenceRngResult = validateNatural64FieldLedger(evidenceRng);
  assert.equal(evidenceRngResult.status, 'INVALID');
  assert.ok(evidenceRngResult.rejectionReasons.includes(
    'pre-game-failure-independent-evidence-invalid'));

  const unknownField = makePreGameRetryFixture();
  unknownField.preGameFailureEvidence[0].unregisteredGameMetadata = 'smuggled';
  seal(unknownField.preGameFailureEvidence[0], 'evidenceSha256');
  const unknownFieldResult = validateNatural64FieldLedger(unknownField);
  assert.equal(unknownFieldResult.status, 'INVALID');
  assert.ok(unknownFieldResult.rejectionReasons.includes(
    'pre-game-failure-independent-evidence-invalid'));

  const evidenceSetup = makePreGameRetryFixture();
  evidenceSetup.preGameFailureEvidence[0].coinWinnerSeat = 0;
  seal(evidenceSetup.preGameFailureEvidence[0], 'evidenceSha256');
  const evidenceSetupResult = validateNatural64FieldLedger(evidenceSetup);
  assert.equal(evidenceSetupResult.status, 'INVALID');
  assert.ok(evidenceSetupResult.rejectionReasons.includes(
    'pre-game-failure-independent-evidence-invalid'));

  const setupEvidence = makePreGameRetryFixture();
  setupEvidence.attempts[0].coinWinnerSeat = 0;
  const setupResult = validateNatural64FieldLedger(setupEvidence);
  assert.equal(setupResult.status, 'INVALID');
  assert.ok(setupResult.rejectionReasons.includes(
    'pre-game-failure-has-played-game-evidence'));

  const nestedSetupEvidence = makePreGameRetryFixture();
  const played = makePublicEntryFixture();
  nestedSetupEvidence.attempts[0].setupCoinChoiceEvidence =
    played.setupCoinChoiceEvidence[0];
  const nestedSetupResult = validateNatural64FieldLedger(nestedSetupEvidence);
  assert.equal(nestedSetupResult.status, 'INVALID');
  assert.ok(nestedSetupResult.rejectionReasons.includes(
    'pre-game-failure-attempt-schema-invalid'));

});

test('unknown terminal classes and mismatched class reasons are rejected without throwing', () => {
  const unknown = {
    schema: 'aichi-natural64-adjudication-protocol-v2',
    rules: [{
      ruleId: 'bad-class',
      reason: 'unknown',
      terminalClass: 'constructor',
      allowedResults: ['candidate-win'],
      clockMode: 'clock-free-game-win'
    }]
  };
  const unknownProblems = new Set();
  validateAdjudicationProtocol(unknown, canonicalSha256(unknown), unknownProblems);
  assert.ok(unknownProblems.has('adjudication-protocol-rule-invalid'));

  const mismatch = {
    schema: 'aichi-natural64-adjudication-protocol-v2',
    rules: [{
      ruleId: 'bad-reason',
      reason: 'candidate-timeout',
      terminalClass: 'opponent-forfeit',
      allowedResults: ['candidate-win'],
      clockMode: 'clock-free-game-win'
    }]
  };
  const mismatchProblems = new Set();
  validateAdjudicationProtocol(
    mismatch, canonicalSha256(mismatch), mismatchProblems);
  assert.ok(mismatchProblems.has('adjudication-protocol-rule-invalid'));
});

test('per-attempt RNG protocol and policy-isolation summary are required', () => {
  const wrongProtocol = makePublicEntryFixture();
  wrongProtocol.attempts[0].rngProtocol = 'other-rng-protocol';
  const protocolResult = validateNatural64FieldLedger(wrongProtocol);
  assert.equal(protocolResult.status, 'INVALID');
  assert.ok(protocolResult.rejectionReasons.includes(
    'independent-rng-observation-mismatch'));

  const missingIsolation = makePublicEntryFixture();
  missingIsolation.attempts[0].effectiveMatchOptions.isolatePolicyRandomness = false;
  const isolationResult = validateNatural64FieldLedger(missingIsolation);
  assert.equal(isolationResult.status, 'INVALID');
  assert.ok(isolationResult.rejectionReasons.includes(
    'independent-rng-hook-evidence-incomplete'));
});

test('natural64 terminal receipt is bound to the attempt RNG commitment', () => {
  const request = makePublicEntryFixture();
  const receipt = request.attempts[0].terminalAdjudicationReceipt;
  receipt.rngMaterialCommitmentSha256 = hash('f');
  seal(receipt, 'receiptSha256');
  request.attempts[0].terminalAdjudicationReceiptSha256 = receipt.receiptSha256;
  const result = validateNatural64FieldLedger(request);
  assert.equal(result.status, 'INVALID');
  assert.ok(result.rejectionReasons.includes(
    'terminal-adjudication-binding-mismatch:rngMaterialCommitmentSha256'));
});

