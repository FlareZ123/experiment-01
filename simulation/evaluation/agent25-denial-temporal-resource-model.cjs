'use strict';
const assert=require('node:assert/strict');
const VERSION='agent25-denial-temporal-resource-model-v1';
/**
 * Conditional two-owner-turn resource exchange at one Basic Energy target.
 * Baseline: Plumeria now, discard Crushing + Enhanced, remove one Energy.
 * Alternative: play Crushing first; tails => Plumeria with Enhanced + X.
 * Heads => Plumeria is reserved unless new Basic Energy is attached before
 * next owner turn, when Plumeria with Enhanced + X is used.
 * All branches ASSUME a legal native action and a fair Hammer coin.
 * Reattachment probability is a free sensitivity parameter, NEVER estimated
 * from correlated archival cases.
 *
 * @typedef {object} DenialScenario
 * @property {number} reattachmentProbability Probability r, 0..1
 * @property {number} secondDenialValue Utility D2 of T5 removal
 * @property {number} plumeriaFutureValue Opportunity utility vP
 * @property {number} enhancedFutureValue Opportunity utility vE
 * @property {number} extraDiscardCost Opportunity cost vX
 *
 * @param {DenialScenario} s Explicit purely hypothetical assumptions
 * @returns {object} Frozen conditional scenario result, never win evidence.
 */
function evaluateTemporalDenial(s){
  assert.ok(s&&typeof s==='object');
  for(const k of ['reattachmentProbability','secondDenialValue',
    'plumeriaFutureValue','enhancedFutureValue','extraDiscardCost']){
    assert.ok(typeof s[k]==='number'&&Number.isFinite(s[k])&&s[k]>=0,
      k+' must be finite and nonnegative');
  }
  const r=s.reattachmentProbability;
  assert.ok(r<=1,'Probability must be within [0,1]');
  const reserve=s.plumeriaFutureValue+s.enhancedFutureValue;
  const spent=(1+r)/2,preserved=(1-r)/2,extraDenials=r/2;
  const utility=preserved*reserve-spent*s.extraDiscardCost+
    extraDenials*s.secondDenialValue;
  return Object.freeze({
    version:VERSION,assumedCoinHeadProbability:0.5,
    assumedReattachmentProbability:r,
    baselineCardConsumption:3,
    alternativeExpectedCardConsumption:1+3*spent,
    baselineEnergyDenials:1,
    alternativeExpectedEnergyDenials:1+extraDenials,
    probabilityPlumeriaPreservedAfterSecondOwnerTurn:preserved,
    probabilityPlumeriaEventuallySpent:spent,
    baselineRelativeExpectedNetValue:utility,
    maximumExtraDiscardCostForNonnegativeValue:
      (r*s.secondDenialValue+(1-r)*reserve)/(1+r),
    scenarioFavorsHammerFirst:utility>0,
    allAlternativesAssumeNativeLegality:true,
    competitiveGameQualified:false
  });
}
module.exports={VERSION,evaluateTemporalDenial};
