'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {choose, prizeDistribution, nextCardsHit} =
  require('../scripts/aichi-prize-conditionals.cjs');

test('exact small binomial coefficients', () => {
  assert.equal(choose(8, 3), 56n);
  assert.equal(choose(52, 6), 20358520n);
  assert.equal(choose(3, 4), 0n);
});

test('rank-6 K0 two other Guzma among 52 unknown and six Prizes', () => {
  const rows = prizeDistribution(52, 2, 6);
  assert.deepEqual(rows.map(row => row.prized), [0, 1, 2]);
  assert.deepEqual(rows.map(row => row.ways),
    [15890700n, 4237520n, 230300n]);
  assert.equal(rows[0].total, 20358520n);
  assert.equal(rows.reduce((sum,row) => sum + row.ways,0n),
    rows[0].total);
  assert.ok(Math.abs(rows[2].p - 0.011312217194570135) < 1e-14);
  assert.equal(Math.ceil(Math.log(0.05) / Math.log(1 - rows[2].p)),264);
});

test('rank-6 post-search Trainers Mail hits one of three VS Seeker', () => {
  const hit = nextCardsHit(44, 3, 4);
  assert.equal(hit.total, 135751n);
  assert.equal(hit.ways, 34481n);
  assert.ok(Math.abs(hit.p - 0.254001812141347) < 1e-14);
  assert.equal(nextCardsHit(44, 3, 1).ways, 3n);
  assert.equal(nextCardsHit(44, 3, 1).total, 44n);
});

test('small-population exhaustive enumeration agrees with distribution', () => {
  const counts = [0,0,0];
  for (let i=0;i<8;i++) for (let j=i+1;j<8;j++)
    for (let k=j+1;k<8;k++) {
      const selected=[i,j,k];
      counts[selected.filter(n=>n<2).length]++;
    }
  const rows=prizeDistribution(8,2,3);
  assert.deepEqual(rows.map(row=>Number(row.ways)), counts);
  assert.equal(rows[0].total,56n);
});
