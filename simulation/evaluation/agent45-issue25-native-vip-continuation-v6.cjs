'use strict';

const assert=require('node:assert/strict');
const {withOwnerFirstPrizeReveal}=
  require('../twinleaf/agent21-owner-first-prize-reveal.cjs');
const {withNativeSelectedVipOwnerSearch}=
  require('../twinleaf/agent45-native-selected-vip-owner-search.cjs');
const {withStewardInnermostOwnerPrompts,runStewardInnermostPrizeV5}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent45-issue25-v6-retro-native-selected-vip-owner-continuation';
const SOURCE_PATHS=Object.freeze([
  'simulation/twinleaf/agent45-native-selected-vip-owner-search.cjs',
  'simulation/evaluation/agent45-issue25-native-vip-continuation-v6.cjs',
  'tests/agent45-native-selected-vip-owner-search.test.cjs',
  'tests/agent45-issue25-native-vip-v6.test.cjs',
  'tests/agent45-issue25-native-vip-v6.native.test.cjs'
]);

/**
 * One additive source-stamped owner-deck continuation wrapped directly
 * around the native runMatch. Original selected v4 policy and v5 Prize and
 * promotion decisions execute unchanged. The new handler acts only when a
 * real Store dispatch of held Battle VIP Pass created that owner's prompt.
 *
 * @template T
 * @param {()=>T} next Synchronous original eight-registered-arm development.
 * @param {{vipLayer?:Function,prizeLayer?:Function,
 *   ownerLayer?:Function,ownerOptions?:object,vipOptions?:object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withAgent45NativeVipInsideStewardV5(next,deps={}){
  assert.equal(typeof next,'function');
  const vip=deps.vipLayer??withNativeSelectedVipOwnerSearch;
  const prize=deps.prizeLayer??withOwnerFirstPrizeReveal;
  const owner=deps.ownerLayer??withStewardInnermostOwnerPrompts;
  const observed=[];
  const selected=owner(next,{
    ...deps.ownerOptions,
    prize:run=>{
      return prize(()=>{
        try{
          const handled=vip(run,deps.vipOptions);
          observed.push({
            status:'returned-unqualified',
            audit:handled.audit??null
          });
          return handled.result;
        }catch(error){
          observed.push({
            status:'engine-aborted-unqualified',
            audit:error?.agent45NativeSelectedVipAudit??null
          });
          throw error;
        }
      });
    }
  });
  return {
    result:selected.result,
    audit:{
      ...selected.audit,selectedNativeVipOwnerAttemptAudits:observed,
      selectedNativeVipOwnerAttemptCount:observed.length,
      appliedAtActualInnerNativeStore:true,
      originalV4StillStewardSelected:true,
      paperEntireGameQualified:false,competitiveGamesQualified:0
    }
  };
}

/**
 * Matched retrospective diagnostic; retains original eight 48-root
 * registrations, printed 60s, and all unqualified abort/cap dispositions.
 * An observed rescue is only a policy-liveness result.
 *
 * @param {object} [deps] Pure seam passed to original native development.
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runAgent45Issue25VipV6(deps={}){
  const selected=runStewardInnermostPrizeV5({
    ...deps,innerLayer:deps.innerLayer??withAgent45NativeVipInsideStewardV5
  });
  return {
    manifest:{
      ...selected.manifest,version:VERSION,
      profile:'retrospective-original-eight-48-root-v5-plus-printed-native-vip-prompt',
      policyEntryPoint:SOURCE_PATHS[1],
      primarySelectedDevelopmentBaseline:
        'agent36-issue25-steward-selected-v4-special-capture-48',
      controlledOwnerPromptTreatment:'native-selected-Battle-VIP-only',
      newNativePromptHandlerBothSeats:true,
      originalNativeRootActionLimit:48,
      resolvedSourceAndPolicyHashes:[
        ...selected.manifest.resolvedSourceAndPolicyHashes,
        ...SOURCE_PATHS.map(hashRegisteredFile)
      ],
      releaseQualified:false,competitiveGamesQualified:0
    },
    diagnostic:{
      ...selected.diagnostic,schema:VERSION,
      nativeVipOwnerPromptAttemptAudits:
        selected.diagnostic.innerNativeOwnerPromptAudit?.
          selectedNativeVipOwnerAttemptAudits??[],
      qualifiedPaperMatchCount:0,
      verdict:'FAIL-retrospective-source-prompt-liveness-only',
      competitiveGamesQualified:0
    },
    rawDevelopment:selected.rawDevelopment
  };
}

module.exports={VERSION,SOURCE_PATHS,
  withAgent45NativeVipInsideStewardV5,runAgent45Issue25VipV6};
