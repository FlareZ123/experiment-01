'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {audit} = require('../scripts/aichi-thorns-dce-mountain-direct.cjs');

test('source-locked Iron Thorns direct DCE plus Stadium event by first draw', () => {
  const result = audit();
  assert.equal(result.schema, 'aichi-thorns-dce-mountain-direct-eight-v1');
  assert.deepEqual(result.rows.map(row => row.rank), [6, 24, 29]);
  assert.deepEqual(
    result.rows.map(row => [row.basics, row.doubleColorlessEnergy, row.thunderMountain]),
    [[4, 1, 1], [4, 3, 1], [4, 1, 1]]
  );
  const expected = [13697 / 1071455, 722693 / 20649860, 13697 / 1071455];
  for (let i = 0; i < expected.length; i++) {
    assert.ok(Math.abs(result.rows[i].directJointByFirstDraw - expected[i]) < 1e-12);
  }
  assert.equal(result.qualifiedForCompetitiveInference, false);
});
