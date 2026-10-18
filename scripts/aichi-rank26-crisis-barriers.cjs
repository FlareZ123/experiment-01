'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k)) {
    throw new TypeError('Combination arguments must be integers');
  }
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    result = result * BigInt(n - Math.min(k, n - k) + i) / BigInt(i);
  }
  return result;
}

/**
 * Exact joint counts for an opening hand containing any Basic.
 * M: sole specified Basic attacker. D: unique Special Energy.
 * T: sole Prize-redeal Ticket. R: sole own-Active switching Item.
 * A: D,T both Prized. B: M forced Active, R,T both Prized.
 * These block the first-turn specific attack, without proving game loss.
 *
 * @param {{deckSize:number,basicCount:number,handSize:number,prizeCount:number}} options
 */
function hardCrisisBarriers(options) {
  const {deckSize:N,basicCount:B,handSize:h,prizeCount:p} = options;
  if (![N,B,h,p].every(Number.isInteger) || B < 1 || N-B < 3 ||
      h < 1 || p < 3 || N-h < p) {
    throw new RangeError('Invalid finite-population parameters');
  }
  const validHands = choose(N,h) - choose(N-B,h);
  const prizeWays = choose(N-h,p);
  const denominator = validHands * prizeWays;
  const a = (choose(N-2,h) - choose(N-B-2,h)) *
    choose(N-h-2,p-2);
  const b = choose(N-B-2,h-1) * choose(N-h-2,p-2);
  const intersection = choose(N-B-3,h-1) * choose(N-h-3,p-3);
  const union = a + b - intersection;
  const format = numerator => ({
    favorableDeals: numerator.toString(),
    totalDeals: denominator.toString(),
    probability: Number(numerator) / Number(denominator),
    percent: 100 * Number(numerator) / Number(denominator)
  });
  return {
    model:'rank26-first-turn-crisis-hard-barriers-v1',
    deckSize:N,basicCount:B,handSize:h,prizeCount:p,
    bothSpecialEnergyAndTicketPrized:format(a),
    forcedMeloettaActiveAndRopeTicketPrized:format(b),
    overlap:format(intersection),
    unionLowerBoundOnNoFirstTurnCrisis:format(union),
    interpretation:'Physical deal subsets only; full-game wins and competent play are not measured.'
  };
}

/** @param {string} root */
function sourceRank26Barriers(root) {
  const manifest = JSON.parse(fs.readFileSync(path.join(
    root,'results/aichi-2026/full-decklists.json'),'utf8'));
  const deck = manifest.decks.find(row=>row.rank===26);
  if (!deck || deck.cards.reduce((s,c)=>s+c.count,0)!==60 ||
      deck.category_counts['Pokémon']!==12 ||
      deck.category_counts['Energy']!==3) {
    throw new Error('Rank 26 source inventory changed or unavailable');
  }
  for (const [name,set,number] of [
    ['Meloetta ex','BLK','44'],
    ['Double Colorless Energy','SUM','136'],
    ['Redeemable Ticket','JTG','156'],
    ['Escape Rope','BST','125']
  ]) {
    const found=deck.cards.filter(c=>c.name===name &&
      c.printing?.set===set && String(c.printing?.number)===number);
    if (found.length!==1 || found[0].count!==1) {
      throw new Error('Missing exact rank 26 singleton: '+name);
    }
  }
  if (deck.cards.find(c=>c.name==='Lightning Energy')?.count!==2) {
    throw new Error('Changed alternate Energy inventory');
  }
  return hardCrisisBarriers({
    deckSize:60,basicCount:12,handSize:7,prizeCount:6
  });
}

if (require.main === module) {
  console.log(JSON.stringify(sourceRank26Barriers(path.resolve(__dirname,'..')),null,2));
}
module.exports={choose,hardCrisisBarriers,sourceRank26Barriers};
