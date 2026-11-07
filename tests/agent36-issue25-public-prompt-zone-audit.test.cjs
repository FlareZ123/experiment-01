'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION,
  promptZoneMatches,
  withIssue25PublicPromptZoneAudit
} = require('../simulation/twinleaf/agent36-issue25-public-prompt-zone-audit.cjs');

const GameMessage = {CHOOSE_CARD_TO_DISCARD: 'CHOOSE_CARD_TO_DISCARD'};

class ChooseCardsPrompt {
  constructor(playerId, cards, sourceCard, options = {}) {
    this.id = 54;
    this.playerId = playerId;
    this.cards = cards;
    this.sourceCard = sourceCard;
    this.message = GameMessage.CHOOSE_CARD_TO_DISCARD;
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
      const attacker = this.state.players[attackerSeat];
      const defender = this.state.players[defenderSeat];
      const prompt = new ChooseCardsPrompt(
        defender.id,
        attacker.active.energies,
        defender.active.getPokemonCard()
      );
      this.prompt(this.state, prompt, () => {});
    }
    return action;
  }
}

const card = fullName => ({fullName});
const cardList = (...fullNames) => ({cards: fullNames.map(card)});
const slot = (pokemon, energies = [], damage = 0) => ({
  getPokemonCard: () => pokemon,
  energies: {cards: energies},
  damage
});

function makeScenario(stunfiskSeat = 0) {
  const attackerSeat = 1 - stunfiskSeat;
  const players = [];
  players[stunfiskSeat] = {
    id: 'stunfisk-owner',
    hand: cardList('Hidden Owner Hand Card'),
    deck: cardList('Hidden Owner Deck Card'),
    prizes: cardList('Hidden Owner Prize Card'),
    discard: cardList('Public Owner Discard Card'),
    lostZone: cardList('Public Owner Lost Zone Card'),
    active: slot(card('Galarian Stunfisk SSH'), [], 10),
    bench: []
  };
  players[attackerSeat] = {
    id: 'attacker',
    hand: cardList('Hidden Opponent Hand Card'),
    deck: cardList('Hidden Opponent Deck Card'),
    prizes: cardList('Hidden Opponent Prize Card'),
    discard: cardList('Public Opponent Discard Card'),
    lostZone: cardList('Public Opponent Lost Zone Card'),
    active: slot(card('Marshadow UNB'), [
      card('Psychic Energy'),
      card('Psychic Energy'),
      card('Psychic Energy')
    ]),
    bench: []
  };
  return {
    players,
    turn: 54,
    phase: 3,
    activePlayer: attackerSeat
  };
}

test('captures public attacker Active Energy zone and initiating AttackAction for either seat', () => {
  for (const stunfiskSeat of [0, 1]) {
    const state = makeScenario(stunfiskSeat);
    const store = new FakeStore(state);
    const originalPrompt = FakeStore.prototype.prompt;
    const originalDispatch = FakeStore.prototype.dispatch;
    const attackerSeat = 1 - stunfiskSeat;
    const attackerId = state.players[attackerSeat].id;

    const {result, audit} = withIssue25PublicPromptZoneAudit(
      () => store.dispatch(new AttackAction(attackerId, 'Red Knuckles')),
      {Store: FakeStore, ChooseCardsPrompt, GameMessage}
    );

    assert.equal(result.name, 'Red Knuckles');
    assert.equal(audit.promptCount, 1);
    assert.equal(audit.attackDispatchCount, 1);
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
    assert.equal(event.sourceCardPublic, true);
    assert.equal(event.sourcePrinting, 'Galarian Stunfisk SSH');
    assert.deepEqual(event.zoneMatches, [{
      zone: 'opponent-active-energies',
      match: 'exact',
      visibility: 'public'
    }]);
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
  }
});

test('hidden hand and deck prompt zones expose counts without card identities', () => {
  const state = makeScenario(0);
  const owner = state.players[0];
  const handPrompt = new ChooseCardsPrompt(owner.id, owner.hand, owner.hand.cards[0]);
  const deckPrompt = new ChooseCardsPrompt(owner.id, owner.deck, owner.deck.cards[0]);

  const handZone = promptZoneMatches(state, handPrompt);
  const deckZone = promptZoneMatches(state, deckPrompt);

  assert.deepEqual(handZone.matches, [{
    zone: 'owner-hand',
    match: 'exact',
    visibility: 'hidden'
  }]);
  assert.equal(handZone.offeredCount, 1);
  assert.equal(handZone.offeredPrintings, null);
  assert.deepEqual(deckZone.matches, [{
    zone: 'owner-deck',
    match: 'exact',
    visibility: 'hidden'
  }]);
  assert.equal(deckZone.offeredPrintings, null);
});

test('public Energy subsets are identified without changing physical objects', () => {
  const state = makeScenario(0);
  const attacker = state.players[1];
  const selected = attacker.active.energies.cards[1];
  const prompt = new ChooseCardsPrompt(
    state.players[0].id,
    {cards: [selected]},
    state.players[0].active.getPokemonCard()
  );
  const result = promptZoneMatches(state, prompt);

  assert.deepEqual(result.matches, [{
    zone: 'opponent-active-energies',
    match: 'subset',
    visibility: 'public'
  }]);
  assert.deepEqual(result.offeredPrintings, ['Psychic Energy']);
  assert.strictEqual(prompt.cards.cards[0], selected);
});

test('unrelated prompt messages are ignored and hooks restore after exceptions', () => {
  const state = makeScenario(0);
  const store = new FakeStore(state);
  const originalPrompt = FakeStore.prototype.prompt;
  const originalDispatch = FakeStore.prototype.dispatch;
  const unrelated = new ChooseCardsPrompt(
    state.players[0].id,
    state.players[0].hand,
    state.players[0].hand.cards[0]
  );
  unrelated.message = 'CHOOSE_CARD_TO_HAND';

  const {audit} = withIssue25PublicPromptZoneAudit(() => {
    store.prompt(state, unrelated, () => {});
    return 'ok';
  }, {Store: FakeStore, ChooseCardsPrompt, GameMessage});
  assert.equal(audit.promptCount, 0);
  assert.equal(audit.events.length, 0);

  const error = new Error('diagnostic fixture failure');
  assert.throws(() => withIssue25PublicPromptZoneAudit(() => {
    store.prompt(state, new ChooseCardsPrompt(
      state.players[0].id,
      state.players[0].hand,
      state.players[0].hand.cards[0]
    ), () => {});
    throw error;
  }, {Store: FakeStore, ChooseCardsPrompt, GameMessage}), error);
  assert.equal(error.issue25PublicPromptZoneAudit.version, VERSION);
  assert.equal(error.issue25PublicPromptZoneAudit.events.length, 1);
  assert.equal(FakeStore.prototype.prompt, originalPrompt);
  assert.equal(FakeStore.prototype.dispatch, originalDispatch);
});
