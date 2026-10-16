'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  seededRandom, decodeWithPolicyRandom, policyRandomStreams
} = require('../simulation/twinleaf/headless.cjs');

/** @param {() => number} draw @param {number} count */
function sample(draw, count) {
  return Array.from({ length: count }, () => draw());
}

test('speculative bot sampling leaves the real game PRNG untouched', () => {
  const previous = Math.random;
  const game = seededRandom(20261016);
  const control = seededRandom(20261016);
  const bot = {
    decodeNextAction(state) {
      assert.equal(state.turn, 1);
      return sample(Math.random, 100);
    }
  };
  Math.random = game;
  try {
    assert.deepEqual(decodeWithPolicyRandom(bot, { turn: 1 },
      policyRandomStreams(20261016)[0]), sample(policyRandomStreams(20261016)[0], 100));
    assert.deepEqual(sample(Math.random, 20), sample(control, 20));
  } finally {
    Math.random = previous;
  }
});

test('exception in a speculative decision restores the original game source', () => {
  const previous = Math.random;
  const game = seededRandom(3141592);
  const control = seededRandom(3141592);
  Math.random = game;
  try {
    assert.throws(() => decodeWithPolicyRandom({
      decodeNextAction() {
        Math.random();
        throw new Error('expected policy failure');
      }
    }, {}, policyRandomStreams(3141592)[1]), /expected policy failure/);
    assert.equal(Math.random, game);
    assert.deepEqual(sample(Math.random, 8), sample(control, 8));
  } finally {
    Math.random = previous;
  }
});

test('seat policy streams are distinct, deterministic and individually advanced', () => {
  const pairA = policyRandomStreams(81);
  const pairB = policyRandomStreams(81);
  const first = pairA[0]();
  const second = pairA[1]();
  assert.notEqual(first, second);
  assert.equal(first, pairB[0]());
  assert.equal(second, pairB[1]());
  sample(pairA[0], 40);
  assert.deepEqual(sample(pairA[1], 10), sample(pairB[1], 10));
});

test('without isolation extra speculative RNG calls perturb actual game events', () => {
  const game = seededRandom(123456);
  const unperturbed = seededRandom(123456);
  game(); // Unscoped speculative trial in the legacy shared-stream protocol.
  assert.notEqual(game(), unperturbed());
});
