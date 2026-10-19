'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const REGIDRAGO_RANKS = Object.freeze([10, 12, 13, 14, 18, 20, 21, 27, 32]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.ok(Number.isSafeInteger(k));
  if (k < 0 || k > n) return 0n;
  const terms = Math.min(k, n - k);
  let result = 1n;
  for (let i = 1; i <= terms; i++) {
    result = result * BigInt(n - terms + i) / BigInt(i);
  }
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/**
 * Unconditional uniformly random six-Prize subset. This is the event that
 * ALL copies of the specified cards are in the Prize cards. It does not
 * estimate the real chance that an attacker is unable to use the Ability.
 *
 * @param {number} heavyBallCopies
 * @param {number} [deckSize]
 * @param {number} [prizeCount]
 * @returns {{fraction:string,probability:number,percent:number}}
 */
function protectedLatiasPrized(heavyBallCopies, deckSize = 60, prizeCount = 6) {
  assert.ok(Number.isSafeInteger(heavyBallCopies) && heavyBallCopies >= 0);
  assert.ok(Number.isSafeInteger(deckSize) && deckSize >= 1);
  assert.ok(Number.isSafeInteger(prizeCount) && prizeCount >= 0 && prizeCount <= deckSize);
  assert.ok(heavyBallCopies + 1 <= deckSize);
  const relevant = heavyBallCopies + 1; // One printed Latias ex.
  const numerator = choose(deckSize - relevant, prizeCount - relevant);
  const denominator = choose(deckSize, prizeCount);
  const divisor = gcd(numerator, denominator);
  const probability = Number(numerator) / Number(denominator);
  return {
    fraction: String(numerator / divisor) + '/' + String(denominator / divisor),
    probability,
    percent: 100 * probability
  };
}

/** @param {object[]} cards @param {string} name @returns {number} */
function countName(cards, name) {
  return cards.filter(row => row.name === name)
    .reduce((total, row) => total + row.count, 0);
}

/**
 * Source-list census: no inferred printings, legal moves or search success.
 * @param {{decks:object[]}} manifest Published original opponent inventory.
 * @returns {{rows:object[],means:object,scope:string}}
 */
function sourceCensus(manifest) {
  assert.ok(Array.isArray(manifest?.decks));
  const rows = REGIDRAGO_RANKS.map(rank => {
    const deck = manifest.decks.find(row => row.rank === rank);
    assert.ok(deck, 'Missing original Regidrago source rank ' + rank);
    const cards = deck.cards;
    assert.ok(Array.isArray(cards));
    assert.equal(cards.reduce((n, row) => n + row.count, 0), 60,
      'Original opponent must have exactly 60 physical cards: rank ' + rank);
    const latias = countName(cards, 'Latias ex');
    const ball = countName(cards, 'Hisuian Heavy Ball');
    assert.equal(latias, 1, 'Expected singleton Latias ex: rank ' + rank);
    assert.ok(ball >= 1, 'Expected printed Prize recovery: rank ' + rank);
    return {
      rank,
      latiasEx: latias,
      hisuianHeavyBall: ball,
      tapuLeleGX: countName(cards, 'Tapu Lele-GX'),
      dedenneGX: countName(cards, 'Dedenne-GX'),
      floatStone: countName(cards, 'Float Stone'),
      airBalloon: countName(cards, 'Air Balloon'),
      escapeRope: countName(cards, 'Escape Rope'),
      guzma: countName(cards, 'Guzma'),
      primeCatcher: countName(cards, 'Prime Catcher'),
      prizeCollapse: protectedLatiasPrized(ball)
    };
  });
  const meanCollapseProbability = rows.reduce(
    (sum, row) => sum + row.prizeCollapse.probability, 0) / rows.length;
  return {
    rows,
    means: {
      latiasExPrizeProbabilityWithoutOpeningConditioning: 6 / 60,
      latiasAndAllHeavyBallsPrized: meanCollapseProbability,
      latiasAndAllHeavyBallsPrizedPercent: 100 * meanCollapseProbability
    },
    scope: 'Exact source multiplicities and uniformly random six-Prize subsets only; no turn-by-turn recovery or game win rate'
  };
}


/**
 * Exact probability that Latias is Prized and a Heavy Ball is present in
 * opening seven or first normal draw, conditional on a Basic-valid opener.
 * Opening seven, setting six Prizes, then a normal draw are modeled in order.
 * No card searches, bonus draws, opponent locks or policy decisions.
 * @param {{size?:number,opening?:number,prizes?:number,basics:number,heavyBalls:number}} input
 * @returns {{numerator:string,denominator:string,probability:number,percent:number}}
 */
function directOpeningPrizeRescue(input) {
  const {size=60,opening=7,prizes=6,basics,heavyBalls}=input;
  for (const n of [size,opening,prizes,basics,heavyBalls])
    assert.ok(Number.isSafeInteger(n),'Expected integer category counts');
  if (size<=opening+prizes || opening<1 || prizes<1 || basics<1 ||
      heavyBalls<1 || basics+heavyBalls>size)
    throw new RangeError('Invalid opening-Prize count');
  const otherBasics=basics-1;
  const otherNonBasics=size-basics-heavyBalls;
  const valid=choose(size,opening)-choose(size-basics,opening);
  let numerator=0n;
  // Latias must be outside the initial seven, so a different Basic starts.
  for(let h=0;h<=Math.min(opening,heavyBalls);h++)
    for(let b=1;b<=Math.min(opening-h,otherBasics);b++){
      const n=opening-h-b;
      if(n<0||n>otherNonBasics)continue;
      const ways=choose(heavyBalls,h)*choose(otherBasics,b)*
        choose(otherNonBasics,n);
      // Conditional on opening Latias exclusion, its Prize probability is
      // prizes/(size-opening). If no Ball was in the opening, one may be
      // the ordinary draw with chance heavyBalls/(size-opening-1).
      numerator+=ways*BigInt(prizes)*
        BigInt(h>0?size-opening-1:heavyBalls);
    }
  const denominator=valid*BigInt(size-opening)*BigInt(size-opening-1);
  const divisor=gcd(numerator,denominator);
  const probability=Number(numerator)/Number(denominator);
  return {numerator:String(numerator/divisor),
    denominator:String(denominator/divisor),
    probability,percent:100*probability};
}

/**
 * Resolve source Basic counts independently of Pokémon-name inference.
 * @param {{decks:object[]}} manifest Exact original published 60s.
 * @param {{decks:object[]}} openingAudit Printed Basic opener audit.
 * @returns {{rows:object[],meanPercent:number,claim:string}}
 */
function sourceDirectRescueCensus(manifest,openingAudit){
  assert.ok(Array.isArray(openingAudit?.decks));
  const rows=sourceCensus(manifest).rows.map(row=>{
    const audit=openingAudit.decks.find(x=>x.rank===row.rank);
    assert.ok(audit && audit.basic_count_known>=1 &&
      Array.isArray(audit.unresolved_pokemon) &&
      audit.unresolved_pokemon.length===0,
      'Unknown Basic opener information for Regidrago rank '+row.rank);
    return {rank:row.rank,basics:audit.basic_count_known,
      heavyBalls:row.hisuianHeavyBall,
      ...directOpeningPrizeRescue({
        basics:audit.basic_count_known,heavyBalls:row.hisuianHeavyBall
      })};
  });
  return {rows,meanPercent:rows.reduce((s,row)=>s+row.percent,0)/rows.length,
    claim:'Latias Prized and printed Heavy Ball in opening seven or first normal draw given Basic-valid opener; excludes access through search and all gameplay outcomes'};
}

if (require.main === module) {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'), 'utf8'));
  const openingAudit=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/opening-hand-audit.json'),'utf8'));
  process.stdout.write(JSON.stringify({
    ...sourceCensus(manifest),
    directOpeningPrizeRescue:sourceDirectRescueCensus(manifest,openingAudit)
  },null,2)+'\n');
}

module.exports = {REGIDRAGO_RANKS, choose, protectedLatiasPrized, countName, sourceCensus,
  directOpeningPrizeRescue, sourceDirectRescueCensus};
