'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  VERSION, PIN, run
} = require('../simulation/twinleaf/agent40-original-rank7-faba-hood-native.cjs');

test('original rank7 Faba sends opposing Vileplume Hood to Lost Zone and Wobbuffet unlocks Item', () => {
  const r = run();
  assert.equal(r.version, VERSION);
  assert.equal(r.pin, PIN);
  assert.equal(r.attempted, 2);
  assert.equal(r.qualifiedCompetitiveGames, 0);
  for (const row of r.rows) {
    assert.equal(row.beforeBlocked, false);
    assert.equal(row.afterBlocked, true);
    assert.equal(row.hoodLost, true);
    assert.equal(row.hoodAttached, false);
    assert.equal(row.originalFabaSelectedTool, true);
    assert.equal(row.sourceBasic, 'Regirock XYP');
    assert.equal(row.sourceBasicOnBench, true);
    assert.equal(row.originalItemDiscarded, true);
    assert.equal(row.promptSequence[0], 'Choose cards');
    assert.equal(row.promptSequence.includes('Shuffle deck'), true);
    assert.equal(row.promptSequence.includes('WaitPrompt'), true);
    assert.equal(row.sourcePhysicalCards, 60);
    assert.equal(row.candidatePhysicalCards, 60);
    assert.equal(row.conditionalStageOnly, true);
    assert.equal(row.naturalDeals, 0);
    assert.equal(row.qualifiedCompetitiveGames, 0);
  }
  console.log('AGENT40_ORIGINAL_RANK7_FABA_HOOD_NATIVE', JSON.stringify(r));
});
