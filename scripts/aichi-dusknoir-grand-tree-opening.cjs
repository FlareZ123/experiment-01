'use strict';

const fs = require('node:fs');
const path = require('node:path');

const BASICS = Object.freeze([
  'Duskull', 'Unown', 'Koffing', 'Chimecho', 'Gengar & Mimikyu-GX',
  'Radiant Alakazam', 'Bloodmoon Ursaluna ex', 'Latias ex', 'Tapu Lele-GX'
]);

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0) {
    throw new Error('Invalid combination inputs.');
  }
  if (k < 0 || k > n) return 0;
  let product = 1;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) {
    product *= (n - Math.min(k, n - k) + i) / i;
  }
  return product;
}

/**
 * Resolve the rank-31 source printing counts; explicitly identify the
 * Cursed Blast PRE Dusknoir rather than the BCR Sinister Hand Dusknoir.
 * @param {object} source Complete exact-printing Aichi manifest.
 * @returns {{basics:number,duskull:number,otherBasics:number,grandTree:number,
 *   dusclops:number,cursedDusknoir:number,other:number,total:number}}
 */
function rank31Counts(source) {
  const deck = source.decks.find(d => d.rank === 31);
  if (!deck || !Array.isArray(deck.cards)) throw new Error('Missing rank-31 source deck.');
  const count = (name, set, number) => deck.cards
    .filter(c => c.name === name && c.printing?.set === set &&
      String(c.printing.number) === String(number))
    .reduce((sum, c) => sum + c.count, 0);
  const total = deck.cards.reduce((sum, c) => sum + c.count, 0);
  const basics = deck.cards.filter(c => BASICS.includes(c.name))
    .reduce((sum, c) => sum + c.count, 0);
  const duskull = count('Duskull', 'PRE', '35');
  const dusclops = count('Dusclops', 'PRE', '36');
  const cursedDusknoir = count('Dusknoir', 'PRE', '37');
  const grandTree = count('Grand Tree', 'SCR', '136');
  if (total !== 60 || basics !== 15 || duskull !== 3 ||
      dusclops !== 3 || cursedDusknoir !== 3 || grandTree !== 1 ||
      count('Dusknoir', 'BCR', '63') !== 1) {
    throw new Error('Rank-31 source construction changed; reverify all printed card types.');
  }
  return {
    basics, duskull, otherBasics: basics - duskull,
    grandTree, dusclops, cursedDusknoir,
    other: total - basics - grandTree - dusclops - cursedDusknoir,
    total
  };
}

/**
 * Probability every copy of a particular group is outside the final
 * searchable deck, conditional on its surviving (non-hand) count.
 * @param {number} remainingGroup
 * @param {number} outsideDeck
 * @param {number} undrawn
 */
function allOutside(remainingGroup, outsideDeck, undrawn) {
  return choose(outsideDeck, remainingGroup) / choose(undrawn, remainingGroup);
}

/**
 * Conditional probability of at least one Stage 1 and one PRE Stage 2
 * remaining in deck after the final draw.
 * @param {number[]} counts Counts before allocating the Prize region and any unobserved draw.
 * @returns {number}
 */
function stageSearchSurvival(counts) {
  const n = counts.reduce((sum, x) => sum + x, 0);
  const outside = n - 45;
  const stage1 = counts[2];
  const stage2 = counts[3];
  if (outside < 0 || stage1 < 0 || stage2 < 0) {
    throw new Error('Impossible game zone allocation.');
  }
  return 1 - allOutside(stage1, outside, n) -
    allOutside(stage2, outside, n) +
    allOutside(stage1 + stage2, outside, n);
}

/**
 * Conditional on Grand Tree being in a specific direct-draw location,
 * enumerate the complete opening 7, Prize 6, first-turn draw and second-turn
 * draw distribution. Only the direct Grand Tree route is modeled.
 *
 * @param {number[]} groups [Duskull, other Basic, PRE Dusclops,
 *   PRE Cursed Blast Dusknoir, remaining cards], excluding Grand Tree.
 * @param {'hand'|'first-draw'|'second-draw'} location
 * @returns {number}
 */
function grandTreeLocationProbability(groups, location) {
  const inHand = location === 'hand' ? 6 : 7;
  const firstDrawIsTree = location === 'first-draw';
  let probability = 0;
  const ways = choose(59, inHand);
  for (let d = 0; d <= Math.min(groups[0], inHand); d += 1) {
    for (let b = 0; b <= Math.min(groups[1], inHand - d); b += 1) {
      if (d + b === 0) continue;
      for (let s1 = 0; s1 <= Math.min(groups[2], inHand - d - b); s1 += 1) {
        for (let s2 = 0; s2 <= Math.min(groups[3], inHand - d - b - s1); s2 += 1) {
          const others = inHand - d - b - s1 - s2;
          if (others < 0 || others > groups[4]) continue;
          const hand = [d, b, s1, s2, others];
          const weight = hand.reduce((acc, count, i) =>
            acc * choose(groups[i], count), 1) / ways;
          const available = groups.map((count, i) => count - hand[i]);
          if (firstDrawIsTree) {
            if (d > 0) probability += weight * stageSearchSurvival(available);
            continue;
          }
          const pool = available.reduce((sum, x) => sum + x, 0);
          for (let i = 0; i < available.length; i += 1) {
            if (!available[i] || d + Number(i === 0) === 0) continue;
            const next = [...available];
            const drawnWeight = available[i] / pool;
            next[i] -= 1;
            probability += weight * drawnWeight * stageSearchSurvival(next);
          }
        }
      }
    }
  }
  return probability;
}

/**
 * Necessary source-only opening opportunity:
 *  - valid seven-card opening (at least one Basic);
 *  - Duskull in initial seven or the player's first draw, enabling T1 play;
 *  - Grand Tree directly drawn in initial seven or first two turn draws;
 *  - at least one PRE Dusclops and one PRE Cursed Blast Dusknoir
 *    remaining searchable in the deck after six unknown Prizes and both draws.
 *
 * No card search, Stadium Nav coin flip, ability lock, disruption, forced
 * Active position, opponent policy, resource contention or turn legality beyond
 * ordinary evolution timing is simulated.
 * @param {ReturnType<typeof rank31Counts>} counts
 * @returns {object}
 */
function openingOpportunity(counts) {
  const {duskull, otherBasics, dusclops, cursedDusknoir,
    grandTree, other, basics, total} = counts;
  if (total !== 60 || grandTree !== 1 ||
      duskull + otherBasics + dusclops + cursedDusknoir + grandTree + other !== total) {
    throw new Error('Expected rank-31 source-derived groups.');
  }
  const groups = [duskull, otherBasics, dusclops, cursedDusknoir, other];
  const byTreeLocation = {
    initialHand: 7 / 60 * grandTreeLocationProbability(groups, 'hand'),
    firstTurnDraw: 1 / 60 * grandTreeLocationProbability(groups, 'first-draw'),
    secondTurnDraw: 1 / 60 * grandTreeLocationProbability(groups, 'second-draw')
  };
  const directJoint = Object.values(byTreeLocation).reduce((sum, p) => sum + p, 0);
  const validOpening = 1 - choose(60 - basics, 7) / choose(60, 7);
  return {
    cards: counts, validOpening, byTreeLocation,
    directJoint, conditionalValidOpening: directJoint / validOpening,
    claim: 'Directly drawn T2 Grand Tree and established Duskull, with both PRE evolution stages still searchable; necessary resource window only.'
  };
}

if (require.main === module) {
  const source = JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'), 'utf8'));
  process.stdout.write(JSON.stringify(openingOpportunity(rank31Counts(source)), null, 2) + '\n');
}

module.exports = {
  BASICS, choose, rank31Counts, allOutside, stageSearchSurvival,
  grandTreeLocationProbability, openingOpportunity
};
