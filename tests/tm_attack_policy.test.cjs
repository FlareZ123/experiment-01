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
  assert.equal(corrected?.name, 'Burrow',
    'Score-only Tool-awareness misses the discrete Evolution setup line');
  const {withBunnelbyEvolutionLine} =
    require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');
  const {SimpleTacticsAi} = require(path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai'));
  const defs = require(path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output/simple-bot/simple-bot-definitions'));
  const enhanced = withBunnelbyEvolutionLine(withToolAttackAwareness({
    tactics: defs.allSimpleTactics,
    promptResolvers: defs.allPromptResolvers,
    scores: defs.defaultStateScores,
    arbiter: defs.defaultArbiterOptions
  }));
  const bot = new SimpleTacticsAi({id: f.attacker.id}, enhanced, null);
  const choice = bot.decodeNextAction(f.state);
  assert.equal(choice?.constructor.name, 'AttackAction');
  assert.equal(choice?.name, 'Evolution');
  f.store.dispatch(choice);
  assert.equal(f.state.prompts.some(prompt => prompt.result === undefined), true);
});

test('Bunnelby Barrage prompt chooses second Evolution over printed Burrow', () => {
  const path = require('node:path');
  const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
  const {withBunnelbyEvolutionLine} =
    require('../simulation/twinleaf/bunnelby-evolution-policy.cjs');
  const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
  const {ChooseAttackPrompt} = require(path.join(output,
    'game/store/prompts/choose-attack-prompt'));
  const {GamePhase} = require(path.join(output, 'game/store/state/state'));
  const {GameMessage} = require(path.join(output, 'game/game-message'));
  const {SimpleTacticsAi} = require(path.join(output,
    'simple-bot/simple-tactics-ai'));
  const defs = require(path.join(output, 'simple-bot/simple-bot-definitions'));
  const {PokemonCardList} = require(path.join(output,
    'game/store/state/pokemon-card-list'));
  const f = preparedToolAttack();
  const cards = initializeCards();
  const bunny = cards.getCardByName('Bunnelby PRC');
  const tool = cards.getCardByName('Technical Machine: Evolution PAR');
  f.attacker.active.cards[0] = bunny;
  f.attacker.active.tools[0] = tool;
  f.attacker.bench.length = 0;
  for (const name of ['Gloom UNB','Pidgeotto TEU']) {
    const slot = new PokemonCardList();
    slot.cards.push(cards.getCardByName(name));
    f.attacker.bench.push(slot);
  }
  f.attacker.deck.cards.push(cards.getCardByName('Vileplume AOR'),
    cards.getCardByName('Pidgeot ex OBF'));
  f.state.phase = GamePhase.ATTACK;
  const prompt = new ChooseAttackPrompt(f.attacker.id,
    GameMessage.CHOOSE_ATTACK_TO_COPY, [bunny, tool],
    {allowCancel: false});
  prompt.id = 1337;
  f.state.prompts.push(prompt);
  const baseOptions = {
    tactics: defs.allSimpleTactics, promptResolvers: defs.allPromptResolvers,
    scores: defs.defaultStateScores, arbiter: defs.defaultArbiterOptions
  };
  const generic = new SimpleTacticsAi({id: f.attacker.id}, baseOptions, null);
  const enhanced = new SimpleTacticsAi({id: f.attacker.id},
    withBunnelbyEvolutionLine(baseOptions), null);
  const original = generic.decodeNextAction(f.state);
  const selected = enhanced.decodeNextAction(f.state);
  assert.equal(original?.result?.name, 'Burrow');
  assert.equal(selected?.result?.name, 'Evolution');
  assert.equal(prompt.validate(selected.result), true);
});
