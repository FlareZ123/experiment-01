'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { sourceStadiumReply } =
  require('../scripts/agent3-thorns-silent-lab-stadium-reply.cjs');

/** @param {number} actual @param {number} expected */
function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-11, `${actual} != ${expected}`);
}

test('four-Stadium source has prelock Tag Call counter opportunity', () => {
  const x = sourceStadiumReply(4);
  near(x.directStadium, 0.4572047432473605);
  near(x.directStadiumOrGuzmaHala, 0.607401850189937);
  near(x.supportedTagCallIncrement, 0.0985788351001212);
  near(x.combinedCounterAccess, 0.7059716698574686);
  assert.ok(x.combinedCounterAccess > x.directStadiumOrGuzmaHala);
});

test('five-Stadium source has stronger raw reply access', () => {
  const x = sourceStadiumReply(5);
  near(x.directStadium, 0.5376147980996149);
  near(x.directStadiumOrGuzmaHala, 0.6677923666852406);
  near(x.supportedTagCallIncrement, 0.08494932470651836);
  near(x.combinedCounterAccess, 0.7527413588904982);
  assert.ok(x.allStadiumPrizedGhCorrection > 0);
});

test('all outputs are probabilities and card-count input must be meaningful', () => {
  for (const n of [1, 2, 3, 4, 5, 6]) {
    const x = sourceStadiumReply(n);
    for (const value of Object.values(x)) assert.ok(value >= 0 && value <= 1);
  }
  assert.throws(() => sourceStadiumReply(0), RangeError);
  assert.throws(() => sourceStadiumReply(4.5), RangeError);
});
