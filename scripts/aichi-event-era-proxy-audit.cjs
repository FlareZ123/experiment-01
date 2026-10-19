'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const EVENT_DAY = '2026-05-10';

/**
 * Paper Expanded Aichi uses Japanese cards. The supplied deck manifest uses
 * English function-equivalent print identifiers, so a later English release
 * does not prove the Japanese card unavailable at the event.
 *
 * Official Japanese trainer-card and expansion links:
 * https://www.pokemon-card.com/ex/m4/
 * https://www.pokemon-card.com/card-search/details.php/card/50138
 * https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all
 */
const JAPANESE_ORIGINALS = Object.freeze({
  'CRI|56|Trubbish': Object.freeze({
    japaneseSet: 'M4',
    japaneseNumber: '054/083',
    japaneseRelease: '2026-03-13',
    officialCardUrl:
      'https://www.pokemon-card.com/card-search/details.php/card/50138'
  }),
  'CRI|82|Special Red Card': Object.freeze({
    japaneseSet: 'M4',
    japaneseNumber: '072/083',
    japaneseRelease: '2026-03-13',
    officialCardUrl:
      'https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all'
  })
});

/** @param {string} filename @returns {unknown} */
function readJson(filename) {
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

/**
 * Validate English set chronology separately from Japanese printing proof.
 * "No later English print flagged" does not imply all cards are paper-legal.
 *
 * @param {object} publishedManifest 29 source-complete field decks.
 * @param {object[]} englishSets Bundled English sets metadata.
 * @returns {object}
 */
function auditEventEra(publishedManifest, englishSets) {
  assert.equal(publishedManifest.decks.length, publishedManifest.published_deck_count);
  assert.ok(Array.isArray(englishSets));
  const sets = new Map();
  for (const set of englishSets) {
    if (set.ptcgoCode) {
      const existing = sets.get(set.ptcgoCode);
      // Gallery subsets share PTCGO codes and first English release dates.
      if (existing) assert.equal(existing.releaseDate, set.releaseDate,
        'Conflicting English release dates for ' + set.ptcgoCode);
      else sets.set(set.ptcgoCode, set);
    }
  }
  const lateEnglish = [];
  const unresolvedSetCodes = new Map();
  let checkedPrintedEntries = 0;
  for (const deck of publishedManifest.decks) {
    assert.ok(Number.isInteger(deck.rank) && deck.rank >= 1 && deck.rank <= 32);
    assert.equal(deck.cards.reduce((sum, card) => sum + card.count, 0), 60);
    for (const card of deck.cards) {
      assert.ok(card.printing?.set && card.printing?.number);
      const set = sets.get(card.printing.set);
      if (!set) {
        const code = card.printing.set;
        unresolvedSetCodes.set(code, (unresolvedSetCodes.get(code) ?? 0) + 1);
        continue;
      }
      checkedPrintedEntries += 1;
      assert.match(set.releaseDate, /^\d{4}\/\d{2}\/\d{2}$/);
      const englishRelease = set.releaseDate.replaceAll('/', '-');
      if (englishRelease <= EVENT_DAY) continue;
      const key = [card.printing.set, card.printing.number, card.name].join('|');
      const japanese = JAPANESE_ORIGINALS[key] ?? null;
      lateEnglish.push({
        rank: deck.rank,
        cardName: card.name,
        copies: card.count,
        englishPrinting: card.printing.set + ' ' + card.printing.number,
        englishRelease,
        originalJapanese: japanese,
        japanesePredatesEvent: japanese ?
          japanese.japaneseRelease <= EVENT_DAY : null,
        paperLegalityCertified: false
      });
    }
  }
  return {
    schema: 'aichi-2026-published-english-proxy-event-era-audit-v1',
    eventDate: EVENT_DAY,
    publishedDeckCount: publishedManifest.decks.length,
    checkedEnglishPrintEntries: checkedPrintedEntries,
    unmappedSetEntryCount: [...unresolvedSetCodes.values()]
      .reduce((sum, n) => sum + n, 0),
    unmappedSetCodes: Object.fromEntries([...unresolvedSetCodes.entries()]
      .sort(([a], [b]) => a.localeCompare(b))),
    laterEnglishPrintEntryCount: lateEnglish.length,
    laterEnglishPhysicalCopies: lateEnglish
      .reduce((sum, row) => sum + row.copies, 0),
    lateEnglish,
    coveredByKnownPreEventJapaneseOriginals: lateEnglish.every(row =>
      row.japanesePredatesEvent === true),
    fullPaperLegalityCertified: false,
    warning: 'An English print released after the event can be a proxy for a pre-event Japanese card. An unmapped set code is unresolved, not illegal.'
  };
}

/** @returns {object} */
function run() {
  const manifest = readJson(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'));
  const sets = readJson(path.join(ROOT, 'resources/sets/en.json'));
  return auditEventEra(manifest, sets);
}

if (require.main === module) process.stdout.write(
  JSON.stringify(run(), null, 2) + '\n');

module.exports = { EVENT_DAY, JAPANESE_ORIGINALS, auditEventEra, run };
