'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const roster = require('../results/aichi-2026/full-decklists.json');
const sets = require('../resources/sets/en.json');
const PROMOS = {
  BWP: { id: 'bwp', prefix: 'BW' },
  SMP: { id: 'smp', prefix: 'SM' },
  XYP: { id: 'xyp', prefix: 'XY' }
};
const VERSION = 'agent42-source-archive-print-census-v2-explicit-aliases';

/** @param {string} displayed @param {string} archived */
function approvedDisplayedNameAlias(displayed, archived) {
  const exactAliases = new Map([
    ['Battle Compressor', 'Battle Compressor Team Flare Gear'],
    ['Robo Substitute', 'Robo Substitute Team Flare Gear'],
    ['Target Whistle', 'Target Whistle Team Flare Gear'],
    ['Unit Energy LPM', 'Unit Energy LightningPsychicMetal']
  ]);
  return exactAliases.get(displayed) === archived ||
    (displayed.includes('♢') && displayed.replaceAll('♢', '◇') === archived);
}

/**
 * Compare each registered original printed card against exactly indexed
 * English card records. An unlisted card is never replaced by a
 * similar-name print; display-name differences retain the same collector
 * number and mapped set.
 *
 * @param {object} database Authenticated original printed 60-card roster.
 * @param {object[]} indexMetadata Card database set metadata.
 * @param {(id:string)=>object[]} readCards Reader for a complete set.
 * @returns {object} Audit with complete rank and printing status.
 */
function auditOriginalPrints(database, indexMetadata, readCards) {
  const idsByCode = new Map();
  for (const set of indexMetadata) {
    if (!set.ptcgoCode) continue;
    if (!idsByCode.has(set.ptcgoCode)) idsByCode.set(set.ptcgoCode, []);
    idsByCode.get(set.ptcgoCode).push(set.id);
  }
  const setCache = new Map();
  const rows = [];
  for (const deck of database.decks) {
    assert.equal(deck.cards.reduce((s, c) => s + c.count, 0), 60);
    for (const source of deck.cards) {
      const printing = source.printing;
      const promo = PROMOS[printing.set];
      const targetNumber = promo ? promo.prefix + printing.number
        : String(printing.number);
      const ids = promo ? [promo.id]
        : idsByCode.get(printing.set) || [];
      const candidates = [];
      for (const id of ids) {
        if (!setCache.has(id)) setCache.set(id, readCards(id));
        const card = setCache.get(id).filter(c => c.number === targetNumber);
        for (const match of card) candidates.push({ id: match.id, name: match.name });
      }
      const exact = candidates.filter(c => c.name === source.name);
      const status = exact.length === 1 && candidates.length === 1
        ? 'ARCHIVE_EXACT'
        : candidates.length === 1
          ? approvedDisplayedNameAlias(source.name, candidates[0].name)
            ? 'ARCHIVE_NUMBER_MATCH_NAME_ALIAS'
            : 'ARCHIVE_NAME_CONFLICT'
          : 'ARCHIVE_UNLISTED';
      rows.push({
        rank: deck.rank, card: source.name, set: printing.set,
        number: printing.number, copies: source.count, status,
        archiveCardId: candidates.length === 1 ? candidates[0].id : null,
        archiveName: candidates.length === 1 ? candidates[0].name : null
      });
    }
  }
  const statuses = {};
  for (const status of [
    'ARCHIVE_EXACT',
    'ARCHIVE_NUMBER_MATCH_NAME_ALIAS',
    'ARCHIVE_NAME_CONFLICT',
    'ARCHIVE_UNLISTED'
  ]) {
    const subset = rows.filter(row => row.status === status);
    statuses[status] = {
      rows: subset.length,
      copies: subset.reduce((sum, row) => sum + row.copies, 0)
    };
  }
  return {
    version: VERSION,
    totalDecks: database.decks.length,
    totalRows: rows.length,
    totalCopies: rows.reduce((sum, row) => sum + row.copies, 0),
    sourceSetCodes: new Set(rows.map(row => row.set)).size,
    archiveSetFilesRead: setCache.size,
    statuses,
    unresolved: rows.filter(row => row.status === 'ARCHIVE_UNLISTED'),
    displayAliases: rows.filter(row => row.status ===
      'ARCHIVE_NUMBER_MATCH_NAME_ALIAS')
  };
}

/** @param {string} setId Card database archive set ID. */
function readArchiveSet(setId) {
  return JSON.parse(fs.readFileSync(
    path.join(root, 'resources/cards/en', setId + '.json'), 'utf8'));
}

if (require.main === module) {
  const report = auditOriginalPrints(roster, sets, readArchiveSet);
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

module.exports = {VERSION, auditOriginalPrints, readArchiveSet};
