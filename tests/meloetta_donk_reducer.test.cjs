'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');

const base = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const engine = name => require(path.join(base, name));
const {Player} = engine('game/store/state/player');
const {State} = engine('game/store/state/state');
const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
const {PlayPokemonEffect} = engine('game/store/effects/play-card-effects');
const {CheckPokemonAttacksEffect} = engine('game/store/effects/check-effects');
const {UseAttackEffect, AttackEffect} = engine('game/store/effects/game-effects');

/** @returns {object} Isolated card reducer fixture using actual pinned engine types. */
function fixture() {
  const manager = initializeCards();
  const risky = manager.getCardByName('Risky Ruins MEG');
  const exeggcute = manager.getCardByName('Exeggcute PLF');
  const meloetta = manager.getCardByName('Meloetta ex SV11B');
  const crisis = manager.getCardByName('Technical Machine: Crisis Punch PAF');
  const player = new Player();
  player.id = 101;
  player.name = 'Meloetta player';
  player.bench = [new PokemonCardList()];
  const opponent = new Player();
  opponent.id = 202;
  opponent.name = 'Opponent';
  const state = new State();
  state.turn = 1;
  state.players = [player, opponent];
  state.activePlayer = 0;
  state.rules.attackFirstTurn = false;
  player.stadium.cards.push(risky);
  player.active.cards.push(meloetta);
  const store = {
    /** @param {object} current @param {object} effect */
    reduceEffect(current, effect) {
      return current;
    }
  };
  return {risky, exeggcute, meloetta, crisis, player, opponent, state, store};
}

test('Risky Ruins damages a freshly benched 30 HP Exeggcute for 20', () => {
  const f = fixture();
  const slot = f.player.bench[0];
  f.risky.reduceEffect(f.store, f.state,
    new PlayPokemonEffect(f.player, f.exeggcute, slot));
  assert.equal(slot.damage, 20);
  assert.equal(f.exeggcute.hp, 30);
});

test('Risky Ruins ignores an occupied Bench slot', () => {
  const f = fixture();
  const slot = f.player.bench[0];
  slot.cards.push(f.exeggcute);
  f.risky.reduceEffect(f.store, f.state,
    new PlayPokemonEffect(f.player, f.exeggcute, slot));
  assert.equal(slot.damage, 0);
});

test('Crisis Punch Tool attack is exposed, and Meloetta grants first-turn use', () => {
  const f = fixture();
  f.player.active.tools.push(f.crisis);
  const attacks = new CheckPokemonAttacksEffect(f.player);
  assert.equal(attacks.attacks.filter(a => a.name === 'Crisis Punch').length, 1);
  const attempted = new UseAttackEffect(f.player, attacks.attacks[0]);
  f.meloetta.reduceEffect(f.store, f.state, attempted);
  assert.equal(attempted.attack.canUseOnFirstTurn, true);
});

test('Crisis Punch requires exactly one opponent Prize in the attack reducer', () => {
  const f = fixture();
  f.player.active.tools.push(f.crisis);
  const attack = new CheckPokemonAttacksEffect(f.player).attacks[0];
  f.opponent.prizes = [{cards: [{name: 'p1'}]}, {cards: [{name: 'p2'}]}];
  assert.throws(() =>
    f.crisis.reduceEffect(f.store, f.state, new AttackEffect(f.player, f.opponent, attack)),
    {message: 'CANNOT_USE_POWER'});
  f.opponent.prizes = [{cards: [{name: 'p1'}]}];
  assert.equal(f.crisis.reduceEffect(f.store, f.state,
    new AttackEffect(f.player, f.opponent, attack)), f.state);
});
