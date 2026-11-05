'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const { completeTmSchedule, reachableTmStates } =
  require('../simulation/evaluation/agent40-tm-evolution-target-frontier.cjs');

const AOR = { label: 'Vileplume AOR', stages: 2 };
const PIDGEOT = { label: 'Pidgeot ex', stages: 2 };
const EGG = { label: 'Exeggutor PLF', stages: 1 };
const PIDGEOTTO = { label: 'Pidgeotto TEU', stages: 1 };

test('exact challenger and printed double-TM card inventory', () => {
  const deck = require('../results/als/agent18-exeggutor-vileplume-native-v2.json');
  const copies = (name, set, number) => deck.cards
    .filter(card => card.name === name && card.printing.set === set &&
      card.printing.number === number)
    .reduce((sum, card) => sum + card.count, 0);
  assert.equal(deck.cards.reduce((sum, card) => sum + card.count, 0), 60);
  assert.deepEqual([
    copies('Bunnelby', 'PRC', '121'),
    copies('Technical Machine: Evolution', 'PAR', '178'),
    copies('Oddish', 'UNB', '5'),
    copies('Gloom', 'UNB', '7'),
    copies('Vileplume', 'AOR', '3'),
    copies('Pidgey', 'MEW', '16'),
    copies('Pidgeotto', 'TEU', '123'),
    copies('Pidgeot ex', 'OBF', '164'),
    copies('Exeggcute', 'PLF', '4'),
    copies('Exeggcute', 'VIV', '4'),
    copies('Exeggutor', 'PLF', '5'),
    copies('Stealthy Hood', 'UNB', '186')
  ], [2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 3]);

  const printed = (file, id) => require(path.resolve(
    __dirname, '../resources/cards/en', file)).find(card => card.id === id);
  const bunnelby = printed('xy5.json', 'xy5-121');
  const tm = printed('sv4.json', 'sv4-178');
  const thorns = printed('sv6.json', 'sv6-77');
  const pidgeot = printed('sv3.json', 'sv3-164');
  const pidgeotto = printed('sm9.json', 'sm9-123');
  const vileplume = printed('xy7.json', 'xy7-3');
  const hood = printed('sm10.json', 'sm10-186');
  assert.equal(bunnelby.ancientTrait.name, 'Ω Barrage');
  assert.match(bunnelby.ancientTrait.text, /attack twice/);
  assert.match(tm.attacks[0].text, /up to 2 of your Benched Pokémon/);
  assert.match(tm.attacks[0].text, /evolve/);
  assert.match(thorns.abilities[0].text, /Pokémon with a Rule Box/);
  assert.match(pidgeot.abilities[0].name, /Quick Search/);
  assert(pidgeot.rules.some(rule => /Pokémon ex rule/.test(rule)));
  assert.equal(pidgeotto.abilities[0].name, 'Air Mail');
  assert.equal(vileplume.abilities[0].name, 'Irritating Pollen');
  assert.match(hood.rules.join(' '), /Prevent all effects of your opponent's Abilities/);
});

test('two complete Stage2 lines use both TM targets on each attack', () => {
  assert.deepEqual(completeTmSchedule([AOR, PIDGEOT]), [
    ['Vileplume AOR', 'Pidgeot ex'],
    ['Vileplume AOR', 'Pidgeot ex']
  ]);
});

test('Vileplume + Pidgeot ex + Exeggutor cannot all mature through two attacks', () => {
  assert.equal(completeTmSchedule([AOR, PIDGEOT, EGG]), null);
});

test('Vileplume + Exeggutor + Pidgeotto is a reachable four-evolution board', () => {
  const found = completeTmSchedule([AOR, EGG, PIDGEOTTO]);
  assert(found);
  assert.equal(found.length, 2);
  assert.deepEqual(found.flat().sort(), [
    'Vileplume AOR', 'Vileplume AOR', 'Exeggutor PLF', 'Pidgeotto TEU'
  ].sort());
});

test('Vileplume + two distinct Exeggutors uses all four TM slots', () => {
  assert.deepEqual(completeTmSchedule([
    AOR, EGG, { label: 'Exeggutor backup', stages: 1 }
  ]), [
    ['Vileplume AOR', 'Exeggutor PLF'],
    ['Vileplume AOR', 'Exeggutor backup']
  ]);
});

test('two Stage2 and two Stage1 require six evolutions and are impossible', () => {
  assert.equal(completeTmSchedule([
    AOR, PIDGEOT, EGG, { label: 'Exeggutor backup', stages: 1 }
  ]), null);
});

test('terminal frontier never violates two attacks or two targets per attack', () => {
  const targets = [AOR, PIDGEOT, EGG];
  for (const state of reachableTmStates(targets)) {
    assert.equal(state.actions.length, 2);
    assert(state.actions.every(action => action.length <= 2));
    assert(state.stages.every((stage, i) => stage >= 0 && stage <= targets[i].stages));
    assert(state.stages.reduce((sum, stage) => sum + stage, 0) <= 4);
  }
});
