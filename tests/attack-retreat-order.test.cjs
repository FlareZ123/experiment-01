'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {withAttackBeforeRetreat} = require('../simulation/twinleaf/attack-retreat-order.cjs');

class Evolve {}
class Retreat {}
class Attack {}
class Ability {}
const types = {AttackTactic: Attack, RetreatTactic: Retreat};

test('attack becomes adjacent to and precedes retreat', () => {
  const options = {tactics: [Evolve, Ability, Retreat, Attack], marker: 'unchanged'};
  const next = withAttackBeforeRetreat(options, types);
  assert.deepEqual(next.tactics, [Evolve, Ability, Attack, Retreat]);
  assert.deepEqual(options.tactics, [Evolve, Ability, Retreat, Attack]);
  assert.equal(next.marker, 'unchanged');
});

test('already attack-first policy remains idempotent', () => {
  const options = {tactics: [Evolve, Attack, Ability, Retreat]};
  const once = withAttackBeforeRetreat(options, types);
  const twice = withAttackBeforeRetreat(once, types);
  assert.deepEqual(once.tactics, twice.tactics);
  assert.deepEqual(once.tactics, [Evolve, Ability, Attack, Retreat]);
});

test('missing pinned extension points are rejected', () => {
  assert.throws(() => withAttackBeforeRetreat({tactics: [Evolve]}, types),
    /extension points missing/);
});
