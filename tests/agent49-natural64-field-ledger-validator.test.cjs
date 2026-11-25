'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateNatural64SlotAttempts,
  evaluateNatural64StoppingRule,
  findRepeatedRandomizationMaterialGroups,
  validateRandomizationUniqueness,
  NATURAL64_DECISION_SCHEDULES
} = require('../scripts/agent49-natural64-field-ledger-validator.cjs');

const hash = ch => ch.repeat(64);
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

test('repeated exact RNG material is surfaced as a threshold-blocking review condition', () => {
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
