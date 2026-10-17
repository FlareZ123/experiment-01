'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RANKS = [8, 11, 16, 22];
const BASIC_NAMES = new Set([
  'Mega Absol ex', 'Trubbish', 'Tapu Koko ♢', 'Dedenne-GX',
  'Crobat V', 'Squawkabilly ex', 'Tapu Lele-GX', 'Budew',
  'Oranguru V', 'Latias ex', 'Vikavolt V'
]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    result = result * BigInt(n - Math.min(k, n - k) + i) / BigInt(i);
  }
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function fraction(numerator, denominator) {
  const d = gcd(numerator, denominator);
  return {
    numerator: String(numerator / d),
    denominator: String(denominator / d),
    probability: Number(numerator) / Number(denominator)
  };
}

/**
 * Exact direct-draw access for a first-eligible Stage 1 Garbotoxin turn.
 * First seven must contain a Basic, Trubbish must be seen by turn one's draw,
 * and a Garbodor plus Float Stone must be seen by turn two's draw.
 * Prize placement is marginalized by random-deal exchangeability.
 * @param {{basics:number, trubbish:number, garbodor:number, floatStone:number}} x
 */
function directGarbotoxinWindow(x) {
  const { basics, trubbish, garbodor, floatStone } = x;
  const populations = [trubbish, garbodor, floatStone, basics - trubbish, 60 - basics - garbodor - floatStone];
  assert(populations.every(n => Number.isInteger(n) && n >= 0));
  assert.equal(populations.reduce((s, n) => s + n, 0), 60);
  const validOpenerCount = choose(60, 7) - choose(60 - basics, 7);
  let numerator = 0n;
  for (let t = 0; t <= Math.min(7, populations[0]); t++) {
    for (let g = 0; g <= Math.min(7 - t, populations[1]); g++) {
      for (let f = 0; f <= Math.min(7 - t - g, populations[2]); f++) {
        for (let b = 0; b <= Math.min(7 - t - g - f, populations[3]); b++) {
          const o = 7 - t - g - f - b;
          if (o > populations[4] || t + b === 0) continue;
          const opening = [t, g, f, b, o];
          const openingWays = opening.reduce((v, n, i) => v * choose(populations[i], n), 1n);
          const remaining = populations.map((n, i) => n - opening[i]);
          for (let first = 0; first < 5; first++) {
            if (remaining[first] === 0) continue;
            for (let second = 0; second < 5; second++) {
              const secondAvailable = remaining[second] - (second === first ? 1 : 0);
              if (secondAvailable <= 0) continue;
              if (t + (first === 0 ? 1 : 0) === 0) continue;
              if (g + (first === 1 ? 1 : 0) + (second === 1 ? 1 : 0) === 0) continue;
              if (f + (first === 2 ? 1 : 0) + (second === 2 ? 1 : 0) === 0) continue;
              numerator += openingWays * BigInt(remaining[first] * secondAvailable);
            }
          }
        }
      }
    }
  }
  return fraction(numerator, validOpenerCount * 53n * 52n);
}

/** @param {object} deck @param {string} name */
function count(deck, name) {
  return deck.cards.filter(c => c.name === name).reduce((sum, c) => sum + c.count, 0);
}

/** @param {object} source */
function audit(source) {
  assert.equal(source.event, 'CL Aichi Open League, 2026-05-10');
  const champion = source.decks.find(d => d.rank === 1);
  assert(champion);
  assert.equal(count(champion, 'Psychic Energy'), 11);
  assert.equal(count(champion, 'Field Blower'), 1);
  const ranks = RANKS.map(rank => {
    const d = source.decks.find(deck => deck.rank === rank);
    assert(d, 'Missing exact registered rank ' + rank);
    assert.equal(d.cards.reduce((sum, card) => sum + card.count, 0), 60);
    for (const c of d.cards.filter(card => card.category === 'Pokémon')) {
      assert(c.name === 'Garbodor' || BASIC_NAMES.has(c.name), 'Unclassified Stage in rank ' + rank + ': ' + c.name);
    }
    const basics = d.cards.filter(c => c.category === 'Pokémon' && BASIC_NAMES.has(c.name))
      .reduce((sum, c) => sum + c.count, 0);
    const x = {
      basics,
      trubbish: count(d, 'Trubbish'),
      garbodor: count(d, 'Garbodor'),
      floatStone: count(d, 'Float Stone')
    };
    assert.equal(x.trubbish, 2);
    assert(x.garbodor >= 2 && x.floatStone >= 3);
    return {
      rank, player: d.player, megaAbsol: count(d, 'Mega Absol ex'),
      ...x, budew: count(d, 'Budew'), vikavoltV: count(d, 'Vikavolt V'),
      shoppingCenter: count(d, 'Shopping Center'),
      directTurnTwoWindow: directGarbotoxinWindow(x)
    };
  });
  return {
    source: 'results/aichi-2026/full-decklists.json',
    championPsychicEnergy: 11, championFieldBlower: 1,
    megaAbsolHP: 280, shadowRiderVMAXHP: 320,
    maxGeistEnergyForUnmodifiedOHKO: Math.ceil((280 - 10) / 30),
    megaAbsolClawIntoDarkWeaknessVMAX: 200 * 2,
    ranks
  };
}

if (require.main === module) {
  const source = JSON.parse(fs.readFileSync(path.join(__dirname, '../results/aichi-2026/full-decklists.json'), 'utf8'));
  process.stdout.write(JSON.stringify(audit(source), null, 2) + '\n');
}

module.exports = { choose, directGarbotoxinWindow, audit };
