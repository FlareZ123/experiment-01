'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {loadNewMoonCandidate} = require('../scripts/aichi-new-moon-candidate.cjs');
test('provisional New Moon inventory', () => {
  const p = loadNewMoonCandidate();
  assert.equal(p.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(p.cards.length,34);
  assert.equal(p.provisionalEnglishProxy,true);
  assert.equal(p.paperLegalPrintsVerified,false);
});
