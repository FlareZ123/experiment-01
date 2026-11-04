'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
/** @param {string} file */
const json = file => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));

const registry = json('results/legality/agent41-jp-exclusive-top32-promo-print-effects-20261104.json');
const originals = json('results/aichi-2026/full-decklists.json');
const gaps = json('results/aichi-2026/agent3-original29-printing-gap-20261104.json');

/** @param {{sourceName:string,sourceSet:string,sourceNumber:string}} entry @param {object} card */
function matchesSource(entry, card) {
  return card.name === entry.sourceName &&
    card.printing?.set === entry.sourceSet &&
    String(card.printing?.number) === entry.sourceNumber;
}

test('three official Japanese promo identities remain exact English-corpus gaps', () => {
  assert.equal(registry.entries.length, 3);
  assert.equal(registry.verifiedOfficialCardIdentityCount, 3);
  assert.equal(registry.resolvedSourceIdentitiesCount, 0);
  assert.equal(registry.unresolvedLocalCorpusPrintingCount, 3);
  const sourceKeys = new Set(registry.entries.map(entry =>
    [entry.sourceName, entry.sourceSet, entry.sourceNumber].join('|')));
  assert.equal(sourceKeys.size, 3);
  for (const entry of registry.entries) {
    assert.equal(entry.localExactEnglishPrintingAvailable, false);
    assert.match(entry.officialUrl, /^https:\/\/www\.pokemon-card\.com\/card-search\/details\.php\/card\/\d+\//);
    assert.ok(entry.officialUrl.includes('/' + entry.officialCardId + '/'));
    assert.ok(entry.officialJapaneseName.length > 0);
  }
});

test('every original rank and printed count reconciles to both authenticated lists and Agent3 gap', () => {
  let copies = 0;
  for (const entry of registry.entries) {
    const actual = originals.decks.flatMap(deck =>
      deck.cards.filter(card => matchesSource(entry, card))
        .map(card => ({rank: deck.rank, count: card.count})))
      .sort((a, b) => a.rank - b.rank);
    const claimed = entry.ranks.slice().sort((a, b) => a.rank - b.rank);
    assert.deepEqual(claimed, actual, entry.sourceName);
    const gap = gaps.remainingExactPrintGaps.find(card =>
      matchesSource(entry, card));
    assert.ok(gap, entry.sourceName);
    assert.equal(gap.copiesAcrossKnownOriginals, entry.originalCopies);
    assert.deepEqual(gap.ranks, claimed);
    assert.equal(actual.reduce((n, card) => n + card.count, 0), entry.originalCopies);
    copies += entry.originalCopies;
  }
  assert.equal(copies, 14);
  assert.equal(copies, registry.totalOriginalPhysicalCopies);
  assert.equal(copies, gaps.unmatchedTrainerCopies);
});

test('Palace Belt is Active-only Tool with passive turn-start draw replacement', () => {
  const belt = registry.entries.find(entry => entry.sourceName === 'Palace Belt');
  assert.equal(belt.modernTrainerKind, 'Pokemon Tool');
  assert.equal(belt.semantics.trigger, 'at-owner-turn-start');
  assert.match(belt.semantics.precondition, /Active Pokemon/);
  assert.equal(belt.semantics.replaceNormalDrawCount, 2);
  assert.equal(belt.semantics.activatedChoice, false);
  assert.equal(belt.semantics.turnEndsFromEffect, false);
});

test('Palace Book official unnumbered SM-P has mandatory draw-three and end turn', () => {
  const book = registry.entries.find(entry => entry.sourceName === 'Palace Book');
  assert.equal(book.sourceNumber, 'NAN25');
  assert.match(book.officialPrintingMark, /unnumbered/);
  assert.equal(book.modernTrainerKind, 'Item');
  assert.equal(book.semantics.trigger, 'on-card-play');
  assert.equal(book.semantics.drawCardCount, 3);
  assert.equal(book.semantics.turnEndsFromEffect, true);
});

test('Player\'s Ceremony is optional, shared once-per-player-turn Stadium draw/end', () => {
  const ceremony = registry.entries.find(entry => entry.sourceName === "Player's Ceremony");
  assert.equal(ceremony.modernTrainerKind, 'Stadium');
  assert.equal(ceremony.semantics.activatedChoice, true);
  assert.equal(ceremony.semantics.usesPerPlayerTurn, 1);
  assert.equal(ceremony.semantics.drawCardCount, 2);
  assert.equal(ceremony.semantics.turnEndsFromEffect, true);
  assert.equal(registry.gate.simulatorPaperCorrectnessVerified, false);
  assert.equal(registry.gate.competitiveGamesQualified, 0);
});
