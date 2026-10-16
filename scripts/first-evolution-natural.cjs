'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { loadBasicIndex, normalizeName } = require('./aichi_opening_audit.cjs');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  const q = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= q; i++) result = result * BigInt(n - q + i) / BigInt(i);
  return result;
}

/** @param {number} n @param {number} k @param {number} total @param {number} count @returns {number} */
function avoids(n, k, total, count) {
  return Number(choose(n - count, k)) / Number(choose(total, k));
}

/**
 * Exact no-search chance of having played a target Basic by the end of T1,
 * and holding its matching Stage 1 by the beginning of T2. The first seven
 * must contain at least one Basic; bonus draws follow Prize setting.
 * All card-draw positions are exchangeable under a uniform shuffle and
 * a uniformly selected Prize subset.
 *
 * @param {{deckSize:number, openingSize:number, prizeCount:number,
 * basicCount:number, targetBasicCount:number, stageOneCount:number,
 * bonusDraws?:number}} input
 * @returns {{openingValid:number, conditional:number, unconditional:number}}
 */
function naturalEvolutionChance(input) {
  const { deckSize:n, openingSize:h, prizeCount:p, basicCount:b,
    targetBasicCount:v, stageOneCount:m, bonusDraws:d = 0 } = input;
  const counts = [n, h, p, b, v, m, d];
  if (counts.some(x => !Number.isInteger(x)) || h < 1 || p < 0 || d < 0 ||
      v < 0 || m < 0 || v > b || b < 1 || b + m > n ||
      h + p + d + 2 > n) throw new RangeError('Inconsistent deck, opening, Prize or draw counts');

  const t1 = h + d + 1;
  const t2 = t1 + 1;
  const valid = 1 - Number(choose(n - b, h)) / Number(choose(n, h));
  // Complement: no target Basic among opener, bonus cards and T1 draw.
  const noVValid = avoids(n, t1, n, v) *
    (1 - Number(choose(n - b, h)) / Number(choose(n - v, h)));
  // Complement: no matching Stage 1 through the T2 draw.
  const noMValid = avoids(n, t2, n, m) *
    (1 - Number(choose(n - m - b, h)) / Number(choose(n - m, h)));
  // Intersection: neither class by T1, then no Stage 1 in the T2 draw.
  const noBothT1 = Number(choose(n - v - m, t1)) / Number(choose(n, t1));
  const noMOnT2 = (n - t1 - m) / (n - t1);
  const legalOpenerGivenNoBoth = 1 -
    Number(choose(n - m - b, h)) / Number(choose(n - v - m, h));
  const bothValid = noBothT1 * noMOnT2 * legalOpenerGivenNoBoth;
  const joint = valid - noVValid - noMValid + bothValid;
  return {openingValid:valid, unconditional:joint, conditional:joint / valid};
}

/** @param {object} deck @param {Map<string, boolean|null>} index */
function countsFromDeck(deck, index) {
  if (deck.cards.reduce((sum, row) => sum + row.count, 0) !== 60) {
    throw new Error('Expected complete 60-card deck');
  }
  let basicCount = 0;
  for (const card of deck.cards.filter(c => c.category === 'Pokémon')) {
    const basic = index.get(normalizeName(card.name));
    if (typeof basic !== 'boolean') throw new Error('Unresolved Pokémon stage: ' + card.name);
    if (basic) basicCount += card.count;
  }
  const count = name => deck.cards.filter(c => c.name === name).reduce((s,c) => s + c.count,0);
  return {basicCount, targetBasicCount:count('Shadow Rider Calyrex V'),
    stageOneCount:count('Shadow Rider Calyrex VMAX')};
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const dir = path.join(root, 'results/aichi-2026');
  const source = JSON.parse(fs.readFileSync(path.join(dir, 'full-decklists.json'),'utf8'));
  const decks = [
    ['champion-reference', source.decks.find(d => d.rank === 1)],
    ['hood-shield-v1', JSON.parse(fs.readFileSync(path.join(dir,'candidate-hood-shadow-rider.json'),'utf8'))],
    ['temple-v1', JSON.parse(fs.readFileSync(path.join(dir,'candidate-temple-shadow-rider.json'),'utf8'))],
  ];
  const index = loadBasicIndex(path.join(root,'resources/cards/en'));
  for (const [label,deck] of decks) {
    const counts = countsFromDeck(deck,index);
    const chances = [0,1,2].map(bonusDraws => naturalEvolutionChance({
      deckSize:60,openingSize:7,prizeCount:6,...counts,bonusDraws,
    }).conditional);
    process.stdout.write(JSON.stringify({label,...counts,chances})+'\n');
  }
}

module.exports = {choose,naturalEvolutionChance,countsFromDeck};
