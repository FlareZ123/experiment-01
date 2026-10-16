'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {inspectTmEvolutionPass} =
  require('../simulation/twinleaf/tm-evolution-pass-evidence.cjs');

/** @param {boolean} remainingTarget */
function makePlayer(remainingTarget) {
  const active = {name: 'Bunnelby'};
  const bench = [{name: 'Budew'}, {name: 'Pidgeot ex'},
    {name: 'Jirachi'}, {name: 'Bunnelby'}, {name: 'Gloom'}];
  const deck = [
    {name: 'Artazon', fullName: 'Artazon PAL'},
    ...(remainingTarget ? [{
      name: 'Vileplume', fullName: 'Vileplume AOR',
      evolvesFrom: 'Gloom', stage: 2
    }] : []),
    {name: 'Vileplume-GX', fullName: 'Vileplume-GX CEC',
      evolvesFrom: 'Gloom', stage: 2},
    {name: 'Gloom', fullName: 'Gloom UNB', evolvesFrom: 'Oddish', stage: 1}
  ];
  return {
    active: {
      getPokemonCard: () => active,
      tools: [{fullName: 'Technical Machine: Evolution PAR'}],
      energies: {cards: [{fullName: 'Jet Energy PAL'}]}
    },
    bench: bench.map(pokemon => ({getPokemonCard: () => pokemon})),
    deck: {cards: deck}
  };
}

test('remaining deck target evidence identifies the exact Gloom branch', () => {
  const player = makePlayer(true);
  const before = JSON.stringify(player.deck.cards);
  const evidence = inspectTmEvolutionPass(player);
  assert.equal(evidence.activePokemon, 'Bunnelby');
  assert.deepEqual(evidence.attachedEnergyPrintings, ['Jet Energy PAL']);
  assert.equal(evidence.targetCount, 1);
  assert.deepEqual(evidence.possibleBenchTargets.map(t => t.evolutionsInDeck),
    [0, 0, 0, 0, 2]);
  assert.deepEqual(evidence.possibleBenchTargets[4].evolutionPrintings,
    ['Vileplume AOR', 'Vileplume-GX CEC']);
  assert.equal(JSON.stringify(player.deck.cards), before);
});

test('if both held evolution printings have left the deck, no target remains', () => {
  const player = makePlayer(false);
  player.deck.cards.splice(1, 1);
  const evidence = inspectTmEvolutionPass(player);
  assert.equal(evidence.targetCount, 0);
  assert.ok(evidence.possibleBenchTargets.every(t => t.evolutionsInDeck === 0));
  assert.equal(evidence.remainingDeckCards, 2);
});

test('no attached TM emits no hidden-deck observation', () => {
  const player = makePlayer(true);
  player.active.tools.length = 0;
  assert.equal(inspectTmEvolutionPass(player), null);
});

test('observational evidence cannot claim attack legality', () => {
  const report = inspectTmEvolutionPass(makePlayer(true));
  assert.equal(Object.hasOwn(report, 'attackLegal'), false);
  assert.match(report.interpretation, /excludes attack payment/);
});
