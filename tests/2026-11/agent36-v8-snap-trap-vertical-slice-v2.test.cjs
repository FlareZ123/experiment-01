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
      message: 'WAIT_FOR_OPPONENT',
      sameRootStore: true
    }
  };
}

function settledResponse(promptId, actionOrdinal, actingSeat, responseKind = 'null') {
  return {
    promptId,
    actionPromptId: promptId,
    samePromptId: true,
    sameRootStore: true,
    rootStoreMatchesAtActionCallback: true,
    nativeValidateAccepted: true,
    responseKind,
    actionType: 'ResolvePromptAction',
    actionOrdinal,
    actingSeat,
    dispatchReturnedWithoutThrow: true,
    promptResultDefined: true,
    promptResultMatches: true,
    promptItemFoundBeforeDispatch: true,
    promptItemRemovedAfterDispatch: true
  };
}

function makeMatchAudit(responseRecords = [
  settledResponse('174', 251, 1)
]) {
  const nextOwnerPrompt = {
    promptIdAfterStore: '174',
    ownerSeat: 1,
    promptType: 'WaitPrompt',
    message: 'WAIT_FOR_OPPONENT',
    sameRootStore: true
  };
  return {
    ownerPromptEvidence: {
      nextOwnerPrompt,
      postSnapTrapPrompts: [nextOwnerPrompt],
      promptRecords: [nextOwnerPrompt],
      responseRecords
    }
  };
}

test('known WaitPrompt null is mechanical and an unknown prompt root fails closed', () => {
  const trialId = '3:312:B:champion-reference';
  const events = [
    { trialId, actionOrdinal: 251, seat: 1, action: 'ResolvePromptAction', promptId: '174', responseKind: 'null' },
    { trialId, actionOrdinal: 252, seat: 0, action: 'ResolvePromptAction', promptId: '175', responseKind: 'undefined' },
    { trialId, actionOrdinal: 253, seat: 1, turnBefore: 56, action: 'AttackAction', promptId: null, responseKind: 'object' },
    { trialId, actionOrdinal: 254, seat: 0, turnBefore: 57, action: 'PlayCardAction', promptId: null, responseKind: 'object' }
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
  assert.deepEqual(
    sequence.mechanicalRootsAfterPrompt.map(event => event.actionOrdinal),
    [251]
  );
  assert.deepEqual(
    sequence.unclassifiedPromptRoots.map(event => event.actionOrdinal),
    [252]
  );
  assert.equal(sequence.promptEvidenceComplete, false);
  assert.equal(sequence.nextOpponentRoot.actionOrdinal, 251);
  assert.equal(sequence.nextOpponentMeaningfulRoot.actionOrdinal, 253);
  assert.equal(sequence.nextSourceRootAfterOpponent.actionOrdinal, 254);
  assert.equal(sequence.nextSourceMeaningfulRootAfterOpponent.actionOrdinal, 254);
  assert.equal(sequence.nextOwnerPromptType, 'WaitPrompt');
  assert.equal(sequence.nextOwnerPromptResponse.responseKind, 'null');
  assert.equal(sequence.continuationGatePassed, false);
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
  assert.equal(sequence.unclassifiedPromptRoots.length, 1);
  assert.equal(sequence.promptEvidenceComplete, false);
  assert.equal(sequence.continuationGatePassed, false);
});

test('WaitPrompt undefined remains unclassified even when undefined matches stored result', () => {
  const trialId = '3:312:B:champion-reference';
  const response = {
    promptId: '174',
    actionPromptId: '174',
    samePromptId: true,
    sameRootStore: true,
    rootStoreMatchesAtActionCallback: true,
    nativeValidateAccepted: true,
    responseKind: 'undefined',
    actionType: 'ResolvePromptAction',
    actionOrdinal: 251,
    actingSeat: 1,
    dispatchReturnedWithoutThrow: true,
    promptResultDefined: false,
    promptResultMatches: true,
    promptItemFoundBeforeDispatch: true,
    promptItemRemovedAfterDispatch: false
  };
  const sequence = buildPostPromptSequence(
    trialId, makeJoin(), [{
      trialId,
      actionOrdinal: 251,
      seat: 1,
      action: 'ResolvePromptAction',
      promptId: '174',
      responseKind: 'undefined'
    }], {}, {
      nativeOutcome: 'engine-error',
      actionCount: null,
      finished: null,
      rootActionCount: 251,
      rootActionLedgerLength: 251
    }, makeMatchAudit([response])
  );
  assert.equal(sequence.mechanicalRootsAfterPrompt.length, 0);
  assert.equal(sequence.unclassifiedPromptRoots[0].reason, 'prompt-result-undefined');
  assert.equal(sequence.promptEvidenceComplete, false);
  assert.equal(sequence.continuationGatePassed, false);
});

test('grouped prompt response stays unclassified until its exact promptItem is removed', () => {
  const trialId = '3:312:B:champion-reference';
  const choosePrompt = {
    promptIdAfterStore: '175',
    ownerSeat: 1,
    promptType: 'ChooseCardsPrompt',
    message: 'CHOOSE_CARDS',
    sameRootStore: true
  };
  const groupedResponse = settledResponse('175', 252, 1, 'array');
  groupedResponse.promptItemIdsBeforeDispatch = ['175', '176'];
  groupedResponse.promptItemRemovedAfterDispatch = false;
  const audit = makeMatchAudit([
    settledResponse('174', 251, 1),
    groupedResponse
  ]);
  audit.ownerPromptEvidence.promptRecords.push(choosePrompt);
  audit.ownerPromptEvidence.postSnapTrapPrompts.push(choosePrompt);
  const sequence = buildPostPromptSequence(
    trialId, makeJoin(), [
      { trialId, actionOrdinal: 251, seat: 1, action: 'ResolvePromptAction', promptId: '174', responseKind: 'null' },
      { trialId, actionOrdinal: 252, seat: 1, action: 'ResolvePromptAction', promptId: '175', responseKind: 'array' },
      { trialId, actionOrdinal: 253, seat: 0, turnBefore: 57, action: 'PlayCardAction', promptId: null, responseKind: 'object' }
    ], {}, {
      nativeOutcome: 'action-cap',
      actionCount: 253,
      finished: false,
      rootActionCount: 253,
      rootActionLedgerLength: 253
    }, audit
  );
  assert.equal(sequence.unclassifiedPromptRoots.length, 1);
  assert.equal(sequence.unclassifiedPromptRoots[0].reason, 'prompt-item-not-removed');
  assert.equal(sequence.promptEvidenceComplete, false);
  assert.equal(sequence.continuationGatePassed, false);
});

test('every captured post-Snap Trap prompt must have an exact settlement receipt', () => {
  const trialId = '3:312:B:champion-reference';
  const secondPrompt = {
    promptIdAfterStore: '175',
    ownerSeat: 1,
    promptType: 'WaitPrompt',
    message: 'WAIT_FOR_OPPONENT',
    sameRootStore: true
  };
  const audit = makeMatchAudit([settledResponse('174', 251, 1)]);
  audit.ownerPromptEvidence.promptRecords.push(secondPrompt);
  audit.ownerPromptEvidence.postSnapTrapPrompts.push(secondPrompt);
  const sequence = buildPostPromptSequence(
    trialId, makeJoin(), [{
      trialId,
      actionOrdinal: 251,
      seat: 1,
      action: 'ResolvePromptAction',
      promptId: '174',
      responseKind: 'null'
    }], {}, {
      nativeOutcome: 'action-cap',
      actionCount: 251,
      finished: false,
      rootActionCount: 251,
      rootActionLedgerLength: 251
    }, audit
  );
  assert.equal(sequence.nextOwnerPromptResponseSettled, true);
  assert.equal(sequence.allPostSnapTrapPromptsSettled, false);
  assert.equal(sequence.postSnapTrapPromptSettlements.length, 2);
  assert.equal(sequence.postSnapTrapPromptSettlements[1].settled, false);
  assert.equal(sequence.promptEvidenceComplete, false);
});

test('known non-WaitPrompt null with exact settlement receipt remains meaningful', () => {
  const trialId = '3:312:B:champion-reference';
  const choosePrompt = {
    promptIdAfterStore: '175',
    ownerSeat: 1,
    promptType: 'ChooseCardsPrompt',
    message: 'CHOOSE_CARDS',
    sameRootStore: true
  };
  const response = settledResponse('175', 252, 1);
  const audit = makeMatchAudit([
    settledResponse('174', 251, 1),
    response
  ]);
  audit.ownerPromptEvidence.promptRecords.push(choosePrompt);
  const sequence = buildPostPromptSequence(
    trialId, makeJoin(), [
      { trialId, actionOrdinal: 251, seat: 1, action: 'ResolvePromptAction', promptId: '174', responseKind: 'null' },
      { trialId, actionOrdinal: 252, seat: 1, turnBefore: 56, action: 'ResolvePromptAction', promptId: '175', responseKind: 'null' },
      { trialId, actionOrdinal: 253, seat: 0, action: 'PlayCardAction', promptId: null, responseKind: 'object' }
    ], {}, {
      nativeOutcome: 'action-cap',
      actionCount: 253,
      finished: false,
      rootActionCount: 253,
      rootActionLedgerLength: 253
    }, audit
  );
  assert.equal(sequence.mechanicalRootsAfterPrompt.length, 1);
  assert.equal(sequence.unclassifiedPromptRoots.length, 0);
  assert.equal(sequence.nextOpponentMeaningfulRoot.actionOrdinal, 252);
  assert.equal(sequence.nextSourceMeaningfulRootAfterOpponent.actionOrdinal, 253);
  assert.equal(sequence.promptEvidenceComplete, true);
  assert.equal(sequence.continuationGatePassed, true);
});

test('source prompt choice during the opponent attack does not claim a new source turn', () => {
  const trialId = '3:312:B:champion-reference';
  const sourcePrompt = {
    promptIdAfterStore: '175',
    ownerSeat: 0,
    promptType: 'ChooseCardsPrompt',
    message: 'CHOOSE_CARD_TO_DISCARD',
    sameRootStore: true
  };
  const audit = makeMatchAudit([
    settledResponse('174', 251, 1),
    settledResponse('175', 253, 0, 'array')
  ]);
  audit.ownerPromptEvidence.promptRecords.push(sourcePrompt);
  audit.ownerPromptEvidence.postSnapTrapPrompts.push(sourcePrompt);
  const events = [
    { trialId, actionOrdinal: 251, seat: 1, turnBefore: 54,
      action: 'ResolvePromptAction', promptId: '174', responseKind: 'null' },
    { trialId, actionOrdinal: 252, seat: 1, turnBefore: 56,
      action: 'AttackAction', promptId: null, responseKind: 'object' },
    { trialId, actionOrdinal: 253, seat: 0, turnBefore: 56,
      action: 'ResolvePromptAction', promptId: '175', responseKind: 'array' }
  ];
  const summary = {nativeOutcome: 'action-cap', actionCount: 254,
    finished: false, rootActionCount: 254, rootActionLedgerLength: 254};
  const unfinished = buildPostPromptSequence(
    trialId, makeJoin(), events, {}, summary, audit
  );
  assert.equal(unfinished.promptEvidenceComplete, true);
  assert.equal(unfinished.unclassifiedPromptRoots.length, 0);
  assert.equal(unfinished.nextOpponentMeaningfulRoot.actionOrdinal, 252);
  assert.equal(unfinished.nextSourceRootAfterOpponent.actionOrdinal, 253);
  assert.equal(unfinished.nextSourceMeaningfulRootAfterOpponent, null);
  assert.equal(unfinished.sourceOwnTurnActionObserved, false);
  assert.equal(unfinished.continuationGatePassed, false);

  const advanced = buildPostPromptSequence(trialId, makeJoin(), [
    ...events,
    { trialId, actionOrdinal: 254, seat: 0, turnBefore: 57,
      action: 'PlayCardAction', promptId: null, responseKind: 'object' }
  ], {}, summary, audit);
  assert.equal(advanced.nextSourceMeaningfulRootAfterOpponent.actionOrdinal, 254);
  assert.equal(advanced.opponentTurnBeforeSourceContinuation, 56);
  assert.equal(advanced.sourceOwnTurnActionObserved, true);
  assert.equal(advanced.continuationGatePassed, true);
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
    nextOwnerPrompt: {
      promptType: 'WaitPrompt',
      message: 'WAIT_FOR_OPPONENT',
      sameRootStore: true,
      ownerSeat: sourceSeat
    }
  };
}

test('strict execution gate requires exact Snap Trap settlement and complete post-prompt evidence in both source-seat orientations', () => {
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
        continuationGatePassed: known,
        promptEvidenceComplete: known,
        nextOwnerPromptResponseSettled: known,
        allPostSnapTrapPromptsSettled: known
      }
    };
  });
  const gate = buildExecutionGate(summaries, {
    allRegisteredAttemptsReturned: true
  });
  assert.equal(gate.passed, true);
  assert.equal(gate.bothSourceSeatPromptResolutionsObserved, true);
  assert.equal(gate.postPromptPromptEvidenceComplete, true);
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
        continuationGatePassed: trial.id === '3:312:B:champion-reference',
        promptEvidenceComplete: trial.id === '3:312:B:champion-reference',
        nextOwnerPromptResponseSettled: trial.id === '3:312:B:champion-reference',
        allPostSnapTrapPromptsSettled: trial.id === '3:312:B:champion-reference'
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
        continuationGatePassed: trial.id === '3:312:B:champion-reference',
        promptEvidenceComplete: trial.id === '3:312:B:champion-reference'
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
