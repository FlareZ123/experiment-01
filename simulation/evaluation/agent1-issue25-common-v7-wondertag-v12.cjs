'use strict';
const assert=require('node:assert/strict');
const {runStewardCommonVoltV7}=
  require('./agent36-issue25-common-v7.cjs');
const {registeredTrials}=
  require('./agent36-issue25-common-v6.cjs');
const {withStewardInnermostOwnerPrompts}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withOwnerWonderTagPrompts}=
  require('../twinleaf/agent8-owner-wondertag-prompt.cjs');
const {withWonderTagNativeShuffleCompletion}=
  require('../twinleaf/agent1-wondertag-native-shuffle-completion.cjs');
const {PREFIX}=
  require('../twinleaf/agent1-wondertag-registered-actor-witness.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent1-issue25-common-v7-wondertag-v12-innermost-native';
const REGISTRATION=
  'results/aichi-2026/registrations/agent1-v7-wondertag-innermost-v12-20261106.md';
const HASH_PATHS=[
  REGISTRATION,
  'simulation/evaluation/agent1-issue25-common-v7-wondertag-v12.cjs',
  'tests/agent1-issue25-common-v7-wondertag-v12.test.cjs',
  'tests/agent1-issue25-common-v7-wondertag-v12.native.test.cjs'
];

/**
 * Per-native-match own Wonder Tag liveness installed only after all outer
 * canonical resource/action adapters. Keep the preexisting owner Prize and
 * promotion layers and the exact native game before this adapter.
 * Physical deck contents never enter this handler's policy.
 * @template T
 * @param {()=>T} next
 * @param {{headless?:{runMatch:Function},owner?:Function,
 *   wonder?:Function,shuffle?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withInnermostOwnerWonderTagV12(next,deps={}){
  assert.equal(typeof next,'function');
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const owner=deps.owner??withStewardInnermostOwnerPrompts;
  const wonder=deps.wonder??withOwnerWonderTagPrompts;
  const shuffle=deps.shuffle??withWonderTagNativeShuffleCompletion;
  for(const f of [owner,wonder,shuffle])
    assert.equal(typeof f,'function');
  const registered=new Set(registeredTrials().map(x=>x.id));
  const attempts=[];
  const surrounded=owner(()=>{
    const before=headless.runMatch;
    assert.equal(typeof before,'function');
    function nativeWithInnermostWonderTag(request,...args){
      assert.ok(request&&typeof request.label==='string'&&
        request.label.startsWith(PREFIX),
      'Native Wonder Tag source trial must have a registered request label');
      const id=request.label.slice(PREFIX.length);
      assert.ok(registered.has(id),'Unregistered inner-native Wonder Tag trial');
      try{
        const actual=shuffle(()=>wonder(
          ()=>before.call(headless,request,...args),{
            selectSupporterIndex:context=>
              context.choices.length>0?0:-1
          }),{getCurrentTrialId:()=>id});
        attempts.push({id,status:'returned-unqualified',
          nativeOwnerShuffle:actual.audit,
          ownerWonderTag:actual.result.audit});
        return actual.result.result;
      }catch(error){
        attempts.push({id,status:'engine-error',
          nativeOwnerShuffle:error?.wonderTagNativeShuffleAudit??null,
          ownerWonderTag:error?.agent8WonderTagAudit??null});
        throw error;
      }
    }
    headless.runMatch=nativeWithInnermostWonderTag;
    try{return next();}
    finally{
      assert.strictEqual(headless.runMatch,nativeWithInnermostWonderTag,
        'Concurrent native runMatch patch replaced per-game Wonder Tag');
      headless.runMatch=before;
    }
  });
  return {result:surrounded.result,audit:{
    version:VERSION,
    nativeMatches:attempts,
    inheritedOwnerPrizeAndPokemon:surrounded.audit,
    ownerHiddenDeckNamesPublished:false,
    fullPaperCardEffectCertified:false,
    competitiveGamesQualified:0
  }};
}

/** @param {object} row */
function nativePrintedSettlement(row){
  const wonder=row.ownerWonderTag;
  const shuffle=row.nativeOwnerShuffle;
  if(!wonder||!shuffle)return false;
  return wonder.selectedSupporters>0&&
    wonder.confirmOffers>=wonder.selectedSupporters&&
    wonder.confirmed>=wonder.selectedSupporters&&
    wonder.searchOffers===wonder.selectedSupporters+
      wonder.emptySearches&&
    wonder.settledSupporterTransfers===wonder.selectedSupporters&&
    wonder.nativeAccepted===wonder.confirmed+wonder.searchOffers&&
    wonder.nativeRejected===0&&wonder.nativeUnsettled===0&&
    wonder.nativeCustodyFailures===0&&wonder.nativeMissingSearchFollowup===0&&
    shuffle.nativeTrialAttributionAvailable===true&&
    shuffle.shufflePromptsOffered===wonder.selectedSupporters&&
    shuffle.validShuffleCallbacksCompleted===wonder.selectedSupporters&&
    shuffle.shuffleCallbacksFailed===0&&
    shuffle.invalidNativeShufflePermutations===0&&
    shuffle.missingRegisteredTrialIds===0&&
    shuffle.ownerReassignedPrompts===0&&
    shuffle.allOfferedShufflesCompleted===true&&
    shuffle.offeredTrialSeats?.length===wonder.selectedSupporters&&
    shuffle.completedTrialSeats?.length===wonder.selectedSupporters&&
    JSON.stringify(shuffle.offeredTrialSeats?.map(x=>x.id+':'+x.seat).sort())===
    JSON.stringify(shuffle.completedTrialSeats?.map(x=>x.id+':'+x.seat).sort())&&
    shuffle.offeredTrialSeats.every(x=>x.id===row.id)&&
    shuffle.completedTrialSeats.every(x=>x.id===row.id);
}

/**
 * Frozen v7 native original-eight trial frame. No new strategy, opponent
 * replacement or original-print inference.
 * @param {{base?:Function,ownerLayer?:Function}} [deps]
 */
function runAgent1InnermostWonderTagV12(deps={}){
  const base=deps.base??runStewardCommonVoltV7;
  const treatment=deps.ownerLayer??withInnermostOwnerWonderTagV12;
  const executed=base({...deps,baseOwnerPromptLayer:treatment});
  const audit=executed.diagnostic?.innerNativeOwnerPromptAudit?.
    preexistingPrizeAndPromotion;
  assert.ok(Array.isArray(audit?.nativeMatches),
    'V12 requires per-native registered owner audit');
  const registered=registeredTrials();
  const sourceById=new Map(registered.map(x=>[x.id,{
    rank:x.rank,sourceSeat:x.candidateSlot==='A'?1:0
  }]));
  const attempts=audit.nativeMatches;
  assert.equal(attempts.length,registered.length);
  assert.deepEqual(attempts.map(x=>x.id).sort(),
    registered.map(x=>x.id).sort());
  const audited=attempts.map(x=>{
    const reg=sourceById.get(x.id);
    const completed=nativePrintedSettlement(x);
    const shuffle=x.nativeOwnerShuffle;
    const bySeat=shuffle?.bySeat??{0:0,1:0};
    return {
      id:x.id,rank:reg.rank,sourceSeat:reg.sourceSeat,
      nativeStatus:x.status,
      printedConfirmationOffers:x.ownerWonderTag?.confirmOffers??null,
      printedConfirmed:x.ownerWonderTag?.confirmed??null,
      ownerSupporterSearches:x.ownerWonderTag?.searchOffers??null,
      settledOwnerSupporterTransfers:
        x.ownerWonderTag?.settledSupporterTransfers??null,
      callbackShuffleOffers:shuffle?.shufflePromptsOffered??null,
      callbackShufflesValid:shuffle?.validShuffleCallbacksCompleted??null,
      nativeOwnerShuffleBySeat:bySeat,
      sourceCompletedShuffles:bySeat[reg.sourceSeat]??0,
      contenderCompletedShuffles:bySeat[1-reg.sourceSeat]??0,
      registeredNativePrintedSettlement:completed,
      ownerWonderTag:x.ownerWonderTag,
      ownerNativeShuffle:shuffle
    };
  });
  const rows=executed.diagnostic.actualNativeAttempts??[];
  assert.equal(rows.length,registered.length);
  return {
    manifest:{
      ...executed.manifest,
      version:VERSION,policyEntryPoint:HASH_PATHS[1],
      experimentRegistration:REGISTRATION,
      onlyNewOwnerAction:
        'per-native-match printed Wonder Tag Confirm/owner-deck Supporter search',
      originalV7PrintedSixtiesAndRootCapRetained:true,
      finalFixed60Selected:false,
      fullPaperCardEffectCertified:false,
      releaseQualified:false,competitiveGamesQualified:0,
      resolvedSourceAndPolicyHashes:[
        ...executed.manifest.resolvedSourceAndPolicyHashes,
        ...HASH_PATHS.map(hashRegisteredFile)
      ]
    },
    diagnostic:{
      ...executed.diagnostic,
      schema:VERSION,
      originalEight:rows,
      nativePerMatchWonderTag:audited,
      registeredNativeSettledRowCount:
        audited.filter(x=>x.registeredNativePrintedSettlement).length,
      printedConfirmationOffers:audited.reduce((n,x)=>
        n+(x.printedConfirmationOffers??0),0),
      printedOwnerSupporterTransfers:audited.reduce((n,x)=>
        n+(x.settledOwnerSupporterTransfers??0),0),
      nativePrintedShufflesValid:audited.reduce((n,x)=>
        n+(x.callbackShufflesValid??0),0),
      originalPolicySelected:false,
      paperGameQualified:false,
      competitiveGamesQualified:0,estimatedWinRate:null,
      verdict:'UNQUALIFIED-inner-native-Wonder-Tag-development'
    },
    rawDevelopment:executed.rawDevelopment
  };
}
module.exports={VERSION,REGISTRATION,HASH_PATHS,
  withInnermostOwnerWonderTagV12,nativePrintedSettlement,
  runAgent1InnermostWonderTagV12};
