'use strict';
const assert = require('node:assert/strict');
const { C, loadCounts, census, censusAfterFirstDraw } =
  require('./rank11-boostshake-opening-census.cjs');

/**
 * Exact first-turn source line using Oranguru V Back Order (searches two Tools)
 * and, if needed, Forest Seal Stone Star Alchemy (searches Boost Shake).
 * This permits playing VIP for Trubbish. It ignores other Trainer draw/search,
 * opposing lock, and decision quality. The Oranguru V must have been in the
 * original seven, chosen Active during setup.
 */
const CARD = Object.freeze({
  oranguru:0, vip:1, float:2, seal:3, shake:4, trubbish:5,
  garbodor:6, crobat:7, muscle:8, otherBasic:9, other:10
});
const SEARCHABLE = [2,3,4,5,6,8];
const memo = new Map();

/** @param {number} n @param {number} k @returns {bigint} */
function combinations(n, k) {
  if (k < 0 || k > n || n < 0) return 0n;
  const key = n * 16 + k;
  if (!memo.has(key)) memo.set(key,C(n,k));
  return memo.get(key);
}

/** @param {number[]} h @param {number[]} deck @returns {boolean} */
function hasTrubbish(h,deck) {
  return h[CARD.trubbish] > 0 ||
    h[CARD.vip] > 0 && deck[CARD.trubbish] > 0;
}
/** @param {number[]} h @param {number[]} deck @returns {boolean} */
function broadBaseline(h,deck) {
  if (!hasTrubbish(h,deck) || !deck[CARD.garbodor]) return false;
  const heldTools = h[CARD.float]+h[CARD.seal]+h[CARD.muscle];
  if (h[CARD.shake]) return heldTools > 0;
  if (!h[CARD.seal] || !deck[CARD.shake]) return false;
  const v = h[CARD.oranguru]+h[CARD.crobat] > 0 ||
    h[CARD.vip] > 0 && deck[CARD.oranguru]+deck[CARD.crobat] > 0;
  return v && (h[CARD.float]+h[CARD.muscle] > 0 ||
    h[CARD.seal] >= 2);
}

/**
 * Given Oranguru V already Active at setup, determine if its Back Order
 * search and the VSTAR Ability can build a Tool-bearing Garbodor on own T1.
 * Star Alchemy must be spent before Garbotoxin suppresses non-Garbotoxin
 * Abilities. Every deck search target is checked against cards left in deck.
 * @param {number[]} h @param {number[]} deck @returns {boolean}
 */
function oranguruLine(h,deck) {
  if (!h[CARD.oranguru] || !hasTrubbish(h,deck) ||
      !deck[CARD.garbodor]) return false;
  const toolInHand = h[CARD.float]+h[CARD.seal]+h[CARD.muscle];
  const deckTools = deck[CARD.float]+deck[CARD.seal]+deck[CARD.muscle];
  if (h[CARD.shake]) return toolInHand+deckTools > 0;
  if (!deck[CARD.shake]) return false;
  if (h[CARD.seal]) {
    return h[CARD.float]+h[CARD.muscle]>0 ||
      h[CARD.seal]>1 || deckTools>0;
  }
  return deck[CARD.seal]>0 && (
    h[CARD.float]+h[CARD.muscle]>0 || deckTools>=2);
}

/**
 * Enumerate all uniform 6-Prize selections over the six source-relevant
 * category buckets; the rest share one combinatorial 'other' bucket.
 * This handles threshold conditions such as two separate Tools.
 * @param {number[]} total @param {number[]} h @param {number} pool
 * @param {(deck:number[],ways:bigint)=>void} apply
 */
function enumeratePrizes(total,h,pool,apply) {
  const rem = total.map((n,i)=>n-h[i]);
  const otherPool = pool -
    SEARCHABLE.reduce((sum,i)=>sum+rem[i],0);
  const prize = Array(total.length).fill(0);
  /** @param {number} position @param {number} left @param {bigint} ways */
  function pick(position,left,ways) {
    if (position===SEARCHABLE.length) {
      const resultWays=ways*combinations(otherPool,left);
      if (!resultWays) return;
      const deck=rem.map((n,i)=>n-prize[i]);
      // Remaining deck excludes the 6 Prize cards, including hidden copies.
      apply(deck,resultWays);
      return;
    }
    const bucket=SEARCHABLE[position];
    for (let count=0;count<=Math.min(left,rem[bucket]);count++) {
      prize[bucket]=count;
      pick(position+1,left-count,ways*combinations(rem[bucket],count));
    }
    prize[bucket]=0;
  }
  pick(0,6,1n);
}

/**
 * Source worlds with an available initial Oranguru V, even if an opponent
 * turns out to make Back Order unusable. For eight-card effective hands,
 * designated first-draw positions cannot be the only Oranguru V.
 * @param {boolean} [firstDraw=false]
 * @returns {Record<string,bigint>}
 */
function backOrderCensus(firstDraw=false) {
  const total=loadCounts();
  assert.deepEqual(total,[2,4,3,2,2,2,2,1,1,6,35]);
  const sampleSize=firstDraw?8:7;
  const pool=60-sampleSize;
  const h=Array(total.length).fill(0);
  const result={
    oranguruOpening:0n, backOrderAll:0n, incremental:0n,
    newWithShake:0n, newWithStarAlchemy:0n
  };
  /** @param {number} i @param {number} remaining @param {bigint} ways */
  function opening(i,remaining,ways) {
    if (i===total.length) {
      if (remaining || !h[CARD.oranguru]) return;
      const drawWays=firstDraw ?
        (h[CARD.oranguru]>1?8n:7n) : 1n;
      const physical=ways*drawWays;
      result.oranguruOpening+=physical*combinations(pool,6);
      if (!h[CARD.trubbish] && !h[CARD.vip]) return;
      enumeratePrizes(total,h,pool,(deck,prizeWays)=>{
        if (!oranguruLine(h,deck)) return;
        const weight=physical*prizeWays;
        result.backOrderAll+=weight;
        if (!broadBaseline(h,deck)) {
          result.incremental+=weight;
          if (h[CARD.shake]) result.newWithShake+=weight;
          else result.newWithStarAlchemy+=weight;
        }
      });
      return;
    }
    for (let count=0;count<=Math.min(remaining,total[i]);count++) {
      h[i]=count;
      opening(i+1,remaining-count,ways*combinations(total[i],count));
    }
    h[i]=0;
  }
  opening(0,sampleSize,1n);
  const expected=firstDraw?{
    oranguruOpening:92290059159217920n,
    backOrderAll:47611686253141796n,
    incremental:39867318095329068n,
    newWithShake:5416256331282216n,
    newWithStarAlchemy:34451061764046852n
  }:{
    oranguruOpening:1963618279983360n,
    backOrderAll:914030490663652n,
    incremental:807394316048678n,
    newWithShake:99650354047082n,
    newWithStarAlchemy:707743962001596n
  };
  assert.deepEqual(result,expected,'Source-exhaustive Back Order model drift');
  return result;
}

if (require.main===module) {
  const seven=backOrderCensus();
  const eight=backOrderCensus(true);
  const basicSeven=census(),basicEight=censusAfterFirstDraw();
  const summary=(b,base)=>{
    const known=base.anyToolDirect+base.anyToolHeldSeal;
    const union=known+b.incremental;
    return {
      sourceOranguruInitiallyActiveOpportunity:
        (Number(b.oranguruOpening)*100/Number(base.valid)).toFixed(8)+'%',
      newBackOrderAndStarAlchemyOpportunity:
        (Number(b.incremental)*100/Number(base.valid)).toFixed(8)+'%',
      broadTwoRoutePreviouslyCounted:
        (Number(known)*100/Number(base.valid)).toFixed(8)+'%',
      deduplicatedCombinedOpportunity:
        (Number(union)*100/Number(base.valid)).toFixed(8)+'%',
      exactNumerators:Object.fromEntries(
        [...Object.entries(b),['combined',union]].map(([k,v])=>[k,String(v)])),
      validDenominator:String(base.valid),
      qualifiedCompetitiveGames:0
    };
  };
  console.log(JSON.stringify({
    sourceRank:11,
    assumptions:'First-turn rules-visible setup, Oranguru in initial seven chosen Active, uniform six Prizes, own normal draw only, no opponent Ability lock',
    initialSeven:summary(seven,basicSeven),
    afterFirstNormalDraw:summary(eight,basicEight)
  },null,2));
}
module.exports={CARD,hasTrubbish,broadBaseline,oranguruLine,
  enumeratePrizes,backOrderCensus};
