'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const {directThreeSingletons} = require('../scripts/agent2-electrode-direct-opening.cjs');
test('conditional direct Electrode Curry and Glasses opening', () => {
  const r = directThreeSingletons(15, 9);
  assert.ok(Math.abs(r.conditionalValidStart - 0.0026489993114368147) < 1e-12);
  assert.ok(Math.abs(r.validStart - 0.8824992053482625) < 1e-12);
});
