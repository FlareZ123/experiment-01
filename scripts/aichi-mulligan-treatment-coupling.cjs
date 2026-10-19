'use strict';

const assert = require('node:assert/strict');
const {choose} = require('./aichi-maximal-opening-coupling.cjs');

/**
 * Exact marginal mulligan and ideal sequential nested-Basic-mask coupling.
 * Each attempted seven-card opening is a fresh uniform subset. Under the
 * nested shared-index construction every Basic position in the reference is
 * also Basic in the alternate. An independent source deck has its own
 * geometric mulligan count. The source may decline extra bonus draws.
 *
 * This is a paper-setup mathematical model, not engine-observed gameplay.
 *
 * @param {{referenceBasics:number,alternateBasics:number,
 *   sourceBasics:number,deckSize?:number,openingSize?:number}} parameters
 * @returns {object}
 */
function analyzeCandidateMulliganTreatment(parameters) {
  const {
    referenceBasics,alternateBasics,sourceBasics,
    deckSize=60,openingSize=7
  }=parameters;
  assert.ok(Number.isSafeInteger(deckSize)&&deckSize>0);
  assert.ok(Number.isSafeInteger(openingSize)&&
    openingSize>=1&&openingSize<=deckSize);
  for(const basic of [referenceBasics,alternateBasics,sourceBasics]) {
    assert.ok(Number.isSafeInteger(basic)&&basic>=1&&basic<=deckSize,
      'Every participant needs a possible legal Basic opening');
  }
  assert.ok(referenceBasics<=alternateBasics,
    'Alternate Basic mask must contain the reference Basic mask');

  const denominator=choose(deckSize,openingSize);
  const referenceNoBasic=choose(deckSize-referenceBasics,openingSize);
  const alternateNoBasic=choose(deckSize-alternateBasics,openingSize);
  const sourceNoBasic=choose(deckSize-sourceBasics,openingSize);
  const pReference=Number(referenceNoBasic)/Number(denominator);
  const pAlternate=Number(alternateNoBasic)/Number(denominator);
  const pSource=Number(sourceNoBasic)/Number(denominator);
  const firstHandMismatch=pReference-pAlternate;
  const pairedTotalMulliganCountMismatch=
    firstHandMismatch/(1-pAlternate);
  const sourceBonusOfferMismatch=pairedTotalMulliganCountMismatch-
    firstHandMismatch*(1-pReference)*pSource/
    ((1-pAlternate*pSource)*(1-pReference*pSource));

  return {
    schema:'nested-basic-mulligan-treatment-mathematics-v1',
    model:'Independent fair source deck; shared fresh index permutation '+
      'at each candidate redraw with reference Basic positions nested in alternate',
    deckSize,openingSize,
    basicCounts:{reference:referenceBasics,alternate:alternateBasics,
      source:sourceBasics},
    denominator:String(denominator),
    firstMulliganNumerators:{
      reference:String(referenceNoBasic),
      alternate:String(alternateNoBasic),
      source:String(sourceNoBasic),
      excessReference:String(referenceNoBasic-alternateNoBasic)
    },
    firstMulliganProbabilities:{
      reference:pReference,alternate:pAlternate,source:pSource
    },
    absoluteFirstAttemptDiscordanceLowerBound:firstHandMismatch,
    absoluteTotalMulliganCountDiscordanceLowerBound:firstHandMismatch,
    nestedSequentialTotalMulliganCountMismatch:pairedTotalMulliganCountMismatch,
    nestedSourceBonusOfferMismatch:sourceBonusOfferMismatch,
    sourceBonusDrawsRequired:false,
    engineGamesMeasured:0,
    competitiveWinRateMeasured:false
  };
}

module.exports={analyzeCandidateMulliganTreatment};
