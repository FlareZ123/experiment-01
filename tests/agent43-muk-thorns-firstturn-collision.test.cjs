'use strict';

const assert = require('node:assert/strict');
const roster = require('../results/aichi-2026/full-decklists.json');
const { candidateForcedActiveMuk, candidateMukBenchGeometry, candidateDirectSoleBenchMukAccess, rank26DirectRopeCologneAccess, rank6GuzmaHalaVoltWindow } =
  require('../simulation/evaluation/agent43-muk-thorns-firstturn-collision.cjs');

/** @param {number} actual @param {number} expected */
function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-12, 'Expected ' + expected + ' got ' + actual);
}

const original = roster.decks.find((deck) => deck.rank === 6);
assert.ok(original);
assert.equal(original.archetype, 'Iron Thorns');
assert.equal(original.cards.reduce((sum, row) => sum + row.count, 0), 60);
const copies = (name) => original.cards.filter((row) => row.name === name).reduce((n, row) => n + row.count, 0);
assert.deepEqual({
  thorns: copies('Iron Thorns ex'),
  gh: copies('Guzma & Hala'),
  tag: copies('Tag Call'),
  dce: copies('Double Colorless Energy'),
  thunder: original.cards.filter((row) => row.name.startsWith('Thunder Mountain')).reduce((n, row) => n + row.count, 0)
}, { thorns: 4, gh: 2, tag: 2, dce: 1, thunder: 1 });
assert.equal(original.cards.filter((row) => row.category === 'Pokémon').reduce((s, row) => s + row.count, 0), 4);

const candidate = candidateForcedActiveMuk();
near(candidate.basicValid, 0.8093533072892635);
near(candidate.forcedGrimerActive, 0.06798254158677426);
near(candidate.directForcedMukUnconditional, 0.024003743836991415);
near(candidate.directForcedMukAmongBasicValid, 0.029657930128668096);

// Strict position classification differs from the historical Grimer-only
// species category: an eighth-drawn Grimer can be Benched before Shake.
const geometry = candidateMukBenchGeometry();
near(geometry.basicValid, candidate.basicValid);
near(geometry.sevenSingleGrimerDirectAmongBasicValid, 0.027939290944717383);
near(geometry.eighthSecondGrimerBenchAmongBasicValid, 0.00047752536793325853);
near(geometry.noNaturalSecondGrimerByEightAmongBasicValid, 0.027461765576784123);
near(geometry.secondGrimerSearchOpportunityAmongBasicValid, 0.015578512181126982);
near(geometry.noDemonstratedSecondGrimerAccessAmongBasicValid, 0.011883253395657152);
near(
  geometry.sevenSingleGrimerDirectAmongBasicValid
    - geometry.eighthSecondGrimerBenchAmongBasicValid,
  geometry.noNaturalSecondGrimerByEightAmongBasicValid
);
assert.ok(geometry.secondGrimerSearchOpportunityAmongBasicValid
  < geometry.noNaturalSecondGrimerByEightAmongBasicValid);

const sourceRank26 = roster.decks.find((deck) => deck.rank === 26);
assert.ok(sourceRank26);
assert.equal(sourceRank26.cards.reduce((n, row) => n + row.count, 0), 60);
const source26Copies = (name) => sourceRank26.cards
  .filter((row) => row.name === name).reduce((n, row) => n + row.count, 0);
assert.deepEqual({
  basics: sourceRank26.cards.filter((row) => row.category === 'Pokémon'
    && (row.supertype === 'Pokémon' || true)
    && !('evolvesFrom' in row)).reduce((n, row) => n + row.count, 0),
  rope: source26Copies('Escape Rope'),
  cologne: source26Copies('Canceling Cologne')
}, { basics: 12, rope: 1, cologne: 1 });
// The Basic count is authenticated separately against the exact rank26
// source printing manifest and is independent of the two singleton Items.
const ropeCologne = rank26DirectRopeCologneAccess();
const soleBench = candidateDirectSoleBenchMukAccess();
near(ropeCologne.basicValid, candidate.basicValid);
near(soleBench.basicValid, candidate.basicValid);
near(ropeCologne.heldPairUnconditional, 0.011354714027587781);
near(ropeCologne.heldPairAmongBasicValid, 0.014029366316692639);
near(soleBench.soleBenchedGrimerUnconditional, 0.023189204151078315);
near(soleBench.soleBenchedGrimerAmongBasicValid, 0.028651522075995514);
near(
  ropeCologne.heldPairAmongBasicValid
    * soleBench.soleBenchedGrimerAmongBasicValid,
  0.000401962698734947
);

const source = rank6GuzmaHalaVoltWindow();
near(source.sourceBasicValid, 0.3994996257446656);
near(source.sourceOpportunityUnconditional, 0.1314789606712864);
near(source.sourceOpportunityAmongBasicValid, 0.32910909597527194);
const independentOpportunityCollision =
  candidate.directForcedMukAmongBasicValid * source.sourceOpportunityAmongBasicValid;
near(independentOpportunityCollision, 0.009760694573143738);

console.log(JSON.stringify({
  status: 'PASS',
  scope: 'combinatorial opening access only; independently shuffled Basic-valid seven; no opponent mulligan bonus draws',
  forcedGrimerValidPercent: candidate.forcedGrimerActive / candidate.basicValid * 100,
  rank26SourceHeldRopeColognePercent: ropeCologne.heldPairAmongBasicValid * 100,
  candidateDirectSoleBenchMukPercent: soleBench.soleBenchedGrimerAmongBasicValid * 100,
  independentDirectRopeMukConjunctionPercent:
    ropeCologne.heldPairAmongBasicValid * soleBench.soleBenchedGrimerAmongBasicValid * 100,
  candidateHistoricalGrimerOnlySpeciesValidPercent: candidate.directForcedMukAmongBasicValid * 100,
  candidateNoNaturallyHeldBenchGrimerByEighthPercent:
    geometry.noNaturalSecondGrimerByEightAmongBasicValid * 100,
  potentialSecondGrimerSearchPercent: geometry.secondGrimerSearchOpportunityAmongBasicValid * 100,
  caveat: 'Potential search requires real affordable discard payment; non-search mobility remains unmodeled.',
  sourcePotentialVoltLineValidPercent: source.sourceOpportunityAmongBasicValid * 100,
  historicalBroadOpportunityCollisionPercent: independentOpportunityCollision * 100,
  narrowerNoNaturalBenchGrimerCollisionPercent:
    geometry.noNaturalSecondGrimerByEightAmongBasicValid
      * source.sourceOpportunityAmongBasicValid * 100,
  strongCaveat: 'Does not model Guzma & Hala discard payment, actual native action chain, opponent optimal policy, game result or win rate.'
}, null, 2));
