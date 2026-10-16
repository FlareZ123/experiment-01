'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0;
  let value = 1;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) {
    value *= (n - i + 1) / i;
  }
  return Math.round(value);
}

/**
 * Exact finite-population opportunity to draw Ranger or search it using
 * Lele from the hand, accounting for the starting Active and six Prizes.
 * @param {{size:number,basics:number,lele:number,ranger:number,
 *   opening?:number,draws?:number,prizes?:number}} input
 */
function rangerEarlyAccess(input) {
  const {size, basics, lele, ranger, opening = 7, draws = 2, prizes = 6} = input;
  if (![size, basics, lele, ranger, opening, draws, prizes].every(Number.isInteger) ||
      size < 1 || basics < 1 || lele < 0 || ranger < 0 || lele > basics ||
      basics + ranger > size || opening < 1 || draws < 0 || prizes < 0 ||
      opening + draws + prizes > size) {
    throw new Error('Invalid finite deck composition or sampling window.');
  }
  const counts = [lele, ranger, basics - lele, size - basics - ranger];
  const totalOpening = choose(size, opening);
  const validOpening = 1 - choose(size - basics, opening) / totalOpening;
  const drawDenom = choose(size - opening, draws);
  let direct = 0;
  let wonderTag = 0;
  for (let a = 0; a <= Math.min(lele, opening); a += 1) {
    for (let b = 0; b <= Math.min(ranger, opening - a); b += 1) {
      for (let c = 0; c <= Math.min(basics - lele, opening - a - b); c += 1) {
        const d = opening - a - b - c;
        if (a + c === 0 || d > counts[3]) continue;
        const openingWeight = choose(counts[0], a) * choose(counts[1], b) *
          choose(counts[2], c) * choose(counts[3], d) / totalOpening;
        const remaining = [counts[0] - a, counts[1] - b,
          counts[2] - c, counts[3] - d];
        for (let aa = 0; aa <= Math.min(remaining[0], draws); aa += 1) {
          for (let bb = 0; bb <= Math.min(remaining[1], draws - aa); bb += 1) {
            for (let cc = 0; cc <= Math.min(remaining[2], draws - aa - bb); cc += 1) {
              const dd = draws - aa - bb - cc;
              if (dd > remaining[3]) continue;
              const weight = openingWeight * choose(remaining[0], aa) *
                choose(remaining[1], bb) * choose(remaining[2], cc) *
                choose(remaining[3], dd) / drawDenom / validOpening;
              if (b + bb > 0) {
                direct += weight;
              } else if (a + aa > 0 && (c > 0 || a >= 2 || aa > 0)) {
                const unseen = size - opening - draws;
                const unseenRangers = ranger - b - bb;
                const allPrized = choose(prizes, unseenRangers) /
                  choose(unseen, unseenRangers);
                wonderTag += weight * (1 - allPrized);
              }
            }
          }
        }
      }
    }
  }
  return {direct, wonderTag, either: direct + wonderTag, validOpening};
}

const BASIC_NAMES = new Set([
  'Shadow Rider Calyrex V', "Lillie's Clefairy ex", 'Tapu Lele-GX',
  'Trevenant & Dusknoir-GX', 'Latias ex', 'Dialga-GX', 'Mimikyu',
  'Girafarig', 'Marshadow', 'Radiant Eternatus', 'Wobbuffet'
]);

/**
 * Extract composition from the three exact Shadow Rider snapshots.
 * Reject an unknown stage instead of assuming it starts as a Basic.
 * @param {{cards:object[]}} deck
 */
function sourceComposition(deck) {
  const sum = predicate => deck.cards.filter(predicate)
    .reduce((n, card) => n + card.count, 0);
  const basics = sum(card => card.category === 'Pokémon' && BASIC_NAMES.has(card.name));
  const pokemon = sum(card => card.category === 'Pokémon');
  const evolutions = sum(card => card.category === 'Pokémon' &&
    card.name === 'Shadow Rider Calyrex VMAX');
  if (sum(() => true) !== 60 || basics + evolutions !== pokemon ||
      pokemon < basics || basics < 1) {
    throw new Error('Source card inventory drift or unsupported Pokémon stage.');
  }
  return {
    size: 60, basics,
    lele: sum(card => card.name === 'Tapu Lele-GX'),
    ranger: sum(card => card.name === 'Pokémon Ranger')
  };
}

function report() {
  const dir = path.resolve(__dirname, '../results/aichi-2026');
  const full = JSON.parse(fs.readFileSync(path.join(dir, 'full-decklists.json'), 'utf8'));
  const decks = [
    ['champion-reference', full.decks.find(deck => deck.rank === 1)],
    ['hood-shield-v1', JSON.parse(fs.readFileSync(path.join(dir, 'candidate-hood-shadow-rider.json'), 'utf8'))],
    ['temple-v1', JSON.parse(fs.readFileSync(path.join(dir, 'candidate-temple-shadow-rider.json'), 'utf8'))]
  ];
  return decks.map(([id, deck]) => ({id, composition: sourceComposition(deck),
    windows: [0, 1, 2].map(draws => ({draws,
      ...rangerEarlyAccess({...sourceComposition(deck), draws})}))}));
}

if (require.main === module) console.log(JSON.stringify(report(), null, 2));
module.exports = {choose, rangerEarlyAccess, sourceComposition, report};
