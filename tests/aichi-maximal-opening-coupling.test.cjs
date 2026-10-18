'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { expandPrintings, auditAlignment } =
  require('../scripts/aichi-position-coupling.cjs');
const { choose, maximalHandEquality, maximalValidOpeningEquality } =
  require('../scripts/aichi-maximal-opening-coupling.cjs');

const dir = path.resolve(__dirname, '../results/aichi-2026');
const source = JSON.parse(fs.readFileSync(path.join(dir, 'full-decklists.json'), 'utf8'));
const arrays = [
  source.decks.find(x => x.rank === 1).cards,
  JSON.parse(fs.readFileSync(
    path.join(dir, 'candidate-hood-shadow-rider.json'), 'utf8')).cards,
  JSON.parse(fs.readFileSync(
    path.join(dir, 'candidate-temple-shadow-rider.json'), 'utf8')).cards
].map(expandPrintings);

/**
 * Independent exact enumeration of unordered hands for very small toy decks.
 * @param {string[]} cards
 * @param {number} k
 * @returns {Map<string,number>}
 */
function bruteHands(cards, k) {
  const histogram = new Map();
  /** @param {number} at @param {string[]} hand */
  function visit(at, hand) {
    if (hand.length === k) {
      const key = JSON.stringify([...hand].sort());
      histogram.set(key, (histogram.get(key) || 0) + 1);
      return;
    }
    for (let i = at; i <= cards.length - (k - hand.length); i += 1) {
      visit(i + 1, [...hand, cards[i]]);
    }
  }
  visit(0, []);
  return histogram;
}

test('real frozen 60s give exact maximal unordered opening equality probabilities', () => {
  const expected = [
    ['213158092', 48, 9, 48],
    ['214740911', 47, 9, 63],
    ['237700970', 51, 6, 12]
  ];
  const pairs = [[0, 1], [0, 2], [1, 2]];
  for (let i = 0; i < pairs.length; i += 1) {
    const [a, b] = pairs[i];
    const exact = maximalHandEquality(arrays[a], arrays[b]);
    const [num, neutral, types, states] = expected[i];
    assert.equal(exact.numerator, num);
    assert.equal(exact.denominator, '386206920');
    assert.equal(exact.neutralCopies, neutral);
    assert.equal(exact.affectedTypes, types);
    assert.equal(exact.statesEvaluated, states);
    assert.ok(exact.probability > auditAlignment(arrays[a], arrays[b])
      .attainableSeven);
  }
});

test('neutral-pool derivation agrees with direct toy-hand enumeration', () => {
  for (const [a, b, k] of [
    [['a', 'a', 'b'], ['a', 'b', 'b'], 2],
    [['a', 'a', 'b', 'c'], ['a', 'b', 'b', 'c'], 2],
    [['a', 'a', 'b', 'b'], ['a', 'b', 'b', 'b'], 2],
    [['a', 'a', 'a', 'b', 'c'], ['a', 'b', 'b', 'c', 'c'], 3],
    [['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd'], 3]
  ]) {
    const left = bruteHands(a, k), right = bruteHands(b, k);
    const handKeys = new Set([...left.keys(), ...right.keys()]);
    const overlap = [...handKeys].reduce((sum, key) =>
      sum + Math.min(left.get(key) || 0, right.get(key) || 0), 0);
    const exact = maximalHandEquality(a, b, k);
    assert.equal(exact.numerator, String(overlap));
    assert.equal(exact.denominator, String(choose(a.length, k)));
  }
});

test('identical and disjoint multisets have expected extreme bounds', () => {
  assert.equal(maximalHandEquality(['x', 'x'], ['x', 'x'], 1).probability, 1);
  assert.equal(maximalHandEquality(['x', 'x'], ['y', 'y'], 1).probability, 0);
  assert.equal(maximalHandEquality(['x', 'x'], ['y', 'y'], 0).probability, 1);
  assert.throws(() => maximalHandEquality(['x'], ['x', 'y']), /equal-sized/);
  assert.throws(() => maximalHandEquality(['x'], ['y'], 2), /valid draw/);
});


test('source Basic-only opening acceptance changes the exact maximal coupling', () => {
  // All named source prints are documented Basic except the VMAX evolution.
  const basics = new Set([
    'Shadow Rider Calyrex V', "Lillie's Clefairy ex", 'Tapu Lele-GX',
    'Trevenant & Dusknoir-GX', 'Latias ex', 'Dialga-GX',
    'Mimikyu', 'Girafarig', 'Marshadow', 'Radiant Eternatus', 'Wobbuffet'
  ]);
  const basicIds = new Set(arrays.flat().filter(id =>
    basics.has(JSON.parse(id)[0])));
  assert.equal(basicIds.size, 11);
  const expected = [
    ['61938700930191360', '110677472811417600', [14,14]],
    ['62785269905367900', '113387189617152000', [14,15]],
    ['70117358031212580', '113387189617152000', [14,15]]
  ];
  [[0,1],[0,2],[1,2]].forEach(([a,b],i) => {
    const result = maximalValidOpeningEquality(arrays[a], arrays[b], basicIds);
    assert.equal(result.numerator, expected[i][0]);
    assert.equal(result.denominator, expected[i][1]);
    assert.deepEqual(result.basicCounts, expected[i][2]);
  });
});

test('conditional maximal mass matches directly enumerated legal tiny openings', () => {
  for (const [a,b,basics,k] of [
    [['a','a','b'],['a','b','b'],new Set(['a']),2],
    [['a','a','b','c'],['a','b','b','c'],new Set(['c']),2],
    [['a','a','b','c'],['a','b','b','c'],new Set(['a','c']),2]
  ]) {
    const left = bruteHands(a,k), right = bruteHands(b,k);
    const valid = histogram => new Map([...histogram].filter(([key]) =>
      JSON.parse(key).some(id => basics.has(id))));
    const p = valid(left), q = valid(right);
    const pa = [...p.values()].reduce((sum,v)=>sum+v,0);
    const pb = [...q.values()].reduce((sum,v)=>sum+v,0);
    const same = [...new Set([...p.keys(),...q.keys()])]
      .reduce((sum,key)=>sum+Math.min(
        (p.get(key)||0)*pb, (q.get(key)||0)*pa),0);
    const exact = maximalValidOpeningEquality(a,b,basics,k);
    assert.equal(exact.numerator,String(same));
    assert.equal(exact.denominator,String(pa*pb));
  }
  assert.throws(() => maximalValidOpeningEquality(
    ['x','x'],['y','y'],new Set(['x']),1),/no valid opening/);
});
