'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { directLineChance } = require('../scripts/iron_thorns_direct_line.cjs');

test('one DCE produces exact prize-aware direct-access probability', () => {
  const result = directLineChance({
    thorns: 4, stadium: 1, dce: 1, guzmaHala: 2, tagCall: 2,
  });
  assert.ok(Math.abs(result.conditional - 0.33781505710593557) < 1e-12);
  assert.ok(Math.abs(result.directInHand - 0.012783551339066966) < 1e-12);
});

test('three DCE produce exact prize-aware direct-access probability', () => {
  const result = directLineChance({
    thorns: 4, stadium: 1, dce: 3, guzmaHala: 2, tagCall: 2,
  });
  assert.ok(Math.abs(result.conditional - 0.3910785062734533) < 1e-12);
  assert.ok(Math.abs(result.supporterLine - 0.3560810292929796) < 1e-12);
});
