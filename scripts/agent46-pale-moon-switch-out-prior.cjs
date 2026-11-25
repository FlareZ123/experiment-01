#!/usr/bin/env node
'use strict';

// Static, source-list-derived prior for Pale Moon-GX escape access.
// This is not a matchup simulator or a game-state estimator.
const fs = require('node:fs');
const path = require('node:path');

const DECK_SIZE = 60;
const PRIZE_COUNT = 6;
const HAND_SIZES = [4, 5, 6, 7];
const DIRECT_OUTS = ['Guzma', 'Escape Rope', 'Scoop Up Cyclone'];
const CONDITIONAL_OUTS = ['Acerola'];

function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let value = 1;
  for (let i = 1; i <= k; i += 1) value = value * (n - k + i) / i;
  return value;
}

function count(cards, name) {
  const entry = cards.find(card => card.name === name);
  return entry ? entry.count : 0;
}

function estimate(deck, handSize, { includeAcerola = false } = {}) {
  const cards = deck.cards;
  const guzma = count(cards, 'Guzma');
  const escapeRope = count(cards, 'Escape Rope');
  const scoopUpCyclone = count(cards, 'Scoop Up Cyclone');
  const acerola = includeAcerola ? count(cards, 'Acerola') : 0;
  const vsSeeker = count(cards, 'VS Seeker');
  const battleCompressor = count(cards, 'Battle Compressor');

  const directOutCopies = guzma + escapeRope + scoopUpCyclone + acerola;
  const noDirectPool = DECK_SIZE - directOutCopies;
  const totalHands = choose(DECK_SIZE, handSize);
  const noDirectHands = choose(noDirectPool, handSize);
  const pDirect = 1 - noDirectHands / totalHands;

  // Conditional probability of holding at least one VS Seeker and one
  // Battle Compressor, given that no direct out is in hand.
  const pBothAccessItems = 1
    - choose(noDirectPool - vsSeeker, handSize) / noDirectHands
    - choose(noDirectPool - battleCompressor, handSize) / noDirectHands
    + choose(noDirectPool - vsSeeker - battleCompressor, handSize) / noDirectHands;

  // Given no Guzma in hand, the remaining cards are split between six
  // Prizes and the deck. The combo needs at least one Guzma in the deck.
  const unseenAfterHand = DECK_SIZE - handSize;
  const pGuzmaInDeck = guzma === 0
    ? 0
    : 1 - choose(PRIZE_COUNT, guzma) / choose(unseenAfterHand, guzma);

  const pCombo = (noDirectHands / totalHands) * pBothAccessItems * pGuzmaInDeck;
  return {
    directOutCopies,
    guzma,
    escapeRope,
    scoopUpCyclone,
    acerola: count(cards, 'Acerola'),
    vsSeeker,
    battleCompressor,
    pDirect,
    pCombo,
    pAccess: pDirect + pCombo
  };
}

function mean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

const sourcePath = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
if (!Array.isArray(source.decks)) throw new Error('Expected source.decks array');

const rows = source.decks.map(deck => {
  const byHandSize = {};
  for (const handSize of HAND_SIZES) {
    const base = estimate(deck, handSize);
    const damaged = estimate(deck, handSize, { includeAcerola: true });
    byHandSize[handSize] = {
      direct: base.pDirect,
      battleCompressorVsSeekerGuzma: base.pCombo,
      total: base.pAccess,
      ifTargetDamagedForAcerola: damaged.pAccess
    };
  }
  const six = estimate(deck, 6);
  return {
    rank: deck.rank,
    archetype: deck.archetype,
    directOutCopies: six.directOutCopies,
    guzma: six.guzma,
    escapeRope: six.escapeRope,
    scoopUpCyclone: six.scoopUpCyclone,
    acerola: six.acerola,
    vsSeeker: six.vsSeeker,
    battleCompressor: six.battleCompressor,
    byHandSize
  };
});

const regidrago = rows.filter(row => /regidrago/i.test(row.archetype));
const summarize = (subset, handSize) => ({
  direct: mean(subset.map(row => row.byHandSize[handSize].direct)),
  combo: mean(subset.map(row => row.byHandSize[handSize].battleCompressorVsSeekerGuzma)),
  total: mean(subset.map(row => row.byHandSize[handSize].total)),
  ifTargetDamagedForAcerola: mean(subset.map(row => row.byHandSize[handSize].ifTargetDamagedForAcerola))
});
const missingRanks = Array.from({ length: 32 }, (_, index) => index + 1)
  .filter(rank => !rows.some(row => row.rank === rank));

process.stdout.write(JSON.stringify({
  assumptions: {
    deckSize: DECK_SIZE,
    prizeCount: PRIZE_COUNT,
    handSizes: HAND_SIZES,
    directOuts: DIRECT_OUTS,
    conditionalOuts: CONDITIONAL_OUTS,
    accessCombo: 'Battle Compressor + VS Seeker in hand, with at least one Guzma in deck',
    scope: 'uniform random hand, no public-zone conditioning, no Item lock, Supporter slot unused, ACE SPEC unused, legal bench/target'
  },
  listCount: rows.length,
  missingRanks,
  field: Object.fromEntries(HAND_SIZES.map(handSize => [handSize, summarize(rows, handSize)])),
  regidrago: {
    listCount: regidrago.length,
    byHandSize: Object.fromEntries(HAND_SIZES.map(handSize => [handSize, summarize(regidrago, handSize)]))
  },
  rows
}, null, 2) + '\n');
