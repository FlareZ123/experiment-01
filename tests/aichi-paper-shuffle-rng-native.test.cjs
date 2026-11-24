'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const engineRoot = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const engine = relativePath => require(path.resolve(engineRoot, relativePath));
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

function makePlayer(id) {
  return {
    id,
    hand: {cards: []},
    deck: {cards: [{id: 'deck-' + id}]},
    supporter: {cards: []},
    supporterTurn: 0,
    prizes: [],
    getPrizeLeft() { return 2; }
  };
}

function makeStore(players) {
  const state = {players};
  return {
    state,
    prompts: [],
    reduceEffect(currentState, _effect) { return currentState; },
    prompt(currentState, prompt, callback) {
      this.prompts.push({prompt, callback});
      return currentState;
    }
  };
}

function prize(name, isSecret = true) {
  return {isSecret, cards: name === null ? [] : [{name}]};
}

function withNoGlobalRandom(action) {
  const previous = Math.random;
  Math.random = () => { throw new Error('paper card shuffle leaked to Math.random'); };
  try { return action(); } finally { Math.random = previous; }
}

function install(rootStore, zero, one) {
  return installAichiPaperShuffleRngHook({
    engine,
    rootStore,
    randomBySeat: [zero.stream, one.stream]
  });
}

test('pinned Gladion implementation uses the acting seat stream in its actual prompt callback', () => {
  const {TrainerEffect} = engine('game/store/effects/play-card-effects');
  const {Gladion} = engine('sets/08-sun-and-moon/set-crimson-invasion/gladion');
  const players = [makePlayer(1), makePlayer(2)];
  const card = new Gladion();
  const actor = players[1];
  actor.hand.cards = [card];
  actor.prizes = [
    prize('A'),
    prize('PUBLIC', false),
    prize(null),
    prize('B'),
    prize('C')
  ];
  const store = makeStore(players);
  const zero = trackedStream();
  const one = trackedStream();
  const restore = install(store, zero, one);
  try {
    withNoGlobalRandom(() => card.reduceEffect(store, store.state,
      new TrainerEffect(actor, card)));
    assert.equal(store.prompts.length, 1);
    withNoGlobalRandom(() => store.prompts[0].callback([actor.prizes[0]]));
    assert.deepEqual(one.calls, [3, 2]);
    assert.deepEqual(zero.calls, []);
    assert.deepEqual(actor.prizes.map(p => p.cards[0]?.name ?? null),
      ['B', 'PUBLIC', null, 'C', 'A']);
  } finally {
    restore();
  }
});

test('pinned Marnie and Iono implementations route both hands to their actual owners', () => {
  const {TrainerEffect} = engine('game/store/effects/play-card-effects');
  const cases = [
    ['sets/09-sword-and-shield/set-sword-and-shield/marnie', 'Marnie'],
    ['sets/10-scarlet-and-violet/set-paldea-evolved/iono', 'Iono']
  ];
  for (const [modulePath, className] of cases) {
    const CardClass = engine(modulePath)[className];
    const players = [makePlayer(1), makePlayer(2)];
    const card = new CardClass();
    players[1].hand.cards = [card, {id: 'p1-a'}, {id: 'p1-b'}];
    players[0].hand.cards = [
      {id: 'p0-a'}, {id: 'p0-b'}, {id: 'p0-c'}, {id: 'p0-d'}
    ];
    const store = makeStore(players);
    const zero = trackedStream();
    const one = trackedStream();
    const restore = install(store, zero, one);
    try {
      withNoGlobalRandom(() => card.reduceEffect(store, store.state,
        new TrainerEffect(players[1], card)));
      assert.deepEqual(one.calls, [2], className + ' acting hand');
      assert.deepEqual(zero.calls, [4, 3, 2], className + ' opponent hand');
    } finally {
      restore();
    }
  }
});
