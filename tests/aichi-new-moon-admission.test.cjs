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

test('shared resolved candidate retains sixty playable engine IDs', () => {
  const {planAichi} = require('../simulation/evaluation/aichi-pilot.cjs');
  const deck = loadNewMoonCandidate();
  const plan = planAichi({label: deck.id, cards: deck.cards}, {
    allowEquivalentBasicEnergies: true,
    allowBasicEnergyMirrorPrintings: true,
    allowJapanesePromoHooks: true
  });
  assert.equal(plan.candidate.cards?.length, 60,
    JSON.stringify(plan.candidate.unresolved));
});
