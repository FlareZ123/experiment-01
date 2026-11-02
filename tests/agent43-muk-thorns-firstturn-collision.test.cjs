'use strict';

const assert = require('node:assert/strict');
const roster = require('../results/aichi-2026/full-decklists.json');
const { candidateForcedActiveMuk, rank6GuzmaHalaVoltWindow } =
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
  candidateDirectMukForcedActiveValidPercent: candidate.directForcedMukAmongBasicValid * 100,
  sourcePotentialVoltLineValidPercent: source.sourceOpportunityAmongBasicValid * 100,
  independentOpportunityCollisionPercent: independentOpportunityCollision * 100,
  strongCaveat: 'Does not model Guzma & Hala discard payment, actual native action chain, opponent optimal policy, game result or win rate.'
}, null, 2));
