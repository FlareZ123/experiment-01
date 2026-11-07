'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION,
  promptZoneMatches,
  withIssue25PublicPromptZoneAuditV2
} = require('../simulation/twinleaf/agent36-issue25-public-prompt-zone-audit-v2.cjs');

const GameMessage = {CHOOSE_CARD_TO_DISCARD: 'CHOOSE_CARD_TO_DISCARD'};

class ChooseCardsPrompt {
  constructor(playerId, cards, sourceCard, options = {}) {
    this.playerId = playerId;
    this.cards = cards;
    this.sourceCard = sourceCard;
    this.message = GameMessage.CHOOSE_CARD_TO_DISCARD;
    this.filter = options.filter ?? null;
    this.options = {
      min: 1,
      max: 1,
      allowCancel: false,
      isSecret: false,
      ...options
    };
  }
}

class AttackAction {
  constructor(playerId, name) {
    this.id = playerId;
    this.name = name;
  }
}

class FakeGalarianStunfisk {
  constructor(ownerId) {
    this.fullName = 'Galarian Stunfisk SSH';
    this.ownerId = ownerId;
    this.store = null;
  }

  reduceEffect(state, effect) {
    const prompt = new ChooseCardsPrompt(
      this.ownerId,
      effect.source,
      null,
      {
        filter: {superType: 'ENERGY'},
        min: 1,
        max: 1,
        allowCancel: false
      }
    );
    this.store.prompt(state, prompt, () => {});
  }
}

class FakeStore {
  constructor(state) {
    this.state = state;
  }

  prompt(_state, prompt, callback) {
    if (typeof callback === 'function') callback();
    return prompt;
  }

  dispatch(action) {
    if (action instanceof AttackAction) {
      const attackerSeat = this.state.players.findIndex(player => player.id === action.id);
      const defenderSeat = 1 - attackerSeat;
      const stunfisk = this.state.players[defenderSeat].active.getPokemonCard();
      stunfisk.store = this;
      stunfisk.reduceEffect(this.state, {
        source: this.state.players[attackerSeat].active
      });
    }
    return action;
  }
}

const card = (fullName, superType) => ({fullName, superType});
const cardList = (...items) => ({cards: items});

function pokemonList(pokemon, energies = [], damage = 0) {
  return {
    cards: [pokemon, ...energies],
    energies: cardList(...energies),
    damage,
    getPokemonCard: () => pokemon
  };
}

function makeScenario(stunfiskSeat = 0) {
  const attackerSeat = 1 - stunfiskSeat;
  const stunfiskOwnerId = 'stunfisk-owner';
  const stunfisk = new FakeGalarianStunfisk(stunfiskOwnerId);
  const marshadow = card('Marshadow UNB', 'POKEMON');
  const energies = [
    card('Psychic Energy', 'ENERGY'),
    card('Psychic Energy', 'ENERGY'),
    card('Psychic Energy', 'ENERGY')
  ];
  const players = [];
  players[stunfiskSeat] = {
    id: stunfiskOwnerId,
    hand: cardList(card('Hidden Owner Hand Card', 'TRAINER')),
    deck: cardList(card('Hidden Owner Deck Card', 'ENERGY')),
    prizes: cardList(card('Hidden Owner Prize Card', 'POKEMON')),
    discard: cardList(card('Public Owner Discard Card', 'TRAINER')),
    lostZone: cardList(card('Public Owner Lost Zone Card', 'TRAINER')),
    active: pokemonList(stunfisk, [], 10),
    bench: []
  };
  players[attackerSeat] = {
    id: 'attacker',
    hand: cardList(card('Hidden Opponent Hand Card', 'TRAINER')),
    deck: cardList(card('Hidden Opponent Deck Card', 'ENERGY')),
    prizes: cardList(card('Hidden Opponent Prize Card', 'POKEMON')),
    discard: cardList(card('Public Opponent Discard Card', 'TRAINER')),
    lostZone: cardList(card('Public Opponent Lost Zone Card', 'TRAINER')),
    active: pokemonList(marshadow, energies),
    bench: []
  };
  return {
    players,
    turn: 54,
    phase: 3,
    activePlayer: attackerSeat
  };
}

test('Snap Trap marker joins exact reducer, live prompt, Active PokemonCardList and Energy subzone for both seats', () => {
  for (const stunfiskSeat of [0, 1]) {
    const state = makeScenario(stunfiskSeat);
    const store = new FakeStore(state);
    const originalPrompt = FakeStore.prototype.prompt;
    const originalDispatch = FakeStore.prototype.dispatch;
    const originalReduceEffect = FakeGalarianStunfisk.prototype.reduceEffect;
    const attackerSeat = 1 - stunfiskSeat;

    const {result, audit} = withIssue25PublicPromptZoneAuditV2(
      () => store.dispatch(new AttackAction('attacker', 'Red Knuckles')),
      {Store: FakeStore, ChooseCardsPrompt, GameMessage}
    );

    assert.equal(result.name, 'Red Knuckles');
    assert.equal(audit.promptCount, 1);
    assert.equal(audit.attackDispatchCount, 1);
    assert.equal(audit.snapTrapReducerCount, 1);
    assert.equal(audit.events.length, 1);
    const event = audit.events[0];
    assert.equal(event.stateIsLiveStore, true);
    assert.equal(event.ownerSeat, stunfiskSeat);
    assert.equal(event.opponentSeat, attackerSeat);
    assert.equal(event.activePlayerSeat, attackerSeat);
    assert.equal(event.message, 'CHOOSE_CARD_TO_DISCARD');
    assert.equal(event.min, 1);
    assert.equal(event.max, 1);
    assert.equal(event.allowCancel, false);
    assert.equal(event.isSecret, false);
    assert.deepEqual(event.filterKeys, ['superType']);
    assert.equal(event.sourceCardPublic, true);
    assert.equal(event.sourcePrinting, 'Galarian Stunfisk SSH');
    assert.equal(event.sourceAttribution, 'reducer-scoped');
    assert.equal(event.sourceEffect, 'Snap Trap');
    assert.equal(event.promptSourceMetadataPresent, false);
    assert.equal(event.sourceMarker.valid, true);
    assert.equal(event.sourceMarker.sourceSeat, stunfiskSeat);
    assert.equal(event.sourceMarker.attackerSeat, attackerSeat);
    assert.equal(event.sourceMarker.promptCardsExact, true);
    assert.equal(event.sourceMarker.energySubzoneExact, true);
    assert.equal(event.sourceMarker.promptOwnerMatches, true);
    assert.equal(event.sourceMarker.activeEnergyMatch, true);
    assert.equal(event.sourceMarker.mandatoryOneEnergy, true);
    assert.deepEqual(event.zoneMatches, [{
      zone: 'opponent-active-pokemon-list',
      match: 'exact-container',
      visibility: 'public',
      eligibleSubzone: 'energies',
      subzoneReferenceMatch: true,
      eligibleCount: 3
    }]);
    assert.equal(event.eligibleSubzone, 'energies');
    assert.equal(event.offeredCount, 3);
    assert.deepEqual(event.offeredPrintings, [
      'Psychic Energy',
      'Psychic Energy',
      'Psychic Energy'
    ]);
    assert.equal(event.ownerActive.printing, 'Galarian Stunfisk SSH');
    assert.equal(event.ownerActive.damage, 10);
    assert.equal(event.opponentActive.printing, 'Marshadow UNB');
    assert.equal(event.opponentActive.energyCount, 3);
    assert.equal(event.currentAttack.attackName, 'Red Knuckles');
    assert.equal(event.currentAttack.seat, attackerSeat);
    assert.equal(FakeStore.prototype.prompt, originalPrompt);
    assert.equal(FakeStore.prototype.dispatch, originalDispatch);
    assert.equal(FakeGalarianStunfisk.prototype.reduceEffect, originalReduceEffect);
  }
});

test('PokemonCardList exact container and attached-Energy subzone are distinguished', () => {
  const state = makeScenario(0);
  const prompt = new ChooseCardsPrompt(
    state.players[0].id,
    state.players[1].active,
    null,
    {filter: {superType: 'ENERGY'}}
  );
  const result = promptZoneMatches(state, prompt);
  assert.deepEqual(result.matches, [{
    zone: 'opponent-active-pokemon-list',
    match: 'exact-container',
    visibility: 'public',
    eligibleSubzone: 'energies',
    subzoneReferenceMatch: true,
    eligibleCount: 3
  }]);
  assert.deepEqual(result.offeredPrintings, [
    'Psychic Energy',
    'Psychic Energy',
    'Psychic Energy'
  ]);
});

test('direct Energy CardList and a selected subset map to the same public attached-Energy subzone', () => {
  const state = makeScenario(0);
  const ownerId = state.players[0].id;
  const energies = state.players[1].active.energies.cards;
  const direct = promptZoneMatches(
    state,
    new ChooseCardsPrompt(ownerId, state.players[1].active.energies, null)
  );
  const subset = promptZoneMatches(
    state,
    new ChooseCardsPrompt(ownerId, cardList(energies[1]), null)
  );
  assert.equal(direct.matches[0].match, 'exact-subzone');
  assert.equal(direct.matches[0].eligibleSubzone, 'energies');
  assert.equal(subset.matches[0].match, 'subset');
  assert.equal(subset.matches[0].eligibleSubzone, null);
  assert.deepEqual(subset.offeredPrintings, ['Psychic Energy']);
});

test('hidden hand and deck prompt zones expose counts without card identities', () => {
  const state = makeScenario(0);
  const owner = state.players[0];
  const hand = promptZoneMatches(
    state,
    new ChooseCardsPrompt(owner.id, owner.hand, owner.hand.cards[0])
  );
  const deck = promptZoneMatches(
    state,
    new ChooseCardsPrompt(owner.id, owner.deck, owner.deck.cards[0])
  );
  assert.deepEqual(hand.matches, [{
    zone: 'owner-hand',
    match: 'exact-container',
    visibility: 'hidden',
    eligibleSubzone: null,
    subzoneReferenceMatch: false,
    eligibleCount: 1
  }]);
  assert.equal(hand.offeredCount, 1);
  assert.equal(hand.offeredPrintings, null);
  assert.equal(deck.offeredPrintings, null);
});

test('an unrelated discard prompt outside the Snap Trap reducer has no source marker', () => {
  const state = makeScenario(0);
  const store = new FakeStore(state);
  const prompt = new ChooseCardsPrompt(
    state.players[0].id,
    state.players[0].hand,
    null,
    {filter: {superType: 'ENERGY'}}
  );
  const {audit} = withIssue25PublicPromptZoneAuditV2(
    () => store.prompt(state, prompt, () => {}),
    {Store: FakeStore, ChooseCardsPrompt, GameMessage}
  );
  assert.equal(audit.promptCount, 1);
  assert.equal(audit.snapTrapReducerCount, 0);
  assert.equal(audit.events[0].sourceCardPublic, false);
  assert.equal(audit.events[0].sourceAttribution, null);
  assert.equal(audit.events[0].sourceMarker, null);
  assert.equal(audit.events[0].offeredPrintings, null);
});

test('a reducer frame with a detached attacker list fails closed', () => {
  const state = makeScenario(0);
  const store = new FakeStore(state);
  const originalDispatch = FakeStore.prototype.dispatch;
  FakeStore.prototype.dispatch = function(action) {
    if (action instanceof AttackAction) {
      const stunfisk = this.state.players[0].active.getPokemonCard();
      stunfisk.store = this;
      const detached = pokemonList(card('Marshadow UNB', 'POKEMON'), [
        card('Psychic Energy', 'ENERGY')
      ]);
      stunfisk.reduceEffect(this.state, {source: detached});
    }
    return action;
  };
  try {
    const {audit} = withIssue25PublicPromptZoneAuditV2(
      () => store.dispatch(new AttackAction('attacker', 'Red Knuckles')),
      {Store: FakeStore, ChooseCardsPrompt, GameMessage}
    );
    assert.equal(audit.events.length, 1);
    assert.equal(audit.events[0].sourceCardPublic, false);
    assert.equal(audit.events[0].sourceMarker.valid, false);
    assert.equal(audit.events[0].sourceMarker.attackerSeat, null);
    assert.deepEqual(audit.events[0].zoneMatches, []);
  } finally {
    FakeStore.prototype.dispatch = originalDispatch;
  }
});

test('hooks and dynamically patched reducer prototype restore after an exception', () => {
  const state = makeScenario(0);
  const store = new FakeStore(state);
  const originalPrompt = FakeStore.prototype.prompt;
  const originalDispatch = FakeStore.prototype.dispatch;
  const originalReduceEffect = FakeGalarianStunfisk.prototype.reduceEffect;
  const error = new Error('diagnostic fixture failure');

  assert.throws(() => withIssue25PublicPromptZoneAuditV2(() => {
    store.dispatch(new AttackAction('attacker', 'Red Knuckles'));
    throw error;
  }, {Store: FakeStore, ChooseCardsPrompt, GameMessage}), error);

  assert.equal(error.issue25PublicPromptZoneAuditV2.version, VERSION);
  assert.equal(error.issue25PublicPromptZoneAuditV2.events.length, 1);
  assert.equal(FakeStore.prototype.prompt, originalPrompt);
  assert.equal(FakeStore.prototype.dispatch, originalDispatch);
  assert.equal(FakeGalarianStunfisk.prototype.reduceEffect, originalReduceEffect);
});
