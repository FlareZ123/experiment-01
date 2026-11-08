'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildPostPromptSequence,
  buildExecutionGate
} = require('../../simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v2.cjs');

const KNOWN_TRIAL = '3:312:B:champion-reference';

/**
 * Regression: an unknown non-null prompt response is a Store no-op and must
 * remain unclassified. It must never satisfy source continuation or the full
 * v2 execution gate.
 */
test('unknown non-null prompt ID cannot satisfy the full v2 execution gate', () => {
  const join = {
    rootActionOrdinal: 250,
    attackerSeat: 1,
    sourceSeat: 0
  };
  const events = [
    {
      trialId: KNOWN_TRIAL,
      actionOrdinal: 251,
      seat: 1,
      action: 'ResolvePromptAction',
      promptId: 174,
      responseKind: 'null'
    },
    {
      trialId: KNOWN_TRIAL,
      actionOrdinal: 252,
      seat: 1,
      action: 'AttackAction',
      promptId: null,
      responseKind: 'object'
    },
    {
      trialId: KNOWN_TRIAL,
      actionOrdinal: 253,
      seat: 0,
      action: 'ResolvePromptAction',
      promptId: 175,
      responseKind: 'array'
    }
  ];
  const waitPrompt = {
    promptIdAfterStore: 174,
    promptType: 'WaitPrompt',
    message: 'WAIT_FOR_OPPONENT',
    ownerSeat: 1,
    sameRootStore: true
  };
  const matchAudit = {
    ownerPromptEvidence: {
      promptRecords: [waitPrompt],
      responseRecords: [{
        promptId: 174,
        actionPromptId: 174,
        samePromptId: true,
        sameRootStore: true,
        rootStoreMatchesAtActionCallback: true,
        nativeValidateAccepted: true,
        responseKind: 'null',
        actionType: 'ResolvePromptAction',
        actionOrdinal: 251,
        actingSeat: 1,
        dispatchReturnedWithoutThrow: true,
        promptResultDefined: true,
        promptResultMatches: true,
        promptItemFoundBeforeDispatch: true,
        promptItemRemovedAfterDispatch: true
      }],
      nextOwnerPrompt: waitPrompt
    }
  };
  const sequence = buildPostPromptSequence(
    KNOWN_TRIAL,
    join,
    events,
    {},
    { nativeOutcome: 'action-cap', actionCount: 260, rootActionCount: 260 },
    matchAudit
  );

  assert.deepEqual(
    sequence.mechanicalRootsAfterPrompt.map(event => event.actionOrdinal),
    [251]
  );
  assert.equal(sequence.nextOpponentMeaningfulRoot.actionOrdinal, 252);
  assert.equal(sequence.nextSourceMeaningfulRootAfterOpponent, null);
  assert.deepEqual(
    sequence.unclassifiedPromptRoots.map(event => ({
      actionOrdinal: event.actionOrdinal,
      reason: event.reason
    })),
    [{ actionOrdinal: 253, reason: 'unknown-prompt-id' }]
  );
  assert.equal(sequence.promptEvidenceComplete, false);
  assert.equal(sequence.continuationGatePassed, false);

  const exactJoin = sourceSeat => ({
    exactPromptIdJoin: true,
    exactRootStoreIdentity: true,
    quarantineActive: true,
    ownerObservationCaptured: true,
    responseShapeAccepted: true,
    exactPhysicalSettlement: true,
    sourceSeatMatchesRegisteredSeat: true,
    sourceSeat,
    rootActionOrdinal: 250,
    promptId: 173
  });
  const summaries = [
    {
      id: KNOWN_TRIAL,
      sourceSeat: 0,
      nativeOutcome: 'action-cap',
      promptJoin: exactJoin(0),
      postPromptSequence: sequence
    },
    {
      id: '3:312:A:champion-reference',
      sourceSeat: 1,
      nativeOutcome: 'action-cap',
      promptJoin: exactJoin(1)
    },
    {
      id: '3:213:A:champion-reference',
      sourceSeat: 0,
      nativeOutcome: 'action-cap',
      promptJoin: exactJoin(0)
    },
    {
      id: '3:213:B:champion-reference',
      sourceSeat: 1,
      nativeOutcome: 'action-cap',
      promptJoin: exactJoin(1)
    }
  ];
  const gate = buildExecutionGate(summaries, {
    allRegisteredAttemptsReturned: true
  });

  assert.equal(gate.allRegisteredTrialsReturned, true);
  assert.equal(gate.bothSourceSeatOrientationsAttempted, true);
  assert.equal(gate.knownPromptResolved, true);
  assert.equal(gate.bothSourceSeatPromptResolutionsObserved, true);
  assert.equal(gate.meaningfulOpponentAndSourceContinuation, false);
  assert.equal(gate.postPromptPromptEvidenceComplete, false);
  assert.equal(gate.passed, false);
});
