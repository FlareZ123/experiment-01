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

test('virtual replacement-only Compressor sensitivity is exact and monotone', () => {
  const denominator=300306336n;
  const expected=[
    [0,2326131n,116748n],
    [1,6148852n,440670n],
    [2,9687014n,751044n],
    [3,12956743n,1048158n],
    [4,15973547n,1332300n]
  ];
  for(const [copies,either,energy] of expected){
    const {counts}=exactOpeningConjunctions(source,{compressorCopies:copies});
    assert.equal(counts.basicLegal,denominator);
    assert.equal(counts.regvVstarEitherRoute,either);
    assert.equal(counts.eitherRouteWithTwoAttachmentEnergy,energy);
  }
  assert.throws(()=>exactOpeningConjunctions(source,{compressorCopies:5}));
});
