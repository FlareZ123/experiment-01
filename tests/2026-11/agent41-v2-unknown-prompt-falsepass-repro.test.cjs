'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildPostPromptSequence,
  buildExecutionGate
} = require('../../simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v2.cjs');

const KNOWN_TRIAL = '3:312:B:champion-reference';

/**
 * Reproduces the current v2 false-pass path. After the opponent's attack, the
 * source-seat bot returns a stale ResolvePromptAction while no matching prompt
 * or promptItem exists. Store accepts it as a no-op; headless records it after
 * dispatch. Convert this fixture to assert a closed gate after the owner fixes
 * unknown prompt handling.
 */
test('reproduces false execution-gate pass from unknown non-null prompt ID', () => {
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
    message: 'WAIT_FOR_OPPONENT'
  };
  const matchAudit = {
    ownerPromptEvidence: {
      promptRecords: [waitPrompt],
      responseRecords: [
        { promptId: 174, responseKind: 'null', actionOrdinal: 251, actingSeat: 1 }
      ],
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
  assert.equal(sequence.nextSourceMeaningfulRootAfterOpponent.actionOrdinal, 253);
  assert.equal(sequence.continuationGatePassed, true);

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
  assert.equal(gate.meaningfulOpponentAndSourceContinuation, true);
  assert.equal(gate.endpointExplicitlyClassified, true);
  assert.equal(gate.passed, true);
});
