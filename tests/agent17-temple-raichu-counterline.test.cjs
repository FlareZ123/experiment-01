'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { analyze, copies } = require('../scripts/agent17-temple-raichu-counterline.cjs');

const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(
  path.join(root, 'results/aichi-2026/full-decklists.json'), 'utf8'
));
const candidate = JSON.parse(fs.readFileSync(
  path.join(root, 'results/aichi-2026/candidate-temple-shadow-rider.json'), 'utf8'
));

test('frozen Temple candidate actually has two Stadium and one Psychic Wobbuffet', () => {
  const result = analyze(source, candidate);
  assert.equal(result.checkedCandidateTempleCopies, 2);
  assert.equal(result.checkedCandidateWobbuffetCopies, 1);
  assert.equal(result.competitivelyQualifiedGames, 0);
  assert.equal(result.isNaturalGameWitness, false);
});

test('rank4 and rank17 source print exact Raichu, GX, Escape Rope and Special Energy engines', () => {
  const result = analyze(source, candidate);
  assert.deepEqual(result.sourceOriginals.map((row) => row.rank), [4, 17]);
  assert.ok(result.sourceOriginals.every((row) =>
    row.nonPsychicElectrodeGx === 3 &&
    row.escapeRope === 3 &&
    row.printedRaichuElectroRain === 2 &&
    row.reversalEnergy === 4 &&
    row.counterEnergy === 4
  ));
});

test('Psychic Marshadow bypasses Bide Barricade exemption in exact original rank17', () => {
  const result = analyze(source, candidate);
  const rank17 = result.sourceOriginals.find((row) => row.rank === 17);
  const rank4 = result.sourceOriginals.find((row) => row.rank === 4);
  assert.equal(rank17.benchedPsychicMarshadowResettingHole, 1);
  assert.equal(rank17.candidateWobbuffetPsychicExceptionLeavesMarshadowAbilityIntact, true);
  assert.equal(rank4.benchedPsychicMarshadowResettingHole, 0);
  assert.equal(rank4.candidateWobbuffetPsychicExceptionLeavesMarshadowAbilityIntact, false);
});

test('nonPsychic Electrode-GX is disabled by Active Wobbuffet until it moves', () => {
  for (const row of analyze(source, candidate).sourceOriginals) {
    assert.equal(row.candidateWobbuffetSuppressesElectrodeWhileActive, true);
    assert.ok(row.possibleConditionalCounterSequence.some((item) =>
      item.includes('candidate Active Wobbuffet to Bench')
    ));
    assert.ok(row.possibleConditionalCounterSequence.some((item) =>
      item.includes('Electrode-GX Extra Energy Bomb')
    ));
  }
});

test('score zero for a counterfeit source rank17 without its actual Marshadow', () => {
  const altered = structuredClone(source);
  const deck = altered.decks.find((entry) => entry.rank === 17);
  deck.cards = deck.cards.filter((card) => card.name !== 'Marshadow');
  assert.throws(() => analyze(altered, candidate));
});

test('refuse counterfeit Temple or Wobbuffet v1 candidate inventories', () => {
  const altered = structuredClone(candidate);
  const temple = altered.cards.find((card) => card.name === 'Temple of Sinnoh');
  temple.count = 3;
  assert.throws(() => analyze(source, altered));
  assert.equal(copies(candidate, 'Wobbuffet', 'PHF', '36'), 1);
});
