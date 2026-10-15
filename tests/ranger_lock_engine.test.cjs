'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath Module relative to pinned compiled engine output. */
function engine(modulePath) {
  return require(path.join(root, modulePath));
}

const {State} = engine('game/store/state/state');
const {Store} = engine('game/store/store');
const {Player} = engine('game/store/state/player');
const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
const {TrainerEffect, PlayItemEffect} = engine('game/store/effects/play-card-effects');
const {AttackEffect} = engine('game/store/effects/game-effects');
const {PokemonRanger} = engine('sets/07-x-and-y/set-steam-siege/pokemon-ranger');
const {Channeler} = engine('sets/08-sun-and-moon/set-unified-minds/channeler');
const {Vileplume} = engine('sets/07-x-and-y/set-ancient-origins/vileplume');
const {QuickBall} = engine('sets/09-sword-and-shield/set-sword-and-shield/quick-ball');
const {BudewASC} = engine('sets/11-mega-evolution/set-ascended-heroes/other-prints');

/** @returns {{state:InstanceType<typeof State>,a:InstanceType<typeof Player>,b:InstanceType<typeof Player>}} */
function emptyBoard() {
  const state = new State();
  const a = new Player();
  const b = new Player();
  a.id = 101; a.name = 'research-A';
  b.id = 202; b.name = 'research-B';
  state.players = [a, b];
  return {state, a, b};
}

test('Ranger removes prior attack-sourced Item restrictions on both players', () => {
  const {state, a, b} = emptyBoard();
  a.applyPlayLocks({item: true}, 1);
  b.applyPlayLocks({item: true}, 1);
  a.usedGX = true;
  a.active.specialConditions = ['Poisoned'];
  const ranger = new PokemonRanger();

  assert.equal(a.cannotPlayItemCards, true);
  assert.equal(b.cannotPlayItemCards, true);
  assert.equal(ranger.canPlay(null, state, a), true);
  ranger.reduceEffect(null, state, new TrainerEffect(a, ranger));
  assert.equal(a.cannotPlayItemCards, false);
  assert.equal(b.cannotPlayItemCards, false);
  assert.equal(a.playLocksTurnsRemaining, 0);
  assert.equal(b.playLocksTurnsRemaining, 0);
  assert.equal(a.usedGX, true);
  assert.deepEqual(a.active.specialConditions, ['Poisoned']);
});

test('Channeler removes only its player attack effects; switching does not', () => {
  const {state, a, b} = emptyBoard();
  a.applyPlayLocks({item: true}, 1);
  b.applyPlayLocks({item: true}, 1);
  const switchTarget = new PokemonCardList();
  a.bench.push(switchTarget);
  a.switchPokemon(switchTarget);
  assert.equal(a.cannotPlayItemCards, true);

  const channeler = new Channeler();
  channeler.reduceEffect(null, state, new TrainerEffect(a, channeler));
  assert.equal(a.cannotPlayItemCards, false);
  assert.equal(b.cannotPlayItemCards, true);
  a.supporterTurn = 1;
  assert.equal(channeler.canPlay(null, state, a), false);
  assert.equal(new PokemonRanger().canPlay(null, state, a), false);
});

test('Ranger does not disable an enabled Vileplume Ability-based Item lock', () => {
  const {state, a, b} = emptyBoard();
  const vileplume = new Vileplume();
  const bench = new PokemonCardList();
  bench.cards.push(vileplume);
  b.bench.push(bench);
  a.applyPlayLocks({item: true}, 1);
  const ranger = new PokemonRanger();
  ranger.reduceEffect(null, state, new TrainerEffect(a, ranger));
  assert.equal(a.cannotPlayItemCards, false);

  // Unit-level Vileplume reducer check, with a stub allowing this power.
  // This is NOT a fully legal constructed board or complete-game scenario.
  const store = {reduceEffect: (_state, _effect) => _state};
  const item = new PlayItemEffect(a, new QuickBall());
  assert.throws(() => vileplume.reduceEffect(store, state, item));
});


test('Real Itchy Pollen reducer applies the player lock that Channeler clears', () => {
  const {state, a, b} = emptyBoard();
  const budew = new BudewASC();
  assert.equal(budew.fullName, 'Budew ASC');
  assert.equal(budew.setNumber, '16');
  a.active.cards.push(budew);
  const attack = new AttackEffect(a, b, budew.attacks[0]);
  const store = {
    reduceEffect(currentState, effect) {
      assert.equal(effect.constructor.name, 'PlayLockEffect');
      effect.applyEffect();
      return currentState;
    }
  };
  assert.equal(b.cannotPlayItemCards, false);
  budew.reduceEffect(store, state, attack);
  assert.equal(b.cannotPlayItemCards, true);
  assert.equal(b.playLocksTurnsRemaining, 1);
  b.bench.push(new PokemonCardList());
  b.switchPokemon(b.bench[0]);
  assert.equal(b.cannotPlayItemCards, true);
  const channeler = new Channeler();
  channeler.reduceEffect(null, state, new TrainerEffect(b, channeler));
  assert.equal(b.cannotPlayItemCards, false);
  assert.equal(b.playLocksTurnsRemaining, 0);
});


test('Real Store.reduceEffect propagates Aichi Budew attack Item lock', () => {
  const {state, a, b} = emptyBoard();
  const store = new Store({onStateChange() {}});
  store.state = state;
  const budew = new BudewASC();
  a.active.cards.push(budew);
  budew.reduceEffect(store, state, new AttackEffect(a, b, budew.attacks[0]));
  assert.equal(b.cannotPlayItemCards, true);
  assert.equal(b.playLocksTurnsRemaining, 1);
  const ranger = new PokemonRanger();
  ranger.reduceEffect(store, state, new TrainerEffect(b, ranger));
  assert.equal(b.cannotPlayItemCards, false);
  assert.equal(b.playLocksTurnsRemaining, 0);
});
