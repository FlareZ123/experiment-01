'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {choose, fraction} = require('./aichi-rank15-dual-lock-prize-ceiling.cjs');

// Exact rank-15 physical print inventory. The other category is all 42
// remaining cards, including search engines. No search effect is executed.
const COUNTS = Object.freeze({bunnelby: 2, oddish: 2, gloom: 2,
  bus: 1, aor: 2, tm: 2, energy: 7, other: 42});

/**
 * Strict direct-hand physical opportunity for Bunnelby to use TM: Evolution
 * twice on the first own turn going second, before any Trainer search/draw.
 * Conditioning is on the initially kept seven containing any Basic (14/60).
 * The two Oddish may include the ordinary first-turn draw; the Bunnelby
 * selected Active must already occur in the initial seven.
 * @returns {object} Exact rational probabilities and scope limitations.
 */
function calculateDirectTmOpportunity() {
  let favorable = 0n;
  const firstEight = choose(60, 8);
  const sixPrizesAfterEight = choose(52, 6);
  for (let b = 1; b <= 2; b++) {
    for (let tm = 1; tm <= 2; tm++) {
      for (let energy = 1; energy <= 7; energy++) {
        for (let aor = 0; aor <= 1; aor++) {
          const other = 8 - b - 2 - tm - energy - aor;
          if (other < 0 || other > COUNTS.other) continue;
          const seenWays = choose(2, b) * choose(2, 2) *
            choose(2, tm) * choose(7, energy) *
            choose(2, aor) * choose(COUNTS.other, other);
          // Neither Gloom nor BUS may be in the first eight. Both Gloom,
          // BUS, and at least one AOR must still be in the deck after Prizes.
          const favorablePrizes = aor === 0 ?
            choose(49, 6) - choose(47, 4) : choose(48, 6);
          // One Bunnelby in eight: it is in the original seven 7/8 of
          // the time. Two in eight: one is necessarily in the original seven.
          favorable += seenWays * BigInt(b === 1 ? 7 : 8) * favorablePrizes;
        }
      }
    }
  }
  const denominator = 8n * firstEight * sixPrizesAfterEight;
  const legalSeven = choose(60, 7) - choose(46, 7);
  const allSeven = choose(60, 7);
  const unconditional = fraction(favorable, denominator);
  const conditional = fraction(favorable * allSeven, denominator * legalSeven);
  assert.equal(conditional.numerator, '53594899');
  assert.equal(conditional.denominator, '413287114240');
  return {
    sourceRank: 15,
    sourcePrintedCounts: COUNTS,
    sample: 'initial seven, six face-down Prizes, then mandatory first-turn draw',
    event: 'Bunnelby in initial seven; both Oddish, TM: Evolution and an Energy in first eight; both Gloom, BUS Vileplume and one AOR Vileplume remain in the deck',
    unconditioned: unconditional,
    conditionalOnBasicValidInitialSeven: conditional,
    enablesGuaranteedAttack: false,
    qualifiesCompetitiveResults: false,
    excludes: 'Buddy-Buddy Poffin, Tag Call, Guzma & Hala, Artazon, other drawing/search, alternative starters, hand recycling, opponent effects and real action choices'
  };
}

/**
 * Same physical event, allowing at most one Buddy-Buddy Poffin played from
 * the first eight cards to search missing 50-HP Oddish. If both Oddish
 * were already seen, Poffin is optional.
 */
function calculatePoffinAssistedTmOpportunity() {
  let favorable = 0n;
  for (let b = 1; b <= 2; b++) {
    for (let oddish = 0; oddish <= 2; oddish++) {
      for (let tm = 1; tm <= 2; tm++) {
        for (let energy = 1; energy <= 7; energy++) {
          for (let poffin = 0; poffin <= 3; poffin++) {
            for (let aor = 0; aor <= 1; aor++) {
              const other = 8 - b - oddish - tm - energy - poffin - aor;
              if (other < 0 || other > 39 || (oddish < 2 && !poffin)) continue;
              const seenWays = choose(2, b) * choose(2, oddish) *
                choose(2, tm) * choose(7, energy) *
                choose(3, poffin) * choose(2, aor) * choose(39, other);
              // Unseen Oddish, both Gloom and BUS must avoid Prizes; an
              // AOR must remain in the deck to complete both searches.
              const prizeWays = aor === 0 ?
                choose(47 + oddish, 6) - choose(45 + oddish, 4) :
                choose(46 + oddish, 6);
              favorable += seenWays * BigInt(b === 1 ? 7 : 8) * prizeWays;
            }
          }
        }
      }
    }
  }
  const denominator = 8n * choose(60, 8) * choose(52, 6);
  const legalSeven = choose(60, 7) - choose(46, 7);
  const allSeven = choose(60, 7);
  const conditional = fraction(favorable * allSeven, denominator * legalSeven);
  assert.deepEqual([conditional.numerator, conditional.denominator],
    ['1379875346061', '388489887385600']);
  const direct = calculateDirectTmOpportunity();
  assert.ok(conditional.probability >
    direct.conditionalOnBasicValidInitialSeven.probability);
  return {
    sourceRank: 15,
    scenario: 'First-eight physical hand, plus at most one owner-played Buddy-Buddy Poffin to obtain missing Oddish',
    unconditioned: fraction(favorable, denominator),
    conditionalOnBasicValidInitialSeven: conditional,
    relativeToNoSearch: conditional.probability /
      direct.conditionalOnBasicValidInitialSeven.probability,
    assumesPoffinUsable: true,
    excludes: 'Tag Call, Guzma & Hala, Artazon, other draw/search, hand recycling, opponent lock and actual policy',
    qualifiesCompetitiveResults: false
  };
}

/**
 * Hard structural upper bound for a Bunnelby chosen Active at setup and two
 * on-deck Gloom plus two distinct Vileplume before any hand recycling.
 * Ignores TM, Energy and Oddish search availability entirely.
 */
function calculateNoPivotStagePoolCeiling() {
  let favorable = 0n;
  for (let b = 1; b <= 2; b++) {
    for (let oddish = 0; oddish <= 2; oddish++) {
      for (let aor = 0; aor <= 1; aor++) {
        const other = 8 - b - oddish - aor;
        if (other < 0 || other > 51) continue;
        const firstEightWays = choose(2, b) * choose(2, oddish) *
          choose(2, aor) * choose(51, other);
        const prizeWays = aor === 0 ?
          choose(47 + oddish, 6) - choose(45 + oddish, 4) :
          choose(46 + oddish, 6);
        favorable += firstEightWays * BigInt(b === 1 ? 7 : 8) * prizeWays;
      }
    }
  }
  const denominator = 8n * choose(60, 8) * choose(52, 6);
  const legalSeven = choose(60, 7) - choose(46, 7);
  const conditional = fraction(favorable * choose(60, 7),
    denominator * legalSeven);
  assert.deepEqual([conditional.numerator, conditional.denominator],
    ['125366629', '1389200384']);
  return {
    sourceRank: 15,
    event: 'Bunnelby in opening seven; both Gloom, BUS and at least one AOR in deck after first eight and Prizes; both Oddish unprized',
    conditionalOnBasicValidInitialSeven: conditional,
    unconditioned: fraction(favorable, denominator),
    requiresBunnelbyChosenActive: true,
    assumesNoHandRecyclingOfStageCards: true,
    ignoresAllToolEnergyAndSearchResources: true,
    qualifiesCompetitiveResults: false
  };
}

/** @param {string} root Repository root */
function fromSourceManifest(root = path.resolve(__dirname, '..')) {
  const field = JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'), 'utf8'));
  const deck = field.decks.find(d => d.rank === 15);
  assert.ok(deck);
  assert.equal(deck.cards.reduce((sum, c) => sum + c.count, 0), 60);
  const count = (name, set) => deck.cards
    .filter(c => c.name === name && c.printing.set === set)
    .reduce((sum, c) => sum + c.count, 0);
  assert.deepEqual([
    count('Bunnelby', 'PRC'), count('Oddish', 'UNB'),
    count('Gloom', 'UNB'), count('Vileplume', 'BUS'),
    count('Vileplume', 'AOR'),
    count('Technical Machine: Evolution', 'PAR')
  ], [2, 2, 2, 1, 2, 2]);
  assert.equal(deck.cards.filter(c => c.category === 'Energy')
    .reduce((sum, c) => sum + c.count, 0), COUNTS.energy);
  assert.equal(count('Buddy-Buddy Poffin', 'TEF'), 3);
  // The earlier source printing audit separately verifies exactly 14 Basics.
  return {...calculateDirectTmOpportunity(),
    poffinAssisted: calculatePoffinAssistedTmOpportunity(),
    noPivotStagePoolCeiling: calculateNoPivotStagePoolCeiling()};
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(fromSourceManifest(), null, 2) + '\n');
}

module.exports = {calculateDirectTmOpportunity, calculatePoffinAssistedTmOpportunity, calculateNoPivotStagePoolCeiling, fromSourceManifest};
