'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../results/aichi-2026/full-decklists.json');
const {preparedToolAttack, nextAction, characterizeToolAttackPolicy} =
  require('../simulation/twinleaf/tm-attack-policy-characterization.cjs');
const {withToolAttackAwareness} =
  require('../simulation/twinleaf/tool-attack-policy.cjs');

test('Aichi printed Technical Machine attacks occur in three source decks', () => {
  const rows = manifest.decks.flatMap(deck => deck.cards
    .filter(card => card.name.startsWith('Technical Machine:'))
    .map(card => ({rank: deck.rank, name: card.name, count: card.count})));
  assert.deepEqual(rows, [
    {rank: 2, name: 'Technical Machine: Evolution', count: 2},
    {rank: 15, name: 'Technical Machine: Evolution', count: 2},
    {rank: 26, name: 'Technical Machine: Crisis Punch', count: 2}
  ]);
});

test('opt-in policy finds paid Tool attack omitted by the default bot', () => {
  const outcome = characterizeToolAttackPolicy();
  assert.equal(outcome.dealtDamage, 280);
  assert.equal(outcome.optInAttack, 'Crisis Punch');
});

test('Tool attack cannot be selected if opponent has two Prizes left', () => {
  const f = preparedToolAttack();
  f.defender.prizes.push(f.defender.prizes[0]);
  const action = nextAction(f, true);
  assert.notEqual(action?.name, 'Crisis Punch');
});

test('opt-in policy is idempotence-guarded at configuration time', () => {
  const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
  const path = require('node:path');
  initializeCards();
  const defs = require(path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output/simple-bot/simple-bot-definitions'));
  const options = {tactics: defs.allSimpleTactics};
  const patched = withToolAttackAwareness(options);
  assert.equal(patched.tactics.filter(T => T.name === 'ToolAwareAttackTactic').length, 1);
  assert.throws(() => withToolAttackAwareness(patched), /already installed/);
});
