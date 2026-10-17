'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const fixture = require('../results/als/new-moon-perfection-english-proxy-60.json');
const source = require('../results/als/new-moon-perfection-source-60.json');
assert.equal(fixture.entries.length, 33);
assert.equal(fixture.entries.reduce((n, c) => n + c.count, 0), 60);
assert.deepEqual(fixture.counts, source.counts);
fixture.entries.forEach((e, i) => {
  assert.equal(e.name_en, source.entries[i].name_en);
  assert.equal(e.count, source.entries[i].count);
});
console.log('new moon proxy source mapping: pass');
