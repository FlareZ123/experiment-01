'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {withOwnerPrizeAndPromotion,runIssue25PrizeAndPromotionV13}=
  require('./agent20-issue25-inner-prize-promotion-v13.cjs');
const {withNativePrizeZoneCustody}=
  require('../twinleaf/agent20-native-prize-zone-custody.cjs');

const VERSION='agent20-issue25-v14-verified-native-owner-prize-zone-counts';
const SOURCE='simulation/evaluation/agent20-issue25-prize-custody-v14.cjs';
const ROOT=path.resolve(__dirname,'../..');
const sha256=value=>createHash('sha256').update(value).digest('hex');

/**
 * Read-only physical zone-count observer is installed at the native Store
 * AFTER both owner-only decision wrappers. It cannot change decision
 * actions; the original physical Prize cards remain opaque. Genuine
 * native Store rather than speculative Simulator dispatch is counted.
 *
 * @template T
 * @param {()=>T} execute
 * @param {{composition?:Function,zone?:Function}} [deps] Pure-test seam.
 * @returns {{result:T,audit:object}}
 */
function withOwnerPrizePromotionAndCustody(execute,deps={}){
  assert.equal(typeof execute,'function');
  const composition=deps.composition??withOwnerPrizeAndPromotion;
  const observe=deps.zone??withNativePrizeZoneCustody;
  assert.equal(typeof composition,'function');
  assert.equal(typeof observe,'function');
  let custody=null;
  try{
    const result=composition(()=>{
      try{
        const found=observe(execute);
        custody=found.audit;
        return found.result;
      }catch(error){
        custody=error?.agent20PrizeZoneCustodyAudit??null;
        throw error;
      }
    });
    return {result:result.result,audit:{
      version:VERSION,
      ...result.audit,
      nativePrizeZoneCustody:custody,
      noConcealedPrizeFaceInspection:true,
      noDecisionChangeFromCustody:true,
      competitiveGamesQualified:0
    }};
  }catch(error){
    if(error&&typeof error==='object')
      error.agent21OwnerPrizeAudit={
        ...error.agent21OwnerPrizeAudit,
        nativePrizeZoneCustody:custody,
        competitiveGamesQualified:0
      };
    throw error;
  }
}

/**
 * Same previously registered eight actual original paper 60s against
 * candidate 60s; compare genuine native root25 and source promotion26.
 *
 * @param {{runner?:Function,ownerPrizeChoice?:Function}} [deps]
 * @returns {object}
 */
function runIssue25PrizeCustodyV14(deps={}){
  const res=runIssue25PrizeAndPromotionV13({
    runner:deps.runner,
    ownerPrizeChoice:deps.ownerPrizeChoice??withOwnerPrizePromotionAndCustody
  });
  return {
    ...res,
    schema:VERSION,
    sourceCodeSha256:sha256(fs.readFileSync(path.join(ROOT,SOURCE))),
    custodySourceSha256:sha256(fs.readFileSync(path.join(ROOT,
      'simulation/twinleaf/agent20-native-prize-zone-custody.cjs'))),
    originalUnalteredV6Artifact:13353289881,
    v13NativeBaselineArtifact:13372685458,
    expectedPrintedNativePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    changesLimitedToReadOnlyPrizeZoneCustody:true,
    competitiveWinEvidence:false,
    qualifiedGames:0
  };
}

module.exports={VERSION,withOwnerPrizePromotionAndCustody,runIssue25PrizeCustodyV14};
