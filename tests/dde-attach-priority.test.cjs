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
