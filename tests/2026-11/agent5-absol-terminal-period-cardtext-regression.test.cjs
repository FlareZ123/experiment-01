'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const rank8 = require('../../simulation/evaluation/2026-11/agent44-rank8-absol-garbodor-opponent-policy.cjs');
const rank11v1 = require('../../simulation/evaluation/2026-11/agent31-rank11-absol-garbodor-opponent-policy.cjs');
const rank11v2 = require('../../simulation/evaluation/2026-11/agent31-rank11-absol-garbodor-opponent-policy-v2.cjs');

const attack = (damage, payable = true) => ({
  kind: 'attack',
  attackName: 'Terminal Period',
  publicMetadata: { attackCostPayable: payable, targetDamage: damage }
});
const minimalActor = { ownPublic: {}, opponentPublic: {} };

for (const [name, policy] of [
  ['rank8', rank8],
  ['rank11-v1', rank11v1],
  ['rank11-v2-base-scorer', rank11v2]
]) {
  test(name + ': exactly six 10-damage counters enable Terminal Period', () => {
    assert.equal(policy.scoreAttack(attack(60), minimalActor), 340);
  });
  test(name + ': 300 damage means thirty counters, not six', () => {
    for (const damage of [0, 50, 70, 290, 300]) {
      assert.equal(policy.scoreAttack(attack(damage), minimalActor), 0,
        'non-six-counter damage ' + damage);
    }
  });
  test(name + ': native nonpayable attack cannot be selected', () => {
    assert.equal(policy.scoreAttack(attack(60, false), minimalActor), 0);
  });
}
