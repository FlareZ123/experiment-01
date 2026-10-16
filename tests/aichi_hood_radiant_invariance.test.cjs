'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const source = require('../results/aichi-2026/full-decklists.json');
const candidate = require('../results/aichi-2026/candidate-hood-shadow-rider.json');
const openingAudit = require('../results/aichi-2026/opening-hand-audit.json');
const { exactOpening, GROUPS } = require('../scripts/radiant-eternatus-opening.cjs');
const { radiantGroups } = require('../scripts/aichi_radiant_candidate_compare.cjs');

test('Hood Shield preserves champion direct Radiant Gate opportunity distribution', () => {
  const baseline = source.decks.find(deck => deck.rank === 1);
  const baselineBasics = openingAudit.decks.find(deck => deck.rank === 1).basic_count_known;
  const candidateBasics = candidate.cards
    .filter(row => row.category === 'Pokémon' && row.name !== 'Shadow Rider Calyrex VMAX')
    .reduce((sum, row) => sum + row.count, 0);
  const groups = radiantGroups(candidate, candidateBasics);
  assert.equal(candidateBasics, 14);
  assert.deepEqual(radiantGroups(baseline, baselineBasics), GROUPS);
  assert.deepEqual(groups, GROUPS,
    'Hood candidate changed identities inside the other-Basic/other-cards bins, not any Gate-relevant bin');
  const oldAccess = exactOpening(true, GROUPS);
  const hoodAccess = exactOpening(true, groups);
  assert.equal(hoodAccess.access, oldAccess.access);
  assert.equal(hoodAccess.twoVmax, oldAccess.twoVmax);
  assert.ok(Math.abs(hoodAccess.access - 0.5220484477) < 1e-9);
  assert.ok(Math.abs(hoodAccess.twoVmax - 0.5065943762) < 1e-9);
});
