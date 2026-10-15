'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * Counts literal published decklist rows. Card roles and mechanics must be
 * established separately from actual card text. No missing deck is imputed.
 *
 * @param {object} manifest Aichi published decklist JSON.
 * @param {string[]} watchedNames Exact card names to count.
 * @returns {object} Per-name prevalence and co-occurrence.
 */
function auditPresence(manifest, watchedNames) {
  if (!Array.isArray(manifest.decks) ||
      manifest.decks.length !== manifest.published_deck_count) {
    throw new Error('Invalid published-deck manifest.');
  }
  if (!Array.isArray(watchedNames) ||
      watchedNames.some(name => typeof name !== 'string' || !name)) {
    throw new Error('watchedNames must be nonempty strings.');
  }
  const ranks = new Set();
  const decks = manifest.decks.map(deck => {
    if (!Number.isInteger(deck.rank) || ranks.has(deck.rank)) {
      throw new Error('Repeated or invalid deck rank.');
    }
    ranks.add(deck.rank);
    const copies = new Map();
    for (const card of deck.cards) {
      if (!Number.isInteger(card.count) || card.count < 1) {
        throw new Error('Invalid card count at rank ' + deck.rank);
      }
      copies.set(card.name, (copies.get(card.name) || 0) + card.count);
    }
    const total = [...copies.values()].reduce((sum, count) => sum + count, 0);
    if (total !== 60) {
      throw new Error('Rank ' + deck.rank + ' contains ' + total + ' cards.');
    }
    return { rank: deck.rank, archetype: deck.archetype, copies };
  });

  const byName = {};
  for (const name of new Set(watchedNames)) {
    const present = decks.filter(deck => deck.copies.has(name));
    byName[name] = {
      decks: present.length,
      copies: present.reduce((sum, deck) => sum + deck.copies.get(name), 0),
      ranks: present.map(deck => deck.rank).sort((a, b) => a - b)
    };
  }

  /** @param {string[]} names Distinct cards jointly present in the same deck. */
  function joint(names) {
    return decks.filter(deck => names.every(name => deck.copies.has(name)))
      .map(deck => deck.rank).sort((a, b) => a - b);
  }

  const byArchetype = {};
  for (const deck of decks) {
    const entry = byArchetype[deck.archetype] ||
      (byArchetype[deck.archetype] = { published: 0, budew: 0, guzma: 0 });
    entry.published += 1;
    if (deck.copies.has('Budew')) entry.budew += 1;
    if (deck.copies.has('Guzma')) entry.guzma += 1;
  }

  return {
    source: manifest.source,
    published: decks.length,
    totalPlacements: manifest.total_placements,
    missing: manifest.missing_full_lists,
    byName,
    joint: {
      budewGuzma: joint(['Budew', 'Guzma']),
      budewGarbodor: joint(['Budew', 'Garbodor']),
      leleDedenne: joint(['Tapu Lele-GX', 'Dedenne-GX'])
    },
    byArchetype
  };
}

/** @returns {object} Audit of the pinned, locally available published field. */
function auditPublishedField() {
  const filename = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
  const manifest = JSON.parse(fs.readFileSync(filename, 'utf8'));
  return auditPresence(manifest, [
    'Budew', 'Guzma', 'VS Seeker', 'Quick Ball',
    'Dedenne-GX', 'Tapu Lele-GX', 'Garbodor', 'Vileplume',
    'Iron Thorns ex', 'Stoutland', 'Path to the Peak',
    'Stealthy Hood', 'Field Blower', 'Silent Lab'
  ]);
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(auditPublishedField(), null, 2) + '\n');
}

module.exports = { auditPresence, auditPublishedField };
