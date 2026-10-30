'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const photo = require(path.join(__dirname, '..', 'results', 'aichi-2026', 'rank28-replica-photo-provisional.json'));
const original = require(path.join(__dirname, '..', 'results', 'aichi-2026', 'full-decklists.json'));

/**
 * Normalize a photographed Japanese card's translated English display name.
 * The original gallery's English labels are functional proxies, not an
 * organizer-registered English/Japanese printing crosswalk.
 *
 * @param {string} name
 * @returns {string}
 */
function normalizedName(name) {
  return name.replace(/^Basic /, '')
    .replace('Battle Compressor Team Flare Gear', 'Battle Compressor')
    .replace(/, unrestricted printing$/, '').trim();
}

/**
 * @param {{name: string, count: number}[]} cards
 * @returns {Map<string, number>}
 */
function countByName(cards) {
  const result = new Map();
  for (const card of cards) {
    const key = normalizedName(card.name);
    result.set(key, (result.get(key) || 0) + card.count);
  }
  return result;
}

/**
 * Minimal number of physical card replacements between equal-size multisets.
 * Returns 0 for identical named-card lists.
 *
 * @param {Map<string, number>} left
 * @param {Map<string, number>} right
 * @returns {number}
 */
function replacements(left, right) {
  const keys = new Set([...left.keys(), ...right.keys()]);
  let distance = 0;
  for (const name of keys) {
    distance += Math.abs((left.get(name) || 0) - (right.get(name) || 0));
  }
  assert.equal(distance % 2, 0, 'both decks should have equal physical card totals');
  return distance / 2;
}

/** @returns {void} */
function audit() {
  assert.equal(photo.schema, 'aichi-provisional-photographic-deck-v1');
  assert.equal(photo.rankClaimed, 28);
  assert.equal(photo.entries.length, 38);
  assert.equal(photo.sourcePhotoSha256,
    '3b23a6fb4daf9b1f537462d50611d6d2765bf0dc228338c3ddd0e41b97452cc9');

  const categoryTotals = { 'Pokémon': 0, Trainer: 0, Energy: 0 };
  const grid = new Set();
  const cardCounts = new Map();

  for (const entry of photo.entries) {
    assert.match(entry.grid, /^[1-5][/][1-8]$/);
    assert.equal(grid.has(entry.grid), false, 'duplicate physical photo position');
    grid.add(entry.grid);
    assert.ok(Number.isSafeInteger(entry.count) && entry.count >= 1 && entry.count <= 4);
    assert.ok(Object.hasOwn(categoryTotals, entry.category));
    assert.equal(typeof entry.englishCard, 'string');
    assert.ok(entry.englishCard.length);
    categoryTotals[entry.category] += entry.count;
    const name = normalizedName(entry.englishCard);
    cardCounts.set(name, (cardCounts.get(name) || 0) + entry.count);
  }

  assert.deepEqual(categoryTotals, { 'Pokémon': 20, Trainer: 30, Energy: 10 });
  assert.equal([...cardCounts.values()].reduce((sum, n) => sum + n, 0), 60);
  assert.equal(cardCounts.get('Prime Catcher'), 1);
  for (const [name, count] of cardCounts) {
    if (!name.endsWith('Energy') || name === 'Double Dragon Energy') {
      assert.ok(count <= 4, `too many copies of ${name}`);
    }
  }

  assert.equal(original.published_deck_count, original.decks.length);
  const distances = original.decks.map(deck => ({
    rank: deck.rank,
    archetype: deck.archetype,
    replacements: replacements(cardCounts, countByName(deck.cards)),
  })).sort((a, b) => a.replacements - b.replacements);

  const report = {
    source: photo.sourceUrl,
    sourceImageSha256: photo.sourcePhotoSha256,
    accountToFinalRankBridge: photo.officialRegistrationBridge,
    distinctPhotoEntries: photo.entries.length,
    totalCards: 60,
    categoryTotals,
    comparedPublishedOriginalDecks: original.decks.length,
    nearestOriginalRank: distances[0].rank,
    nearestOriginalSwapDistance: distances[0].replacements,
    identicalOriginalRanks: distances.filter(d => d.replacements === 0).map(d => d.rank),
    importantQualification: 'Qualifier rank and Limitless final placement are different ranking concepts',
    competitiveQualifiedGames: 0,
  };
  process.stdout.write(JSON.stringify(report, null, 2) + String.fromCharCode(10));
}

if (require.main === module) audit();

module.exports = { normalizedName, countByName, replacements, audit };
