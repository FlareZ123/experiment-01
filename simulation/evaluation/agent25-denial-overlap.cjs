'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent25-rank6-denial-coheld-opening-v1';

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
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/**
 * Exact, disjoint-category hypergeometric overlap, conditioned on the first
 * seven containing a Basic. 'oneDraw' models one subsequent ordinary draw
 * after Prize cards are dealt uniformly, without search or other effects.
 * The result describes card locations only, not legal or useful play.
 * @param {{total:number,basics:number,groupA:number,groupB:number,
 *   opening:number,oneDraw:boolean}} input
 * @returns {{numerator:string,denominator:string,probability:number}}
 */
function conditionalCoheldProbability(input) {
  const {total, basics, groupA, groupB, opening, oneDraw} = input;
  for (const value of [total, basics, groupA, groupB, opening]) {
    assert.ok(Number.isSafeInteger(value) && value >= 0);
  }
  assert.equal(typeof oneDraw, 'boolean');
  assert.ok(opening >= 1 && basics >= 1);
  assert.ok(total >= basics + groupA + groupB);
  const visible = opening + Number(oneDraw);
  assert.ok(visible <= total);
  const other = total - basics - groupA - groupB;
  const denominatorOpening = choose(total, opening);
  const validOpening = denominatorOpening - choose(total - basics, opening);
  assert.ok(validOpening > 0n);
  let numeratorWeighted = 0n;
  for (let b = 1; b <= Math.min(basics, visible); b++) {
    for (let a = 1; a <= Math.min(groupA, visible - b); a++) {
      for (let h = 1; h <= Math.min(groupB, visible - b - a); h++) {
        const o = visible - b - a - h;
        if (o > other) continue;
        const ways = choose(basics, b) * choose(groupA, a) *
          choose(groupB, h) * choose(other, o);
        // Of the possible final draw cards, all but the sole Basic preserve
        // Basic-validity of the first opening when exactly one Basic exists.
        const admissibleLast = !oneDraw ? 1 : b === 1 ? opening : visible;
        numeratorWeighted += ways * BigInt(admissibleLast);
      }
    }
  }
  const rawNumerator = numeratorWeighted * denominatorOpening;
  const rawDenominator = BigInt(oneDraw ? visible : 1) *
    choose(total, visible) * validOpening;
  const divisor = gcd(rawNumerator, rawDenominator);
  const numerator = rawNumerator / divisor;
  const denominator = rawDenominator / divisor;
  return {numerator:String(numerator), denominator:String(denominator),
    probability:Number(numerator) / Number(denominator)};
}

/**
 * Reads the original published rank-6 source 60 from the repository.
 * No missing opponent list is reconstructed.
 * @param {string} [file] Source manifest path.
 * @returns {object} Exact 7-card and 7-plus-one-draw exposure.
 */
function rank6Overlap(file = path.resolve(__dirname,
  '../../results/aichi-2026/full-decklists.json')) {
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  const deck = manifest.decks.find(d => d.rank === 6);
  assert.ok(deck);
  const count = name => deck.cards.filter(c => c.name === name)
    .reduce((n, c) => n + c.count, 0);
  const total = deck.cards.reduce((n, c) => n + c.count, 0);
  const basics = deck.cards.filter(c => c.category === 'Pokémon')
    .reduce((n, c) => n + c.count, 0);
  assert.equal(total, 60);
  assert.equal(basics, 4);
  const input = {total, basics, groupA:count('Plumeria'),
    groupB:count('Enhanced Hammer'), opening:7};
  assert.equal(input.groupA, 4);
  assert.equal(input.groupB, 2);
  const crushing = {...input,groupB:count('Crushing Hammer')};
  assert.equal(crushing.groupB, 4);
  return {version:VERSION, rank:6, player:deck.player, counts:input,
    seven:conditionalCoheldProbability({...input,oneDraw:false}),
    sevenPlusOneDraw:conditionalCoheldProbability({...input,oneDraw:true}),
    crushingAlternative:{
      counts:crushing,
      seven:conditionalCoheldProbability({...crushing,oneDraw:false}),
      sevenPlusOneDraw:conditionalCoheldProbability({...crushing,oneDraw:true})
    },
    limitation:'Only co-held physical cards given Basic-valid seven; no opponent Energy, native legality, discard affordance, or tactical win inference'};
}

module.exports = {VERSION, choose, conditionalCoheldProbability, rank6Overlap};
