'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { choose, prizeCut } = require('../scripts/copycat-prize-cut.cjs');

test('exact combinations handle invalid prize partitions', () => {
  assert.equal(choose(60, 6), 50063860n);
  assert.equal(choose(12, 13), 0n);
  assert.equal(choose(12, -1), 0n);
});

test('independent rational reference for 1 to 4 Heavy Balls', () => {
  const known = [
    [139744719n, 5904101632n],
    [18690899n, 8515531200n],
    [897366297n, 6119828422400n],
    [156780847n, 24479313689600n]
  ];
  known.forEach(([num, den], index) => {
    const r = prizeCut(index + 1);
    assert.equal(r.numerator * den, num * r.denominator);
    process.stdout.write('Heavy Ball x' + (index + 1)
      + ': ' + (100 * r.probability).toFixed(6) + '%\n');
  });
});

test('isolated prize rescue cut decreases with more copies', () => {
  for (let n = 1; n < 4; n++) {
    assert.ok(prizeCut(n + 1).probability < prizeCut(n).probability);
  }
});
