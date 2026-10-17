'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {horrorHousePowerglassContract} = require('../simulation/twinleaf/new-moon-horror-house-powerglass.cjs');

test('Horror House-GX and Powerglass source turn order', () => {
  const r = horrorHousePowerglassContract();
  assert.equal(r.before.attackerEnergy, 1);
  assert.equal(r.afterAttack.energyCount, 1);
  assert.equal(r.after.energyCount, 2);
  assert.equal(r.after.opponentHand, 3);
});
