'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildPostPromptSequence
} = require('../../simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v2.cjs');

/**
 * Reproduces the current v2 false-pass path. The unknown prompt ID is a
 * successful Store no-op, but v2 currently treats its non-null response kind
 * as a meaningful opponent decision. Convert this fixture to assert a closed
 * gate after the owner fixes unknown prompt handling.
 */
test('reproduces false continuation pass from unknown non-null prompt ID', () => {
  const trialId = '3:312:B:champion-reference';
  const join = {
    rootActionOrdinal: 250,
    attackerSeat: 1,
    sourceSeat: 0
  };
  const events = [
    {
      trialId,
      actionOrdinal: 251,
      seat: 1,
      action: 'ResolvePromptAction',
      promptId: 174,
      responseKind: 'null'
    },
    {
      trialId,
      actionOrdinal: 252,
      seat: 1,
      action: 'ResolvePromptAction',
      promptId: 175,
      responseKind: 'array'
    },
    {
      trialId,
      actionOrdinal: 253,
      seat: 0,
      action: 'PlayCardAction',
      promptId: null,
      responseKind: 'object'
    }
  ];
  const matchAudit = {
    ownerPromptEvidence: {
      promptRecords: [
        {
          promptIdAfterStore: 174,
          promptType: 'WaitPrompt',
          message: 'WAIT_FOR_OPPONENT'
        }
      ],
      responseRecords: [
        { promptId: 174, responseKind: 'null', actionOrdinal: 251 }
      ]
    }
  };
  const sequence = buildPostPromptSequence(
    trialId,
    join,
    events,
    {},
    { nativeOutcome: 'engine-error' },
    matchAudit
  );

  assert.deepEqual(
    sequence.mechanicalRootsAfterPrompt.map(event => event.actionOrdinal),
    [251]
  );
  assert.equal(sequence.nextOpponentMeaningfulRoot.actionOrdinal, 252);
  assert.equal(sequence.nextSourceMeaningfulRootAfterOpponent.actionOrdinal, 253);
  assert.equal(sequence.continuationGatePassed, true);
});
