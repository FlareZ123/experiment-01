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

test('rank-2 Bunnelby source TM Evolution is selectable by opt-in policy', () => {
  const path = require('node:path');
  const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
  const cards = initializeCards();
  const get = name => {
    const card = cards.getCardByName(name);
    assert.ok(card, 'Missing pinned card: ' + name);
    return card;
  };
  const {PokemonCardList} = require(path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output/game/store/state/pokemon-card-list'));
  const f = preparedToolAttack();
  f.state.turn = 2;
  const bunnelby = get('Bunnelby PRC');
  const tool = get('Technical Machine: Evolution PAR');
  const jet = get('Jet Energy PAL');
  f.attacker.active.cards.splice(0, f.attacker.active.cards.length, bunnelby, jet);
  f.attacker.active.energies.cards.splice(0, f.attacker.active.energies.cards.length, jet);
  f.attacker.active.tools.splice(0, 1, tool);
  for (const name of ['Oddish UNB', 'Pidgey MEW']) {
    const slot = new PokemonCardList();
    slot.cards.push(get(name));
    f.attacker.bench.push(slot);
  }
  f.attacker.deck.cards.push(get('Gloom UNB'), get('Pidgeotto TEU'),
    get('Vileplume AOR'), get('Pidgeot ex OBF'));
  let id = 1000;
  for (const zone of [
    f.attacker.active, f.attacker.deck, ...f.attacker.bench
  ]) {
    for (const card of zone.cards) card.id = ++id;
  }
  tool.id = ++id;
  assert.ok(tool.attacks.some(attack => attack.name === 'Evolution'));
  assert.ok(!bunnelby.attacks.some(attack => attack.name === 'Evolution'));
  const generic = nextAction(f, false);
  const corrected = nextAction(f, true);
  assert.notEqual(generic?.name, 'Evolution');
  assert.equal(corrected?.constructor.name, 'AttackAction');
  assert.equal(corrected?.name, 'Evolution');
  f.store.dispatch(corrected);
  assert.equal(f.state.prompts.some(prompt => prompt.result === undefined), true);
});
