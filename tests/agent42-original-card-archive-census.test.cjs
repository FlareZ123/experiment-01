'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const source = require('../results/aichi-2026/full-decklists.json');
const sets = require('../resources/sets/en.json');
const {
  auditOriginalPrints, readArchiveSet
} = require('../scripts/agent42-original-card-archive-census.cjs');

test('29 authentic full 60s have the immutable exact-print coverage census', () => {
  const actual = auditOriginalPrints(source, sets, readArchiveSet);
  assert.equal(actual.totalDecks, 29);
  assert.equal(actual.totalRows, 989);
  assert.equal(actual.totalCopies, 1740);
  assert.equal(actual.sourceSetCodes, 66);
  assert.equal(actual.archiveSetFilesRead, 69);
  assert.deepEqual(actual.statuses, {
    ARCHIVE_EXACT: { rows: 911, copies: 1549 },
    ARCHIVE_NUMBER_MATCH_NAME_ALIAS: { rows: 34, copies: 57 },
    ARCHIVE_UNLISTED: { rows: 44, copies: 134 }
  });
  assert.deepEqual([...new Set(actual.unresolved
    .map(row => row.set + ':' + row.card))].sort(), [
    'BWP:Palace Belt',
    'MEE:Darkness Energy',
    'MEE:Fighting Energy',
    'MEE:Fire Energy',
    'MEE:Grass Energy',
    'MEE:Lightning Energy',
    'MEE:Psychic Energy',
    'MEE:Water Energy',
    'SMP:Palace Book',
    "SP:Player's Ceremony"
  ]);
});

test('a registered collector-number mismatch never becomes a named alias', () => {
  const mini = {
    decks: [{
      rank: 1, cards: [
        { name: 'Different Card', count: 60,
          printing: { set: 'ABC', number: '12' }}
      ]
    }]
  };
  const available = [{ id: 'test', ptcgoCode: 'ABC' }];
  const read = () => [{ id: 'test-12', name: 'Original Card', number: '12' }];
  const got = auditOriginalPrints(mini, available, read);
  assert.equal(got.statuses.ARCHIVE_NUMBER_MATCH_NAME_ALIAS.copies, 60);
  assert.equal(got.statuses.ARCHIVE_EXACT.rows, 0);
  mini.decks[0].cards[0].printing.number = '13';
  const missing = auditOriginalPrints(mini, available, read);
  assert.equal(missing.statuses.ARCHIVE_UNLISTED.copies, 60);
});
