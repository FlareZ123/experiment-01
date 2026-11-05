'use strict';

const assert=require('node:assert/strict');
const {withStewardInnermostOwnerPrompts,runStewardInnermostPrizeV5}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withOwnerTagCallHala}=
  require('../twinleaf/agent6-owner-tagcall-hala-native.cjs');
const {withNativeHalaAfterActualTagCall}=
  require('../twinleaf/agent45-owner-ghala-after-tagcall.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent45-issue25-ghala-after-native-tagcall-v8-retro';
const HASH_PATHS=Object.freeze([
  'results/aichi-2026/registrations/agent45-issue25-ghala-followup-v8-20261105.json',
  'simulation/twinleaf/agent45-owner-ghala-after-tagcall.cjs',
  'simulation/evaluation/agent45-issue25-ghala-followup-v8.cjs',
  'tests/agent45-owner-ghala-after-tagcall.test.cjs',
  'tests/agent45-issue25-ghala-followup-v8.test.cjs',
  'tests/agent45-issue25-ghala-followup-v8.native.test.cjs'
]);

/**
 * Original v5 selected Prize/Promotion -> Agent6 genuinely held Tag Call
 * root+prompt -> Agent45 genuine G&H Supporter+payment+search. All source
 * printings come from the two 60s passed to a real native runMatch. No
 * separate deck, seed or native game setup is created for the treatment.
 *
 * @template T
 * @param {()=>T} next Original v5 frozen eight development.
 * @param {{headless?:{runMatch:Function},ownerLayer?:Function,
 *   tagLayer?:Function,halaLayer?:Function,ownerOptions?:object,
 *   tagOptions?:object,halaOptions?:object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withNativeTagThenGuzmaHalaInsideSelectedV5(next,deps={}){
  assert.equal(typeof next,'function');
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const owner=deps.ownerLayer??withStewardInnermostOwnerPrompts;
  const tag=deps.tagLayer??withOwnerTagCallHala;
  const hala=deps.halaLayer??withNativeHalaAfterActualTagCall;
  const prior=headless.runMatch;
  const methods=[prior,owner,tag,hala];
  assert.ok(methods.every(fn=>typeof fn==='function'));
  const audits=[];

  function withOriginalDecks(request){
    assert.ok(Array.isArray(request?.deckA)&&
      request.deckA.length===60&&
      request.deckA.every(c=>typeof c==='string'));
    assert.ok(Array.isArray(request?.deckB)&&
      request.deckB.length===60&&
      request.deckB.every(c=>typeof c==='string'));
    const decks=[request.deckA,request.deckB];
    let innerAudit=null;
    try{
      const tagged=tag(decks,()=>{
        const paid=hala(decks,()=>prior(request),deps.halaOptions);
        innerAudit=paid.audit;
        return paid.result;
      },deps.tagOptions);
      audits.push({status:'returned-unqualified',
        matchLabel:request.label??null,
        tagAudit:tagged.audit??null,halaAudit:innerAudit});
      return tagged.result;
    }catch(error){
      audits.push({status:'engine-aborted-unqualified',
        matchLabel:request.label??null,
        tagAudit:error?.ownerTagCallHalaNativeAudit??null,
        halaAudit:error?.agent45NativeGuzmaHalaAudit??innerAudit});
      throw error;
    }
  }

  headless.runMatch=withOriginalDecks;
  let selected;
  try{
    selected=owner(next,{headless,...deps.ownerOptions});
  }finally{
    assert.strictEqual(headless.runMatch,withOriginalDecks);
    headless.runMatch=prior;
  }
  return {result:selected.result,audit:{
    ...selected.audit,
    sourceIndependentNativeTagAndGHBothSeats:true,
    actualNativeMatchCalls:audits.length,
    nativeTagThenHalaAttempts:audits,
    fullPaperStrategyDominanceCertified:false,
    qualifiedCompetitiveGames:0
  }};
}

/**
 * Fail-inclusive original eight same physical starts. Retrospective v7
 * baseline is a separate run; v8 adds only genuine G&H continuation.
 * @param {{runner?:Function,layers?:object,attackLayer?:Function,
 *   innerLayer?:Function}} [deps]
 */
function runAgent45GuzmaHalaV8(deps={}){
  const selected=runStewardInnermostPrizeV5({
    ...deps,
    innerLayer:deps.innerLayer??withNativeTagThenGuzmaHalaInsideSelectedV5
  });
  const after=selected.diagnostic.innerNativeOwnerPromptAudit??{};
  const hashes=[
    ...selected.manifest.resolvedSourceAndPolicyHashes,
    ...HASH_PATHS.map(hashRegisteredFile)
  ];
  return {
    manifest:{
      ...selected.manifest,version:VERSION,
      policyEntryPoint:HASH_PATHS[2],
      original48RootCapPreserved:true,
      actualFirstTurnPrintedTagCallOwnerSearchPreserved:true,
      nativeGuzmaHalaSupporterAdditiveAndConditional:true,
      knownRegisteredPrinted60EachPhysicalOwner:true,
      qualifiedPaperGames:0,releaseQualified:false,
      resolvedSourceAndPolicyHashes:hashes
    },
    diagnostic:{
      ...selected.diagnostic,schema:VERSION,
      nativeTagThenHalaAttempts:after.nativeTagThenHalaAttempts??[],
      nativeTagThenHalaMatchCalls:after.actualNativeMatchCalls??0,
      verdict:'FAIL-retrospective-Supporter-payoff-mechanics-only',
      competitiveGamesQualified:0
    },
    rawDevelopment:selected.rawDevelopment
  };
}

module.exports={
  VERSION,HASH_PATHS,
  withNativeTagThenGuzmaHalaInsideSelectedV5,
  runAgent45GuzmaHalaV8
};
