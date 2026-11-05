'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  TELEPATH, chooseTelepathicBasics, withOwnerTelepathicBenchSearch
} = require('../simulation/twinleaf/agent8-owner-telepathic-bench-search.cjs');

const types = {
  Stage: {BASIC: 2, STAGE_1: 3},
  CardType: {PSYCHIC: 5, DARK: 7},
  SuperType: {POKEMON: 1, ENERGY: 3}
};
const GameMessage = {CHOOSE_CARD_TO_PUT_ONTO_BENCH: 'bench'};
let nextCardId = 1;
const pokemon = (fullName, type = 5, stage = 2) => ({
  id: nextCardId++, fullName, superType: 1, stage, cardType: [type]
});
const energy = () => ({id: nextCardId++, fullName: TELEPATH, superType: 3});
class PlayCardAction {
  constructor(id, handIndex) {this.id = id; this.handIndex = handIndex;}
}
class ResolvePromptAction {
  constructor(id, result) {this.id = id; this.result = result;}
}
class ChooseCardsPrompt {
  constructor(owner, max) {
    this.id = 13;
    this.playerId = owner.id;
    this.cards = owner.deck;
    this.message = GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH;
    this.filter = {stage: 2, cardType: [5]};
    this.options = {min: 0, max};
  }
  validate(cards) {
    return Array.isArray(cards) && cards.length <= this.options.max &&
      cards.every(c => this.cards.cards.includes(c) &&
        c.superType === 1 && c.stage === 2 && c.cardType.includes(5));
  }
}
class ShuffleDeckPrompt {
  constructor(id) {this.id = 77; this.playerId = id;}
}
class Store {
  constructor(state) {this.state = state;}
  dispatch(action) {
    if (action instanceof PlayCardAction) {
      const owner = this.state.players.find(p => p.id === action.id);
      const [card] = owner.hand.cards.splice(action.handIndex, 1);
      owner.active.energies.cards.push(card);
      const free = owner.bench.filter(slot => slot.cards.length === 0).length;
      const eligible = owner.deck.cards.filter(c =>
        c.superType === 1 && c.stage === 2 && c.cardType.includes(5)).length;
      if (free > 0 && eligible > 0) {
        const prompt = new ChooseCardsPrompt(owner, Math.min(2, free, eligible));
        prompt.callback = selected => {
          selected.forEach((c, i) => {
            owner.deck.cards.splice(owner.deck.cards.indexOf(c), 1);
            owner.bench.filter(s => s.cards.length === 0)[0].cards.push(c);
          });
          this.state.prompts.push(new ShuffleDeckPrompt(owner.id));
        };
        this.state.prompts.push(prompt);
      }
    } else if (action instanceof ResolvePromptAction) {
      const prompt = this.state.prompts.find(p =>
        p.id === action.id && p.result === undefined);
      assert.ok(prompt && prompt.validate(action.result), 'invalid fixture prompt');
      prompt.result = action.result;
      prompt.callback(action.result);
    }
    return this.state;
  }
}
class Ai {
  constructor(id) {this.client = {id};}
  decodeNextAction() {return {kind: 'default-fallback'};}
}
const dependencies = {
  SimpleTacticsAi: Ai, Store, ResolvePromptAction,
  types, GameMessage,
  assertValidPromptAction: (state, action) => {
    const p = state.prompts.find(p => p.id === action.id && p.result === undefined);
    assert.ok(p && p.validate(action.result, state));
  }
};
function scene(seat, {open = 3, pool = null, StoreClass = Store} = {}) {
  const owner = {id: 100 + seat, hand: {cards: [energy()]},
    deck: {cards: pool ?? [pokemon('Mewtwo & Mew-GX UNM'),
      pokemon('Duskull VIV'), pokemon('Gengar & Mimikyu-GX TEU'),
      pokemon('Zoroark DEX', 7), pokemon('Dusknoir SFA', 5, 4)]},
    active: {cards: [pokemon('Klefki SVI')], energies: {cards: []}},
    bench: Array.from({length: 5}, (_, n) => ({
      cards: n < 5 - open ? [pokemon('Occupied ' + n)] : [],
      energies: {cards: []}
    }))};
  const opponent = {id: 300 + seat, hand: {get cards() {
    throw new Error('opponent concealed-hand accessed');
  }}, deck: {get cards() {throw new Error('opponent concealed-deck accessed');}}};
  const state = {players: seat === 0 ? [owner, opponent] : [opponent, owner],
    turn: 1, prompts: []};
  return {owner, state, store: new StoreClass(state), ai: new Ai(owner.id)};
}
for (const seat of [0, 1]) {
  test('two-seat genuine Telepath root-to-two-Basics custody: seat ' + seat, () => {
    const f = scene(seat);
    const previous = [Ai.prototype.decodeNextAction, Store.prototype.dispatch];
    const {audit} = withOwnerTelepathicBenchSearch(() => {
      assert.equal(f.ai.decodeNextAction(f.state).kind, 'default-fallback');
      f.store.dispatch(new PlayCardAction(f.owner.id, 0));
      const action = f.ai.decodeNextAction(f.state);
      assert.ok(action instanceof ResolvePromptAction);
      assert.deepEqual(action.result.map(x => x.fullName),
        ['Duskull VIV', 'Gengar & Mimikyu-GX TEU']);
      f.store.dispatch(action);
      assert.equal(f.owner.deck.cards.includes(action.result[0]), false);
      assert.equal(f.owner.deck.cards.includes(action.result[1]), false);
      assert.equal(f.state.prompts.at(-1).constructor.name, 'ShuffleDeckPrompt');
    }, dependencies);
    assert.equal(audit.actualAttachments, 1);
    assert.equal(audit.matchingOwnerSearches, 1);
    assert.equal(audit.settled, 1);
    assert.equal(audit.physicallyBenched, 2);
    assert.equal(audit.readsUnopenedDeck, false);
    assert.equal(audit.readsOpponentHidden, false);
    assert.strictEqual(Ai.prototype.decodeNextAction, previous[0]);
    assert.strictEqual(Store.prototype.dispatch, previous[1]);
  });
  test('one remaining Bench slot narrows native max and accepted count: seat ' + seat, () => {
    const f = scene(seat, {open: 1});
    const {audit} = withOwnerTelepathicBenchSearch(() => {
      f.store.dispatch(new PlayCardAction(f.owner.id, 0));
      const action = f.ai.decodeNextAction(f.state);
      assert.equal(action.result.length, 1);
      f.store.dispatch(action);
    }, dependencies);
    assert.equal(audit.physicallyBenched, 1);
  });
}
test('source prompt classifier rejects an unrelated owner deck search', () => {
  const f = scene(0);
  const prompt = new ChooseCardsPrompt(f.owner, 2);
  prompt.message = 'unrelated lookup';
  assert.equal(chooseTelepathicBasics(prompt, f.owner,
    {...types, GameMessage}, f.state), null);
});
test('K0 non-Telepath actions cannot look into unopened owner deck', () => {
  const f = scene(0);
  Object.defineProperty(f.owner.deck, 'cards', {get() {
    throw new Error('K0 owner deck accessed');
  }});
  const {result, audit} = withOwnerTelepathicBenchSearch(() =>
    f.ai.decodeNextAction(f.state), dependencies);
  assert.deepEqual(result, {kind: 'default-fallback'});
  assert.equal(audit.matchingOwnerSearches, 0);
});
class SilentStore extends Store {
  dispatch(action) {
    if (action instanceof ResolvePromptAction) return this.state;
    return super.dispatch(action);
  }
}
test('native silent prompt no-op fails closed with no accepted search', () => {
  const f = scene(0, {StoreClass: SilentStore});
  let thrown;
  try {
    withOwnerTelepathicBenchSearch(() => {
      f.store.dispatch(new PlayCardAction(f.owner.id, 0));
      f.store.dispatch(f.ai.decodeNextAction(f.state));
    }, {...dependencies, Store: SilentStore});
  } catch (error) {thrown = error;}
  assert.match(thrown?.message ?? '', /without settlement/);
  assert.equal(thrown.ownerTelepathicAudit.unsettled, 1);
  assert.equal(thrown.ownerTelepathicAudit.settled, 0);
});
class MissingTransferStore extends Store {
  dispatch(action) {
    if (action instanceof ResolvePromptAction) {
      const p = this.state.prompts.find(p =>
        p.id === action.id && p.result === undefined);
      p.result = action.result;
      this.state.prompts.push(new ShuffleDeckPrompt(p.playerId));
      return this.state;
    }
    return super.dispatch(action);
  }
}
test('resolved search without physical Bench transfer fails closed', () => {
  const f = scene(1, {StoreClass: MissingTransferStore});
  let thrown;
  try {
    withOwnerTelepathicBenchSearch(() => {
      f.store.dispatch(new PlayCardAction(f.owner.id, 0));
      f.store.dispatch(f.ai.decodeNextAction(f.state));
    }, {...dependencies, Store: MissingTransferStore});
  } catch (error) {thrown = error;}
  assert.match(thrown?.message ?? '', /physical deck-to-Bench custody/);
  assert.equal(thrown.ownerTelepathicAudit.custodyFailures, 1);
  assert.equal(thrown.ownerTelepathicAudit.settled, 0);
});
class MissingShuffleStore extends Store {
  dispatch(action) {
    if (action instanceof ResolvePromptAction) {
      const p = this.state.prompts.find(p =>
        p.id === action.id && p.result === undefined);
      p.result = action.result;
      p.callback(action.result);
      this.state.prompts.pop();
      return this.state;
    }
    return super.dispatch(action);
  }
}
test('native Bench settlement without required shuffle fails closed', () => {
  const f = scene(1, {StoreClass: MissingShuffleStore});
  let thrown;
  try {
    withOwnerTelepathicBenchSearch(() => {
      f.store.dispatch(new PlayCardAction(f.owner.id, 0));
      f.store.dispatch(f.ai.decodeNextAction(f.state));
    }, {...dependencies, Store: MissingShuffleStore});
  } catch (error) {thrown = error;}
  assert.match(thrown?.message ?? '', /mandatory shuffle follow-up/);
  assert.equal(thrown.ownerTelepathicAudit.shuffleMissing, 1);
  assert.equal(thrown.ownerTelepathicAudit.settled, 0);
});
