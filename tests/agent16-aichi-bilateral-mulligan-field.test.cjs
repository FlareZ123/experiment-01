'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { mulliganProbability } = require('../scripts/agent16-bilateral-mulligan-bonus.cjs');
const { normalizeName, stageIndex, originalBasicCensus, aggregateBonuses } =
  require('../scripts/agent16-aichi-bilateral-mulligan-field.cjs');

const root = path.resolve(__dirname, '..');
const original = JSON.parse(fs.readFileSync(path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'));
const stages = stageIndex(path.join(root, 'resources/cards/en'));
const source = originalBasicCensus(original, stages);

const expected = [
  [1,14],[2,14],[3,11],[4,13],[5,11],[6,4],[7,12],
  [8,10],[9,11],[10,15],[11,11],[12,15],[13,11],[14,14],
  [15,14],[16,11],[17,13],[18,16],[19,16],[20,14],[21,14],
  [22,12],[24,4],[26,12],[27,15],[29,4],[30,16],[31,15],[32,13]
];

/** @param {number} actual @param {number} expectedValue */
function close(actual, expectedValue) {
  assert.ok(Math.abs(actual - expectedValue) < 1e-12,
    actual + ' differs from ' + expectedValue);
}

test('all 29 original card-count sixties have unambiguous Basic stage names', () => {
  assert.equal(normalizeName('Ditto ◇'), 'Ditto ♢');
  assert.equal(normalizeName('Tapu Koko ◇'), 'Tapu Koko ♢');
  assert.deepEqual(source.map(row => [row.rank,row.basics]), expected);
  assert.deepEqual(source.filter(row => row.basics === 4).map(row => row.rank), [6,24,29]);
  assert.equal(stages.get('Mega Absol ex').has(true), true);
  assert.equal(stages.get('Mega Kangaskhan ex').has(true), true);
  assert.equal(stages.get('Mega Lopunny ex').has(false), true);
  assert.equal(stages.get('Mega Dragonite ex').has(false), true);
});

test('field-wide exact mean is the arithmetic average of each distinct original', () => {
  for (const [candidateBasics, candidateOpportunity, candidateMean,
    sourceOpportunity, sourceMean] of [
    [14, 0.18787519648139359, 0.3040179024040035,
      0.11255292947209823, 0.13066137894345153],
    [17, 0.19637033957021569, 0.31636864377829665,
      0.06705279592470963, 0.07315681256979091]
  ]) {
    const a = aggregateBonuses(source, candidateBasics);
    assert.equal(a.knownOriginals, 29);
    assert.deepEqual(a.missingRanks, [23,25,28]);
    assert.deepEqual(a.fourBasicOriginals, [6,24,29]);
    close(a.candidateOfferedAtLeastOneMean, candidateOpportunity);
    close(a.candidateExpectedOfferedCardsMean, candidateMean);
    close(a.sourceOfferedAtLeastOneMean, sourceOpportunity);
    close(a.sourceExpectedOfferedCardsMean, sourceMean);
    const pCandidate = mulliganProbability(candidateBasics);
    let sum = 0;
    for (const x of source) {
      const q = mulliganProbability(x.basics);
      sum += q * (1 - pCandidate) / (1 - q * pCandidate);
    }
    close(a.candidateOfferedAtLeastOneMean, sum / source.length);
  }
});

test('source-stage ambiguity and nonexistent names fail closed', () => {
  const item = source[0];
  assert.equal(item.rank, 1);
  const missing = structuredClone(original);
  const first = missing.decks[0].cards.find(card => card.category === 'Pokémon');
  first.name = 'Unpublished Source Creature';
  assert.throws(() => originalBasicCensus(missing, stages), /Unknown printed Pokémon/);
  const changed = new Map(stages);
  changed.set(original.decks[0].cards.find(card => card.category === 'Pokémon').name,
    new Set([true,false]));
  assert.throws(() => originalBasicCensus(original, changed), /Printed stage varies/);
});
