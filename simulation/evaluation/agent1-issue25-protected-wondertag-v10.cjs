'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {runPrechoiceCustodyV8}=
  require('./agent1-issue25-prechoice-input-custody-v8.cjs');
const {withThreePrintedOwnerAttackFrontiers}=
  require('./agent1-issue25-joined-three-attacks-v5.cjs');
const {withOwnerWonderTagPrompts}=
  require('../twinleaf/agent8-owner-wondertag-prompt.cjs');
const {withWonderTagZeroShuffleHook}=
  require('../twinleaf/agent8-wonder-tag-zero-shuffle-hook.cjs');
const {withWonderTagNativeShuffleCompletion}=
  require('../twinleaf/agent1-wondertag-native-shuffle-completion.cjs');
const {createWonderTagRegisteredActorWitness}=
  require('../twinleaf/agent1-wondertag-registered-actor-witness.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent1-issue25-protected-wondertag-v10-same-opening-retro';
const EXTRA_HASH_PATHS=Object.freeze([
  'simulation/evaluation/agent1-issue25-protected-wondertag-v10.cjs',
  'simulation/twinleaf/agent8-owner-wondertag-prompt.cjs',
  'simulation/twinleaf/agent8-wonder-tag-zero-shuffle-hook.cjs',
  'simulation/twinleaf/agent1-wondertag-native-shuffle-completion.cjs',
  'tests/agent1-wondertag-native-shuffle-completion.test.cjs',
  'simulation/twinleaf/agent1-wondertag-registered-actor-witness.cjs',
  'tests/agent1-wondertag-registered-actor-witness.test.cjs',
  'tests/agent1-issue25-protected-wondertag-v10.test.cjs',
  'tests/agent1-issue25-protected-wondertag-v10.native.test.cjs'
]);

/**
 * Source-independent opt-in original printed Lele Supporter search. Keep the
 * same protected setup and original symmetric printed attack adapters. A
 * separate source-only Rank11 script and generic raw bot are NOT added.
 * @template T
 * @param {()=>T} next Native batch with immutable eight original trial IDs.
 * @param {{attack?:Function,wonder?:Function,shuffle?:Function,
 *   nativeShuffle?:Function,witnessFactory?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPrintedWonderTagAndAttacks(next,deps={}){
  assert.equal(typeof next,'function');
  const attack=deps.attack??withThreePrintedOwnerAttackFrontiers;
  const wonder=deps.wonder??withOwnerWonderTagPrompts;
  const shuffle=deps.shuffle??withWonderTagZeroShuffleHook;
  const nativeShuffle=deps.nativeShuffle??withWonderTagNativeShuffleCompletion;
  const factory=deps.witnessFactory??createWonderTagRegisteredActorWitness;
  for(const f of [attack,wonder,shuffle,nativeShuffle,factory])
    assert.equal(typeof f,'function');
  const witness=factory();
  assert.equal(typeof witness.run,'function');
  assert.equal(typeof witness.selectSupporterIndex,'function');
  assert.equal(typeof witness.currentTrialId,'function');
  const outer=nativeShuffle(()=>shuffle(()=>wonder(
    ()=>witness.run(()=>attack(next)),
    {selectSupporterIndex:witness.selectSupporterIndex}
  )),{getCurrentTrialId:witness.currentTrialId});
  assert.ok(outer?.result?.result?.result);
  return {
    result:outer.result.result.result.result,
    audit:{
      ...outer.result.result.result.audit,
      sourceIndependentOwnerWonderTag:outer.result.result.audit,
      ownerWonderTagMandatoryZeroShuffle:outer.result.audit,
      ownerWonderTagNativeShuffleCompletion:outer.audit,
      registeredWonderTagActorWitness:witness.audit,
      originalPrintedAttacksRetained:true,
      rankedStrengthCertified:false,
      competitiveGamesQualified:0
    }
  };
}

/** @param {object} witness @param {string[]} ids @returns {Map<string,object>} */
function ownerInputsById(witness,ids){
  assert.equal(witness?.exactNativeStoreRootsRecorded,8);
  assert.equal(witness?.firstOwnerSetupInputsObserved,16);
  assert.equal(witness?.exactPhysicalSixtyPrintedCountMatches,16);
  assert.equal(witness?.registeredNativeTrialLabelWitnessSelected,true);
  const expected=new Set(ids),byKey=new Map(),storeOrdinalByTrial=new Map();
  const trialByOrdinal=new Map();
  for(const event of witness.events){
    assert.ok(expected.has(event.registeredNativeTrialId));
    assert.ok(event.physicalOwnerSeat===0||event.physicalOwnerSeat===1);
    assert.ok(Number.isSafeInteger(event.nativeStoreOrdinal)&&
      event.nativeStoreOrdinal>=1&&event.nativeStoreOrdinal<=ids.length);
    assert.ok(event.nativeFirstPlayerSeat===0||event.nativeFirstPlayerSeat===1);
    assert.equal(event.noPolicyChoiceOrHiddenNamesPublished,true);
    assert.ok(event.ownerHandCount>=0&&event.ownerDeckCount>=0&&
      event.ownerPrizeCount>=0&&
      event.ownerHandCount+event.ownerDeckCount+
        event.ownerPrizeCount===60);
    const priorOrdinal=storeOrdinalByTrial.get(event.registeredNativeTrialId);
    if(priorOrdinal!==undefined)
      assert.equal(event.nativeStoreOrdinal,priorOrdinal,
        'Both owners of a registered native trial must share one Store');
    else storeOrdinalByTrial.set(event.registeredNativeTrialId,
      event.nativeStoreOrdinal);
    const priorTrial=trialByOrdinal.get(event.nativeStoreOrdinal);
    if(priorTrial!==undefined)
      assert.equal(event.registeredNativeTrialId,priorTrial,
        'One native Store must have one registered trial ID');
    else trialByOrdinal.set(event.nativeStoreOrdinal,
      event.registeredNativeTrialId);
    assert.match(event.opaquePhysicalPrechoiceInputHmacSha256,/^[0-9a-f]{64}$/);
    assert.match(event.opaquePreRunRequestHmacSha256,/^[0-9a-f]{64}$/);
    assert.equal(event.firstBeforeAnyOwnerSetupChoice,true);
    assert.equal(event.globalTurnAtCapture,0);
    assert.equal(event.physicalSixtyCardCount,60);
    const key=event.registeredNativeTrialId+':'+event.physicalOwnerSeat;
    assert.ok(!byKey.has(key),'Duplicate native owner setup input');
    assert.equal(event.exactPhysicalSixtyPrintedCountMatched,true);
    byKey.set(key,event);
  }
  assert.equal(byKey.size,16);
  assert.equal(storeOrdinalByTrial.size,ids.length);
  assert.equal(trialByOrdinal.size,ids.length);
  for(const id of ids){
    const left=byKey.get(id+':0'),right=byKey.get(id+':1');
    assert.ok(left&&right);
    assert.equal(left.nativeFirstPlayerSeat,right.nativeFirstPlayerSeat,
      'Both owners of a registered native trial must agree on the first player');
    assert.equal(left.opaquePreRunRequestHmacSha256,
      right.opaquePreRunRequestHmacSha256,
      'Both owners must witness one genuine registered native request');
  }
  return byKey;
}

/**
 * Bounded retrospective same-initial-policy A/B. Consume only authentic
 * owner-private HMAC equality, public board equalities, statuses and counts.
 * Neither an engine abort nor a cap is a game result.
 * @param {object} baseline Actual protected opening, unchanged printed attacks.
 * @param {object} treatment Exact same opening plus owner Wonder Tag+shuffle.
 * @returns {object}
 */
function compareProtectedWonderTagV10(baseline,treatment){
  assert.equal(baseline.manifest.prechoiceMode,'protected');
  assert.equal(treatment.manifest.prechoiceMode,'protected');
  const ids=baseline.diagnostic.registered;
  assert.deepEqual(treatment.diagnostic.registered,ids);
  assert.equal(ids.length,8);
  assert.equal(new Set(ids).size,8);
  const left=baseline.diagnostic.actualNativePrechoicePhysicalInputs;
  const right=treatment.diagnostic.actualNativePrechoicePhysicalInputs;
  const pairableSession=typeof left.privateFingerprintSessionId==='string'&&
    left.privateFingerprintSessionId.length>0&&
    left.privateFingerprintSessionId===right.privateFingerprintSessionId;
  const a=ownerInputsById(left,ids),b=ownerInputsById(right,ids);
  const attempts=execution=>{
    const raw=execution.diagnostic.attemptedRows;
    assert.ok(Array.isArray(raw)&&raw.length===ids.length);
    const byId=new Map();
    for(const row of raw){
      assert.ok(ids.includes(row.id),'Unexpected registered native attempt');
      assert.ok(!byId.has(row.id),'Duplicate registered native attempt');
      byId.set(row.id,row);
    }
    return byId;
  };
  const rawA=attempts(baseline),rawB=attempts(treatment);
  const rows=ids.map(id=>{
    const candidateSeat=id.split(':')[2]==='A'?0:1;
    const sourceSeat=1-candidateSeat;
    const ownerPairs=[0,1].map(seat=>{
      const l=a.get(id+':'+seat),r=b.get(id+':'+seat);
      assert.ok(l&&r);
      return {
        seat,
        samePrechoicePhysicalInput:pairableSession&&
          l.opaquePhysicalPrechoiceInputHmacSha256===
          r.opaquePhysicalPrechoiceInputHmacSha256,
        sameRequest:l.opaquePreRunRequestHmacSha256===
          r.opaquePreRunRequestHmacSha256,
        sameNativeFirstPlayer:l.nativeFirstPlayerSeat===r.nativeFirstPlayerSeat
      };
    });
    const first=rawA.get(id),second=rawB.get(id);
    assert.ok(first&&second);
    return {
      id,sourceSeat,candidateSeat,ownerPairs,
      baselineStatus:first.status,
      treatmentStatus:second.status,
      baselineRoots:first.nativeRootActionCount,
      treatmentRoots:second.nativeRootActionCount,
      sameStatus:first.status===second.status,
      samePostSetupSourceDeal:typeof first.sourceDealFingerprint==='string'&&
        typeof second.sourceDealFingerprint==='string'?
        first.sourceDealFingerprint===second.sourceDealFingerprint:null
    };
  });
  const ownerPairs=rows.flatMap(r=>r.ownerPairs);
  const wonder=treatment.diagnostic.audit
    ?.firstBlockedPromptEnvelope?.sourceIndependentOwnerWonderTag??null;
  const shuffle=treatment.diagnostic.audit
    ?.firstBlockedPromptEnvelope?.ownerWonderTagMandatoryZeroShuffle??null;
  const nativeShuffle=treatment.diagnostic.audit
    ?.firstBlockedPromptEnvelope?.ownerWonderTagNativeShuffleCompletion??null;
  const actorWitness=treatment.diagnostic.audit
    ?.firstBlockedPromptEnvelope?.registeredWonderTagActorWitness??null;
  const witnessedDecisions=actorWitness?.decisions??[];
  const authenticatedWonderTagDecisions=
    Array.isArray(witnessedDecisions)&&
    witnessedDecisions.length===actorWitness?.observedSearchDecisionCount&&
    witnessedDecisions.every(event=>
      ids.includes(event.id)&&
      (event.actorSeat===0||event.actorSeat===1)&&
      Number.isSafeInteger(event.globalTurn)&&
      (event.answerCardinality===0||event.answerCardinality===1)&&
      event.ownerDeckPrintingsOmitted===true);
  const nativeSearchSettlementCertified=authenticatedWonderTagDecisions&&
    wonder?.confirmOffers===witnessedDecisions.length&&
    wonder?.searchOffers===witnessedDecisions.length&&
    wonder?.confirmed===witnessedDecisions.length&&
    wonder?.selectedSupporters+wonder?.emptySearches===witnessedDecisions.length&&
    wonder?.nativeAccepted===2*witnessedDecisions.length&&
    wonder?.nativeRejected===0&&
    wonder?.nativeUnsettled===0&&
    wonder?.nativeCustodyFailures===0&&
    wonder?.nativeMissingSearchFollowup===0&&
    wonder?.settledSupporterTransfers===wonder?.selectedSupporters&&
    witnessedDecisions.filter(d=>d.answerCardinality===1).length===
      wonder?.selectedSupporters&&
    shuffle?.interceptedSupporterSearches===witnessedDecisions.length&&
    shuffle?.nonzeroNativeSelections===wonder?.selectedSupporters&&
    shuffle?.zeroSelections===wonder?.emptySearches&&
    shuffle?.repairedShuffles===shuffle?.zeroSelections&&
    [0,1].every(seat=>wonder?.bySeat?.[seat]===
      2*witnessedDecisions.filter(d=>d.actorSeat===seat).length);
  const expectedShuffleTrialSeats=witnessedDecisions
    .filter(d=>d.answerCardinality===1)
    .map(d=>d.id+':'+d.actorSeat).sort();
  const nativeTrialSeats=records=>Array.isArray(records)&&
    records.every(d=>ids.includes(d.id)&&(d.seat===0||d.seat===1))?
    records.map(d=>d.id+':'+d.seat).sort():null;
  const nativeShuffleTrialOriginsComplete=!!nativeShuffle&&
    nativeShuffle.nativeTrialAttributionAvailable===true&&
    JSON.stringify(nativeTrialSeats(nativeShuffle.offeredTrialSeats))===
      JSON.stringify(expectedShuffleTrialSeats)&&
    JSON.stringify(nativeTrialSeats(nativeShuffle.completedTrialSeats))===
      JSON.stringify(expectedShuffleTrialSeats);
  const nativePrintedShuffleCompleted=nativeSearchSettlementCertified&&
    nativeShuffleTrialOriginsComplete&&
    !!nativeShuffle&&
    nativeShuffle.shufflePromptsOffered===wonder.selectedSupporters&&
    nativeShuffle.shuffleCallbacksCompleted===wonder.selectedSupporters&&
    nativeShuffle.validShuffleCallbacksCompleted===wonder.selectedSupporters&&
    nativeShuffle.invalidNativeShufflePermutations===0&&
    nativeShuffle.outstandingShuffleCallbacks===0&&
    nativeShuffle.shuffleCallbacksFailed===0&&
    nativeShuffle.allOfferedShufflesCompleted===true&&
    nativeShuffle.missingRegisteredTrialIds===0&&
    nativeShuffle.ownerReassignedPrompts===0&&
    nativeShuffle.preCallbackRejections===0&&
    nativeShuffle.nativeCallbackFailures===0&&
    [0,1].every(seat=>nativeShuffle.bySeat?.[seat]===
      witnessedDecisions.filter(d=>d.actorSeat===seat&&
        d.answerCardinality===1).length);
  const registeredActorRoles=witnessedDecisions.map(event=>{
    const row=rows.find(x=>x.id===event.id);
    return {
      id:event.id,actorSeat:event.actorSeat,globalTurn:event.globalTurn,
      answerCardinality:event.answerCardinality,
      role:row&&event.actorSeat===row.sourceSeat?'original-source':
        row&&event.actorSeat===row.candidateSeat?'contender':'unverified'
    };
  });
  const settledRoleCensus=nativeSearchSettlementCertified?{
    originalSourceSearches:registeredActorRoles.filter(
      d=>d.role==='original-source').length,
    originalSourceSupporterTransfers:registeredActorRoles.filter(
      d=>d.role==='original-source'&&d.answerCardinality===1).length,
    contenderSearches:registeredActorRoles.filter(
      d=>d.role==='contender').length,
    contenderSupporterTransfers:registeredActorRoles.filter(
      d=>d.role==='contender'&&d.answerCardinality===1).length,
    registeredDecisions:registeredActorRoles
  }:null;
  const allGenuineInitialInputsMatched=pairableSession&&
    ownerPairs.every(row=>row.samePrechoicePhysicalInput&&
      row.sameRequest&&row.sameNativeFirstPlayer);
  const sameVendor=!!baseline.manifest.observedTwinleafGitCommit&&
    baseline.manifest.observedTwinleafGitCommit===
      treatment.manifest.observedTwinleafGitCommit;
  const sameRepo=!!baseline.manifest.observedRepositoryGitCommit&&
    baseline.manifest.observedRepositoryGitCommit===
      treatment.manifest.observedRepositoryGitCommit;
  return {
    schema:VERSION,
    sourceRegistration:'original-eight-rank6-rank11-v6-unchanged',
    setupPolicyBothArms:'protected-turn-entry-preserving',
    addedTreatment:'same-actor printed Wonder Tag affirmative search and zero-selection deck shuffle',
    ids,rows,
    observedOriginalActualNativePrechoiceOwnerRecords:ownerPairs.length,
    matchingGenuineOwnerPrechoiceAndRequestPairs:
      ownerPairs.filter(x=>x.samePrechoicePhysicalInput&&x.sameRequest&&
        x.sameNativeFirstPlayer).length,
    samePrivateHmacSession:pairableSession,
    sameVendorPin:sameVendor,sameRepositoryPin:sameRepo,
    originalStorePrintingsMatchConfigured:
      left.exactPhysicalSixtyPrintedCountMatches===16&&
      right.exactPhysicalSixtyPrintedCountMatches===16,
    actualOwnerWonderTagAudit:wonder?{
      version:wonder.version,confirmOffers:wonder.confirmOffers,
      searchOffers:wonder.searchOffers,confirmed:wonder.confirmed,
      selectedSupporters:wonder.selectedSupporters,
      emptySearches:wonder.emptySearches,
      nativeAccepted:wonder.nativeAccepted,
      nativeRejected:wonder.nativeRejected,
      nativeUnsettled:wonder.nativeUnsettled,
      nativeCustodyFailures:wonder.nativeCustodyFailures,
      settledSupporterTransfers:wonder.settledSupporterTransfers,
      nativeMissingSearchFollowup:wonder.nativeMissingSearchFollowup,
      bySeat:wonder.bySeat
    }:null,
    registeredWonderTagActorWitness:actorWitness?{
      version:actorWitness.version,
      observedSearchDecisionCount:actorWitness.observedSearchDecisionCount,
      decisions:witnessedDecisions.map(event=>({...event})),
      authenticatedTrialAndActorSeat:authenticatedWonderTagDecisions,
      nativeSettlementOfEveryChoiceAttested:nativeSearchSettlementCertified,
      // This certifies the chosen Supporter's native zone transfer only.
      // A later native ShuffleDeckPrompt may remain unresolved at a root cap.
      nativeShufflePromptCompletionIndependentlyCertified:
        nativePrintedShuffleCompleted,
      settledRoleCensus,
      originalSourceAttackAndOpponentReplyCertified:false,
      originalSourceEffectCertified:false
    }:null,
    actualNativeShuffleCompletionAudit:nativeShuffle?{
      version:nativeShuffle.version,
      printedEntrances:nativeShuffle.printedEntrances,
      shufflePromptsOffered:nativeShuffle.shufflePromptsOffered,
      shuffleCallbacksCompleted:nativeShuffle.shuffleCallbacksCompleted,
      validShuffleCallbacksCompleted:
        nativeShuffle.validShuffleCallbacksCompleted,
      invalidNativeShufflePermutations:
        nativeShuffle.invalidNativeShufflePermutations,
      shuffleCallbacksFailed:nativeShuffle.shuffleCallbacksFailed,
      shuffleCallbackInvocations:nativeShuffle.shuffleCallbackInvocations,
      preCallbackRejections:nativeShuffle.preCallbackRejections,
      nativeCallbackFailures:nativeShuffle.nativeCallbackFailures,
      missingRegisteredTrialIds:nativeShuffle.missingRegisteredTrialIds,
      ownerReassignedPrompts:nativeShuffle.ownerReassignedPrompts,
      allOfferedShufflesCompleted:nativeShuffle.allOfferedShufflesCompleted,
      outstandingShuffleCallbacks:nativeShuffle.outstandingShuffleCallbacks,
      bySeat:nativeShuffle.bySeat,
      nativeTrialAttributionAvailable:
        nativeShuffle.nativeTrialAttributionAvailable,
      offeredTrialSeats:nativeShuffle.offeredTrialSeats,
      completedTrialSeats:nativeShuffle.completedTrialSeats,
      exactNativeShuffleTrialAndActorJoin:nativeShuffleTrialOriginsComplete,
      completePaperAbilityCertified:false
    }:null,
    actualZeroSearchShuffleAudit:shuffle?{
      version:shuffle.version,printedEntrances:shuffle.printedEntrances,
      interceptedSupporterSearches:shuffle.interceptedSupporterSearches,
      zeroSelections:shuffle.zeroSelections,
      nonzeroNativeSelections:shuffle.nonzeroNativeSelections,
      repairedShuffles:shuffle.repairedShuffles
    }:null,
    comparisonEligibleForPolicyStudy:allGenuineInitialInputsMatched&&
      sameVendor&&sameRepo,
    claimSingleExecutingChangeCertified:false,
    originalSourceAttackAndOpponentReplyCertified:false,
    paperGameQualified:0,competitiveGamesQualified:0,
    fullFieldCoverage:false,winRateClaim:null,
    selectedPolicyAndDataHashes:EXTRA_HASH_PATHS.map(hashRegisteredFile)
  };
}

/**
 * Run both exact frozen protected opening variants in one Node process.
 * This reuses the eight historically inspected sources and is descriptive,
 * not a prospective randomized comparison.
 * @returns {object}
 */
function runProtectedWonderTagV10(){
  const baseline=runPrechoiceCustodyV8('protected');
  const treatment=runPrechoiceCustodyV8('protected',{
    attackLayer:withPrintedWonderTagAndAttacks
  });
  return compareProtectedWonderTagV10(baseline,treatment);
}

module.exports={VERSION,EXTRA_HASH_PATHS,withPrintedWonderTagAndAttacks,
  compareProtectedWonderTagV10,runProtectedWonderTagV10};
