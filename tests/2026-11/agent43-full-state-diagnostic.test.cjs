'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { actorObservation } = require('../../simulation/twinleaf/actor-observation-contract.cjs');
const {
  snapshotFullGameState,
  formatFullGameStateText,
  formatFixtureGameTraceText,
  DIAGNOSTIC_SCHEMA,
  PRIVATE_VISIBILITY,
} = require('../../simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs');

const card = fullName => ({
  fullName,
  name: fullName,
  hp: 300,
  cardType: ['PSYCHIC'],
  retreat: [],
  weakness: [],
  resistance: [],
  attacks: [{ name: 'Attack', cost: ['PSYCHIC'], damage: 100, text: 'Deal damage' }],
  powers: [{ name: 'Ability', powerType: 'ABILITY', text: 'Do something' }],
});
const slot = (pokemon = null) => ({
  cards: pokemon ? [pokemon] : [],
  getPokemonCard: () => pokemon,
  damage: 20,
  pokemonPlayedTurn: 2,
  specialConditions: ['ASLEEP'],
  energies: { cards: [card('Psychic Energy')] },
  tools: [card('Tool')],
});
const zone = cards => ({ cards });
function player(id, name, prefix) {
  return {
    id, name,
    active: slot(card(prefix + ' Active')),
    bench: [slot(card(prefix + ' Bench')), slot(null)],
    deck: zone([card(prefix + ' Deck Top'), card(prefix + ' Deck Bottom')]),
    hand: zone([card(prefix + ' Hand 1'), card(prefix + ' Hand 2')]),
    prizes: [zone([card(prefix + ' Prize 1')]), zone([card(prefix + ' Prize 2')])],
    discard: zone([card(prefix + ' Discard')]),
    lostzone: zone([card(prefix + ' Lost')]),
    stadium: zone([card(prefix + ' Stadium')]),
    supporter: zone([card(prefix + ' Supporter')]),
    usedGX: false, usedVSTAR: true,
    supporterTurn: 1, energyPlayedTurn: 1, retreatedTurn: 0,
    stadiumPlayedTurn: 1, stadiumUsedTurn: 0,
    cannotAttackTurnsRemaining: 0,
    cannotPlayItemCards: false,
    cannotPlaySupporterCards: false,
    customLockCounter: 3,
  };
}
function makeState() {
  return {
    turn: 4,
    phase: 'PLAYER_TURN',
    activePlayer: 0,
    winner: null,
    gameSettings: { format: 'EXPANDED', recordingEnabled: false, rules: { attackFirstTurn: false } },
    rules: { attackFirstTurn: false },
    effectStack: [{ type: 'TriggeredEffect', source: card('A Triggered Effect') }],
    players: [player(101, 'candidate', 'A'), player(202, 'opponent', 'B')],
    prompts: [{
      id: 'prompt-1', playerId: 101, message: 'Choose a card',
      cards: [card('A Prompt Card')], options: ['one', 'two'], result: undefined,
    }],
  };
}

test('full diagnostic captures both players private zones while actor observation stays actor-only', () => {
  const state = makeState();
  const before = JSON.stringify(state);
  const snapshot = snapshotFullGameState(state, {
    trialId: 'fixture-1', actionOrdinal: 9, actualFirstPlayerSeat: 1,
  });
  assert.equal(snapshot.schema, DIAGNOSTIC_SCHEMA);
  assert.equal(snapshot.visibility, PRIVATE_VISIBILITY);
  assert.equal(snapshot.firstPlayerSeat, 1);
  assert.equal(snapshot.winnerSeat, null);
  assert.deepEqual(snapshot.players[0].zones.hand, ['A Hand 1', 'A Hand 2']);
  assert.deepEqual(snapshot.players[1].zones.hand, ['B Hand 1', 'B Hand 2']);
  assert.deepEqual(snapshot.players[1].zones.deckArrayOrder, ['B Deck Top', 'B Deck Bottom']);
  assert.equal(snapshot.players[1].zones.prizes[0].cards[0], 'B Prize 1');
  assert.deepEqual(snapshot.players[0].zones.discard, ['A Discard']);
  assert.deepEqual(snapshot.players[0].zones.lostZone, ['A Lost']);
  assert.deepEqual(snapshot.players[0].zones.stadium, ['A Stadium']);
  assert.deepEqual(snapshot.players[0].zones.resolvingSupporter, ['A Supporter']);
  assert.equal(snapshot.players[0].board.active.printing, 'A Active');
  assert.equal(snapshot.players[0].board.active.energies[0], 'Psychic Energy');
  assert.equal(snapshot.prompts[0].fields.cards[0].fullName, 'A Prompt Card');
  assert.equal(snapshot.engineExtraFields.effectStack[0].source.fullName, 'A Triggered Effect');
  assert.equal(snapshot.players[0].extraStateFields.customLockCounter, 3);

  const actorView = actorObservation(state, 0);
  const actorViewText = JSON.stringify(actorView);
  assert.ok(actorViewText.includes('A Hand 1'));
  assert.ok(actorViewText.includes('B Active'));
  for (const secret of [
    'B Hand 1', 'B Deck Top', 'B Prize 1',
    'A Deck Top', 'A Prize 1',
  ]) assert.equal(actorViewText.includes(secret), false, secret + ' leaked into actor view');
  assert.equal(JSON.stringify(state), before, 'diagnostic must not mutate live Store state');
});

test('full-state text is human-readable and preserves native zone order', () => {
  const snapshot = snapshotFullGameState(makeState(), { trialId: 'fixture-1' });
  const text = formatFullGameStateText(snapshot);
  assert.match(text, /STATE turn=4 phase=PLAYER_TURN activeSeat=0/);
  assert.match(text, /HAND \(2\) \["A Hand 1","A Hand 2"\]/);
  assert.match(text, /DECK native-array-order \(2\) \["A Deck Top","A Deck Bottom"\]/);
  assert.match(text, /PRIZES \(2\)/);
  assert.match(text, /B Hand 1/);
  assert.match(text, /VISIBILITY private-offline-diagnostic-only/);
});

test('full-state projection handles cycles and identifies the winning seat', () => {
  const state = makeState();
  state.rules.self = state.rules;
  state.winner = { id: 202 };
  const snapshot = snapshotFullGameState(state);
  assert.equal(snapshot.rules.self, '[Circular]');
  assert.equal(snapshot.winnerPlayerId, 202);
  assert.equal(snapshot.winnerSeat, 1);
});

test('trace formatter emits selected card and before/after full state changes', () => {
  const state = makeState();
  const before = snapshotFullGameState(state, { actionOrdinal: 0 });
  const moved = state.players[0].hand.cards.shift();
  state.players[0].discard.cards.push(moved);
  const after = snapshotFullGameState(state, { actionOrdinal: 1 });
  assert.deepEqual(before.players[0].zones.hand, ['A Hand 1', 'A Hand 2']);
  assert.deepEqual(after.players[0].zones.hand, ['A Hand 2']);
  assert.ok(after.players[0].zones.discard.includes('A Hand 1'));

  const text = formatFixtureGameTraceText({
    fixtureOnly: true,
    admissionEligible: false,
    competitiveGameQualified: false,
    trialId: 'fixture-1',
    seed: 1,
    candidateSeat: 0,
    opponentSeat: 1,
    candidateDeckSha256: 'candidate-deck-hash',
    opponentDeckSha256: 'opponent-deck-hash',
    candidateIdentity: { policyId: 'candidate-policy' },
    opponentIdentity: { policyId: 'opponent-policy' },
    policyConstraintsSha256: 'constraints-hash',
    cardPoolSha256: 'card-pool-hash',
    fieldSha256: 'field-hash',
    actualFirstPlayerSeat: 1,
    finished: true,
    endReason: 'natural-terminal',
    actions: 1,
    turns: 4,
    winnerSeat: 0,
    decisionTrace: [{
      actionOrdinal: 0,
      turnBefore: 1,
      actingSeat: 0,
      actingPlayerId: 101,
      phaseBefore: 'PLAYER_TURN',
      actionName: 'PlayCardAction',
      isRootDecision: true,
      selectedCardIdentity: { playerId: 101, handIndex: 0, fullName: 'A Hand 1' },
      policyObservationSha256: 'view123',
      policyInputKind: 'actor-observation',
      policyObservationBefore: { actorSeat: 0, ownHand: ['A Hand 1'], opponentPublic: { active: 'B Active' } },
      actorObservationAfter: { actorSeat: 0, ownHand: ['A Hand 2'], opponentPublic: { active: 'B Active' } },
      promptResolverContext: { playerId: 101, promptType: 'ChooseCardsPrompt' },
      actionPayloadSha256: 'abc123',
      fullStateBefore: before,
      fullStateAfter: after,
    }, {
      actionOrdinal: 1,
      turnBefore: 1,
      actingSeat: 0,
      actingPlayerId: 101,
      phaseBefore: 'PLAYER_TURN',
      actionName: 'ResolvePromptAction',
      isRootDecision: false,
      policyInputKind: 'native-owner-prompt',
      policyObservationBefore: { mustNotLeak: true },
      promptResolverContext: { playerId: 101, promptType: 'ChooseCardsPrompt' },
    }, {
      actionOrdinal: 2,
      turnBefore: 2,
      actingSeat: 1,
      actingPlayerId: 202,
      phaseBefore: 'PLAYER_TURN',
      actionName: 'PlayCardAction',
      isRootDecision: true,
      policyInputKind: 'actor-observation',
      dispatchStatus: 'failed',
      selectedCardIdentity: { playerId: 202, handIndex: 0, fullName: 'B Hand 1' },
      failure: { name: 'Error', messageSha256: 'failure-hash' },
      fullStateBefore: before,
      fullStateAfter: after,
    }],
    failedAction: { actionOrdinal: 2, actionName: 'PlayCardAction' },
    finalPublicState: { phase: 'PLAYER_TURN', activePlayer: 1 },
    finalFullState: after,
    finalDiagnosticFailure: { name: 'SnapshotError' },
    failure: { stage: 'dispatch', actionOrdinal: 2 },
  });
  assert.match(text, /candidateSeat=0/);
  assert.match(text, /opponentSeat=1/);
  assert.match(text, /candidateDeckSha256=candidate-deck-hash/);
  assert.match(text, /opponentDeckSha256=opponent-deck-hash/);
  assert.match(text, /candidate-policy/);
  assert.match(text, /opponent-policy/);
  assert.match(text, /constraints-hash/);
  assert.match(text, /card-pool-hash/);
  assert.match(text, /field-hash/);
  assert.match(text, /ACTION #0 turn=1 seat=0/);
  assert.match(text, /SELECTED CARD .*A Hand 1/);
  assert.match(text, /ACTOR OBSERVATION SHA256 view123/);
  assert.match(text, /ACTOR OBSERVATION BEFORE \(ROOT POLICY CONTRACT\)/);
  assert.match(text, /PROMPT RESOLVER CONTEXT/);
  assert.match(text, /inputKind=native-owner-prompt/);
  assert.equal(text.includes('mustNotLeak'), false, 'prompt resolver must not be mislabelled as actor observation');
  assert.match(text, /dispatch=failed/);
  assert.match(text, /ACTION FAILURE .*failure-hash/);
  assert.match(text, /FAILED ACTION .*PlayCardAction/);
  assert.match(text, /FINAL PUBLIC STATE/);
  assert.match(text, /--- FINAL FULL STATE ---/);
  assert.match(text, /FINAL DIAGNOSTIC FAILURE/);
  assert.match(text, /FAILURE .*dispatch/);
  assert.match(text, /ACTION PAYLOAD SHA256 abc123/);
  assert.match(text, /--- BEFORE ---/);
  assert.match(text, /--- AFTER ---/);
  assert.match(text, /B Deck Top/);
  assert.match(text, /A Hand 1/);
});
