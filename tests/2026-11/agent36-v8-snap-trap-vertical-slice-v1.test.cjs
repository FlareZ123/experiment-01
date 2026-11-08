'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  ROOT_LIMIT,
  trials,
  summarizeNativeAttempt,
  joinSnapTrapPromptEvidence,
  buildPostPromptSequence,
  buildExecutionGate
} = require('../../simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v1.cjs');

test('freezes two registered rank-3 seeds across both physical seat orientations', () => {
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
  assert.deepEqual(new Set(registered.map(trial => trial.candidateSlot)),
    new Set(['A', 'B']));
});

test('retains actionCount, finished and root ledger length independently', () => {
  const trial = trials()[0];
  const summary = summarizeNativeAttempt({
    trial,
    actionCount: 260,
    finished: false,
    rootActionCount: 260,
    rootActionLedger: Array.from({ length: 259 }, (_, index) => ({
      actionOrdinal: index + 1
    }))
  }, trial);
  assert.equal(summary.actionCount, 260);
  assert.equal(summary.finished, false);
  assert.equal(summary.rootActionCount, 260);
  assert.equal(summary.rootActionLedgerLength, 259);
  assert.equal(summary.nativeOutcome, 'action-cap');

  const terminal = summarizeNativeAttempt({
    trial,
    actionCount: 19,
    finished: true,
    rootActionCount: 19,
    rootActionLedger: []
  }, trial);
  assert.equal(terminal.actionCount, 19);
  assert.equal(terminal.finished, true);
  assert.equal(terminal.rootActionLedgerLength, 0);
  assert.equal(terminal.nativeOutcome, 'native-terminal-unqualified');

  const error = summarizeNativeAttempt({
    trial,
    actionCount: 7,
    finished: null,
    error: { message: 'native abort' },
    rootActionLedger: [{ actionOrdinal: 1 }]
  }, trial);
  assert.equal(error.actionCount, 7);
  assert.equal(error.finished, null);
  assert.equal(error.rootActionLedgerLength, 1);
  assert.equal(error.nativeOutcome, 'engine-error');
});

function syntheticMatchAudit() {
  const proof = {
    promptIdAfterStore: 173,
    pendingNativePromptId: 173,
    sourceSeat: 0,
    attackerSeat: 1,
    turn: 54,
    sourcePrinting: 'Galarian Stunfisk SSH',
    attackerPrinting: 'Marshadow UNB'
  };
  const choice = {
    promptId: 173,
    sourceSeat: 0,
    attackerSeat: 1,
    energyPrinting: 'Psychic Energy',
    exactRootStoreJoin: true,
    exactPromptCardIdentityJoin: true,
    exactlyOneMoveCardsEffect: true,
    noOtherPublicCardMoved: true
  };
  const response = {
    promptId: '173',
    actionPromptId: 173,
    actionOrdinal: 250,
    actingSeat: 0,
    sameRootStore: true,
    rootStoreMatchesAtActionCallback: true,
    responseKind: 'array',
    responseLength: 1,
    selectedCardIsEnergy: true,
    nativeValidateAccepted: true,
    physicalZoneSettled: true,
    physicalZoneAfter: { destination: 'attacker-discard' },
    ownerObservationAtDecision: { actorSeat: 0 }
  };
  return {
    label: 'agent41-bilateral-v2-common-policy-development-3:312:B:champion-reference',
    rootStoreCaptureCount: 1,
    marker: {
      exactSourcePromptsStamped: [proof]
    },
    ownerPolicy: {
      quarantineActiveAtInstall: true,
      choices: [choice],
      promptStoreJoins: 1,
      markerStoreIdentityJoins: 1,
      physicalSettlements: [{}],
      moveCardsEffectReceiptCount: 1,
      physicalSettlementFailures: 0
    },
    ownerPromptEvidence: {
      quarantineActiveAtInstall: true,
      readsOpponentHidden: false,
      readsOpponentHand: false,
      readsOpponentDeck: false,
      readsFaceDownPrizeIdentities: false,
      snapTrapPrompt: {
        promptIdAfterStore: '173',
        sameRootStore: true,
        snapTrapIdentity: { sourceSeat: 0, attackerSeat: 1 },
        ownerObservationAtPromptCreation: { actorSeat: 0 }
      },
      responseRecords: [response],
      nextOwnerPrompt: {
        promptIdAfterStore: '174',
        ownerSeat: 1,
        ownerObservationAtPromptCreation: { actorSeat: 1 }
      }
    }
  };
}

test('joins source marker, Store prompt, owner choice and root response by prompt id', () => {
  const joined = joinSnapTrapPromptEvidence(syntheticMatchAudit());
  assert.equal(joined.promptId, '173');
  assert.equal(joined.exactPromptIdJoin, true);
  assert.equal(joined.exactRootStoreIdentity, true);
  assert.equal(joined.quarantineActive, true);
  assert.equal(joined.ownerObservationCaptured, true);
  assert.equal(joined.responseShapeAccepted, true);
  assert.equal(joined.exactPhysicalSettlement, true);
  assert.equal(joined.selectedEnergyPrinting, 'Psychic Energy');
  assert.equal(joined.rootActionOrdinal, 250);
  assert.equal(joined.nextOwnerPromptCapturedIfCreated, true);
});

test('rejects a mismatched prompt id even when all individual layers report success', () => {
  const audit = syntheticMatchAudit();
  audit.ownerPolicy.choices[0].promptId = 174;
  const joined = joinSnapTrapPromptEvidence(audit);
  assert.equal(joined.exactPromptIdJoin, false);
  assert.equal(joined.exactPhysicalSettlement, true);
});

test('retains the first opponent root and subsequent meaningful source root', () => {
  const trialId = '3:312:B:champion-reference';
  const joined = joinSnapTrapPromptEvidence(syntheticMatchAudit());
  const events = [
    { trialId, actionOrdinal: 250, seat: 0, action: 'ResolvePromptAction', promptId: 173 },
    { trialId, actionOrdinal: 251, seat: 1, action: 'AttackAction', promptId: null },
    { trialId, actionOrdinal: 252, seat: 0, action: 'PlayCardAction', promptId: null }
  ];
  const row = {
    rootActionLedger: [
      { actionOrdinal: 250, playerSlot: 0, action: 'ResolvePromptAction', pendingPrompt: 'ChooseCardsPrompt' }
    ]
  };
  const summary = {
    nativeOutcome: 'action-cap',
    actionCount: 260,
    finished: false,
    rootActionCount: 260,
    rootActionLedgerLength: 259
  };
  const sequence = buildPostPromptSequence(
    trialId, joined, events, row, summary,
    syntheticMatchAudit().ownerPromptEvidence.nextOwnerPrompt
  );
  assert.equal(sequence.promptResponseActionOrdinal, 250);
  assert.equal(sequence.promptRootLedgerEntry.playerSlot, 0);
  assert.equal(sequence.nextOpponentMeaningfulRoot.actionOrdinal, 251);
  assert.equal(sequence.nextSourceMeaningfulRootAfterOpponent.actionOrdinal, 252);
  assert.equal(sequence.continuationGatePassed, true);
  assert.equal(sequence.endpoint, 'action-cap');
  assert.equal(sequence.finished, false);
  assert.equal(sequence.rootActionLedgerLength, 259);
});

test('execution gate requires the exact prompt settlement and both post-prompt seats', () => {
  const registered = trials();
  const knownJoin = joinSnapTrapPromptEvidence(syntheticMatchAudit());
  const knownSummary = {
    id: '3:312:B:champion-reference',
    sourceSeat: 0,
    nativeOutcome: 'action-cap',
    promptJoin: knownJoin,
    postPromptSequence: {
      continuationGatePassed: true
    }
  };
  const otherSummaries = registered.slice(1).map(trial => ({
    id: trial.id,
    sourceSeat: trial.candidateSlot === 'A' ? 1 : 0,
    nativeOutcome: 'action-cap',
    promptJoin: { exactPromptIdJoin: false },
    postPromptSequence: { continuationGatePassed: false }
  }));
  const gate = buildExecutionGate(
    [knownSummary, ...otherSummaries],
    { allRegisteredAttemptsReturned: true }
  );
  assert.equal(gate.passed, true);
  assert.equal(gate.allRegisteredTrialsReturned, true);
  assert.equal(gate.bothSourceSeatOrientationsAttempted, true);
  assert.equal(gate.snapTrapPromptResolved, true);
  assert.equal(gate.meaningfulOpponentAndSourceContinuation, true);
  assert.equal(gate.endpointExplicitlyClassified, true);
});
