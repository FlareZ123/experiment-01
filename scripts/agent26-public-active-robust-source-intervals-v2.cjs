'use strict';
const assert=require('node:assert/strict');
const {publicActiveRobustIntervals,
  VERSION:OLD_VERSION}=
  require('./agent26-public-active-robust-source-intervals.cjs');
const {maximumLegalHistoryLikelihood,VERSION:DP_VERSION}=
  require('./agent26-prism-joint-mulligan-envelope.cjs');

const VERSION='agent26-public-active-robust-source-intervals-v2-strict-caps';

/**
 * The original known-source likelihood and owner-Active-choice intervals
 * remain unchanged. Only the hypothetical missing-source *upper*
 * likelihood is strengthened by a common physical 60-card inventory,
 * Prism singleton, global ACE SPEC singleton, and a jointly legal seven.
 *
 * @param {object} manifest 29 authenticated printed original sixties.
 * @param {string[][]} failedSevens Genuine fully shown Basic-free invalid sevens.
 * @param {string} activeName Genuine face-up ordinary Basic Pokemon name.
 * @param {{maxActiveCopies?:number,copyCaps?:Record<string,number>}} [options]
 * @returns {object} Floating displays of valid posterior interval bounds.
 */
function strictPublicActiveRobustIntervals(manifest,failedSevens,activeName,options={}){
  assert.ok(options&&typeof options==='object');
  const old=publicActiveRobustIntervals(manifest,failedSevens,activeName);
  const maxActiveCopies=options.maxActiveCopies??4;
  const strict=maximumLegalHistoryLikelihood(failedSevens,{
    maxActiveCopies,copyCaps:options.copyCaps??{}});
  const singleMissingStrict=strict.probabilityUpper;
  // The older module's product-of-independent-maxima is another valid
  // upper bound. Its floating estimate can differ in the last digit.
  const olderSingleMissing=old.omittedTotalLikelihoodUpper===undefined?
    0:old.omittedTotalLikelihoodUpper/3;
  const missingUpper=3*Math.min(olderSingleMissing,singleMissingStrict);
  const base={...old,version:VERSION,
    previousVersion:OLD_VERSION,strictSolverVersion:DP_VERSION,
    activeCopyCap:maxActiveCopies,
    strictMissingSingleSourceUpper:Math.min(olderSingleMissing,singleMissingStrict),
    strictMissingRaw:strict,
    omittedTotalLikelihoodUpper:missingUpper,
    strictUnknownSixty:true,strictACEandPrismRules:true,
    competitiveQualifiedGames:0};
  const knownLower=old.totalKnownLikelihoodLower??0;
  const knownUpper=old.totalKnownLikelihoodUpper??0;
  if(knownUpper===0&&missingUpper===0)return{
    ...base,status:'OUTSIDE_SUPPORTED_32_SOURCE_EVENT',
    sources:[],ranges:[],knownPosteriorMassLower:0,
    unknownPosteriorMassUpper:0};
  const denom=knownLower+missingUpper;
  const ratio=(n,d)=>d===0?0:n/d;
  const ranges=old.ranges.map(row=>{
    const otherUpper=Math.max(0,knownUpper-row.upperEvent);
    return {...row,
      posteriorLower:ratio(row.lowerEvent,
        row.lowerEvent+otherUpper+missingUpper)};
  });
  return {...base,status:knownUpper===0?'KNOWN_29_IMPOSSIBLE':'BOUNDED',
    ranges,
    knownPosteriorMassLower:ratio(knownLower,denom),
    unknownPosteriorMassUpper:ratio(missingUpper,denom)};
}
module.exports={VERSION,strictPublicActiveRobustIntervals};
