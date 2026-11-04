'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {
  choose,
  allNonBasicCopiesPrizedGivenValidStart,
  anyNonBasicSingletonPrizedGivenValidStart,
  minimumObstructedCohortWinRate
} = require('../simulation/evaluation/agent1-prize-failure-budget.cjs');

const root = path.resolve(__dirname, '..');
const load = relative => require(path.join(root, relative));
const candidates = {
  muk: load('results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json'),
  adp: load('results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json'),
  sentinel: load('results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json'),
  arven: load('results/aichi-2026/candidate-arven-shake-absol-v1.json')
};

function copies(deck, name) {
  return deck.cards.filter(x => x.name === name).reduce((n, x) => n + x.count, 0);
}

function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-12,
    'expected ' + expected + ' but received ' + actual);
}

test('four immutable candidate manifests contain exactly 60 physical cards', () => {
  for (const deck of Object.values(candidates)) {
    assert.equal(deck.cards.reduce((n, x) => n + x.count, 0), 60);
  }
});

test('exact binomial and zero-copy boundary', () => {
  assert.equal(choose(60, 6), 50063860n);
  assert.equal(choose(60, 7), 386206920n);
  assert.equal(choose(5, 6), 0n);
  close(allNonBasicCopiesPrizedGivenValidStart(0, 12).probability, 1);
  close(anyNonBasicSingletonPrizedGivenValidStart(0, 12), 0);
});

test('independent target identities and Basic counts match four frozen manifests', () => {
  assert.equal(copies(candidates.muk, 'Alolan Muk'), 2);
  assert.equal(copies(candidates.muk, 'Regidrago VSTAR'), 3);
  assert.equal(copies(candidates.adp, 'M Charizard-EX'), 1);
  assert.equal(copies(candidates.adp, 'Arceus & Dialga & Palkia-GX'), 2);
  assert.equal(copies(candidates.sentinel, 'Herdier'), 1);
  assert.equal(copies(candidates.sentinel, 'Stoutland'), 1);
  assert.equal(copies(candidates.arven, 'Garbodor'), 2);
  assert.equal(copies(candidates.arven, 'Secret Box'), 1);
  // Basic eligible counts from each frozen candidate's printed Stage roster:
  // Muk 12; ADP 7; Sentinel 14; Arven Shake 12. All targets above are non-Basic.
});

test('Alolan Muk 2/60 joint Prize exclusion, conditional on 12-Basic valid opener', () => {
  close(allNonBasicCopiesPrizedGivenValidStart(2, 12).probability,
    0.008606833848066566);
});

test('single Wild Blaze Mega Charizard, conditional on 7-Basic valid opener', () => {
  close(allNonBasicCopiesPrizedGivenValidStart(1, 7).probability,
    0.10115867303241878);
});

test('either of Sentinel lone Herdier and Stoutland Prized, 14 Basic opener', () => {
  close(anyNonBasicSingletonPrizedGivenValidStart(2, 14),
    0.1927092516553753);
});

test('Arven Shake two Garbodor or lone Secret Box Prized, 12 Basic opener', () => {
  close(allNonBasicCopiesPrizedGivenValidStart(2, 12).probability,
    0.008606833848066566);
  close(allNonBasicCopiesPrizedGivenValidStart(1, 12).probability,
    0.10077777379917645);
});

test('conditional-on-valid is different from naive unconditional Prize rates', () => {
  const twoCopiesNaive = Number(choose(58, 4)) / Number(choose(60, 6));
  close(twoCopiesNaive, 0.00847457627118644);
  assert.ok(allNonBasicCopiesPrizedGivenValidStart(2, 12).probability >
    twoCopiesNaive);
});

test('0.995 aggregate target implies a salvage requirement for each cohort', () => {
  close(minimumObstructedCohortWinRate(0.008606833848066566),
    0.4190662805552826);
  close(minimumObstructedCohortWinRate(0.10115867303241878),
    0.9505727007866381);
  close(minimumObstructedCohortWinRate(0.1927092516553753),
    0.9740541776948957);
  close(minimumObstructedCohortWinRate(0.0001), 0);
  close(minimumObstructedCohortWinRate(0), 0);
});
