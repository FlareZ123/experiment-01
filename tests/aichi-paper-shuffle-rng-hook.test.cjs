'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {installAichiPaperShuffleRngHook} =
  require('../simulation/twinleaf/aichi-paper-shuffle-rng-hook.cjs');

function trackedStream() {
  const calls = [];
  const stream = () => { throw new Error('float RNG must not be used'); };
  stream.randomInt = bound => {
    calls.push(bound);
    return 0;
  };
  return {stream, calls};
}

function makePlayers() {
  const a = {
    id: 101,
    hand: {cards: []},
    prizes: []
  };
  const b = {
    id: 202,
    hand: {cards: []},
    prizes: []
  };
  return [a, b];
}

function prize(name, isSecret = true) {
  return {isSecret, cards: name === null ? [] : [{name}]};
}

function withThrowingMathRandom(action) {
  const previous = Math.random;
  Math.random = () => { throw new Error('live paper shuffle leaked to Math.random'); };
  try { return action(); } finally { Math.random = previous; }
}

function fakeEngine() {
  class Gladion {
    reduceEffect(store, state, effect) {
      return store.prompt(state, {kind: 'choose-prize'}, () => {
        state.players[state.players.indexOf(effect.player)].prizes =
          this.shuffleFaceDownPrizeCards(effect.player.prizes);
      });
    }
    shuffleFaceDownPrizeCards(positions) {
      const faceDown = positions.filter(p => p.isSecret && p.cards.length > 0);
      for (let i = faceDown.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [faceDown[i], faceDown[j]] = [faceDown[j], faceDown[i]];
      }
      const result = [];
      let next = 0;
      for (const position of positions) {
        result.push(position.cards.length === 0 || !position.isSecret ?
          position : faceDown[next++]);
      }
      return result;
    }
  }

  class Marnie {
    reduceEffect(_store, state, effect) {
      const player = effect.player;
      const opponent = state.players.find(p => p !== player);
      const playerCards = player.hand.cards.filter(card => card !== this);
      const opponentCards = [...opponent.hand.cards];
      this.shuffleCards(playerCards);
      this.shuffleCards(opponentCards);
      this.lastShuffled = [playerCards, opponentCards];
      return state;
    }
    shuffleCards(cards) {
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }
    }
  }

  class Iono {
    reduceEffect(_store, state, effect) {
      const player = effect.player;
      const opponent = state.players.find(p => p !== player);
      const playerCards = player.hand.cards.filter(card => card !== this);
      const opponentCards = [...opponent.hand.cards];
      this.shuffleCards(playerCards);
      this.shuffleCards(opponentCards);
      this.lastShuffled = [playerCards, opponentCards];
      return state;
    }
    shuffleCards(cards) {
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }
    }
  }

  const classes = {
    'sets/08-sun-and-moon/set-crimson-invasion/gladion': {Gladion},
    'sets/09-sword-and-shield/set-sword-and-shield/marnie': {Marnie},
    'sets/10-scarlet-and-violet/set-paldea-evolved/iono': {Iono}
  };
  return {engine: path => classes[path]};
}

function makeRootStore(players) {
  const store = {
    state: {players},
    pending: null,
    prompt(state, _prompt, callback) {
      this.pending = callback;
      return state;
    }
  };
  return store;
}

test('Gladion Prize permutation uses the acting physical seat stream in its deferred prompt callback', () => {
  const players = makePlayers();
  players[1].prizes = [
    prize('A'),
    prize('PUBLIC', false),
    prize(null),
    prize('B'),
    prize('C')
  ];
  const rootStore = makeRootStore(players);
  const zero = trackedStream();
  const one = trackedStream();
  const {engine} = fakeEngine();
  const restore = installAichiPaperShuffleRngHook({
    engine, rootStore, randomBySeat: [zero.stream, one.stream]
  });
  const originalPrompt = rootStore.prompt;
  try {
    const {Gladion} = engine('sets/08-sun-and-moon/set-crimson-invasion/gladion');
    const card = new Gladion();
    withThrowingMathRandom(() => card.reduceEffect(rootStore, rootStore.state, {
      trainerCard: card, player: players[1]
    }));
    assert.strictEqual(rootStore.prompt, originalPrompt,
      'Root prompt method must be restored before the deferred callback runs');
    assert.equal(typeof rootStore.pending, 'function');
    withThrowingMathRandom(() => rootStore.pending());
    assert.deepEqual(one.calls, [3, 2]);
    assert.deepEqual(zero.calls, []);
    assert.deepEqual(players[1].prizes.map(p => p.cards[0]?.name ?? null),
      ['B', 'PUBLIC', null, 'C', 'A']);
  } finally {
    restore();
  }
});

test('Marnie and Iono shuffle each physical hand with its own seat stream', () => {
  for (const [path, className] of [
    ['sets/09-sword-and-shield/set-sword-and-shield/marnie', 'Marnie'],
    ['sets/10-scarlet-and-violet/set-paldea-evolved/iono', 'Iono']
  ]) {
    const players = makePlayers();
    const card = new (fakeEngine().engine(path)[className])();
    players[1].hand.cards = [card, {id: 'b1'}, {id: 'b2'}];
    players[0].hand.cards = [{id: 'a1'}, {id: 'a2'}, {id: 'a3'}, {id: 'a4'}];
    const rootStore = makeRootStore(players);
    const zero = trackedStream();
    const one = trackedStream();
    const {engine} = fakeEngine();
    const restore = installAichiPaperShuffleRngHook({
      engine, rootStore, randomBySeat: [zero.stream, one.stream]
    });
    try {
      withThrowingMathRandom(() => card.reduceEffect(rootStore, rootStore.state, {
        trainerCard: card, player: players[1]
      }));
      assert.deepEqual(one.calls, [2]);
      assert.deepEqual(zero.calls, [4, 3, 2]);
      assert.equal(card.lastShuffled.length, 2);
    } finally {
      restore();
    }
  }
});

test('speculative bot Store retains policy Math.random instead of consuming physical streams', () => {
  const players = makePlayers();
  const card = new (fakeEngine().engine(
    'sets/09-sword-and-shield/set-sword-and-shield/marnie').Marnie)();
  players[0].hand.cards = [card, {id: 'a1'}, {id: 'a2'}];
  players[1].hand.cards = [{id: 'b1'}, {id: 'b2'}, {id: 'b3'}];
  const rootStore = makeRootStore(players);
  const cloneStore = makeRootStore(players);
  const zero = trackedStream();
  const one = trackedStream();
  const {engine} = fakeEngine();
  const restore = installAichiPaperShuffleRngHook({
    engine, rootStore, randomBySeat: [zero.stream, one.stream]
  });
  const previous = Math.random;
  let policyCalls = 0;
  Math.random = () => { policyCalls += 1; return 0; };
  try {
    card.reduceEffect(cloneStore, cloneStore.state, {
      trainerCard: card, player: players[0]
    });
    assert.ok(policyCalls > 0);
    assert.deepEqual(zero.calls, []);
    assert.deepEqual(one.calls, []);
  } finally {
    Math.random = previous;
    restore();
  }
});
