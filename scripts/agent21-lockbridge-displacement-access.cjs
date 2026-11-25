#!/usr/bin/env node
'use strict';

// Exact K0 access prior for Trainer cards that can displace an Active Wobbuffet.
// Run from any working directory: node scripts/agent21-lockbridge-displacement-access.cjs
// Input is the published 29-list field; this is not a game simulator.

const fs = require('node:fs');
const path = require('node:path');

function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  k = Math.min(k, n - k);
  let value = 1n;
  for (let i = 1; i <= k; i += 1) {
    value = (value * BigInt(n - k + i)) / BigInt(i);
  }
  return value;
}

function count(deck, name) {
  return deck.cards
    .filter((card) => card.name === name)
    .reduce((sum, card) => sum + card.count, 0);
}

/**
 * Probability that at least one modeled displacement line is accessible in
 * the first H cards observed, after six Prize cards are selected.
 *
 * No-access states are counted exactly with a multivariate hypergeometric DP:
 * choose six Prizes from 60, then H cards from the remaining 54.
 *
 * Direct categories are excluded from the no-access hand. The Guzma recycle
 * line requires both VS Seeker and Battle Compressor in hand and at least one
 * Guzma still in the draw deck.
 */
function displacementAccess(deck, H, options = {}) {
  const includeEscapeRope = options.includeEscapeRope !== false;
  const includeCounterCatcher = options.includeCounterCatcher === true;
  const includePrimeCatcher = options.includePrimeCatcher !== false;
  const includeGuzmaRecycle = options.includeGuzmaRecycle !== false;

  const counts = {
    guzma: count(deck, 'Guzma'),
    vsSeeker: count(deck, 'VS Seeker'),
    battleCompressor: count(deck, 'Battle Compressor'),
    escapeRope: count(deck, 'Escape Rope'),
    counterCatcher: count(deck, 'Counter Catcher'),
    primeCatcher: count(deck, 'Prime Catcher'),
  };

  const relevantTotal = Object.values(counts).reduce((sum, value) => sum + value, 0);
  if (relevantTotal > 60) throw new Error(`Relevant card count exceeds 60 at rank ${deck.rank}`);

  const categories = [
    { key: 'guzma', n: counts.guzma, direct: true, guzma: true },
    { key: 'vsSeeker', n: counts.vsSeeker, vsSeeker: true },
    { key: 'battleCompressor', n: counts.battleCompressor, battleCompressor: true },
    { key: 'escapeRope', n: counts.escapeRope, direct: includeEscapeRope },
    { key: 'counterCatcher', n: counts.counterCatcher, direct: includeCounterCatcher },
    { key: 'primeCatcher', n: counts.primeCatcher, direct: includePrimeCatcher },
    { key: 'other', n: 60 - relevantTotal },
  ];

  // State: prizes used, hand cards used, VS-in-hand, Compressor-in-hand,
  // and at least one Guzma remaining in the draw deck.
  let states = new Map([['0,0,0,0,0', 1n]]);

  for (const category of categories) {
    const next = new Map();

    for (const [key, ways] of states) {
      const [prizesUsed, handUsed, hasVS, hasCompressor, guzmaInDeck] =
        key.split(',').map(Number);

      for (let prizes = 0; prizes <= Math.min(category.n, 6 - prizesUsed); prizes += 1) {
        for (
          let hand = 0;
          hand <= Math.min(category.n - prizes, H - handUsed);
          hand += 1
        ) {
          // We are counting no-access states, so no direct out may be in hand.
          if (category.direct && hand > 0) continue;

          const weight =
            ways * choose(category.n, prizes) * choose(category.n - prizes, hand);
          const nextVS = category.vsSeeker ? (hasVS || hand > 0 ? 1 : 0) : hasVS;
          const nextCompressor = category.battleCompressor
            ? (hasCompressor || hand > 0 ? 1 : 0)
            : hasCompressor;
          const nextGuzmaInDeck = category.guzma
            ? (category.n - prizes - hand > 0 ? 1 : 0)
            : guzmaInDeck;

          const nextKey = [
            prizesUsed + prizes,
            handUsed + hand,
            nextVS,
            nextCompressor,
            nextGuzmaInDeck,
          ].join(',');

          next.set(nextKey, (next.get(nextKey) || 0n) + weight);
        }
      }
    }

    states = next;
  }

  let noAccessWays = 0n;
  for (const [key, ways] of states) {
    const [prizesUsed, handUsed, hasVS, hasCompressor, guzmaInDeck] =
      key.split(',').map(Number);
    if (prizesUsed !== 6 || handUsed !== H) continue;

    const recycleLine =
      includeGuzmaRecycle && hasVS === 1 && hasCompressor === 1 && guzmaInDeck === 1;

    if (!recycleLine) noAccessWays += ways;
  }

  const denominator = choose(60, 6) * choose(54, H);
  return {
    probability: 1 - Number(noAccessWays) / Number(denominator),
    counts,
  };
}

function mean(rows, key) {
  return rows.reduce((sum, row) => sum + row[key], 0) / rows.length;
}

function run() {
  const root = path.resolve(__dirname, '..');
  const inputPath = path.join(root, 'results', 'aichi-2026', 'full-decklists.json');
  const field = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

  if (!Array.isArray(field.decks) || field.decks.length !== 29) {
    throw new Error('Expected the 29 currently published Aichi lists.');
  }

  for (const deck of field.decks) {
    const total = deck.cards.reduce((sum, card) => sum + card.count, 0);
    if (total !== 60) throw new Error(`Rank ${deck.rank} has ${total} cards, not 60`);
  }

  const handSizes = [7, 8, 9, 10];
  const rows = field.decks.map((deck) => {
    const row = {
      rank: deck.rank,
      player: deck.player,
      archetype: deck.archetype,
      counts: {
        guzma: count(deck, 'Guzma'),
        vsSeeker: count(deck, 'VS Seeker'),
        battleCompressor: count(deck, 'Battle Compressor'),
        escapeRope: count(deck, 'Escape Rope'),
        counterCatcher: count(deck, 'Counter Catcher'),
        primeCatcher: count(deck, 'Prime Catcher'),
      },
    };

    for (const H of handSizes) {
      row[`gustNoCounterH${H}`] = displacementAccess(deck, H, {
        includeEscapeRope: false,
        includeCounterCatcher: false,
        includePrimeCatcher: true,
        includeGuzmaRecycle: true,
      }).probability;

      row[`anyNoCounterH${H}`] = displacementAccess(deck, H, {
        includeEscapeRope: true,
        includeCounterCatcher: false,
        includePrimeCatcher: true,
        includeGuzmaRecycle: true,
      }).probability;

      row[`anyWithCounterH${H}`] = displacementAccess(deck, H, {
        includeEscapeRope: true,
        includeCounterCatcher: true,
        includePrimeCatcher: true,
        includeGuzmaRecycle: true,
      }).probability;
    }

    for (let i = 1; i < handSizes.length; i += 1) {
      const previous = handSizes[i - 1];
      const current = handSizes[i];
      if (row[`anyNoCounterH${current}`] + 1e-12 < row[`anyNoCounterH${previous}`]) {
        throw new Error(`Non-monotonic access probability at rank ${deck.rank}`);
      }
    }
    return row;
  });

  const averages = Object.fromEntries(handSizes.map((H) => [
    H,
    {
      gustNoCounter: mean(rows, `gustNoCounterH${H}`),
      anyNoCounter: mean(rows, `anyNoCounterH${H}`),
      anyWithCounter: mean(rows, `anyWithCounterH${H}`),
    },
  ]));

  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.archetype)) groups.set(row.archetype, []);
    groups.get(row.archetype).push(row);
  }

  const archetypesH9 = Object.fromEntries(
    [...groups.entries()].map(([archetype, group]) => [
      archetype,
      {
        lists: group.length,
        anyNoCounter: mean(group, 'anyNoCounterH9'),
        anyWithCounter: mean(group, 'anyWithCounterH9'),
      },
    ]),
  );

  const cardPresence = {};
  for (const name of [
    'Guzma',
    'Escape Rope',
    'Counter Catcher',
    'Prime Catcher',
    'VS Seeker',
    'Battle Compressor',
  ]) {
    const decks = field.decks.filter((deck) => count(deck, name) > 0);
    cardPresence[name] = {
      copies: field.decks.reduce((sum, deck) => sum + count(deck, name), 0),
      lists: decks.length,
      ranks: decks.map((deck) => deck.rank),
    };
  }

  process.stdout.write(JSON.stringify({
    source: field.source,
    event: field.event,
    publishedDeckCount: field.decks.length,
    totalPlacements: field.total_placements,
    missingFullLists: field.missing_full_lists,
    cardPresence,
    averages,
    archetypesH9,
    perRank: rows,
    method: {
      prizeAndHandSampling: 'Choose 6 Prize cards from 60, then H cards from the remaining 54.',
      handSizes: 'H = 7, 8, 9, 10 cards observed; no turn mapping is asserted.',
      modeledDirectOuts: [
        'Guzma',
        'Prime Catcher',
        'Escape Rope (assumes the Lockbridge player has a Benched Pokémon to promote)',
        'Counter Catcher (conditional variant only; assumes its Prize condition is live)',
      ],
      modeledRecycleLine: 'VS Seeker + Battle Compressor both in hand, with at least one Guzma remaining in the draw deck.',
      omitted: [
        'Mulligan and valid-opening-Basic conditioning.',
        'Actual card expenditure before the response window and Supporter contention.',
        'VS Seeker retrieving a Guzma already in the discard pile.',
        'Other attacks, Abilities, and non-listed displacement effects.',
        'Whether a legal target/Bench exists or whether the opponent chooses to use the out.',
        'Candidate re-establishment of Wobbuffet after displacement.',
      ],
      interpretation: 'Access prior only. It is not an action rate, lock-uptime estimate, matchup result, or game win rate.',
    },
  }, null, 2) + '\n');
}

if (require.main === module) run();

module.exports = { displacementAccess };
