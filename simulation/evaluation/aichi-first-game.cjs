'use strict';

const assert = require('node:assert/strict');
const { runAichiPilot } = require('./aichi-pilot.cjs');

const trial = runAichiPilot({
  candidate: 1,
  selectedRanks: [5],
  gamesPerSeat: 1,
  seedBase: 2026101505,
  maxActions: 800,
  captureTrace: true,
  allowEquivalentBasicEnergies: true,
  allowBasicEnergyMirrorPrintings: true,
  allowJapanesePromoHooks: true
});
const row = trial.evaluation.opponents.find(item => item.rank === 5);
assert.equal(trial.plan.candidateResolved, true);
assert.deepEqual(trial.plan.blockedRanks, []);
assert.equal(row.attempted, 2);
assert.equal(row.games.length, 2);
assert.equal(row.games[0].candidateEngineSide, 'A');
assert.equal(row.games[1].candidateEngineSide, 'B');
assert.equal(row.trueStartingTurn.unverified,0);
assert.equal(row.trueStartingTurn.first,1);
assert.equal(row.trueStartingTurn.second,1);
console.log(JSON.stringify({
  experiment: 'two bounded Aichi 2026 champion versus Mew Genesect engine games',
  scope: 'mechanical/policy feasibility only; no competitive win-rate inference',
  candidateDigest: trial.plan.candidateDigest,
  manifestDigest: trial.plan.manifestDigest,
  engineRevision: trial.plan.engineRevision,
  printEquivalencePolicy: trial.plan.printEquivalencePolicy,
  opponent: row,
  actualFirstTurnVerified: true,
  note: 'Do not treat engine A/B as demonstrated actual first/second turn.'
}, null, 2));
