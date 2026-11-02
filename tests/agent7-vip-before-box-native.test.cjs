'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  offerVipBeforeBox, selectOwnedVipBasic, withOwnerVipBeforeBox
} = require('../simulation/twinleaf/agent7-vip-before-box-native.cjs');

const DEFAULT_BENCH = Array(5).fill(null);

/** @param {string[]} names @param {(string|null)[]} bench */
function view(names, bench = [...DEFAULT_BENCH]) {
  return {
    turn: 1, handNames: names, benchNames: bench,
    activeName: 'Mega Absol ex',
    itemLocked: false, toolLocked: false
  };
}

test('requires a payable original Box and a payable Box after VIP removal', () => {
  const hand = ['Secret Box', 'Trubbish', 'Float Stone', 'Battle VIP Pass',
    'Dark Patch', 'VS Seeker', 'Lightning Energy', 'Quick Ball'];
  const selected = offerVipBeforeBox(view(hand));
  assert.equal(selected.eligible, true);
  assert.equal(selected.reason, 'VIP_FIRST_RETAINS_THREE_CARD_BOX_K0');
  assert.deepEqual(selected.anticipatedBox.discardNames,
    ['Dark Patch', 'Quick Ball', 'VS Seeker']);

  const short = offerVipBeforeBox(view([
    'Secret Box', 'Float Stone',
    'Battle VIP Pass', 'Dark Patch', 'VS Seeker'
  ], ['Trubbish', null, null, null, null]));
  assert.equal(short.eligible, false);
  assert.equal(short.reason, 'VIP_FIRST_LOSES_BOX_K0_PAYMENT');
});

test('never exposes owner-deck/Prize identities in K0 plan and rejects full Bench', () => {
  const hand = ['Secret Box', 'Battle VIP Pass', 'Float Stone',
    'Dark Patch', 'VS Seeker', 'Lightning Energy'];
  const full = ['Trubbish', 'Mega Absol ex',
    'Crobat V', 'Budew', 'Dedenne-GX'];
  assert.equal(offerVipBeforeBox(view(hand, full)).reason,
    'NO_OPEN_BENCH_FOR_VIP');
  assert.equal(offerVipBeforeBox(view(hand.slice(1))).reason,
    'ORIGINAL_BOX_K0_ABSENT');
  const locked = {...view(hand, ['Trubbish', ...DEFAULT_BENCH.slice(1)]),
    itemLocked: true};
  assert.equal(offerVipBeforeBox(locked).eligible, false);
});

test('owner-deck VIP search prefers one real Trubbish over unrelated Basics', () => {
  const pokemon = n => ({
    name: n, fullName: n + ' PAR', superType: 3, stage: 0
  });
  const cards = [pokemon('Mega Absol ex'), pokemon('Trubbish')];
  const prompt = {cards: {cards}, validate: choice =>
    choice.length === 1 && cards.includes(choice[0])};
  const slot = name => ({getPokemonCard: () => name ? {name} : null});
  const owner = {
    active: slot('Mega Absol ex'),
    bench: [slot(null), slot(null), slot(null)]
  };
  assert.equal(selectOwnedVipBasic(prompt, owner,
    {pokemon: 3, basic: 0}, {}), cards[1]);
  owner.bench[0] = slot('Trubbish');
  assert.equal(selectOwnedVipBasic(prompt, owner,
    {pokemon: 3, basic: 0}, {}), cards[0]);
});

test('reversible native owner VIP root, physical search and delegate to Box', () => {
  class PlayCardAction {
    constructor(playerId, handIndex, target) {
      this.playerId = playerId;
      this.handIndex = handIndex;
      this.target = target;
    }
  }
  class ResolvePromptAction {
    constructor(id, cards) { this.id = id; this.cards = cards; }
  }
  class AddPlayerAction {}
  class ChooseCardsPrompt {
    constructor(deck, ownerId) {
      this.id = 93;
      this.cards = deck;
      this.playerId = ownerId;
      this.message = 'CHOOSE_CARD_TO_PUT_ONTO_BENCH';
    }
    validate(cards) {
      return cards.length === 1 && this.cards.cards.includes(cards[0]);
    }
  }
  const card = (name, type = 1) => ({
    name, fullName: name + ' FST', stage: 0,
    superType: type
  });
  const slot = picked => ({
    cards: picked ? [picked] : [],
    getPokemonCard() { return this.cards[0] ?? null; }
  });
  const hand = ['Secret Box', 'Trubbish', 'Float Stone', 'Battle VIP Pass',
    'Dark Patch', 'VS Seeker', 'Lightning Energy', 'Quick Ball'];
  const owner = {
    id: 'A',
    hand: {cards: hand.map(name => card(name))},
    deck: {cards: [card('Trubbish', 3), card('Mega Absol ex', 3)]},
    active: slot(card('Mega Absol ex', 3)),
    bench: Array.from({length: 5}, () => slot(null)),
    cannotPlayItemCards: false, cannotPlayToolCards: false
  };
  const other = {id: 'B'};
  const state = {
    players: [owner, other], activePlayer: 0, turn: 1,
    phase: 'PLAYER_TURN', prompts: []
  };
  let originalCalls = 0;
  class SimpleTacticsAi {
    constructor() { this.client = {id: 'A'}; }
    decodeNextAction() {
      originalCalls++;
      return 'original-box-handler-next';
    }
  }
  class Store {
    constructor() { this.state = state; }
    dispatch(action) {
      if (action instanceof PlayCardAction) {
        const selected = owner.hand.cards.splice(action.handIndex, 1)[0];
        assert.equal(selected.name, 'Battle VIP Pass');
        state.prompts.push(new ChooseCardsPrompt(owner.deck, owner.id));
      }
      if (action instanceof ResolvePromptAction) {
        const selected = action.cards[0];
        owner.deck.cards.splice(owner.deck.cards.indexOf(selected), 1);
        owner.bench[0].cards.push(selected);
        state.prompts[0].result = action.cards;
      }
      return action;
    }
  }
  const ownDecode = SimpleTacticsAi.prototype.decodeNextAction;
  const ownDispatch = Store.prototype.dispatch;
  const result = withOwnerVipBeforeBox(() => {
    const store = new Store(), ai = new SimpleTacticsAi();
    store.dispatch(new AddPlayerAction());
    const vip = ai.decodeNextAction(state);
    assert.ok(vip instanceof PlayCardAction);
    store.dispatch(vip);
    const search = ai.decodeNextAction(state);
    assert.ok(search instanceof ResolvePromptAction);
    assert.equal(search.cards.length, 1);
    assert.equal(search.cards[0].name, 'Trubbish');
    store.dispatch(search);
    assert.equal(ai.decodeNextAction(state), 'original-box-handler-next');
    return 'native-test-finished';
  }, {
    SimpleTacticsAi, Store,
    cardActions: {
      PlayCardAction, PlayerType: {ANY: 7}, SlotType: {BOARD: 4}
    },
    ResolvePromptAction,
    types: {Stage: {BASIC: 0}, SuperType: {POKEMON: 3}},
    GamePhase: {PLAYER_TURN: 'PLAYER_TURN'}
  });
  assert.equal(result.result, 'native-test-finished');
  assert.equal(result.audit.acceptedVipRoots, 1);
  assert.equal(result.audit.acceptedVipSearches, 1);
  assert.equal(result.audit.physicalBenchConfirmed, 1);
  assert.equal(result.audit.unresolvedOwnerSearches, 0);
  assert.equal(originalCalls, 1);
  assert.equal(result.audit.competitiveQualifiedGames, 0);
  assert.equal(SimpleTacticsAi.prototype.decodeNextAction, ownDecode);
  assert.equal(Store.prototype.dispatch, ownDispatch);
});
