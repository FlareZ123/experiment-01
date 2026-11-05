'use strict';

const assert=require('node:assert/strict');
const {runStewardInnermostPrizeV5,withStewardInnermostOwnerPrompts}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withOwnerTagCallHala}=
  require('../twinleaf/agent6-owner-tagcall-hala-native.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent45-issue25-owner-tagcall-v7-retrospective-eight';
const SOURCE_PATHS=Object.freeze([
  'results/aichi-2026/registrations/agent45-issue25-tagcall-v7-frozen-eight-20261105.json',
  'simulation/evaluation/agent45-issue25-owner-tagcall-v7.cjs',
  'simulation/twinleaf/agent6-owner-tagcall-hala-native.cjs',
  'simulation/twinleaf/agent6-owner-tagcall-hala-offer.cjs',
  'tests/agent45-issue25-owner-tagcall-v7.test.cjs',
  'tests/agent45-issue25-owner-tagcall-v7.native.test.cjs'
]);

/**
 * Compose the pre-existing native Tag Call owner policy INSIDE selected v5
 * owner's Prize/Promotion components, at the original headless.runMatch
 * boundary. This is required because earlier source-independent root
 * decoders may mask Tag Call when installed outside them.
 *
 * The registered printed sixties come from each genuine native match's
 * immutable submitted deckA/deckB. That gives both players knowledge of
 * their own registered 60 without reading the physical shuffled deck or
 * opponent concealed identities. K0 search probability remains a
 * card-count inference; actual K1 selection needs the accepted native
 * Tag Call prompt.
 *
 * @template T
 * @param {()=>T} next Entire selected-v5 original-eight development.
 * @param {{headless?:{runMatch:Function},ownerLayer?:Function,
 *   tagLayer?:Function,ownerOptions?:object,tagOptions?:object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerTagCallInsideSelectedV5(next,deps={}){
  assert.equal(typeof next,'function');
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const owner=deps.ownerLayer??withStewardInnermostOwnerPrompts;
  const tag=deps.tagLayer??withOwnerTagCallHala;
  const prior=headless.runMatch;
  assert.equal(typeof prior,'function');
  assert.equal(typeof owner,'function');
  assert.equal(typeof tag,'function');
  const attempts=[];

  function withRegisteredTagAtLiveMatch(request){
    assert.ok(request&&typeof request==='object');
    assert.ok(Array.isArray(request.deckA)&&request.deckA.length===60);
    assert.ok(Array.isArray(request.deckB)&&request.deckB.length===60);
    assert.ok(request.deckA.every(card=>typeof card==='string'));
    assert.ok(request.deckB.every(card=>typeof card==='string'));
    const label=request.label??null;
    try{
      const selected=tag([request.deckA,request.deckB],
        ()=>prior(request),deps.tagOptions);
      attempts.push({
        nativeMatchLabel:label,status:'returned-unqualified',
        ownerTagCallAudit:selected.audit??null
      });
      return selected.result;
    }catch(error){
      attempts.push({
        nativeMatchLabel:label,status:'engine-aborted-unqualified',
        ownerTagCallAudit:error?.ownerTagCallHalaNativeAudit??null
      });
      throw error;
    }
  }

  headless.runMatch=withRegisteredTagAtLiveMatch;
  let selected;
  try{
    selected=owner(next,{headless,...deps.ownerOptions});
  }finally{
    assert.strictEqual(headless.runMatch,withRegisteredTagAtLiveMatch,
      'Native owner Tag Call wrapper was replaced by an unrelated layer');
    headless.runMatch=prior;
  }
  return {
    result:selected.result,
    audit:{
      ...selected.audit,
      originalStewardOwnerPromptsPreserved:true,
      nativeTagCallAttempts:attempts,
      nativeTagCallMatchCalls:attempts.length,
      ownerRegisteredSixtyPerPhysicalSeat:true,
      sourceIndependentBothSeats:true,
      selectedNativeCardActionFromActualOwnerRoot:true,
      competitiveGamesQualified:0,
      paperClockVerified:false
    }
  };
}

/**
 * Original eight registered Aichi r6/r11 frozen 48-root trials only.
 * No deck change, reseed, source substitution, or win-rate inference.
 * @param {{runner?:Function,layers?:object,attackLayer?:Function,
 *   innerLayer?:Function}} [deps] Unit injection and native runner.
 */
function runAgent45OwnerTagCallV7(deps={}){
  const prior=runStewardInnermostPrizeV5({
    ...deps,
    innerLayer:deps.innerLayer??withOwnerTagCallInsideSelectedV5
  });
  const audited=prior.diagnostic.innerNativeOwnerPromptAudit??{};
  return {
    manifest:{
      ...prior.manifest,
      version:VERSION,
      policyEntryPoint:SOURCE_PATHS[1],
      originalRegistrationUnchanged:true,
      ownerTagCallTreatmentDefaultOffOutsideThisRunner:true,
      sourceIndependentBothSeats:true,
      firstTurnK0TagCallOnly:true,
      originalNativeRootActionLimit:48,
      selectedSourcePolicyUnchangedBeyondAdditiveTagCall:true,
      sourceAndPolicyHashes:[
        ...prior.manifest.resolvedSourceAndPolicyHashes,
        ...SOURCE_PATHS.map(hashRegisteredFile)
      ],
      resolvedSourceAndPolicyHashes:[
        ...prior.manifest.resolvedSourceAndPolicyHashes,
        ...SOURCE_PATHS.map(hashRegisteredFile)
      ],
      competitiveGamesQualified:0,
      releaseQualified:false
    },
    diagnostic:{
      ...prior.diagnostic,
      schema:VERSION,
      nativeOwnerTagCallAudits:audited.nativeTagCallAttempts??[],
      nativeOwnerTagCallMatchCalls:audited.nativeTagCallMatchCalls??0,
      originalOwnerPrizeAndPokemonPromptAudits:audited.nativeMatchAttempts??[],
      verdict:'FAIL-retrospective-Tag-Call-development-only',
      competitiveGamesQualified:0
    },
    rawDevelopment:prior.rawDevelopment
  };
}

module.exports={
  VERSION,SOURCE_PATHS,withOwnerTagCallInsideSelectedV5,
  runAgent45OwnerTagCallV7
};
