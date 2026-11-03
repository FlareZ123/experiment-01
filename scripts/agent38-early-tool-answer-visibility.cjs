'use strict';

const assert=require('node:assert/strict');
const {choose}=require('./agent38-arven-shake-opening.cjs');

/**
 * Exact direct-draw visibility of at least one marked Trainer card, given
 * that the initial seven contain >=1 Basic Pokémon.
 *
 * Random initial opening from N, then exactly ordinaryDraws random cards
 * from the remainder. Six original Prize cards between these actions do not
 * alter the marginal unordered distribution of future normal draws when
 * there are no intervening searches, deck edits, replacements or rewards.
 * Basic and answer sets must be disjoint (the listed Tool-answer cards are
 * Trainers). No playability or strategic use is inferred.
 *
 * @param {{deckSize:number,basicCount:number,answerCount:number,
 *    openingSize:number,ordinaryDraws:number}} q
 * @returns {object} Exact conditional count and probability.
 */
function seenAnswerConditionalValidOpening(q){
  const {deckSize:N,basicCount:B,answerCount:C,openingSize:h,
    ordinaryDraws:d}=q;
  assert.ok([N,B,C,h,d].every(n=>Number.isSafeInteger(n)&&n>=0));
  assert.ok(N>0&&B>0&&B+C<=N&&h>=1&&h+d<=N);
  const validInitial=choose(N,h)-choose(N-B,h);
  assert.ok(validInitial>0n);
  const expected=validInitial*choose(N-h,d);
  const noAnswerValidInitial=choose(N-C,h)-choose(N-B-C,h);
  const noAnswerAnyDraws=(N-C-h<d?0n:
    noAnswerValidInitial*choose(N-C-h,d));
  const withAnswer=expected-noAnswerAnyDraws;
  assert.ok(withAnswer>=0n&&withAnswer<=expected);
  return {
    numerator:String(withAnswer),denominator:String(expected),
    answerSeenProbability:Number(withAnswer)/Number(expected),
    noAnswerProbability:Number(noAnswerAnyDraws)/Number(expected),
    scope:'At least one listed Trainer drawn naturally by the given observation '+
      'horizon conditional on a Basic-valid opening, with no search/other draw.'
  };
}

/**
 * Individually print-verified Basic counts from published original source
 * ranks: all source Pokémon are Basic except rank1's 4 CRE VMAX,
 * rank5's 3 FST VMAX and rank11's 2 BKP Garbodor. Ranks6/29 have four
 * Iron Thorns ex Basics; rank7 and rank30 contain only Basics.
 * This is a deliberately bounded seven-rank paper roster witness.
 */
const SOURCE_BASIC_COUNTS=Object.freeze({
  1:14,5:11,6:4,7:12,11:11,29:4,30:16
});

/**
 * @param {object} manifest Original published Aichi 60-card source roster.
 * @param {function(object):object} toolCensus Authenticated print-aware
 *   answer scanner from agent38-garbotoxin-tool-counter-census.cjs.
 * @returns {object[]} Seven original ranks, 9 naturally seen cards.
 */
function sevenSourceToolAnswerVisibility(manifest,toolCensus){
  const field=toolCensus(manifest);
  const selected=field.rows.filter(row=>
    Object.hasOwn(SOURCE_BASIC_COUNTS,row.rank));
  assert.equal(selected.length,Object.keys(SOURCE_BASIC_COUNTS).length);
  return selected.map(row=>({
    rank:row.rank,
    basicCount:SOURCE_BASIC_COUNTS[row.rank],
    directAnswerCount:row.directCounterCopies,
    ...seenAnswerConditionalValidOpening({
      deckSize:60,basicCount:SOURCE_BASIC_COUNTS[row.rank],
      answerCount:row.directCounterCopies,
      openingSize:7,ordinaryDraws:2
    })
  }));
}

module.exports={SOURCE_BASIC_COUNTS,seenAnswerConditionalValidOpening,
  sevenSourceToolAnswerVisibility};
