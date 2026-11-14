'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const { actorObservation } = require('../../simulation/twinleaf/actor-observation-contract.cjs');

function emptySlot(cards = []) {
  return {
    cards,
    getPokemonCard() { return cards.length ? cards[cards.length - 1] : null; },
    damage: 0,
    pokemonPlayedTurn: 0,
    specialConditions: [],
    energies: { cards: [] },
    tools: [],
    cannotAttackNextTurn: false,
    cannotUseAttacksNextTurn: [],
    blockedAttackNameNextTurn: null,
    blockedAttackNameUntilLeavesActive: null,
    onlyAllowedAttackNameNextTurn: null,
    attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0,
    cannotRetreat: false,
    cannotRetreatNextTurn: false,
    cannotRetreatWhileActive: false,
    cannotEvolveNextTurn: false
  };
}

function player(id, seat, sentinels) {
  const active = emptySlot();
  const bench = Array.from({ length: 5 }, () => emptySlot());
  const prizes = Array.from({ length: 6 }, (_, index) => ({
    cards: [{ fullName: sentinels[id + '-prize-' + index] }],
    faceUpPrize: false
  }));
  return {
    id,
    hand: {
      isPublic: false,
      cards: [{ fullName: 'ACTOR-' + seat + '-OWN-HAND-CARD' }]
    },
    deck: {
      cards: [{ fullName: sentinels[id + '-deck'] }]
    },
    prizes,
    active,
    bench,
    stadium: { cards: [] },
    discard: { cards: [] },
    lostzone: { cards: [] },
    supporter: { cards: [] },
    usedGX: false,
    usedVSTAR: false,
    cannotAttackTurnsRemaining: 0,
    cannotAttackMaxEnergy: null,
    cannotAttackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [],
    ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false,
    cannotPlayPokemonCards: false,
    cannotPlayPokemonWithAbilities: false,
    cannotEvolvePokemonCards: false,
    cannotPlayItemCards: false,
    cannotPlaySupporterCards: false,
    cannotPlayStadiumCards: false,
    cannotPlayToolCards: false,
    cannotPlayEnergyCards: false,
    cannotPlaySpecialEnergyCards: false,
    supporterTurn: 0,
    retreatedTurn: 0,
    usedTurnSkip: false,
    energyPlayedTurn: false,
    stadiumPlayedTurn: false,
    stadiumUsedTurn: false
  };
}

function makeState() {
  const sentinels = {};
  for (const key of [
    'p0-hand', 'p0-deck', 'p0-prize-0', 'p0-prize-1', 'p0-prize-2',
    'p0-prize-3', 'p0-prize-4', 'p0-prize-5',
    'p1-hand', 'p1-deck', 'p1-prize-0', 'p1-prize-1', 'p1-prize-2',
    'p1-prize-3', 'p1-prize-4', 'p1-prize-5'
  ]) sentinels[key] = 'HIDDEN_ZONE_SENTINEL_' + key + '_' + crypto.randomUUID();
  const players = [player('p0', 0, sentinels), player('p1', 1, sentinels)];
  players[0].hand.cards = [{ fullName: 'VISIBLE_ACTOR_ZERO_HAND_CARD' }];
  players[1].hand.cards = [{ fullName: 'VISIBLE_ACTOR_ONE_HAND_CARD' }];
  return {
    players,
    activePlayer: 0,
    turn: 1,
    phase: 0,
    prompts: [],
    sentinels
  };
}

class ChooseCardsPrompt {
  constructor(playerId, cards) {
    this.playerId = playerId;
    this.cards = cards;
    this.result = undefined;
    this.options = { min: 1, max: 1, isSecret: true };
  }
}

function requestFor(seat, observation) {
  const init = {
    schema: protocol.INIT_SCHEMA,
    type: 'init',
    role: 'candidate',
    seat,
    policyVersion: 'actor-view-boundary-test-v1',
    bundleSha256: 'a'.repeat(64),
    config: {}
  };
  return {
    schema: protocol.REQUEST_SCHEMA,
    type: 'decision',
    requestId: 'actor-view-seat' + seat,
    sequence: 1,
    role: 'candidate',
    seat,
    observationSchema: protocol.OBSERVATION_SCHEMA,
    observation,
    prompt: null,
    publicEventReceipt: null,
    actionFrontier: {
      schema: protocol.FRONTIER_SCHEMA,
      items: [{ token: 'pass-' + seat, kind: 'pass' }]
    }
  };
}

test('actor observation excludes concealed hand, deck, face-down Prize and setup Pokémon identities for both seats', () => {
  const state = makeState();
  for (const seat of [0, 1]) {
    const view = actorObservation(state, seat);
    assert.equal(view.actorSeat, seat);
    assert.equal(view.opponentPublic.active, null);
    assert.equal(view.opponentPublic.publicHand, null);
    assert.equal(view.ownerK1, null);
    assert.ok(Object.isFrozen(view));
    assert.ok(Object.isFrozen(view.ownPublic));
    const request = requestFor(seat, view);
    protocol.validateInit({
      schema: protocol.INIT_SCHEMA,
      type: 'init',
      role: 'candidate',
      seat,
      policyVersion: 'actor-view-boundary-test-v1',
      bundleSha256: 'a'.repeat(64),
      config: {}
    });
    protocol.validateRequest(request, {
      schema: protocol.INIT_SCHEMA,
      type: 'init',
      role: 'candidate',
      seat,
      policyVersion: 'actor-view-boundary-test-v1',
      bundleSha256: 'a'.repeat(64),
      config: {}
    }, 1, new Set());
    const serialized = JSON.stringify(request);
    for (const marker of Object.values(state.sentinels))
      assert.equal(serialized.includes(marker), false,
        'concealed identity crossed the actor-view boundary: ' + marker);
    assert.ok(view.ownHand.includes('VISIBLE_ACTOR_' + seat + '_HAND_CARD'),
      'the actor must retain access to its own hand');
    assert.equal(view.opponentPublic.handCount, 1);
    assert.equal(view.opponentPublic.deckCount, 1);
    assert.equal(view.opponentPublic.prizeCount, 6);
  }
});

test('owner deck-search prompt authenticates the actor but does not smuggle deck identities into the observation', () => {
  const state = makeState();
  for (const seat of [0, 1]) {
    const owner = state.players[seat];
    const prompt = new ChooseCardsPrompt(owner.id, owner.deck);
    state.prompts = [prompt];
    const view = actorObservation(state, seat);
    assert.equal(view.decisionKind, 'owner-prompt');
    assert.equal(view.pendingPromptType, 'ChooseCardsPrompt');
    assert.equal(view.pendingOwnerDeckSearch, true);
    const serialized = JSON.stringify(view);
    assert.equal(serialized.includes(state.sentinels[owner.id + '-deck']), false);
    assert.equal(serialized.includes(state.sentinels[state.players[1 - seat].id + '-deck']), false);
    assert.throws(() => actorObservation(state, 1 - seat),
      /Only the prompted actor may inspect/);
  }
});
