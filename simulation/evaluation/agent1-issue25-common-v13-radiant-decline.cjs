'use strict';
const assert=require('node:assert/strict');
const {runAgent1InnermostWonderTagV12,
  withInnermostOwnerWonderTagV12}=
  require('./agent1-issue25-common-v7-wondertag-v12.cjs');
const {withStewardInnermostOwnerPrompts}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withOwnerRadiantDecline}=
  require('../twinleaf/agent1-owner-radiant-decline.cjs');
const {registeredTrials}=
  require('./agent36-issue25-common-v6.cjs');
const {PREFIX}=
  require('../twinleaf/agent1-wondertag-registered-actor-witness.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');

const VERSION='agent1-issue25-common-v13-innermost-radiant-decline';
const REGISTRATION=
  'results/aichi-2026/registrations/agent1-v12-v13-radiant-decline-native-20261106.md';
const HASH_PATHS=[
  REGISTRATION,
  'simulation/evaluation/agent1-issue25-common-v13-radiant-decline.cjs',
  'simulation/twinleaf/agent1-owner-radiant-decline.cjs',
  'tests/agent1-issue25-common-v13-radiant-decline.test.cjs',
  'tests/agent1-issue25-common-v13-radiant-decline.native.test.cjs'
];

/**
 * Install the exact optional Radiant decline after all live canonical actor
 * policies, in a per-match native Store scope. Decline is deliberate for this
 * developmental arm, not a generally optimal game policy.
 * @template T
 * @param {()=>T} next
 * @param {{headless?:object,radiant?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withPerMatchRadiantDecline(next,deps={}){
  assert.equal(typeof next,'function');
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const radiant=deps.radiant??withOwnerRadiantDecline;
  const previous=headless.runMatch;
  assert.equal(typeof previous,'function');
  assert.equal(typeof radiant,'function');
  const registered=new Set(registeredTrials().map(x=>x.id));
  const attempts=[];
  function radiantNativeMatch(request,...args){
    assert.ok(typeof request?.label==='string'&&
      request.label.startsWith(PREFIX));
    const id=request.label.slice(PREFIX.length);
    assert.ok(registered.has(id),
      'Radiant owner prompt must belong to frozen v7 original trial');
    try{
      const result=radiant(()=>previous.call(headless,request,...args));
      attempts.push({id,status:'returned-unqualified',
        ownerRadiant:result.audit});
      return result.result;
    }catch(error){
      attempts.push({id,status:'engine-error',
        ownerRadiant:error?.ownerRadiantDeclineAudit??null});
      throw error;
    }
  }
  headless.runMatch=radiantNativeMatch;
  try{return {result:next(),audit:{
    version:VERSION,perNativeMatch:attempts,
    readsOpponentHiddenZones:false,competitiveGamesQualified:0
  }};}
  finally{
    assert.strictEqual(headless.runMatch,radiantNativeMatch);
    headless.runMatch=previous;
  }
}

/**
 * A single common owner policy: v12 genuine Wonder Tag plus per-game Radiant
 * optional decline, each installed close to real native prompt dispatch.
 * @template T
 * @param {()=>T} next
 * @param {{wonderTag?:Function,owner?:Function,radiant?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerWonderRadiantV13(next,deps={}){
  assert.equal(typeof next,'function');
  const wonderTag=deps.wonderTag??withInnermostOwnerWonderTagV12;
  const owner=deps.owner??withStewardInnermostOwnerPrompts;
  const radiant=deps.radiant??withPerMatchRadiantDecline;
  let radiantAudit=null;
  const selected=wonderTag(next,{
    owner:run=>{
      const observed=owner(()=>{
        const inner=radiant(run);
        radiantAudit=inner.audit;
        return inner.result;
      });
      return {result:observed.result,audit:{
        ...observed.audit,
        livePerMatchRadiantAudit:radiantAudit
      }};
    }
  });
  return {result:selected.result,audit:{
    ...selected.audit,
    perMatchRadiantAudit:radiantAudit
  }};
}

/**
 * Eight frozen exact original v7/v12 source games, one optional prompt
 * decision newly available. Every error and cap remains counted.
 * @param {{base?:Function,ownerLayer?:Function}} [deps]
 */
function runAgent1CommonRadiantV13(deps={}){
  const selected=runAgent1InnermostWonderTagV12({
    ...deps,ownerLayer:deps.ownerLayer??withOwnerWonderRadiantV13
  });
  const radial=selected.diagnostic?.innerNativeOwnerPromptAudit?.
    preexistingPrizeAndPromotion?.perMatchRadiantAudit;
  assert.ok(Array.isArray(radial?.perNativeMatch));
  const registration=registeredTrials();
  assert.deepEqual(radial.perNativeMatch.map(x=>x.id).sort(),
    registration.map(x=>x.id).sort());
  const sourceById=new Map(registration.map(x=>[x.id,{
    rank:x.rank,sourceSeat:x.candidateSlot==='A'?1:0
  }]));
  const rows=radial.perNativeMatch.map(x=>{
    const role=sourceById.get(x.id);
    const a=x.ownerRadiant;
    return {
      id:x.id,sourceRank:role.rank,sourceSeat:role.sourceSeat,
      status:x.status,
      printedRadiantOffers:a?.printedOfferCount??null,
      nativeOptionalDeclinesAccepted:a?.nativeDeclinesAccepted??null,
      failedOrUnsettledDeclines:(a?.nativeDeclinesRejected??0)+
        (a?.nativeDeclinesUnsettled??0),
      sourceDeclines:a?.bySeat?.[role.sourceSeat]??null,
      contenderDeclines:a?.bySeat?.[1-role.sourceSeat]??null,
      completeNativeDeclineWitness:
        (a?.printedOfferCount??0)>0&&
        a.nativeDeclinesAccepted===a.printedOfferCount&&
        a.nativeDeclinesRejected===0&&
        a.nativeDeclinesUnsettled===0,
      ownerAudit:a??null
    };
  });
  const offers=rows.reduce((n,x)=>n+(x.printedRadiantOffers??0),0);
  const accepted=rows.reduce((n,x)=>
    n+(x.nativeOptionalDeclinesAccepted??0),0);
  return {
    manifest:{
      ...selected.manifest,
      version:VERSION,policyEntryPoint:HASH_PATHS[1],
      originalV12Registration:REGISTRATION,
      commonPolicyRadiantPrintedOptionalDeclineBothSeats:true,
      nativeRoot96Unchanged:true,
      noFixed60Selected:true,releaseQualified:false,
      competitiveGamesQualified:0,
      resolvedSourceAndPolicyHashes:[
        ...selected.manifest.resolvedSourceAndPolicyHashes,
        ...HASH_PATHS.map(hashRegisteredFile)
      ]
    },
    diagnostic:{
      ...selected.diagnostic,
      schema:VERSION,
      realNativeRadiantByTrial:rows,
      actualPrintedRadiantOffers:offers,
      actualNativeOptionalDeclinesAccepted:accepted,
      actualNativeCompleteRadiantDeclineRows:
        rows.filter(x=>x.completeNativeDeclineWitness).length,
      competitiveGamesQualified:0,
      estimatedWinRate:null,
      originalRankAndCandidateRoleInferenceLimitedToOriginalRegistration:true,
      verdict:'UNQUALIFIED-v13-developmental-optional-decline'
    },
    rawDevelopment:selected.rawDevelopment
  };
}
module.exports={VERSION,REGISTRATION,HASH_PATHS,
  withPerMatchRadiantDecline,withOwnerWonderRadiantV13,
  runAgent1CommonRadiantV13};
