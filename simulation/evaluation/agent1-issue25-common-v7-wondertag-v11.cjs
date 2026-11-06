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
const {createWonderTagRegisteredActorWitness}=
  require('../twinleaf/agent1-wondertag-registered-actor-witness.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent1-issue25-common-v7-wondertag-v11-retrospective';
const REGISTRATION=
  'results/aichi-2026/registrations/agent1-v7-wondertag-retrospective-20261106.md';
const HASH_PATHS=[
  REGISTRATION,
  'simulation/evaluation/agent1-issue25-common-v7-wondertag-v11.cjs',
  'tests/agent1-issue25-common-v7-wondertag-v11.test.cjs',
  'tests/agent1-issue25-common-v7-wondertag-v11.native.test.cjs'
];

/**
 * Add the same first-eligible own-deck Wonder Tag handler to both live seats.
 * Native player actions and all Store payments remain authoritative.
 * This is a retrospective liveness treatment, not a competitive policy.
 * @template T
 * @param {()=>T} next
 * @param {{owner?:Function,wonder?:Function,shuffle?:Function,witnessFactory?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withCommonOwnerWonderTagV11(next,deps={}){
  assert.equal(typeof next,'function');
  const owner=deps.owner??withStewardInnermostOwnerPrompts;
  const wonder=deps.wonder??withOwnerWonderTagPrompts;
  const shuffle=deps.shuffle??withWonderTagNativeShuffleCompletion;
  const factory=deps.witnessFactory??createWonderTagRegisteredActorWitness;
  for(const item of [owner,wonder,shuffle,factory])
    assert.equal(typeof item,'function');
  const witness=factory();
  assert.equal(typeof witness.run,'function');
  assert.equal(typeof witness.selectSupporterIndex,'function');
  assert.equal(typeof witness.currentTrialId,'function');
  const complete=shuffle(()=>wonder(
    ()=>witness.run(()=>owner(next)),
    {selectSupporterIndex:witness.selectSupporterIndex}
  ),{getCurrentTrialId:witness.currentTrialId});
  assert.ok(complete?.result?.result&&
    Object.prototype.hasOwnProperty.call(complete.result.result,'result'));
  return {
    result:complete.result.result.result,
    audit:{
      version:VERSION,
      currentRegisteredActorWitness:witness.audit,
      ownerWonderTag:complete.result.audit,
      ownerNativeShuffle:complete.audit,
      inheritedOwnerPrizeAndPokemon:complete.result.result.audit,
      fullOwnerInformationSafetyCertified:false,
      completePaperAbilityCertified:false,
      competitiveGamesQualified:0
    }
  };
}

/** @param {readonly object[]} pairs */
function trialActorRoles(pairs){
  const reg=registeredTrials();
  const map=new Map(reg.map(x=>[x.id,
    {sourceSeat:x.candidateSlot==='A'?1:0,rank:x.rank}]));
  assert.equal(map.size,8);
  return pairs.map(event=>{
    const trial=map.get(event.id);
    assert.ok(trial,'Wonder Tag action had no original v6/v7 registration');
    assert.ok(event.actorSeat===0||event.actorSeat===1);
    return {
      id:event.id,actorSeat:event.actorSeat,
      role:event.actorSeat===trial.sourceSeat?'original-source':'contender',
      sourceRank:trial.rank,answerCardinality:event.answerCardinality,
      globalTurn:event.globalTurn,ownerDeckPrintingsOmitted:true
    };
  });
}

/** @param {readonly {id:string,seat:number}[]} values */
function pairIds(values){
  return values.map(x=>x.id+':'+x.seat).sort();
}

/**
 * Preserve identical printed sixties, source registration and 96-root limit
 * from exact common v7. No rank-specific action is added.
 * @param {{runner?:Function,base?:Function,ownerLayer?:Function}} [deps]
 */
function runAgent1CommonWonderTagV11(deps={}){
  const base=deps.base??runStewardCommonVoltV7;
  const ownerLayer=deps.ownerLayer??withCommonOwnerWonderTagV11;
  const result=base({...deps,baseOwnerPromptLayer:ownerLayer});
  const audit=result.diagnostic?.innerNativeOwnerPromptAudit?.
    preexistingPrizeAndPromotion??null;
  assert.ok(audit,'Native owner prompt composition must return an audit');
  const witness=audit.currentRegisteredActorWitness;
  const shuffle=audit.ownerNativeShuffle;
  const wonder=audit.ownerWonderTag;
  const decisions=trialActorRoles(witness?.decisions??[]);
  const nonempty=decisions.filter(x=>x.answerCardinality===1);
  const expected=nonempty.map(x=>x.id+':'+x.actorSeat).sort();
  const exactNativeShuffleJoin=!!shuffle&&
    JSON.stringify(pairIds(shuffle.offeredTrialSeats??[]))===
      JSON.stringify(expected)&&
    JSON.stringify(pairIds(shuffle.completedTrialSeats??[]))===
      JSON.stringify(expected);
  const certified=nonempty.length>0&&
    exactNativeShuffleJoin&&
    shuffle?.allOfferedShufflesCompleted===true&&
    shuffle?.nativeTrialAttributionAvailable===true&&
    shuffle?.shufflePromptsOffered===nonempty.length&&
    shuffle?.validShuffleCallbacksCompleted===nonempty.length&&
    wonder?.selectedSupporters===nonempty.length&&
    wonder?.settledSupporterTransfers===nonempty.length&&
    wonder?.nativeRejected===0&&wonder?.nativeUnsettled===0&&
    wonder?.nativeCustodyFailures===0;
  const rows=result.diagnostic.actualNativeAttempts??[];
  assert.equal(rows.length,8);
  return {
    manifest:{
      ...result.manifest,
      version:VERSION,policyEntryPoint:HASH_PATHS[1],
      originalPrecommittedRegistration:REGISTRATION,
      comparedDevelopmentalPolicy:'agent36 common v7',
      onlyNewOwnerAction:'actual printed Wonder Tag owner Confirm / Supporter search',
      originalV7Native96RootProfileRetained:true,
      commonOwnerPromptOnBothSeats:true,
      nativePrintedShuffleActorJoinCertified:certified,
      fullPaperAbilityCertified:false,
      releaseQualified:false,competitiveGamesQualified:0,
      resolvedSourceAndPolicyHashes:[
        ...result.manifest.resolvedSourceAndPolicyHashes,
        ...HASH_PATHS.map(hashRegisteredFile)
      ]
    },
    diagnostic:{
      ...result.diagnostic,
      schema:VERSION,
      registeredActorDecisions:decisions,
      registeredNativeShuffleTrialSeatJoin:exactNativeShuffleJoin,
      nativePrintedShuffleCompletionCertified:certified,
      actualOwnerWonderTagAudit:wonder??null,
      actualOwnerShuffleAudit:shuffle??null,
      actualOwnerPrizePokemonAudit:audit.inheritedOwnerPrizeAndPokemon??null,
      nativeEight:rows.map(row=>({
        id:row.id,sourceSeat:row.sourceSeat,
        status:row.status,rootCount:row.rootCount,
        sourcePhysicalDealFingerprint:
          row.sourcePhysicalDealFingerprint??null,
        fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
        settledSourceAttacks:row.settledSourceAttacks??null
      })),
      originalPolicySelected:false,
      paperGameQualified:false,
      competitiveGamesQualified:0,
      estimatedWinRate:null,
      verdict:'UNQUALIFIED-common-owner-wondertag-v7-retro'
    },
    rawDevelopment:result.rawDevelopment
  };
}

module.exports={VERSION,REGISTRATION,HASH_PATHS,
  withCommonOwnerWonderTagV11,trialActorRoles,runAgent1CommonWonderTagV11};
