'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { dittoResourceFrontier } = require('../scripts/ditto-full-resource-frontier.cjs');
const { dittoDirectPathFrontier } = require('../scripts/ditto-direct-path-frontier.cjs');

/** @param {number} actual @param {number} expected */
function close(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-9, `expected ${expected}, got ${actual}`);
}

test('4 Ditto, 4 Tag, 4 G&H, one Stage 2, singleton Stadium and Tool, four DCE', () => {
  const x = dittoResourceFrontier({
    otherBasics: 4, targetCopies: 1, energyCopies: 4,
    stadiumCopies: 1, toolCopies: 1
  });
  close(x.resourceVisibility, 0.257308618161664);
  close(x.idealOneReroll, 0.192981463621248);
  assert.ok(x.resourceVisibility < dittoDirectPathFrontier(4, 1).directVisibility);
});

test('two Stage 2, two each Glimwood and Hood: explicit accessible category model', () => {
  const x = dittoResourceFrontier({
    otherBasics: 4, targetCopies: 2, energyCopies: 4,
    stadiumCopies: 2, toolCopies: 2
  });
  close(x.resourceVisibility, 0.38434662888206167);
  close(x.idealOneReroll, 0.28825997166154627);
});

test('four Stage 2 and four of every resource approach simpler connector-only ceiling', () => {
  const x = dittoResourceFrontier({
    otherBasics: 4, targetCopies: 4, energyCopies: 4,
    stadiumCopies: 4, toolCopies: 4
  });
  close(x.resourceVisibility, 0.40829387368926734);
  assert.ok(x.resourceVisibility < dittoDirectPathFrontier(4, 4).directVisibility);
  assert.ok(x.resourceVisibility > dittoResourceFrontier({
    otherBasics: 4, targetCopies: 1, energyCopies: 4,
    stadiumCopies: 1, toolCopies: 1
  }).resourceVisibility);
});

test('fail closed for invalid card class counts', () => {
  assert.throws(() => dittoResourceFrontier({
    otherBasics: -1, targetCopies: 1, energyCopies: 4,
    stadiumCopies: 2, toolCopies: 2
  }), RangeError);
  assert.throws(() => dittoResourceFrontier({
    otherBasics: 4, targetCopies: 0, energyCopies: 4,
    stadiumCopies: 2, toolCopies: 2
  }), RangeError);
  assert.throws(() => dittoResourceFrontier({
    otherBasics: 45, targetCopies: 4, energyCopies: 4,
    stadiumCopies: 4, toolCopies: 4
  }), RangeError);
});
