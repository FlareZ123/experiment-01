'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {printedBasicEnergyAudit} =
  require('../simulation/twinleaf/printed-basic-energy-audit.cjs');

// The actual pinned CardType enum uses numeric values. The production caller
// injects that enum; this fixture checks its concrete type representation.
const CardType = Object.freeze({
  GRASS: 1, FIRE: 2, WATER: 3, LIGHTNING: 4,
  PSYCHIC: 5, FIGHTING: 6, DARK: 7, METAL: 8,
  COLORLESS: 9, FAIRY: 10
});

function slot(name, energy=[], attacks=[]) {
  const pokemon = name ? {name, attacks} : null;
  return {
    getPokemonCard() { return pokemon; },
    energies: {cards: energy.map(value => ({name: value}))}
  };
}

function audit(active) {
  return printedBasicEnergyAudit(active, CardType);
}

test('typed energy and Colorless requirements use numeric engine cost codes', () => {
  const result = audit(slot('Shadow Rider Calyrex VMAX',
    ['Psychic Energy', 'Psychic Energy', 'Fire Energy'],
    [{name: 'Max Geist', cost: [5, 9, 9]},
      {name: 'Strict Psychic', cost: [5, 5, 5]},
      {name: 'Too Expensive', cost: [5, 5, 9, 9]}]));
  assert.deepEqual(result.attacks.map(x => x.printedCostCoveredByBasic),
    [true, false, false]);
  assert.equal(result.evidenceType, 'printed-basic-energy-cost-only-v1');
});

test('Special Energy, unknown costs, and unmatched typed requirements are excluded', () => {
  const result = audit(slot('Attacker',
    ['Double Colorless Energy', 'Psychic Energy', 'Fire Energy'],
    [{name:'Two Psychic',cost:[5,5]},
      {name:'One Psychic',cost:[5]},
      {name:'Other Type',cost:[3]},
      {name:'Unknown Cost',cost:[0]}]));
  assert.deepEqual(result.attacks.map(a=>a.printedCostCoveredByBasic),
    [false,true,false,false]);
  assert.deepEqual(result.attachedBasicEnergy,['Psychic Energy','Fire Energy']);
});

test('empty printed cost is covered without any attack-legality claim', () => {
  const result = audit(slot('Attacker',[],[{name:'Free Attack',cost:[]}]));
  assert.equal(result.attacks[0].printedCostCoveredByBasic,true);
  assert.equal(Object.hasOwn(result.attacks[0],'legalToAttack'),false);
});

test('detached output never aliases the engine state', () => {
  const board=slot('Attacker',['Psychic Energy'],[{name:'Mind',cost:[5]}]);
  const report=audit(board);
  board.energies.cards.push({name:'Fire Energy'});
  board.getPokemonCard().attacks[0].cost.push(9);
  assert.deepEqual(report.attachedBasicEnergy,['Psychic Energy']);
  assert.deepEqual(report.attacks[0].printedCost,[5]);
});

test('empty active returns null', () => {
  assert.equal(audit(slot(null)),null);
});
