'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION,
  promptZoneMatches,
  withIssue25PublicPromptZoneAuditV6
} = require('../simulation/twinleaf/agent36-issue25-public-prompt-zone-audit-v6.cjs');

const GameMessage = {CHOOSE_CARD_TO_DISCARD: 'CHOOSE_CARD_TO_DISCARD'};
const SuperType = {ENERGY: 'ENERGY', POKEMON: 'POKEMON'};

class ChooseCardsPrompt {
  constructor(player, message, cards, filter, options = {}) {
    this.id = null;
    this.player = player;
    this.playerId = player.id;
    this.message = message;
    this.cards = cards;
    this.filter = filter;
    this.options = options;
  }
}

class PokemonCardList {
  constructor(pokemon, energies = [], damage = 0) {
    this.cards = pokemon ? [pokemon, ...energies] : [...energies];
    this.energies = {cards: energies};
    this.damage = damage;
    this.pokemon = pokemon;
  }

  getPokemonCard() {
    return this.pokemon;
  }
}

class AttackAction {
  constructor(playerId, name) {
    this.id = playerId;
    this.name = name;
  }
}

class FakeStore {
  constructor(state, promptFactory) {
    this.state = state;
    this.promptFactory = promptFactory;
  }

  prompt(stateArgument, prompt, callback, token) {
    assert.equal(stateArgument, this.state);
    assert.equal(prompt.id, null);
    prompt.id = String(stateArgument.prompts.length + 1);
    stateArgument.prompts.push(prompt);
    this.promptArgs = [stateArgument, prompt, callback, token];
    if (typeof callback === 'function') callback();
    return stateArgument;
  }

  dispatch(action) {
    if (action instanceof AttackAction) {
      const attackerSeat = this.state.players.findIndex(player => player.id === action.id);
      const ownerSeat = 1 - attackerSeat;
      const owner = this.state.players[ownerSeat];
      const prompt = this.promptFactory(owner, this.state.players[attackerSeat].active);
      const callback = () => {};
      const token = {preserved: true};
      this.prompt(this.state, prompt, callback, token);
    }
    return action;
  }
}

const card = (fullName, superType) => ({fullName, superType});
const cardList = (...items) => ({cards: items});

function makeScenario(ownerSeat = 0) {
  const attackerSeat = 1 - ownerSeat;
  const stunfisk = card('Galarian Stunfisk SSH', 'POKEMON');
  const marshadow = card('Marshadow UNB', 'POKEMON');
  const energies = [
    card('Psychic Energy MEE', SuperType.ENERGY),
    card('Psychic Energy MEE', SuperType.ENERGY),
    card('Psychic Energy MEE', SuperType.ENERGY)
  ];
  const players = [];
  players[ownerSeat] = {
    id: 'owner',
    hand: cardList(card('Hidden Owner Hand Card', 'TRAINER')),
    deck: cardList(card('Hidden Owner Deck Card', SuperType.ENERGY)),
    prizes: cardList(card('Hidden Owner Prize Card', 'POKEMON')),
    discard: cardList(card('Public Owner Discard Card', 'TRAINER')),
    lostZone: cardList(card('Public Owner Lost Zone Card', 'TRAINER')),
    active: new PokemonCardList(stunfisk, [], 10),
    bench: []
  };
  players[attackerSeat] = {
    id: 'attacker',
    hand: cardList(card('Hidden Attacker Hand Card', 'TRAINER')),
    deck: cardList(card('Hidden Attacker Deck Card', SuperType.ENERGY)),
    prizes: cardList(card('Hidden Attacker Prize Card', 'POKEMON')),
    discard: cardList(card('Public Attacker Discard Card', 'TRAINER')),
    lostZone: cardList(card('Public Attacker Lost Zone Card', 'TRAINER')),
    active: new PokemonCardList(marshadow, energies),
    bench: []
  };
  return {
    state: {players, turn: 54, phase: 3, activePlayer: attackerSeat, prompts: []},
    ownerSeat,
    attackerSeat
  };
}

function makePrompt(owner, cards, filter = {superType: SuperType.ENERGY}) {
  return new ChooseCardsPrompt(
    owner,
    GameMessage.CHOOSE_CARD_TO_DISCARD,
    cards,
    filter,
    {min: 1, max: 1, allowCancel: false, isSecret: false}
  );
}

test('version identifies the post-Store.prompt ID and public zone observer', () => {
  assert.equal(VERSION, 'agent36-issue25-public-prompt-zone-audit-v6');
});

test('captures live State-first prompt, post-call ID, exact Active list and Energy subzone', () => {
  for (const ownerSeat of [0, 1]) {
    const {state, attackerSeat} = makeScenario(ownerSeat);
    const store = new FakeStore(state, (owner, attacker) => makePrompt(owner, attacker));
    const originalPrompt = FakeStore.prototype.prompt;
    const originalDispatch = FakeStore.prototype.dispatch;

    const {result, audit} = withIssue25PublicPromptZoneAuditV6(
      () => store.dispatch(new AttackAction('attacker', 'Red Knuckles')),
      {Store: FakeStore, ChooseCardsPrompt, GameMessage, SuperType}
    );

    assert.equal(result.name, 'Red Knuckles');
    assert.equal(audit.promptCount, 1);
    assert.equal(audit.attackDispatchCount, 1);
    assert.equal(audit.events.length, 1);
    const event = audit.events[0];
    assert.equal(event.promptId, '1');
    assert.equal(event.promptIdBeforeStore, null);
    assert.equal(event.promptIdAssignedByStore, true);
    assert.equal(event.stateIsLiveStore, true);
    assert.equal(event.promptStateArgumentMatchesLiveState, true);
    assert.equal(event.turn, 54);
    assert.equal(event.phase, 3);
    assert.equal(event.ownerSeat, ownerSeat);
    assert.equal(event.opponentSeat, attackerSeat);
    assert.equal(event.activePlayerSeat, attackerSeat);
    assert.equal(event.promptType, 'ChooseCardsPrompt');
    assert.equal(event.message, 'CHOOSE_CARD_TO_DISCARD');
    assert.equal(event.min, 1);
    assert.equal(event.max, 1);
    assert.equal(event.allowCancel, false);
    assert.equal(event.isSecret, false);
    assert.deepEqual(event.filterKeys, ['superType']);
    assert.equal(event.filterIsExactSuperTypeEnergy, true);
    assert.equal(event.promptPlayerMatches, true);
    assert.equal(event.promptPlayerIdBeforeStore, 'owner');
    assert.equal(event.promptPlayerIdAfterStore, 'owner');
    assert.equal(event.promptCardsClass, 'PokemonCardList');
    assert.deepEqual(event.zoneMatches, [{
      zone: 'opponent-active-pokemon-list',
      match: 'exact-container',
      visibility: 'public',
      eligibleSubzone: 'energies',
      subzoneReferenceMatch: true,
      eligibleCount: 3
    }]);
    assert.equal(event.eligibleSubzone, 'energies');
    assert.equal(event.filterMatchesEnergySubzone, true);
    assert.equal(event.offeredCount, 3);
    assert.deepEqual(event.offeredPrintings, [
      'Psychic Energy MEE',
      'Psychic Energy MEE',
      'Psychic Energy MEE'
    ]);
    assert.equal(event.promptSourceMetadataPresent, false);
    assert.equal(event.ownerActive.printing, 'Galarian Stunfisk SSH');
    assert.equal(event.opponentActive.printing, 'Marshadow UNB');
    assert.equal(event.opponentActive.energyCount, 3);
    assert.equal(event.currentAttack.attackName, 'Red Knuckles');
    assert.equal(event.currentAttack.seat, attackerSeat);
    assert.equal(event.lastAttack, null);
    assert.equal(store.promptArgs[0], state);
    assert.equal(store.promptArgs[1].id, '1');
    assert.equal(typeof store.promptArgs[2], 'function');
    assert.deepEqual(store.promptArgs[3], {preserved: true});
    assert.equal(state.prompts[0], store.promptArgs[1]);
    assert.equal(FakeStore.prototype.prompt, originalPrompt);
    assert.equal(FakeStore.prototype.dispatch, originalDispatch);
  }
});

test('direct Energy sublist and a selected Energy subset remain public zone matches', () => {
  const {state, ownerSeat} = makeScenario(0);
  const owner = state.players[ownerSeat];
  const attacker = state.players[1].active;
  const direct = promptZoneMatches(
    state,
    makePrompt(owner, attacker.energies),
    SuperType
  );
  const subset = promptZoneMatches(
    state,
    makePrompt(owner, {cards: [attacker.energies.cards[1]]}),
    SuperType
  );
  assert.equal(direct.matches[0].match, 'exact-subzone');
  assert.equal(direct.matches[0].eligibleSubzone, 'energies');
  assert.equal(subset.matches[0].match, 'subset');
  assert.equal(subset.matches[0].eligibleSubzone, 'energies');
  assert.deepEqual(subset.offeredPrintings, ['Psychic Energy MEE']);
});

test('hidden hand, deck and Prize prompts never emit hidden card identities', () => {
  const {state, ownerSeat} = makeScenario(0);
  const owner = state.players[ownerSeat];
  for (const zone of [owner.hand, owner.deck, owner.prizes]) {
    const result = promptZoneMatches(
      state,
      makePrompt(owner, zone),
      SuperType
    );
    assert.equal(result.matches.length, 1);
    assert.equal(result.matches[0].visibility, 'hidden');
    assert.equal(result.offeredPrintings, null);
  }
});

test('wrong superType filter cannot be reported as an Energy subzone', () => {
  const {state, ownerSeat} = makeScenario(0);
  const owner = state.players[ownerSeat];
  const attacker = state.players[1].active;
  const result = promptZoneMatches(
    state,
    makePrompt(owner, attacker, {superType: SuperType.POKEMON}),
    SuperType
  );
  assert.equal(result.eligibleSubzone, null);
  assert.equal(result.filterMatchesEnergySubzone, false);
  assert.equal(result.offeredCount, attacker.cards.length);
});

test('ambiguous public matches are retained instead of choosing the first', () => {
  const {state, ownerSeat} = makeScenario(0);
  const owner = state.players[ownerSeat];
  const attacker = state.players[1].active;
  owner.discard.cards.push(...attacker.energies.cards);
  const result = promptZoneMatches(
    state,
    makePrompt(owner, attacker),
    SuperType
  );
  assert.equal(result.matches.length, 2);
});

test('unrelated prompt messages are ignored and original Store.prompt arguments are preserved', () => {
  const {state, ownerSeat} = makeScenario(0);
  const owner = state.players[ownerSeat];
  const prompt = makePrompt(owner, owner.hand);
  prompt.message = 'CHOOSE_CARD_TO_MOVE';
  const store = new FakeStore(state, () => prompt);
  const {audit} = withIssue25PublicPromptZoneAuditV6(
    () => store.prompt(state, prompt, () => {}, 'extra'),
    {Store: FakeStore, ChooseCardsPrompt, GameMessage, SuperType}
  );
  assert.equal(audit.promptCount, 0);
  assert.equal(store.promptArgs[0], state);
  assert.equal(store.promptArgs[1], prompt);
  assert.equal(store.promptArgs[3], 'extra');
});

test('Store prompt and dispatch descriptors restore after a callback exception', () => {
  const {state} = makeScenario(0);
  const store = new FakeStore(state, (owner, attacker) => makePrompt(owner, attacker));
  const originalPrompt = Object.getOwnPropertyDescriptor(FakeStore.prototype, 'prompt');
  const originalDispatch = Object.getOwnPropertyDescriptor(FakeStore.prototype, 'dispatch');
  const error = new Error('observer fixture failure');

  assert.throws(() => withIssue25PublicPromptZoneAuditV6(() => {
    store.dispatch(new AttackAction('attacker', 'Red Knuckles'));
    throw error;
  }, {Store: FakeStore, ChooseCardsPrompt, GameMessage, SuperType}), error);

  assert.equal(error.issue25PublicPromptZoneAuditV6.events.length, 1);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype, 'prompt'), originalPrompt);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype, 'dispatch'), originalDispatch);
});
