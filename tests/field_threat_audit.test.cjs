'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { auditPublishedField, auditPresence } = require('../scripts/field_threat_audit.cjs');

test('field card counts and overlaps', () => {
  const r = auditPublishedField();
  assert.equal(r.published, 29);
  assert.deepEqual(r.missing.map(x => x.rank), [23, 25, 28]);
  assert.equal(r.byName.Budew.decks, 14);
  assert.equal(r.byName.Budew.copies, 19);
  assert.equal(r.byName.Guzma.decks, 25);
  assert.equal(r.byName.Guzma.copies, 48);
  assert.equal(r.byArchetype.Regidrago.budew, 9);
  assert.equal(r.byArchetype.Regidrago.published, 9);
  assert.deepEqual(r.joint.budewGuzma, r.byName.Budew.ranks);
  assert.equal(r.joint.budewGarbodor.length, 3);
  assert.equal(r.joint.leleDedenne.length, 15);
});

test('duplicate printing rows aggregate by name', () => {
  const fixture = { published_deck_count: 1, total_placements: 1, missing_full_lists: [], source: 'fixture', decks: [{ rank: 1, archetype: 'fixture', cards: [{ name: 'Budew', count: 1 }, { name: 'Budew', count: 2 }, { name: 'Guzma', count: 3 }, { name: 'Energy', count: 54 }] }] };
  assert.equal(auditPresence(fixture, ['Budew']).byName.Budew.copies, 3);
});
