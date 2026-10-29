'use strict';

const assert = require('node:assert/strict');
const {censusAfterFirstDraw} = require('./rank11-boostshake-opening-census.cjs');

function calibrate(distinctDeals, sourceFirstDeals) {
  assert.ok(Number.isSafeInteger(distinctDeals) && distinctDeals >= 0);
  assert.ok(Number.isSafeInteger(sourceFirstDeals) && sourceFirstDeals >= 0 && sourceFirstDeals <= distinctDeals);
  const counts = censusAfterFirstDraw();
  const probability = Number(counts.anyToolDirect) / Number(counts.valid);
  return {
    directEventCount: String(counts.anyToolDirect),
    legalEventCount: String(counts.valid),
    probability,
    expectedOpportunities: distinctDeals * probability,
    idealizedNoSourceFirstOpportunity: (1 - probability) ** sourceFirstDeals,
    idealizedExactlyOneOpportunity: distinctDeals * probability * (1 - probability) ** (distinctDeals - 1),
    competitiveQualified: false
  };
}

if (require.main === module) console.log(JSON.stringify(calibrate(8, 6), null, 2));
module.exports = {calibrate};
