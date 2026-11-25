#!/usr/bin/env node
'use strict';

// Conditional K0 access sensitivity for an opponent who has already discarded
// one or two Guzma copies, optionally with one VS Seeker already spent. Once
// Guzma is in discard, a remaining VS Seeker is a direct displacement out.
//
// Run from any working directory:
//   node scripts/agent6-lockbridge-vsseeker-discard-sensitivity.cjs
//
// This is a hypergeometric access prior, not a game, policy, lock-uptime, or
// matchup model. It reuses Agent21's baseline implementation unchanged.

const fs = require('node:fs');
const path = require('node:path');
const { displacementAccess } = require('./agent21-lockbridge-displacement-access.cjs');

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
 * Conditional probability of at least one displacement out in H observed
 * cards, given the specified Guzma copies and any specified spent VS Seeker
 * are already outside the six Prizes and removed from the pool.
 *
 * A remaining VS Seeker in hand is direct because a Guzma is already in
 * discard. Remaining Guzma, Escape Rope, and Prime Catcher are direct.
 * Counter Catcher is included only in the explicitly conditional variant.
 *
 * The model does not simulate how the discard state arose or prior card use.
 */
function guzmaDiscardAccess(deck, H, preDiscardedGuzma = 1, preSpentVSSeeker = 0, includeCounterCatcher = false, includeVSSeeker = true) {
  const guzmaTotal = count(deck, 'Guzma');
  const vsSeekerTotal = count(deck, 'VS Seeker');
  if (
    preDiscardedGuzma < 1 ||
    guzmaTotal < preDiscardedGuzma ||
    preSpentVSSeeker < 0 ||
    vsSeekerTotal < preSpentVSSeeker
  ) {
    throw new Error('Invalid conditioned discard counts at rank ' + deck.rank);
  }

  const poolSize = 60 - preDiscardedGuzma - preSpentVSSeeker;
  const counts = {
    guzma: guzmaTotal - preDiscardedGuzma,
    vsSeeker: vsSeekerTotal - preSpentVSSeeker,
    escapeRope: count(deck, 'Escape Rope'),
    counterCatcher: count(deck, 'Counter Catcher'),
    primeCatcher: count(deck, 'Prime Catcher'),
  };

  const relevantTotal = Object.values(counts).reduce((sum, value) => sum + value, 0);
  if (relevantTotal > poolSize) {
    throw new Error('Relevant card count exceeds conditional pool at rank ' + deck.rank);
  }

  const categories = [
    { key: 'guzma', n: counts.guzma, direct: true },
    { key: 'vsSeeker', n: counts.vsSeeker, direct: includeVSSeeker },
    { key: 'escapeRope', n: counts.escapeRope, direct: true },
    { key: 'counterCatcher', n: counts.counterCatcher, direct: includeCounterCatcher },
    { key: 'primeCatcher', n: counts.primeCatcher, direct: true },
    { key: 'other', n: poolSize - relevantTotal, direct: false },
  ];

  // State: Prize cards used and observed cards used. Count only states with
  // no direct displacement card in the observed hand.
  let states = new Map([['0,0', 1n]]);

  for (const category of categories) {
    const next = new Map();

    for (const [key, ways] of states) {
      const [prizesUsed, handUsed] = key.split(',').map(Number);

      for (let prizes = 0; prizes <= Math.min(category.n, 6 - prizesUsed); prizes += 1) {
        for (
          let hand = 0;
          hand <= Math.min(category.n - prizes, H - handUsed);
          hand += 1
        ) {
          if (category.direct && hand > 0) continue;

          const weight =
            ways * choose(category.n, prizes) * choose(category.n - prizes, hand);
          const nextKey = [prizesUsed + prizes, handUsed + hand].join(',');
          next.set(nextKey, (next.get(nextKey) || 0n) + weight);
        }
      }
    }

    states = next;
  }

  let noAccessWays = 0n;
  for (const [key, ways] of states) {
    const [prizesUsed, handUsed] = key.split(',').map(Number);
    if (prizesUsed === 6 && handUsed === H) noAccessWays += ways;
  }

  const denominator = choose(poolSize, 6) * choose(poolSize - 6, H);
  return {
    probability: 1 - Number(noAccessWays) / Number(denominator),
    counts,
    poolSize,
    denominator: denominator.toString(),
  };
}


function mean(rows, key) {
  return rows.reduce((sum, row) => sum + row[key], 0) / rows.length;
}

function summarize(subset, H) {
  const baseNoCounter = mean(subset, 'baselineNoCounterH' + H);
  const oneNoCounter = mean(subset, 'oneDiscardNoCounterH' + H);
  const baseWithCounter = mean(subset, 'baselineWithCounterH' + H);
  const oneWithCounter = mean(subset, 'oneDiscardWithCounterH' + H);
  const oneNoVS = mean(subset, 'oneDiscardNoVSNoCounterH' + H);
  return {
    lists: subset.length,
    baselineNoCounter: baseNoCounter,
    oneDiscardNoCounter: oneNoCounter,
    deltaNoCounter: oneNoCounter - baseNoCounter,
    oneDiscardNoVSNoCounter: oneNoVS,
    marginalVSSeekerNoCounter: oneNoCounter - oneNoVS,
    baselineWithCounter: baseWithCounter,
    oneDiscardWithCounter: oneWithCounter,
    deltaWithCounter: oneWithCounter - baseWithCounter,
  };
}

function summarizeTwoPlus(subset, H) {
  const one = mean(subset, 'oneDiscardNoCounterH' + H);
  const two = mean(subset, 'twoDiscardNoCounterH' + H);
  const twoNoVS = mean(subset, 'twoDiscardNoVSNoCounterH' + H);
  return {
    lists: subset.length,
    oneDiscardNoCounter: one,
    twoDiscardNoCounter: two,
    twoDiscardNoVSNoCounter: twoNoVS,
    marginalVSSeekerAtTwoDiscards: two - twoNoVS,
    twoDiscardWithCounter: mean(subset, 'twoDiscardWithCounterH' + H),
  };
}

function summarizeTwoPlusOneVSSpent(subset, H) {
  const access = mean(subset, 'twoDiscardOneVSSpentNoCounterH' + H);
  const noVS = mean(subset, 'twoDiscardOneVSSpentNoVSNoCounterH' + H);
  return {
    lists: subset.length,
    twoDiscardOneVSSpent: access,
    twoDiscardOneVSSpentNoVS: noVS,
    marginalVSSeeker: access - noVS,
  };
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
    if (total !== 60) throw new Error('Rank ' + deck.rank + ' has ' + total + ' cards, not 60');
  }

  const handSizes = [7, 8, 9, 10];
  const rows = field.decks.map((deck) => {
    const guzma = count(deck, 'Guzma');
    const row = {
      rank: deck.rank,
      archetype: deck.archetype,
      guzma,
      vsSeeker: count(deck, 'VS Seeker'),
    };

    for (const H of handSizes) {
      row['baselineNoCounterH' + H] = displacementAccess(deck, H, {
        includeEscapeRope: true,
        includeCounterCatcher: false,
        includePrimeCatcher: true,
        includeGuzmaRecycle: true,
      }).probability;

      row['baselineWithCounterH' + H] = displacementAccess(deck, H, {
        includeEscapeRope: true,
        includeCounterCatcher: true,
        includePrimeCatcher: true,
        includeGuzmaRecycle: true,
      }).probability;

      if (guzma > 0) {
        row['oneDiscardNoCounterH' + H] =
          guzmaDiscardAccess(deck, H, 1, 0, false, true).probability;
        row['oneDiscardWithCounterH' + H] =
          guzmaDiscardAccess(deck, H, 1, 0, true, true).probability;
        row['oneDiscardNoVSNoCounterH' + H] =
          guzmaDiscardAccess(deck, H, 1, 0, false, false).probability;
        row['oneDiscardNoVSWithCounterH' + H] =
          guzmaDiscardAccess(deck, H, 1, 0, true, false).probability;
      } else {
        row['oneDiscardNoCounterH' + H] = null;
        row['oneDiscardWithCounterH' + H] = null;
        row['oneDiscardNoVSNoCounterH' + H] = null;
        row['oneDiscardNoVSWithCounterH' + H] = null;
      }

      if (guzma >= 2) {
        row['twoDiscardNoCounterH' + H] =
          guzmaDiscardAccess(deck, H, 2, 0, false, true).probability;
        row['twoDiscardWithCounterH' + H] =
          guzmaDiscardAccess(deck, H, 2, 0, true, true).probability;
        row['twoDiscardNoVSNoCounterH' + H] =
          guzmaDiscardAccess(deck, H, 2, 0, false, false).probability;
        if (row.vsSeeker >= 1) {
          row['twoDiscardOneVSSpentNoCounterH' + H] =
            guzmaDiscardAccess(deck, H, 2, 1, false, true).probability;
          row['twoDiscardOneVSSpentNoVSNoCounterH' + H] =
            guzmaDiscardAccess(deck, H, 2, 1, false, false).probability;
        } else {
          row['twoDiscardOneVSSpentNoCounterH' + H] = null;
          row['twoDiscardOneVSSpentNoVSNoCounterH' + H] = null;
        }
      } else {
        row['twoDiscardNoCounterH' + H] = null;
        row['twoDiscardWithCounterH' + H] = null;
        row['twoDiscardNoVSNoCounterH' + H] = null;
        row['twoDiscardOneVSSpentNoCounterH' + H] = null;
        row['twoDiscardOneVSSpentNoVSNoCounterH' + H] = null;
      }

    }
    return row;
  });

  const guzmaLists = rows.filter((row) => row.guzma > 0);
  const guzmaAndVS = guzmaLists.filter((row) => row.vsSeeker > 0);
  const guzmaTwoPlus = rows.filter((row) => row.guzma >= 2);
  const regidrago = rows.filter((row) => row.archetype === 'Regidrago');
  const regidragoTwoPlus = regidrago.filter((row) => row.guzma >= 2);
  const regidragoTwoPlusOneVSSpent = regidrago.filter((row) => row.guzma >= 2 && row.vsSeeker >= 1);

  process.stdout.write(JSON.stringify({
    source: field.source,
    event: field.event,
    publishedDeckCount: field.decks.length,
    missingFullLists: field.missing_full_lists,
    assumptions: {
      conditionalState: 'One or two Guzma copies are already in discard and not in Prizes; an additional branch removes one already-spent VS Seeker.',
      sample: 'Choose six Prizes from the remaining 60 minus conditioned discard/spent cards, then H observed cards.',
      directOuts: [
        'Any remaining Guzma',
        'VS Seeker (because one Guzma is already in the discard pile)',
        'Escape Rope',
        'Prime Catcher',
      ],
      counterCatcher: 'Reported separately with its Prize condition assumed live.',
      spentVSSeeker: 'Main one- and two-Guzma branches assume no VS Seeker has already been spent; a separate two-Guzma Regidrago branch conditions on one VS Seeker already used.',
      currentSupporter: 'Assumes the opponent has not already used a Supporter this turn.',
      excluded: [
        'How the prior Guzma reached the discard pile.',
        'Other cards already used or removed from the deck.',
        'Legal target/Bench requirements and actual choice to use an out.',
        'Mulligans, board state, Supporter contention across turns, and candidate re-establishment.',
      ],
      interpretation: 'Conditional K0 access prior only; not a game, lock-uptime, matchup, or win-rate estimate.',
    },
    fieldCoverage: {
      guzmaLists: guzmaLists.length,
      guzmaCopies: rows.reduce((sum, row) => sum + row.guzma, 0),
      guzmaAndVSLists: guzmaAndVS.length,
      guzmaTwoPlusLists: guzmaTwoPlus.length,
      regidragoLists: regidrago.length,
      regidragoGuzmaCopies: regidrago.reduce((sum, row) => sum + row.guzma, 0),
      regidragoVSSeekerCopies: regidrago.reduce((sum, row) => sum + row.vsSeeker, 0),
    },
    averagesH9: {
      all29Baseline: {
        noCounterCatcher: mean(rows, 'baselineNoCounterH9'),
        counterCatcherAssumedLive: mean(rows, 'baselineWithCounterH9'),
      },
      allGuzmaLists: summarize(guzmaLists, 9),
      allGuzmaAndVSLists: summarize(guzmaAndVS, 9),
      regidrago: summarize(regidrago, 9),
      twoPlusGuzma: summarizeTwoPlus(guzmaTwoPlus, 9),
      regidragoTwoPlus: summarizeTwoPlus(regidragoTwoPlus, 9),
      regidragoTwoPlusOneVSSpent: summarizeTwoPlusOneVSSpent(regidragoTwoPlusOneVSSpent, 9),
    },
    perRank: rows,
  }, null, 2) + '\n');
}

if (require.main === module) run();

module.exports = { guzmaDiscardAccess };
