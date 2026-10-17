'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {coversPrintedApexCost} = require('../simulation/twinleaf/dde-attach-tactic.cjs');

const types = {
  GRASS: 'GRASS',
  FIRE: 'FIRE',
  COLORLESS: 'COLORLESS',
  ANY: 'ANY'
};

test('Apex printed GGF requires three distinct effective units', () => {
  const ready = [
    ['GRASS', 'GRASS', 'FIRE'],
    ['FIRE', 'GRASS', 'GRASS'],
    ['GRASS', 'ANY', 'ANY'],
    ['ANY', 'GRASS', 'FIRE'],
    ['ANY', 'ANY', 'ANY'],
    ['FIRE', 'FIRE', 'GRASS', 'GRASS']
  ];
  for (const supplied of ready) {
    assert.equal(coversPrintedApexCost(supplied, types), true, supplied.join(','));
  }

  const short = [
    [],
    ['GRASS', 'FIRE'],
    ['ANY', 'ANY'],
    ['GRASS', 'GRASS', 'COLORLESS'],
    ['GRASS', 'FIRE', 'COLORLESS'],
    ['FIRE', 'FIRE', 'FIRE']
  ];
  for (const supplied of short) {
    assert.equal(coversPrintedApexCost(supplied, types), false, supplied.join(','));
  }
});

test('Temple-like effective Colorless cannot masquerade as typed or ANY Energy', () => {
  assert.equal(coversPrintedApexCost(['GRASS','GRASS','COLORLESS'],types),false);
  assert.equal(coversPrintedApexCost(['GRASS','GRASS','ANY'],types),true);
});

test('Double Dragon target selection uses simulated local identity in both clone profiles', () => {
  const {testCloneLocalEnergyMatching} =
    require('../simulation/twinleaf/dde-clone-local-identity.cjs');
  const result = testCloneLocalEnergyMatching();
  assert.equal(result.cases.length, 2);
  assert.equal(result.cases[0].selectedBenchRegidrago, true);
  assert.equal(result.cases[1].selectedBenchRegidrago, true);
  assert.equal(result.cases[1].sourceCardDetached, true);
  assert.ok(result.cases.every(row => row.authoritativeStoreAttachment));
});

test('Source Regidrago v4 clone modes preserve exact decks and observed first-turn identity', () => {
  const {checkCloneSensitivityBySeat} =
    require('../simulation/twinleaf/dde-source-clone-seat-panel.cjs');
  const report = checkCloneSensitivityBySeat();
  assert.equal(report.cases.length, 2);
  assert.deepEqual(report.cases.map(row => row.candidateSlot), [0, 1]);
  for (const row of report.cases) {
    assert.deepEqual(row.pinned.deckHashes, row.prototypeSafe.deckHashes);
    assert.equal(row.pinned.verifiedByDrawLog, true);
    assert.equal(row.prototypeSafe.verifiedByDrawLog, true);
    assert.equal(row.pinned.actualFirstTurnSlot,
      row.prototypeSafe.actualFirstTurnSlot);
    assert.match(row.pinned.observableDigest, /^[a-f0-9]{64}$/);
    assert.equal(row.pinned.observableDigest, row.prototypeSafe.observableDigest);
  }
  console.log('SOURCE_DDE_V4_CLONE_SEAT_PANEL ' + JSON.stringify(report));
});

test('Observable match digest changes if DDE attachment telemetry changes', () => {
  const {observableDigest} =
    require('../simulation/twinleaf/dde-source-clone-seat-panel.cjs');
  const synthetic = {
    firstTurnSlot: 1, finished: true, endReason: 'engine-game-end',
    winner: 0, actions: 10, turns: 3, actionCounts: {},
    actionsBySeat: [{}, {}],
    cardsPlayedBySeat: [{'Double Dragon Energy': 1}, {}],
    attackTrace: [], abilityTrace: [], terminalTransition: null,
    finalState: [], prizesRemaining: [6, 6]
  };
  const original = observableDigest(synthetic);
  const changed = observableDigest({
    ...synthetic,
    cardsPlayedBySeat: [{'Double Dragon Energy': 0}, {}]
  });
  assert.notEqual(original, changed);
});

test('The nine published Aichi Regidrago 60s have an explicit ROS97 Energy census', () => {
  const {summarizeRegidragoSourceEnergy} =
    require('../scripts/aichi-regidrago-dde-census.cjs');
  const report = summarizeRegidragoSourceEnergy();
  assert.equal(report.sourceDeckCount, 29);
  assert.deepEqual(report.missingFullListRanks, [23, 25, 28]);
  assert.deepEqual(report.rows.map(row => row.rank),
    [10, 12, 13, 14, 18, 20, 21, 27, 32]);
  assert.equal(report.publishedRegidragoDeckCount, 9);
  assert.equal(report.totalEnergyCards, 88);
  assert.equal(report.totalDoubleDragonCards, 34);
  assert.equal(report.fractionOfRegidragoEnergyCards, '34/88');
  assert.equal(report.fourCopyDdeLists, 7);
  for (const row of report.rows) {
    assert.equal(row.energyCards,
      row.doubleDragonCards + row.grassCards + row.fireCards);
  }
});
