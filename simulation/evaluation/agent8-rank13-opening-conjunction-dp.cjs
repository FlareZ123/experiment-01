'use strict';

const assert = require('node:assert/strict');

const BUCKETS = ['regv', 'vstar', 'compressor', 'quickball', 'donor',
  'dde', 'grass', 'fire', 'otherbasic', 'other'];
const OTHER_BASICS = new Set(['Dialga-GX', 'Kyurem', 'Latias ex',
  'Tapu Lele-GX', 'Dedenne-GX', 'Squawkabilly ex', 'Budew']);
const DRAGON_DONORS = new Set(['Salamence ex', 'Dragapult ex', 'Noivern ex']);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= k; i++) result = result * BigInt(n - i + 1) / BigInt(i);
  return result;
}

/**
 * Bucket each distinct physical source-13 printing. Categories are disjoint.
 * Fails closed if the authenticated source card counts change.
 * @param {{cards:Array<{name:string,count:number}>}} source
 * @returns {number[]}
 */
function source13Buckets(source) {
  assert.ok(Array.isArray(source?.cards));
  assert.equal(source.cards.reduce((n, row) => n + row.count, 0), 60);
  const map = new Map();
  for (const row of source.cards) {
    assert.ok(!map.has(row.name), 'Duplicate source name: ' + row.name);
    map.set(row.name, row.count);
  }
  for (const [name, expected] of [
    ['Regidrago V', 4], ['Regidrago VSTAR', 3],
    ['Battle Compressor', 2], ['Quick Ball', 3],
    ['Double Dragon Energy', 3], ['Grass Energy', 4], ['Fire Energy', 3],
    ...[...DRAGON_DONORS, ...OTHER_BASICS].map(name => [name, 1])
  ]) assert.equal(map.get(name), expected, 'Source-13 printing changed: ' + name);
  const group = name => {
    if (name === 'Regidrago V') return 'regv';
    if (name === 'Regidrago VSTAR') return 'vstar';
    if (name === 'Battle Compressor') return 'compressor';
    if (name === 'Quick Ball') return 'quickball';
    if (DRAGON_DONORS.has(name)) return 'donor';
    if (name === 'Double Dragon Energy') return 'dde';
    if (name === 'Grass Energy') return 'grass';
    if (name === 'Fire Energy') return 'fire';
    if (OTHER_BASICS.has(name)) return 'otherbasic';
    return 'other';
  };
  const totals = new Map(BUCKETS.map(name => [name, 0]));
  for (const row of source.cards)
    totals.set(group(row.name), totals.get(group(row.name)) + row.count);
  const counts = BUCKETS.map(name => totals.get(name));
  assert.deepEqual(counts, [4, 3, 2, 3, 3, 3, 4, 3, 7, 28]);
  return counts;
}

/**
 * Exact unordered physical seven-card opening frequency, conditioned on at
 * least one Basic. Enumerates multinomial category take counts with BigInt
 * binomial weights. These are co-occurrences, not executable turn plans.
 * @param {{cards:Array<{name:string,count:number}>}} source
 * @param {{compressorCopies?:number}} [options] Hypothetical exchange with an
 *   unspecified non-Basic, non-resource 'other' slot. This is only a static
 *   opening-access sensitivity, never a verified card swap or deck strength.
 * @returns {{counts:Record<string,bigint>,conditionalRates:Record<string,number>}}
 */
function exactOpeningConjunctions(source, options = {}) {
  const totals = source13Buckets(source);
  if (options.compressorCopies !== undefined) {
    const copies = options.compressorCopies;
    assert.ok(Number.isSafeInteger(copies) && copies >= 0 && copies <= 4);
    totals[9] += totals[2] - copies;
    totals[2] = copies;
  }
  const counts = Object.fromEntries([
    'all', 'basicLegal', 'regvAndVstar', 'regvVstarCompressor',
    'regvVstarQuickballDonor', 'regvVstarBothRoutes',
    'regvVstarEitherRoute', 'eitherRouteWithDde',
    'eitherRouteWithTwoAttachmentEnergy',
    'eitherRouteWithThreeBasicEnergy', 'eitherRouteWithAnyEnergy',
    'anyTwoAttachmentEnergy'
  ].map(name => [name, 0n]));
  const take = Array(totals.length).fill(0);
  function accumulate(weight) {
    const [v, star, compressor, ball, donor, dde, grass, fire, basic] = take;
    counts.all += weight;
    if (v + basic === 0) return;
    counts.basicLegal += weight;
    const vv = v > 0 && star > 0;
    const qbDonor = ball > 0 && donor > 0;
    const route = compressor > 0 || qbDonor;
    const twoAttachment = dde >= 2 ||
      (dde >= 1 && (grass > 0 || fire > 0));
    const threeBasic = grass >= 2 && fire >= 1;
    const anyEnergy = twoAttachment || threeBasic;
    if (twoAttachment) counts.anyTwoAttachmentEnergy += weight;
    if (!vv) return;
    counts.regvAndVstar += weight;
    if (compressor > 0) counts.regvVstarCompressor += weight;
    if (qbDonor) counts.regvVstarQuickballDonor += weight;
    if (compressor > 0 && qbDonor) counts.regvVstarBothRoutes += weight;
    if (!route) return;
    counts.regvVstarEitherRoute += weight;
    if (dde > 0) counts.eitherRouteWithDde += weight;
    if (twoAttachment) counts.eitherRouteWithTwoAttachmentEnergy += weight;
    if (!twoAttachment && threeBasic)
      counts.eitherRouteWithThreeBasicEnergy += weight;
    if (anyEnergy) counts.eitherRouteWithAnyEnergy += weight;
  }
  function enumerate(index, remaining, weight) {
    if (index === totals.length) {
      if (remaining === 0) accumulate(weight);
      return;
    }
    for (let n = 0; n <= Math.min(remaining, totals[index]); n++) {
      take[index] = n;
      enumerate(index + 1, remaining - n, weight * choose(totals[index], n));
    }
  }
  enumerate(0, 7, 1n);
  assert.equal(counts.all, choose(60, 7));
  assert.equal(counts.basicLegal, choose(60, 7) - choose(49, 7));
  assert.equal(counts.regvVstarEitherRoute,
    counts.regvVstarCompressor + counts.regvVstarQuickballDonor -
    counts.regvVstarBothRoutes);
  const conditionalRates = Object.fromEntries(Object.entries(counts)
    .filter(([name]) => name !== 'all' && name !== 'basicLegal')
    .map(([name, value]) => [name, Number(value) / Number(counts.basicLegal)]));
  return {counts, conditionalRates};
}

module.exports = {BUCKETS, source13Buckets, exactOpeningConjunctions, choose};
