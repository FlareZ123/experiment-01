'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION,
  chooseQuickBallPaymentCard,
  chooseQuickBallSearchTarget,
  withOwnerQuickBallPromptContinuation
} = require('../../simulation/twinleaf/2026-11/agent49-owner-quick-ball-prompt-continuation.cjs');

class AddPlayerAction {}
class StartNextTurnAction {}
class PlayCardAction {
  constructor(id, handIndex) { Object.assign(this, { id, handIndex }); }
}
class ResolvePromptAction {
  constructor(id, result) { Object.assign(this, { id, result }); }
}
class ChooseCardsPrompt {
  constructor({ id, playerId, cards, sourceCard, message, min, max, validate }) {
    Object.assign(this, {
      id, playerId, cards, sourceCard, message,
      options: { min, max }, validate, result: undefined
    });
  }
}
class Bot {
  constructor(id) { this.client = { id }; }
  decodeNextAction() { return { type: 'GENERIC_FALLBACK' }; }
}
class Store {
  constructor(state) { this.state = state; }
  dispatch(action) {
    if (action instanceof AddPlayerAction) return true;
    if (action instanceof StartNextTurnAction) {
      const owner = this.state.players[this.state.activePlayer];
      owner.discard.cards.push(...owner.supporter.cards.splice(0));
      this.state.activePlayer = (this.state.activePlayer + 1) % this.state.players.length;
      return true;
    }
    if (action instanceof PlayCardAction) {
      if (action.id === 202) return true;
      const owner = this.state.players.find(player => player.id === action.id);
      if (!owner) return true;
      const item = owner.hand.cards[action.handIndex];
      if (item?.stage === 'BASIC') {
        owner.hand.cards.splice(action.handIndex, 1);
        owner.bench.push({ getPokemonCard: () => item });
        return true;
      }
      owner.hand.cards.splice(action.handIndex, 1);
      owner.supporter.cards.push(item);
      const offered = owner.hand.cards.slice();
      this.state.prompts = [new ChooseCardsPrompt({
        id: 11, playerId: owner.id, cards: { cards: offered },
        sourceCard: item, message: 'CHOOSE_CARD_TO_DISCARD', min: 1, max: 1,
        validate: selected => Array.isArray(selected) && selected.length === 1 &&
          selected.every(card => offered.includes(card) && owner.hand.cards.includes(card))
      })];
      return true;
    }
    if (action instanceof ResolvePromptAction) {
      const prompt = this.state.prompts.find(item => item.id === action.id);
      const owner = this.state.players.find(player => player.id === prompt.playerId);
      if (prompt.message === 'CHOOSE_CARD_TO_DISCARD') {
        const payment = action.result[0];
        owner.hand.cards.splice(owner.hand.cards.indexOf(payment), 1);
        owner.discard.cards.push(payment);
        const item = prompt.sourceCard;
        this.state.prompts = [new ChooseCardsPrompt({
          id: 12, playerId: owner.id, cards: owner.deck,
          sourceCard: item, message: 'CHOOSE_CARD_TO_HAND', min: 0, max: 1,
          validate: selected => Array.isArray(selected) && selected.length <= 1 &&
            selected.every(card => owner.deck.cards.includes(card) && card.stage === 'BASIC')
        })];
        return true;
      }
      if (prompt.message === 'CHOOSE_CARD_TO_HAND') {
        const target = action.result[0] ?? null;
        if (target) {
          owner.deck.cards.splice(owner.deck.cards.indexOf(target), 1);
          owner.hand.cards.push(target);
        }
        this.state.prompts = [];
        return true;
      }
    }
    return true;
  }
}

function makeScenario() {
  const energies = Array.from({ length: 3 }, (_, index) => ({
    id: `energy-${index}`, name: 'Psychic Energy', fullName: 'Psychic Energy SVE'
  }));
  const item = { id: 'quick-ball', name: 'Quick Ball', fullName: 'Quick Ball FST' };
  const arven = { id: 'arven', name: 'Arven', fullName: 'Arven SVI' };
  const floatStone = { id: 'float', name: 'Float Stone', fullName: 'Float Stone BKT' };
  const shadowRider = {
    id: 'shadow-rider-v', name: 'Shadow Rider Calyrex V',
    fullName: 'Shadow Rider Calyrex V CRE', stage: 'BASIC'
  };
  const tapu = {
    id: 'tapu-lele', name: 'Tapu Lele-GX',
    fullName: 'Tapu Lele-GX GRI', stage: 'BASIC'
  };
  const owner = {
    id: 101,
    hand: { cards: [...energies, arven, item, floatStone] },
    supporter: { cards: [] },
    bench: [],
    discard: { cards: [] },
    deck: { cards: [shadowRider, tapu] }
  };
  const opponent = {
    id: 202,
    get hand() { throw new Error('opponent hand must not be read'); },
    get deck() { throw new Error('opponent deck must not be read'); },
    get prizes() { throw new Error('opponent prizes must not be read'); }
  };
  const state = { players: [owner, opponent], activePlayer: 0, turn: 2, prompts: [] };
  return { state, owner, item, energies, shadowRider, tapu };
}

function nativeDeps() {
  return {
    SimpleTacticsAi: Bot,
    Store,
    ResolvePromptAction,
    eligibleSeats: [0]
  };
}

test('synthetic Store prompt chain preserves Quick Ball until next-turn cleanup', () => {
  const { state, owner, item, energies, shadowRider } = makeScenario();
  const oldDecode = Object.getOwnPropertyDescriptor(Bot.prototype, 'decodeNextAction');
  const oldDispatch = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  const trace = [];

  const wrapped = withOwnerQuickBallPromptContinuation(() => {
    const store = new Store(state);
    store.dispatch(new AddPlayerAction());
    const bot = new Bot(owner.id);
    const root = new PlayCardAction(owner.id, owner.hand.cards.indexOf(item));
    store.dispatch(root);

    const speculative = { ...state };
    assert.deepEqual(bot.decodeNextAction(speculative), { type: 'GENERIC_FALLBACK' });

    const costReply = bot.decodeNextAction(state);
    assert.ok(costReply instanceof ResolvePromptAction);
    assert.strictEqual(costReply.result[0], energies[0]);
    store.dispatch(costReply);

    const searchReply = bot.decodeNextAction(state);
    assert.ok(searchReply instanceof ResolvePromptAction);
    assert.deepEqual(searchReply.result, [shadowRider]);
    store.dispatch(searchReply);

    const targetPlay = new PlayCardAction(owner.id, owner.hand.cards.indexOf(shadowRider));
    store.dispatch(targetPlay);
    assert.ok(owner.supporter.cards.includes(item));
    assert.ok(!owner.discard.cards.includes(item));
    trace.push({ phase: 'test-before-start-next-turn' });
    store.dispatch(new StartNextTurnAction());

    return 'synthetic Quick Ball chain completed';
  }, { ...nativeDeps(), trace: event => trace.push(event) });

  assert.equal(wrapped.result, 'synthetic Quick Ball chain completed');
  assert.equal(wrapped.audit.version, VERSION);
  assert.equal(wrapped.audit.quickBallRootsSeen, 1);
  assert.equal(wrapped.audit.quickBallRootsAccepted, 1);
  assert.equal(wrapped.audit.paymentPromptProposals, 1);
  assert.equal(wrapped.audit.paymentPhysicalAcceptances, 1);
  assert.equal(wrapped.audit.searchPromptProposals, 1);
  assert.equal(wrapped.audit.targetPhysicalRetrievals, 1);
  assert.equal(wrapped.audit.targetPhysicalBenchPlacements, 1);
  assert.equal(wrapped.audit.targetPhysicalBenchPlacementFailures, 0);
  assert.equal(wrapped.audit.completedPhysicalChains, 1);
  assert.equal(wrapped.audit.completedSetupChains, 1);
  assert.equal(wrapped.audit.nativeItemFinalizations, 1);
  assert.equal(wrapped.audit.nonLiveStateFallbacks, 1);
  assert.equal(wrapped.audit.pendingPlansAtEnd, 0);
  assert.equal(wrapped.audit.pendingFinalityAtEnd, 0);
  assert.equal(wrapped.audit.pendingBenchPlacementsAtEnd, 0);
  assert.strictEqual(owner.bench[0].getPokemonCard(), shadowRider);
  assert.ok(!owner.hand.cards.includes(shadowRider));
  const phases = trace.map(event => event.phase);
  assert.ok(phases.indexOf('quick-ball-target-physically-benched') < phases.indexOf('test-before-start-next-turn'));
  assert.ok(phases.indexOf('test-before-start-next-turn') < phases.indexOf('quick-ball-setup-chain-completed'));
  assert.ok(phases.indexOf('quick-ball-setup-chain-completed') < phases.indexOf('quick-ball-native-item-finalized'));
  assert.strictEqual(owner.discard.cards[0], energies[0]);
  assert.ok(owner.hand.cards.includes(energies[1]));
  assert.ok(owner.hand.cards.includes(energies[2]));
  assert.ok(!owner.deck.cards.includes(shadowRider));
  assert.ok(owner.discard.cards.includes(item));
  assert.strictEqual(Store.prototype.dispatch, oldDispatch.value);
  assert.strictEqual(Bot.prototype.decodeNextAction, oldDecode.value);
});

test('same-printing Basic copy does not satisfy exact Quick Ball target-to-Bench follow-through', () => {
  const { state, owner, item, shadowRider } = makeScenario();
  const samePrintingCopy = { ...shadowRider, id: 'shadow-rider-same-printing-copy' };
  const wrapped = withOwnerQuickBallPromptContinuation(() => {
    const store = new Store(state);
    store.dispatch(new AddPlayerAction());
    const bot = new Bot(owner.id);
    store.dispatch(new PlayCardAction(owner.id, owner.hand.cards.indexOf(item)));

    const costReply = bot.decodeNextAction(state);
    assert.ok(costReply instanceof ResolvePromptAction);
    store.dispatch(costReply);

    const searchReply = bot.decodeNextAction(state);
    assert.ok(searchReply instanceof ResolvePromptAction);
    assert.deepEqual(searchReply.result, [shadowRider]);
    store.dispatch(searchReply);

    owner.hand.cards.push(samePrintingCopy);
    store.dispatch(new PlayCardAction(owner.id, owner.hand.cards.indexOf(samePrintingCopy)));
    return 'different physical copy benched';
  }, nativeDeps());

  assert.equal(wrapped.result, 'different physical copy benched');
  assert.equal(wrapped.audit.targetPhysicalRetrievals, 1);
  assert.equal(wrapped.audit.completedPhysicalChains, 1);
  assert.equal(wrapped.audit.targetPhysicalBenchPlacements, 0);
  assert.equal(wrapped.audit.targetPhysicalBenchPlacementFailures, 0);
  assert.equal(wrapped.audit.completedSetupChains, 0);
  assert.equal(wrapped.audit.pendingBenchPlacementsAtEnd, 1);
  assert.equal(wrapped.audit.pendingFinalityAtEnd, 1);
  assert.ok(owner.supporter.cards.includes(item));
  assert.ok(!owner.discard.cards.includes(item));
  assert.ok(owner.hand.cards.includes(shadowRider));
  assert.strictEqual(owner.bench[0].getPokemonCard(), samePrintingCopy);
});

test('same-printing but different physical Quick Ball cannot bind a pending prompt', () => {
  const { state, owner, item } = makeScenario();
  const wrapped = withOwnerQuickBallPromptContinuation(() => {
    const store = new Store(state);
    store.dispatch(new AddPlayerAction());
    const bot = new Bot(owner.id);
    store.dispatch(new PlayCardAction(owner.id, owner.hand.cards.indexOf(item)));
    const prompt = state.prompts[0];
    prompt.sourceCard = { fullName: 'Quick Ball FST' };
    assert.deepEqual(bot.decodeNextAction(state), { type: 'GENERIC_FALLBACK' });
    return 'source mismatch rejected';
  }, nativeDeps());

  assert.equal(wrapped.result, 'source mismatch rejected');
  assert.equal(wrapped.audit.quickBallRootsSeen, 1);
  assert.equal(wrapped.audit.quickBallRootsAccepted, 1);
  assert.equal(wrapped.audit.sourceCardBindingFailures, 1);
  assert.equal(wrapped.audit.pendingPlansAtEnd, 0);
});

test('search target chooser validates actual offered owner-deck cards and falls back only to legal choices', () => {
  const preferred = { fullName: 'Shadow Rider Calyrex V CRE' };
  const fallback = { fullName: 'Tapu Lele-GX GRI' };
  const state = {};
  const prompt = {
    cards: { cards: [preferred, fallback] },
    validate: ([card]) => card === fallback
  };
  assert.deepEqual(chooseQuickBallSearchTarget(prompt, state), {
    valid: true, cards: [fallback], selectedCard: fallback
  });
  const noTargets = {
    cards: { cards: [] },
    validate: cards => Array.isArray(cards) && cards.length === 0
  };
  assert.deepEqual(chooseQuickBallSearchTarget(noTargets, state), {
    valid: true, cards: [], selectedCard: null
  });
});

test('payment donor must be an exact physical duplicate other than Quick Ball', () => {
  const { owner, item, energies } = makeScenario();
  assert.strictEqual(chooseQuickBallPaymentCard(owner, item), energies[0]);
  const noDuplicates = {
    hand: { cards: [item, { fullName: 'Arven SVI' }, { fullName: 'Float Stone BKT' }] }
  };
  assert.equal(chooseQuickBallPaymentCard(noDuplicates, item), null);
});

test('candidate-seat scope does not inspect or resolve opponent Quick Ball prompts', () => {
  const { state } = makeScenario();
  state.activePlayer = 1;
  const wrapped = withOwnerQuickBallPromptContinuation(() => {
    const store = new Store(state);
    store.dispatch(new AddPlayerAction());
    const bot = new Bot(202);
    store.dispatch(new PlayCardAction(202, 0));
    assert.deepEqual(bot.decodeNextAction(state), { type: 'GENERIC_FALLBACK' });
    return 'opponent prompt untouched';
  }, nativeDeps());

  assert.equal(wrapped.result, 'opponent prompt untouched');
  assert.equal(wrapped.audit.quickBallRootsSeen, 0);
  assert.equal(wrapped.audit.sourceCardBindingFailures, 0);
  assert.equal(wrapped.audit.pendingPlansAtEnd, 0);
});
