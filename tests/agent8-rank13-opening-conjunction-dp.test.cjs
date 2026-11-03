'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {source13Buckets, exactOpeningConjunctions, choose} =
  require('../simulation/evaluation/agent8-rank13-opening-conjunction-dp.cjs');
const {originalSource} =
  require('../simulation/evaluation/agent8-rank13-vstar-opening-dp.cjs');

const source = originalSource();

test('authentic rank13 list partitions into exact physical categories', () => {
  assert.deepEqual(source13Buckets(source), [4, 3, 2, 3, 3, 3, 4, 3, 7, 28]);
  assert.equal(choose(60, 7), 386206920n);
});

test('exact seven-card opening event lattice obeys counts', () => {
  const {counts: c} = exactOpeningConjunctions(source);
  assert.deepEqual(c, {
    all: 386206920n,
    basicLegal: 300306336n,
    regvAndVstar: 44046764n,
    regvVstarCompressor: 7625861n,
    regvVstarQuickballDonor: 2326131n,
    regvVstarBothRoutes: 264978n,
    regvVstarEitherRoute: 9687014n,
    eitherRouteWithDde: 1954854n,
    eitherRouteWithTwoAttachmentEnergy: 751044n,
    eitherRouteWithThreeBasicEnergy: 21672n,
    eitherRouteWithAnyEnergy: 772716n,
    anyTwoAttachmentEnergy: 51560949n
  });
  assert.equal(c.regvVstarEitherRoute,
    c.regvVstarCompressor + c.regvVstarQuickballDonor - c.regvVstarBothRoutes);
});

test('source change must not be silently treated as original', () => {
  const copy = structuredClone(source);
  copy.cards.find(row => row.name === 'Battle Compressor').count--;
  copy.cards.find(row => row.name === 'VS Seeker').count++;
  assert.throws(() => source13Buckets(copy), /Source-13 printing changed/);
});
