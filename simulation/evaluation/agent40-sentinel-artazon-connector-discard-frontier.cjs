'use strict';

const assert = require('node:assert/strict');
const {COUNTS, exactArtazonIncrement} =
  require('../../scripts/agent28-sentinel-artazon-direct-opening.cjs');

const VERSION = 'agent40-sentinel-artazon-spare-connector-payment-v1';

/**
 * Count discardable named search connectors in hand AFTER arranging to play
 * exactly one Guzma & Hala, possibly obtained through Tag Call. A Tag Call
 * played to fetch G&H is no longer in the hand. Two G&H can be fetched with
 * Tag Call if two copies remain in the deck.
 *
 * This counts physically available named cards, not strategic permission to
 * discard them. Other cards can also pay G&H; this is a sufficient subset.
 *
 * @param {number} gHand Literal Guzma & Hala in initial seven plus turn draw.
 * @param {number} tagHand Literal Tag Call in the same eight cards.
 * @param {number} gDeck Actual G&H in deck, used only in offline deal analysis.
 * @returns {number|null} Null if no modelled G&H access route.
 */
function spareConnectorCount(gHand, tagHand, gDeck) {
  for (const n of [gHand, tagHand, gDeck])
    assert.ok(Number.isSafeInteger(n) && n >= 0);
  if (gHand > 0) return gHand + tagHand - 1;
  if (tagHand > 0 && gDeck > 0)
    return tagHand - 1 + Number(gDeck >= 2);
  return null;
}

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++)
    result = result * BigInt(n - i + 1) / BigInt(i);
  return result;
}

/**
 * Refine Agent28's exact Fan-Rotom-Prized NEW direct Artazon→Bunnelby event
 * by counting the two extra cards available for G&H's optional printed
 * discard cost. This is only a physical access screen with marginal Prizes.
 * Restrict cost cards to spare printed G&H or Tag Call connectors, because
 * arbitrary other cards have state-dependent strategic discard value.
 *
 * @param {number} [bonusDraws] Optional mulligan-compensation draws accepted after Prizes.
 * @returns {{version:string,baselineNewEvent:string,zeroSpare:string,
 *   oneSpare:string,twoOrMoreSpare:string,byRoute:object,
 *   reachableSubsetPercent:number,subsetOfNewEventPercent:number}}
 */
function exactConnectorPaymentFrontier(bonusDraws=0) {
  assert.ok(Number.isSafeInteger(bonusDraws) && bonusDraws>=0 && bonusDraws<=15);
  const seen=1+bonusDraws;
  const classes = [
    ['B', COUNTS.B], ['F', COUNTS.F], ['A', COUNTS.A],
    ['O', COUNTS.O], ['G', COUNTS.G], ['T', COUNTS.T],
    ['L', COUNTS.L], ['V', COUNTS.V], ['M', COUNTS.M],
    ['J', COUNTS.J], ['X', COUNTS.X],
    ['Y', COUNTS.Y + COUNTS.C + COUNTS.R]
  ];
  assert.equal(classes.reduce((sum, [,n]) => sum + n, 0), 60);
  let states = new Map([['0,0,0,0,0,0,0', 1n]]);
  for (const [name, total] of classes) {
    const choices = [];
    for (let h = 0; h <= total; h++)
      for (let p = 0; p <= total - h; p++)
        for (let d = 0; d <= Math.min(seen, total - h - p); d++) {
          const r = total - h - p - d;
          if (name === 'B' && (h > 0 || d > 0 || r === 0)) continue;
          if (name === 'F' && p !== 1) continue;
          if (name === 'A' && p > 0) continue;
          if (name === 'O' && h + d === 0) continue;
          if (['L','V'].includes(name) && r === 0) continue;
          if (['M','J'].includes(name) && p === total) continue;
          choices.push([h,p,d,r,
            choose(total,h) * choose(total-h,p) * choose(total-h-p,d)]);
        }
    const next = new Map();
    for (const [encoded, ways] of states) {
      const [H,P,D,openingBasic,G,T,gDeck] = encoded.split(',').map(Number);
      for (const [h,p,d,r,weight] of choices) {
        if (H+h > 7 || P+p > 6 || D+d > seen) continue;
        const newBasic = openingBasic ||
          (['O','X'].includes(name) && h > 0);
        const key = [H+h,P+p,D+d,Number(Boolean(newBasic)),
          G+(name==='G'?h+d:0),
          T+(name==='T'?h+d:0),
          gDeck+(name==='G'?r:0)].join(',');
        next.set(key,(next.get(key)??0n)+ways*weight);
      }
    }
    states = next;
  }
  const byRoute = {
    direct: [0n,0n,0n], tagCall: [0n,0n,0n]
  };
  for (const [encoded, ways] of states) {
    const [H,P,D,basic,G,T,gDeck] = encoded.split(',').map(Number);
    if (H!==7 || P!==6 || D!==seen || basic!==1) continue;
    const spare = spareConnectorCount(G,T,gDeck);
    if (spare===null) continue;
    byRoute[G>0?'direct':'tagCall'][Math.min(2,spare)]+=ways;
  }
  const buckets = [0n,1n,2n].map(i => byRoute.direct[Number(i)] +
    byRoute.tagCall[Number(i)]);
  const baseline = exactArtazonIncrement();
  const sum = buckets.reduce((a,b)=>a+b,0n);
  if(bonusDraws===0) assert.equal(sum,baseline.numerator,
    'Preserve the exact original Fan-prized new-route denominator');
  const validDenominator=bonusDraws===0?baseline.validDenominator:
    (choose(60,7)-choose(46,7))*choose(53,6)*choose(47,seen);
  const stringify = counts => Object.fromEntries(
    ['zero','one','twoOrMore'].map((key,i)=>[key,counts[i].toString()]));
  return {
    version:VERSION,
    bonusDraws,
    baselineNewEvent:sum.toString(),
    zeroSpare:buckets[0].toString(),
    oneSpare:buckets[1].toString(),
    twoOrMoreSpare:buckets[2].toString(),
    byRoute:{
      direct:stringify(byRoute.direct),
      tagCall:stringify(byRoute.tagCall)
    },
    newArtazonIncrementPercent:
      100*Number(sum)/Number(validDenominator),
    reachableSubsetPercent:
      100*Number(buckets[2])/Number(validDenominator),
    subsetOfNewEventPercent:100*Number(buckets[2])/Number(sum),
    caveat:'Physical two-named-connector payment subset, not free discard, play frequency or win rate'
  };
}

if (require.main===module)
  console.log(JSON.stringify(exactConnectorPaymentFrontier(
    Number(process.argv[2]??0)),null,2));
module.exports={VERSION,spareConnectorCount,exactConnectorPaymentFrontier};
