'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  hoodedShadowTargets, sourceEffectiveHoodTargets, sourceRemovalCandidates, sourceRemovalOpportunity,
  sourceFabaHoodPromptChoice: faba, sourceFieldBlowerHoodPromptChoice: fieldBlower,
  withIronThornsHoodRemoval
} = require('../../simulation/twinleaf/2026-11/agent4-iron-thorns-hood-removal-policy.cjs');

function zone(name, tools = []) {
  return { getPokemonCard: () => ({ name, fullName: name + ' TEST' }),
    tools: tools.map(name => ({ name, fullName: name + ' TEST' })) };
}
function fixture() {
  const source = { id: 101, active: zone('Iron Thorns ex'), hand: { cards: [
    { name: 'Faba' }, { name: 'Megaton Blower' }, { name: 'Field Blower' }
  ] } };
  const opponent = { active: zone('Shadow Rider Calyrex VMAX', ['Stealthy Hood']), bench: [
    zone('Shadow Rider Calyrex VMAX', ['Stealthy Hood']),
    zone('Shadow Rider Calyrex V', ['Stealthy Hood']),
    zone('Shadow Rider Calyrex VMAX', ['Float Stone'])
  ] };
  const state = { phase: 2, activePlayer: 0, prompts: [], players: [source, opponent] };
  return { state, source, opponent };
}
function prompt(name, message, source, extra = {}) {
  return { constructor: { name }, playerId: source.id, message, result: undefined,
    validate: () => true, ...extra };
}

test('visible Hood census includes Active and Bench but excludes unrelated Tools', () => {
  const x = fixture();
  const rows = hoodedShadowTargets(x.opponent);
  assert.deepEqual(rows.map(row => [row.slot, row.index, row.pokemon]), [
    ['active', 0, 'Shadow Rider Calyrex VMAX TEST'],
    ['bench', 0, 'Shadow Rider Calyrex VMAX TEST'],
    ['bench', 1, 'Shadow Rider Calyrex V TEST']
  ]);
});

test('three Iron Thorns answers follow the registered fixed counterplay priority', () => {
  const x = fixture();
  const rows = sourceRemovalCandidates(x.state, x.source, x.opponent, 0, 2);
  assert.deepEqual(rows.map(row => row.card), ['Field Blower', 'Megaton Blower', 'Faba']);
  assert.equal(sourceRemovalOpportunity(x.state, x.source, x.opponent, 0, 2).card, 'Field Blower');
  x.source.hand.cards = [{ name: 'Megaton Blower' }, { name: 'Faba' }];
  assert.deepEqual(sourceRemovalCandidates(x.state, x.source, x.opponent, 0, 2).map(row => row.card),
    ['Megaton Blower', 'Faba']);
});

test('source policy refuses wrong turn, non-Thorns Active, pending prompt, or no Hood', () => {
  const x = fixture();
  x.state.activePlayer = 1;
  assert.deepEqual(sourceRemovalCandidates(x.state, x.source, x.opponent, 0, 2), []);
  x.state.activePlayer = 0;
  x.source.active = zone('Garbodor');
  assert.deepEqual(sourceRemovalCandidates(x.state, x.source, x.opponent, 0, 2), []);
  x.source.active = zone('Iron Thorns ex');
  x.state.prompts = [{ result: undefined }];
  assert.deepEqual(sourceRemovalCandidates(x.state, x.source, x.opponent, 0, 2), []);
  x.state.prompts = [];
  x.opponent.active = zone('Shadow Rider Calyrex VMAX');
  x.opponent.bench = [zone('Shadow Rider Calyrex VMAX', ['Float Stone'])];
  assert.deepEqual(sourceRemovalCandidates(x.state, x.source, x.opponent, 0, 2), []);
});

test('Active Tool Jammer makes Active Hood ineffective and keeps Bench Hood as the response target', () => {
  const x = fixture();
  x.source.active = zone('Iron Thorns ex', ['Tool Jammer']);
  assert.deepEqual(sourceEffectiveHoodTargets(x.opponent, x.source).map(row => row.slot),
    ['bench', 'bench']);
  const fabaPrompt = prompt('ChoosePokemonPrompt', 'CHOOSE_POKEMON_TO_DISCARD_CARDS', x.source,
    { validate: selected => selected.length === 1 });
  assert.deepEqual(faba({ ...x, prompt: fabaPrompt, stage: 'pokemon' }).result, [x.opponent.bench[0]]);
  const fieldBlowerPrompt = prompt('ChoosePokemonPrompt', 'CHOOSE_POKEMON_TO_DISCARD_CARDS', x.source,
    { validate: selected => selected.length === 1 });
  assert.deepEqual(fieldBlower({ ...x, prompt: fieldBlowerPrompt, stage: 'start' }).result,
    [x.opponent.bench[0]]);
  x.opponent.bench = [zone('Shadow Rider Calyrex VMAX', ['Float Stone'])];
  assert.deepEqual(sourceRemovalCandidates(x.state, x.source, x.opponent, 0, 2), []);
});

test('Faba chooses Tool menu and the highest-priority valid Active/Bench Hood target', () => {
  const x = fixture();
  const menu = prompt('SelectPrompt', 'DISCARD_STADIUM_OR_TOOL_OR_SPECIAL_ENERGY', x.source,
    { values: ['CHOICE_STADIUM', 'CHOICE_SPECIAL_ENERGY', 'CHOICE_TOOL'] });
  assert.equal(faba({ ...x, prompt: menu, stage: 'choice' }).result, 2);
  const target = prompt('ChoosePokemonPrompt', 'CHOOSE_POKEMON_TO_DISCARD_CARDS', x.source,
    { validate: selected => selected[0] !== x.opponent.active });
  assert.deepEqual(faba({ ...x, prompt: target, stage: 'pokemon' }).result, [x.opponent.bench[0]]);
  const zone = x.opponent.bench[0];
  const exact = prompt('ChooseCardsPrompt', 'CHOOSE_CARD_TO_DISCARD', x.source,
    { cards: zone, validate: selected => selected[0].name === 'Stealthy Hood' });
  assert.equal(faba({ ...x, prompt: exact, stage: 'tool', targetZone: zone }).result[0], zone.tools[0]);
});

test('Field Blower chooses Tools mode and up to two public Hooded Pokémon', () => {
  const x = fixture();
  const mode = prompt('SelectOptionPrompt', 'CHOOSE_MODE', x.source,
    { values: ['Discard the Stadium', 'Discard Pokémon Tools'] });
  const d = fieldBlower({ ...x, prompt: mode, stage: 'start' });
  assert.equal(d.result, 1);
  assert.equal(d.nextStage, 'pokemon');
  const targets = prompt('ChoosePokemonPrompt', 'CHOOSE_POKEMON_TO_DISCARD_CARDS', x.source,
    { validate: selected => selected.length <= 2 && selected.every(z => z.tools.some(t => t.name === 'Stealthy Hood')) });
  const result = fieldBlower({ ...x, prompt: targets, stage: 'pokemon' });
  assert.deepEqual(result.result, [x.opponent.active, x.opponent.bench[0]]);
});

test('Field Blower handles direct target prompt and falls back to one valid target', () => {
  const x = fixture();
  const target = prompt('ChoosePokemonPrompt', 'CHOOSE_POKEMON_TO_DISCARD_CARDS', x.source,
    { validate: selected => selected.length === 1 && selected[0] === x.opponent.bench[0] });
  const d = fieldBlower({ ...x, prompt: target, stage: 'start' });
  assert.deepEqual(d.result, [x.opponent.bench[0]]);
});

test('prompt helpers fail closed for wrong owner, resolved prompts, and unknown prompt shapes', () => {
  const x = fixture();
  const p = prompt('SelectOptionPrompt', 'CHOOSE_MODE', x.source,
    { values: ['Discard the Stadium', 'Discard Pokémon Tools'] });
  p.playerId = 202;
  assert.equal(fieldBlower({ ...x, prompt: p, stage: 'start' }), null);
  p.playerId = 101; p.result = 0;
  assert.equal(fieldBlower({ ...x, prompt: p, stage: 'start' }), null);
  p.result = undefined; p.values = ['unknown', 'unknown'];
  assert.equal(fieldBlower({ ...x, prompt: p, stage: 'start' }), null);
  assert.equal(faba({ ...x, prompt: p, stage: 'choice' }), null);
});

test('invalid physical seat fails before the compiled Twinleaf engine is loaded', () => {
  assert.throws(() => withIronThornsHoodRemoval(2, () => {}), /source physical seat/);
});
