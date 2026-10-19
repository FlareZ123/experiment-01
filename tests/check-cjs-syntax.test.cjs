'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {checkSource} = require('../scripts/check-cjs-syntax.cjs');

test('CommonJS parse-only probe accepts valid source, including hashbang', () => {
  assert.equal(checkSource("'use strict'; module.exports = {value: 3};"), null);
  assert.equal(checkSource('#!/usr/bin/env node\nmodule.exports = 1;'), null);
  assert.equal(checkSource('return 1;'), null);
});

test('detects broken ternary introduced into canonical bilateral runner', () => {
  assert.match(checkSource("const label=enabled?'active':'inactive'';"), /SyntaxError/);
  assert.equal(checkSource("const label=enabled?'active':'inactive';"), null);
});

test('parsing never evaluates research code', () => {
  globalThis.__testSyntaxSideEffect = 0;
  assert.equal(checkSource('globalThis.__testSyntaxSideEffect = 1;'), null);
  assert.equal(globalThis.__testSyntaxSideEffect, 0);
  delete globalThis.__testSyntaxSideEffect;
});
