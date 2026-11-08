'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ROOT_LIMIT,
  trials,
  nativeAbortSummary,
  buildPostPromptSequence,
  buildExecutionGate,
  buildDiagnosticSummary
} = require('../../simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v2.cjs');

test('v2 retains the frozen four-arm, two-seed, both-seat frame', () => {
  const registered = trials();
  assert.equal(ROOT_LIMIT, 260);
  assert.equal(registered.length, 4);
  assert.deepEqual(registered.map(trial => trial.id), [
    '3:312:B:champion-reference',
    '3:312:A:champion-reference',
    '3:213:A:champion-reference',
    '3:213:B:champion-reference'
  ]);
  assert.deepEqual(new Set(registered.map(trial => trial.seed)),
    new Set([2404595552, 948758444]));
});

test('native abort summary preserves action, seat, pending prompt and failure stage', () => {
  const summary = nativeAbortSummary({
    nativeAbortEvidence: {
      failureStage: 'dispatch',
      actionOrdinal: 260,
      actionName: 'ResolvePromptAction',
      actingSeat: 1,
      turnBefore: 42,
      phaseBefore: 'attack',
      pendingPrompt: {
        id: 7,
        promptType: 'WaitPrompt',
        message: 'WAIT_FOR_OPPONENT'
      },
      errorMessage: 'dispatch rejected'
    }
  });
  assert.deepEqual(summary, {
    failureStage: 'dispatch',
    actionOrdinal: 260,
    actionName: 'ResolvePromptAction',
    actingSeat: 1,
    turnBefore: 42,
    phaseBefore: 'attack',
    pendingPrompt: {
      id: 7,
      promptType: 'WaitPrompt',
      message: 'WAIT_FOR_OPPONENT'
    },
    errorMessage: 'dispatch rejected',
    redactedMessageDigest: null
  });
});

function makeJoin() {
  return {
    promptId: '173',
    sourceSeat: 0,
    attackerSeat: 1,
    rootActionOrdinal: 250,
    nextOwnerPrompt: {
      promptIdAfterStore: '174',
      ownerSeat: 1,
      promptType: 'WaitPrompt',
      message: 'WAIT_FOR_OPPONENT'
    }
  };
}

function makeMatchAudit() {
  return {
    ownerPromptEvidence: {
      promptRecords: [
        {
          promptIdAfterStore: '174',
          ownerSeat: 1,
          promptType: 'WaitPrompt',
          message: 'WAIT_FOR_OPPONENT'
        }
      ],
      responseRecords: [
        { promptId: '174', responseKind: 'null', actionOrdinal: 251 },
        { promptId: '175', responseKind: 'null', actionOrdinal: 252 }
      ]
    }
  };
}

test('mechanical null WaitPrompt roots are retained and excluded from meaningful continuation', () => {
  const trialId = '3:312:B:champion-reference';
  const events = [
    { trialId, actionOrdinal: 251, seat: 1, action: 'ResolvePromptAction', promptId: '174', responseKind: 'null' },
    { trialId, actionOrdinal: 252, seat: 0, action: 'ResolvePromptAction', promptId: '175', responseKind: 'null' },
    { trialId, actionOrdinal: 253, seat: 1, action: 'AttackAction', promptId: null, responseKind: 'object' },
    { trialId, actionOrdinal: 254, seat: 0, action: 'PlayCardAction', promptId: null, responseKind: 'object' }
  ];
  const summary = {
    nativeOutcome: 'engine-error',
    actionCount: null,
    finished: null,
    rootActionCount: 254,
    rootActionLedgerLength: 254,
    nativeAbortEvidence: { failureStage: 'dispatch' }
  };
  const sequence = buildPostPromptSequence(
    trialId, makeJoin(), events, {}, summary, makeMatchAudit()
  );
  assert.equal(sequence.mechanicalRootsAfterPrompt.length, 2);
  assert.equal(sequence.nextOpponentRoot.actionOrdinal, 251);
  assert.equal(sequence.nextOpponentMeaningfulRoot.actionOrdinal, 253);
  assert.equal(sequence.nextSourceRootAfterOpponent.actionOrdinal, 254);
  assert.equal(sequence.nextSourceMeaningfulRootAfterOpponent.actionOrdinal, 254);
  assert.equal(sequence.nextOwnerPromptType, 'WaitPrompt');
  assert.equal(sequence.nextOwnerPromptResponse.responseKind, 'null');
  assert.equal(sequence.continuationGatePassed, true);
});

test('WaitPrompt-only continuation cannot pass the meaningful-decision gate', () => {
  const trialId = '3:312:B:champion-reference';
  const events = [
    { trialId, actionOrdinal: 251, seat: 1, action: 'ResolvePromptAction', promptId: '174', responseKind: 'null' },
    { trialId, actionOrdinal: 252, seat: 0, action: 'ResolvePromptAction', promptId: '175', responseKind: 'null' }
  ];
  const sequence = buildPostPromptSequence(
    trialId, makeJoin(), events, {}, {
      nativeOutcome: 'engine-error',
      actionCount: null,
      finished: null,
      rootActionCount: 252,
      rootActionLedgerLength: 252
    }, makeMatchAudit()
  );
  assert.equal(sequence.nextOpponentMeaningfulRoot, null);
  assert.equal(sequence.nextSourceMeaningfulRootAfterOpponent, null);
  assert.equal(sequence.continuationGatePassed, false);
});

function settledJoin(sourceSeat, matches = true) {
  return {
    exactPromptIdJoin: true,
    exactRootStoreIdentity: true,
    quarantineActive: true,
    ownerObservationCaptured: true,
    responseShapeAccepted: true,
    exactPhysicalSettlement: true,
    sourceSeat,
    sourceSeatMatchesRegisteredSeat: matches,
    promptId: '173',
    rootActionOrdinal: 250,
    nextOwnerPrompt: { promptType: 'WaitPrompt', message: 'WAIT_FOR_OPPONENT' }
  };
}

test('strict execution gate requires exact Snap Trap settlement in both source-seat orientations', () => {
  const registered = trials();
  const summaries = registered.map(trial => {
    const sourceSeat = trial.candidateSlot === 'A' ? 1 : 0;
    const known = trial.id === '3:312:B:champion-reference';
    const otherSeatPrompt = trial.id === '3:312:A:champion-reference';
    return {
      id: trial.id,
      sourceSeat,
      nativeOutcome: 'action-cap',
      promptJoin: known ? settledJoin(sourceSeat) :
        otherSeatPrompt ? settledJoin(sourceSeat) : { exactPromptIdJoin: false },
      postPromptSequence: {
        continuationGatePassed: known
      }
    };
  });
  const gate = buildExecutionGate(summaries, {
    allRegisteredAttemptsReturned: true
  });
  assert.equal(gate.passed, true);
  assert.equal(gate.bothSourceSeatPromptResolutionsObserved, true);
  assert.deepEqual(gate.sourceSeatsWithExactPromptSettlement, [0, 1]);
});

test('strict execution gate rejects a one-seat-only prompt witness', () => {
  const registered = trials();
  const summaries = registered.map(trial => {
    const sourceSeat = trial.candidateSlot === 'A' ? 1 : 0;
    return {
      id: trial.id,
      sourceSeat,
      nativeOutcome: 'engine-error',
      promptJoin: trial.id === '3:312:B:champion-reference' ?
        settledJoin(sourceSeat) : { exactPromptIdJoin: false },
      postPromptSequence: {
        continuationGatePassed: trial.id === '3:312:B:champion-reference'
      }
    };
  });
  const gate = buildExecutionGate(summaries, {
    allRegisteredAttemptsReturned: true
  });
  assert.equal(gate.knownPromptResolved, true);
  assert.equal(gate.bothSourceSeatPromptResolutionsObserved, false);
  assert.equal(gate.passed, false);
});

test('strict execution gate rejects a prompt whose observed source seat differs from registration', () => {
  const registered = trials();
  const summaries = registered.map(trial => {
    const sourceSeat = trial.candidateSlot === 'A' ? 1 : 0;
    return {
      id: trial.id,
      sourceSeat,
      nativeOutcome: 'action-cap',
      promptJoin: trial.id === '3:312:B:champion-reference' ?
        settledJoin(1 - sourceSeat, false) :
        trial.id === '3:312:A:champion-reference' ?
          settledJoin(sourceSeat) : { exactPromptIdJoin: false },
      postPromptSequence: {
        continuationGatePassed: trial.id === '3:312:B:champion-reference'
      }
    };
  });
  const gate = buildExecutionGate(summaries, {
    allRegisteredAttemptsReturned: true
  });
  assert.equal(gate.knownPromptResolved, false);
  assert.equal(gate.passed, false);
});

test('compact diagnostic summary hashes owner observations instead of printing private hand contents', () => {
  const secret = 'PRIVATE-OWNER-HAND-PRINTING';
  const output = {
    diagnostic: {
      actualAttemptRows: [{
        id: '3:312:B:champion-reference',
        sourceSeat: 0,
        candidateSeat: 1,
        seed: 2404595552,
        nativeOutcome: 'engine-error',
        promptJoin: {},
        postPromptSequence: {}
      }],
      rootActionEvents: [],
      nativeMatchIntegrationAudit: {
        nativeMatchAttempts: [{
          label: 'attempt-3:312:B:champion-reference',
          status: 'returned',
          rootStoreCaptureCount: 1,
          marker: { exactSourcePromptsStamped: [{}] },
          ownerPolicy: { choices: [{}] },
          ownerPromptEvidence: {
            snapTrapPrompt: {
              promptIdAfterStore: '173',
              ownerSeat: 0,
              promptType: 'ChooseCardsPrompt',
              ownerObservationAtPromptCreation: { ownHand: [secret] }
            },
            responseRecords: [{
              promptId: '173',
              ownerObservationAtDecision: { ownHand: [secret] }
            }]
          }
        }]
      },
      executionGate: { passed: false },
      selectedV0ThrownCode: null,
      rawStateFallbackCalls: 0
    }
  };
  const summary = buildDiagnosticSummary(output);
  const text = JSON.stringify(summary);
  assert.equal(text.includes(secret), false);
  assert.equal(typeof summary.nativeMatchAttempts[0].snapTrapPrompt.ownerObservationSha256, 'string');
});
