'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { installMimikyuNonGxCopycatHook } =
  require('../simulation/twinleaf/copycat-compat.cjs');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
function engine(modulePath) {
  return require(path.join(root, modulePath));
}

const { State } = engine('game/store/state/state');
const { Player } = engine('game/store/state/player');
const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
const { AttackEffect } = engine('game/store/effects/game-effects');
const { Mimikyu } = engine('sets/08-sun-and-moon/set-guardians-rising/mimikyu');
const { RegidragoVSTAR } =
  engine('sets/09-sword-and-shield/set-silver-tempest/regidrago-vstar');
const { clearCopyAttackSessionsForTests } =
  engine('game/store/prefabs/copy-attack-delegation');

/**
 * Source-aware reducer fixture. The fake store records a delegated attack
 * without simulating a complete game. This deliberately isolates the early
 * rejection in COPY_OPPONENTS_LAST_ATTACK; no damage/GX claims result.
 *
 * @param {object} [lastAttackOverrides]
 * @returns {object}
 */
function fixture(lastAttackOverrides = {}) {
  clearCopyAttackSessionsForTests();
  const state = new State();
  const mimikyu = new Mimikyu();
  const regidrago = new RegidragoVSTAR();
  const player = new Player();
  player.id = 101;
  player.name = 'mimikyu-test';
  player.active = new PokemonCardList();
  player.active.cards = [mimikyu];
  const opponent = new Player();
  opponent.id = 202;
  opponent.name = 'regidrago-test';
  opponent.active = new PokemonCardList();
  opponent.active.cards = [regidrago];
  state.players = [player, opponent];
  const previousAttack = {...regidrago.attacks[0], ...lastAttackOverrides};
  state.playerLastAttack[opponent.id] = {
    attack: previousAttack, sourceCard: regidrago
  };
  const effect = new AttackEffect(player, opponent, mimikyu.attacks[1]);
  effect.source = player.active;
  const observed = [];
  const store = {
    /** @param {object} current @param {object} e */
    reduceEffect(current, e) {
      observed.push(e.constructor.name);
      return current;
    },
    hasPrompts() { return false; },
    /** @param {object} _state @param {object} log @param {object} fields */
    log(_state, log, fields) { observed.push({log, fields}); }
  };
  return { state, mimikyu, regidrago, effect, store, observed, previousAttack };
}

test('unpatched pinned engine silently blocks non-GX Apex Dragon due to copy metadata', () => {
  const f = fixture();
  assert.equal(f.previousAttack.name, 'Apex Dragon');
  assert.equal(f.previousAttack.gxAttack, undefined);
  assert.equal(f.previousAttack.copycatAttack, true);
  assert.equal(f.mimikyu.reduceEffect(f.store, f.state, f.effect), f.state);
  assert.deepEqual(f.observed, [], 'Unpatched handler performs no delegated attack');
});

test('opt-in hook delegates non-GX Apex Dragon and restores original metadata', () => {
  const restore = installMimikyuNonGxCopycatHook();
  try {
    const f = fixture();
    assert.equal(f.mimikyu.reduceEffect(f.store, f.state, f.effect), f.state);
    assert.ok(f.observed.includes('AttackEffect'),
      'Apex Dragon should be delegated rather than silently blocked');
    assert.equal(f.previousAttack.copycatAttack, true,
      'Hook must not persistently mutate opponent attack metadata');
    assert.equal(f.state.playerLastAttack[101].attack.name, 'Apex Dragon');
  } finally {
    restore();
    clearCopyAttackSessionsForTests();
  }
});

test('opt-in hook preserves the printed no-GX restriction', () => {
  const restore = installMimikyuNonGxCopycatHook();
  try {
    const f = fixture({ gxAttack: true });
    assert.equal(f.mimikyu.reduceEffect(f.store, f.state, f.effect), f.state);
    assert.deepEqual(f.observed, []);
    assert.equal(f.previousAttack.copycatAttack, true);
  } finally {
    restore();
    clearCopyAttackSessionsForTests();
  }
});

test('opt-in hook does not bypass restrictions for other copy-tagged attacks', () => {
  const restore = installMimikyuNonGxCopycatHook();
  try {
    const f = fixture({ name: 'Unrelated Copy Move' });
    assert.equal(f.mimikyu.reduceEffect(f.store, f.state, f.effect), f.state);
    assert.deepEqual(f.observed, []);
    assert.equal(f.previousAttack.copycatAttack, true);
  } finally {
    restore();
    clearCopyAttackSessionsForTests();
  }
});

test('after hook restore, original pinned-engine block is reinstated', () => {
  const restore = installMimikyuNonGxCopycatHook();
  restore();
  const f = fixture();
  f.mimikyu.reduceEffect(f.store, f.state, f.effect);
  assert.deepEqual(f.observed, []);
  clearCopyAttackSessionsForTests();
});
