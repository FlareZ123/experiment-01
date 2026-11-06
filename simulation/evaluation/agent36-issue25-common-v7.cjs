'use strict';
const assert=require('node:assert/strict');
const {hashRegisteredFile}=require('./agent36-issue25-selected-v0.cjs');
const {runStewardCommonV6}=require('./agent36-issue25-common-v6.cjs');
const {withStewardInnermostOwnerPrompts}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withOwnerVoltTransfer}=
  require('../twinleaf/agent4-allturn-owner-volt-attach-energy.cjs');
const VERSION='agent36-issue25-common-volt-v7-retro-96root';
const REGISTRATION_PATH=
  'results/aichi-2026/registrations/agent36-issue25-common-v7-volt-prompt-retro-20261106.json';
const HASH_PATHS=[
  'simulation/evaluation/agent36-issue25-common-v7.cjs',
  REGISTRATION_PATH,
  'simulation/twinleaf/agent4-allturn-owner-volt-attach-energy.cjs',
  'tests/agent36-issue25-common-v7.test.cjs',
  'tests/agent36-issue25-common-v7.native.test.cjs'
];
/**
 * Apply a single owner-only mandatory Volt transfer handler within actual
 * per-game native Store dispatch. The real prompting Store validates payment.
 * @template T
 * @param {()=>T} next
 * @param {{headless?:{runMatch:Function},voltLayer?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerVoltAcrossNativeMatches(next,deps={}){
  assert.equal(typeof next,'function');
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const voltLayer=deps.voltLayer??withOwnerVoltTransfer;
  const prior=headless.runMatch;
  assert.equal(typeof prior,'function');
  assert.equal(typeof voltLayer,'function');
  const attempts=[];
  function nativeVoltMatch(request){
    try{
      const observed=voltLayer(()=>prior(request));
      attempts.push({label:request.label??null,
        status:'returned-unqualified',volt:observed.audit??null});
      return observed.result;
    }catch(error){
      attempts.push({label:request?.label??null,
        status:'engine-aborted-unqualified',
        volt:error?.nativeOwnerVoltAttemptAudit??null});
      throw error;
    }
  }
  headless.runMatch=nativeVoltMatch;
  try{
    const result=next();
    return {result,audit:{schema:VERSION,
      nativeMatchCount:attempts.length,
      attempts,
      commonOwnerVoltBothSeats:true,
      paperGameQualified:false
    }};
  }finally{
    assert.strictEqual(headless.runMatch,nativeVoltMatch);
    headless.runMatch=prior;
  }
}
/**
 * Retrospective original v6 exact-deal treatment; change only the generic
 * genuine actor's owner-held mandatory Volt Cyclone Energy transfer response.
 * @param {{runner?:Function,layers?:object,attackLayer?:Function,
 *   baseOwnerPromptLayer?:Function,headless?:object,voltLayer?:Function,
 *   env?:NodeJS.ProcessEnv}} [deps]
 */
function runStewardCommonVoltV7(deps={}){
  const ownerLayer=deps.baseOwnerPromptLayer??
    withStewardInnermostOwnerPrompts;
  const selected=runStewardCommonV6({
    ...deps,
    innerLayer:next=>{
      const layer=withOwnerVoltAcrossNativeMatches(
        ()=>ownerLayer(next),{
          headless:deps.headless,voltLayer:deps.voltLayer
        });
      assert.ok(layer.result&&typeof layer.result==='object');
      return {result:layer.result.result,
        audit:{nativeVolt:layer.audit,
          preexistingPrizeAndPromotion:layer.result.audit??null}};
    }
  });
  const volt=selected.diagnostic.innerNativeOwnerPromptAudit?.nativeVolt;
  return {
    manifest:{
      ...selected.manifest,
      version:VERSION,
      policyEntryPoint:HASH_PATHS[0],
      treatmentRegistration:REGISTRATION_PATH,
      profile:'retrospective-original-v6-96root-owner-volt-v7',
      selectedV6UnderlyingRootAndPrintedSixtiesUnchanged:true,
      commonOwnerVoltPromptBothSeats:true,
      fullPaperEffectCoverageCertified:false,
      resolvedSourceAndPolicyHashes:[
        ...selected.manifest.resolvedSourceAndPolicyHashes,
        ...HASH_PATHS.map(hashRegisteredFile)
      ],
      releaseQualified:false,competitiveGamesQualified:0
    },
    diagnostic:{
      ...selected.diagnostic,
      schema:VERSION,
      originalV6ArchiveSha256:
        'ecff915c5cb7a8c573fb790c00b7c5134949ec6f70a2bb6b357c6cceb55bd964',
      ownerVoltMatchAudit:volt??null,
      ownerVoltSelectedPromptCount:(volt?.attempts??[]).reduce((n,x)=>
        n+(x.volt?.ownerPromptChoices??0),0),
      verdict:'FAIL-retrospective-v7-paper-policy-and-clock-unverified',
      competitiveGamesQualified:0,estimatedWinRate:null
    },
    rawDevelopment:selected.rawDevelopment
  };
}
module.exports={VERSION,REGISTRATION_PATH,HASH_PATHS,
  withOwnerVoltAcrossNativeMatches,runStewardCommonVoltV7};
