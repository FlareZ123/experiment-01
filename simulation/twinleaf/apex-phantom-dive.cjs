'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * Inject a controlled attack-resolution board to test the primary Regidrago
 * attack payload. This bypasses opening, Energy payment, and decision policy.
 */
function phantomDiveCopyContract() {
  const cards = initializeCards();
  const copycat = cards.getCardByName('Regidrago VSTAR SIT');
  const payload = cards.getCardByName('Dragapult ex TWM');
  const target = cards.getCardByName('Shadow Rider Calyrex V CRE');
  const benchTarget = cards.getCardByName('Dratini OBF');
  assert.ok(copycat && payload && target && benchTarget, 'Expected pinned card printings');
  const { Store } = load('game/store/store');
  const { Player } = load('game/store/state/player');
  const { PokemonCardList } = load('game/store/state/pokemon-card-list');
  const { GamePhase } = load('game/store/state/state');
  const { PlayerType, SlotType } = load('game/store/actions/play-card-action');
  const { AttackEffect } = load('game/store/effects/game-effects');
  const { ResolvePromptAction } = load('game/store/actions/resolve-prompt-action');
  const { clearCopyAttackSessionsForTests } = load('game/store/prefabs/copy-attack-delegation');

  clearCopyAttackSessionsForTests();
  const store = new Store({ onStateChange() {} });
  const state = store.state;
  const attacker = new Player();
  attacker.id = 101;
  attacker.name = 'Regidrago';
  const victim = new Player();
  victim.id = 202;
  victim.name = 'Defender';
  state.players = [attacker, victim];
  state.activePlayer = 0;
  state.phase = GamePhase.ATTACK;
  state.turn = 4;
  attacker.active.cards.push(copycat);
  attacker.discard.cards.push(payload);
  victim.active.cards.push(target);
  const bench = new PokemonCardList();
  bench.cards.push(benchTarget);
  victim.bench.push(bench);

  copycat.reduceEffect(store, state, new AttackEffect(attacker, victim, copycat.attacks[0]));
  const attackPrompt = state.prompts.find(p => p.constructor.name === 'ChooseAttackPrompt');
  assert.ok(attackPrompt, 'Apex Dragon should prompt to copy');
  assert.ok(attackPrompt.cards.includes(payload), 'Dragapult ex must appear in discard choices');
  const phantomDive = payload.attacks.find(a => a.name === 'Phantom Dive');
  assert.ok(phantomDive, 'Expected Phantom Dive payload');
  store.dispatch(new ResolvePromptAction(attackPrompt.id, phantomDive));

  const damagePrompt = state.prompts.find(p => p.result === undefined && p.constructor.name === 'PutDamagePrompt');
  assert.ok(damagePrompt, 'Phantom Dive should prompt for Bench damage counters');
  assert.equal(damagePrompt.damage, 60, 'Six damage counters are worth 60 damage');
  store.dispatch(new ResolvePromptAction(damagePrompt.id, [{
    target: { player: PlayerType.TOP_PLAYER, slot: SlotType.BENCH, index: 0 },
    damage: 60
  }]));
  assert.equal(victim.active.damage, 200, 'Copied Phantom Dive should deal 200 Active damage');
  assert.equal(bench.damage, 60, 'Copied Phantom Dive should place six Bench damage counters');
  assert.equal(copycat.attacks[0].name, 'Apex Dragon', 'Printed attack preserved');
  clearCopyAttackSessionsForTests();
  return {
    attack: 'Regidrago VSTAR Apex Dragon copying Dragapult ex Phantom Dive',
    activeDamage: victim.active.damage,
    benchCountersDamage: bench.damage,
    engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scope: 'Isolated attack reducer and prompts; no legal game or decision policy'
  };
}

if (require.main === module) console.log(JSON.stringify(phantomDiveCopyContract(), null, 2));
module.exports = { phantomDiveCopyContract };
