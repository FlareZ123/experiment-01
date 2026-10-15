'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(root, name));

/** Isolated effect-reducer test. Injected board does not prove legal setup or energy payment. */
function apexCopyContract() {
  const manager = initializeCards();
  const vstar = manager.getCardByName('Regidrago VSTAR SIT');
  const dragon = manager.getCardByName('Dratini OBF');
  const defender = manager.getCardByName('Shadow Rider Calyrex V CRE');
  assert.ok(vstar && dragon && defender, 'Expected pinned cards');
  assert.equal(vstar.attacks[0].name, 'Apex Dragon');
  assert.equal(dragon.attacks[0].name, 'Tail Snap');
  const { Store } = load('game/store/store');
  const { Player } = load('game/store/state/player');
  const { GamePhase } = load('game/store/state/state');
  const { AttackEffect } = load('game/store/effects/game-effects');
  const { ResolvePromptAction } = load('game/store/actions/resolve-prompt-action');
  const { clearCopyAttackSessionsForTests } = load('game/store/prefabs/copy-attack-delegation');
  clearCopyAttackSessionsForTests();

  const store = new Store({ onStateChange() {} });
  const state = store.state;
  const attacker = new Player();
  attacker.id = 101;
  attacker.name = 'regidrago-fixture';
  const victim = new Player();
  victim.id = 202;
  victim.name = 'target-fixture';
  state.players = [attacker, victim];
  state.activePlayer = 0;
  state.phase = GamePhase.ATTACK;
  state.turn = 4;
  attacker.active.cards.push(vstar);
  victim.active.cards.push(defender);
  attacker.discard.cards.push(dragon);

  const apex = new AttackEffect(attacker, victim, vstar.attacks[0]);
  vstar.reduceEffect(store, state, apex);
  const choose = state.prompts.find(p => p.constructor.name === 'ChooseAttackPrompt');
  assert.ok(choose, 'Apex Dragon should offer a copy-attack choice from discard');
  assert.ok(choose.cards.includes(dragon), 'Dratini must be offered');
  assert.ok(!choose.cards.includes(vstar), 'Regidrago VSTAR itself must be excluded');

  store.dispatch(new ResolvePromptAction(choose.id, dragon.attacks[0]));
  assert.equal(victim.active.damage, 20, 'Copied Tail Snap must deal 20 damage without copied Energy cost');
  assert.equal(vstar.attacks[0].name, 'Apex Dragon', 'Copying must not permanently overwrite printed attacks');
  clearCopyAttackSessionsForTests();
  return { test: 'Apex Dragon copies discard Dratini Tail Snap', damage: victim.active.damage,
    engine: 'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    limit: 'Isolated reducer fixture, no legal match setup or bot policy' };
}

if (require.main === module) console.log(JSON.stringify(apexCopyContract(), null, 2));
module.exports = { apexCopyContract };
