'use strict';
const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/agent49-source-carmine-first-own-turn-16pair-20261109.json');
const {runNativeBatch,summarizeRow}=
  require('./agent32-fresh-perfection-field.cjs');
const {withSourceEarlyCarmine}=
  require('../twinleaf/agent49-source-early-carmine-native.cjs');
const {firstRootDivergence}=
  require('./agent24-v8-perfection-paired-native.cjs');
const {save}=require('./2026-11/agent8-source-challenger-2x2.cjs');

const VERSION='agent49-source-carmine-first-own-turn-16pair-native-v1';

/** Frozen independently generated physical sources, no selected seeds. */
function registered(){
  assert.equal(registration.schema,
    'agent49-source-carmine-first-own-turn-16pair-20261109');
  assert.equal(registration.enginePin,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(registration.groups.length,16);
  assert.equal(registration.attempts,32);
  assert.equal(new Set(registration.groups.map(x=>x.seed)).size,16);
  assert.equal(new Set(registration.groups.map(x=>x.id)).size,16);
  for(const rank of [11,18]){
    const rows=registration.groups.filter(x=>x.rank===rank);
    assert.equal(rows.length,8);
    assert.equal(rows.filter(x=>x.candidateSlot==='A').length,4);
    assert.equal(rows.filter(x=>x.candidateSlot==='B').length,4);
  }
  return registration.groups.map(x=>({...x}));
}

/** @param {object[]} groups */
function nativeOptions(groups){
  return {
    registeredTrials:groups,
    registeredFrameName:registration.schema,
    nativeRootActionLimit:registration.rootLimit,
    vipAfterPass:true,
    vipPreferMewtwoDonor:true,
    perfectionTransition:false
  };
}

/** @param {object[]} groups @param {boolean} treatment @param {object} deps */
function oneArm(groups,treatment,deps={}){
  const run=deps.batch??runNativeBatch;
  const intervene=deps.intervene??withSourceEarlyCarmine;
  const exec=()=>run(true,undefined,nativeOptions(groups));
  return treatment?intervene(exec,{trials:groups}):{
    result:exec(),audit:null
  };
}

/** Count source/Carmine, opponent reply, and source next own-turn actions. */
function sourceContinuation(row,sourceSeat,accepted){
  const roots=row.rootActionLedger??[];
  const first=accepted?.[0]??null;
  if(!first)return {
    sourceCarmineRootCount:0,
    laterOpponentMeaningfulRootCount:0,
    laterSourceMeaningfulNextOwnTurnCount:0,
    sourceNativeCarmineObserved:false
  };
  const actual=roots.filter(x=>x.playerSlot===sourceSeat&&
    x.action==='PlayCardAction'&&
    (x.card==='Carmine'||x.card==='Carmine TWM')&&
    x.turnBefore===first.globalTurn);
  // The physical Store witness remains the authoritative action evidence.
  const sourceRoot=actual[0]??null;
  const after=sourceRoot?roots.filter(x=>
    x.actionOrdinal>sourceRoot.actionOrdinal):[];
  const consequential=new Set([
    'PlayCardAction','UseAbilityAction','AttackAction','RetreatAction'
  ]);
  return {
    sourceCarmineRootCount:actual.length,
    sourceNativeCarmineObserved:actual.length>0,
    laterOpponentMeaningfulRootCount:after.filter(x=>
      x.playerSlot===1-sourceSeat&&consequential.has(x.action)).length,
    laterSourceMeaningfulNextOwnTurnCount:after.filter(x=>
      x.playerSlot===sourceSeat&&x.turnBefore>first.globalTurn&&
      consequential.has(x.action)).length
  };
}

/**
 * Run all 32 original-source native attempts; keep errors and root caps.
 * Pure injection seam supports regression without initializing Twinleaf.
 * @param {{batch?:Function,intervene?:Function}} deps
 */
function run(deps={}){
  const groups=registered();
  const a=oneArm(groups,false,deps);
  const b=oneArm(groups,true,deps);
  const before=a.result.selected.rawDevelopment.rows;
  const after=b.result.selected.rawDevelopment.rows;
  assert.equal(before.length,16);
  assert.equal(after.length,16);
  const pairs=groups.map((group,i)=>{
    const pre=before[i],post=after[i];
    assert.equal(pre.trial?.id,group.id);
    assert.equal(post.trial?.id,group.id);
    const p=summarizeRow(pre,true),q=summarizeRow(post,true);
    const matched=p.fullPhysicalDealFingerprint!==null&&
      p.sourceDealFingerprint!==null&&
      JSON.stringify(p.fullPhysicalDealFingerprint)===
        JSON.stringify(q.fullPhysicalDealFingerprint)&&
      JSON.stringify(p.sourceDealFingerprint)===
        JSON.stringify(q.sourceDealFingerprint);
    const sourceSeat=group.candidateSlot==='A'?1:0;
    const nativeAccepted=(b.audit?.accepted??[]).filter(x=>
      x.trialId===group.id);
    const nativeRejected=(b.audit?.rejected??[]).filter(x=>
      x.trialId===group.id);
    const firstDifference=Array.isArray(pre.rootActionLedger)&&
      Array.isArray(post.rootActionLedger)?
      firstRootDivergence(pre.rootActionLedger,post.rootActionLedger):null;
    const terminalPair=p.status==='native-terminal'&&
      q.status==='native-terminal';
    return {
      id:group.id,rank:group.rank,seed:group.seed,
      candidateSeat:p.candidateSeat,sourceSeat,
      sameFullAndSourcePhysicalDeals:matched,
      control:{status:p.status,winner:terminalPair?p.winner:null,
        finalPrizes:p.remainingPrizes,error:p.error,
        acceptedRootCount:pre.rootActionLedger?.length??null},
      treatment:{status:q.status,winner:terminalPair?q.winner:null,
        finalPrizes:q.remainingPrizes,error:q.error,
        acceptedRootCount:post.rootActionLedger?.length??null},
      nativeCarmineAcceptance:nativeAccepted,
      nativeCarmineRejection:nativeRejected,
      firstRootDivergence:firstDifference,
      ...sourceContinuation(post,sourceSeat,nativeAccepted),
      completeNativeWinnerChanged:matched&&terminalPair&&p.winner!==q.winner,
      qualifiedCompetitivePaperGames:0
    };
  });
  const total=(f)=>pairs.reduce((n,p)=>n+Number(f(p)),0);
  const allPhysicallyMatched=pairs.every(p=>p.sameFullAndSourcePhysicalDeals);
  const summary={version:VERSION,registration:registration.schema,
    pinnedEngine:registration.enginePin,originalSourceRanks:[11,18],
    fixedCandidate:registration.candidate,original60sUnchanged:true,
    frozenPhysicalGroups:groups.length,attemptedNativeGames:before.length+after.length,
    physicallyMatchedPairs:total(p=>p.sameFullAndSourcePhysicalDeals),
    allPhysicallyMatched,
    controlTerminals:total(p=>p.control.status==='native-terminal'),
    treatmentTerminals:total(p=>p.treatment.status==='native-terminal'),
    controlErrors:total(p=>p.control.status==='engine-error'),
    treatmentErrors:total(p=>p.treatment.status==='engine-error'),
    nativeCarmineCommitted:b.audit?.nativeCommitted??0,
    nativeCarmineFullEffects:b.audit?.nativeEffectsComplete??0,
    sourceCarmineFirstDivergences:total(p=>{
      const d=p.firstRootDivergence;
      return Number.isSafeInteger(d?.ordinal)&&
        d.baseline?.action==='PassTurnAction'&&
        d.treatment?.action==='PlayCardAction'&&
        ['Carmine','Carmine TWM'].includes(d.treatment?.card)&&
        d.baseline?.playerSlot===p.sourceSeat&&
        d.treatment.playerSlot===p.sourceSeat&&
        p.nativeCarmineAcceptance.some(x=>x.nativeCarmineEffectFullySettled);
    }),
    sourceOpponentMeaningfulFollowupPairs:total(p=>
      p.laterOpponentMeaningfulRootCount>0),
    sourceNextOwnTurnFollowupPairs:total(p=>
      p.laterSourceMeaningfulNextOwnTurnCount>0),
    completedNativeWinnerReversals:total(p=>p.completeNativeWinnerChanged),
    qualifiedCompetitiveGames:0,
    allStatusesDevelopmentOnly:true};
  return {summary,sourceNativeAudit:b.audit,pairs,
    rawNativeRows:{control:before,treatment:after}};
}
if(require.main===module){
  const result=run();
  save(process.env.AGENT49_CARMINE_NATIVE_OUTPUT??
    'artifacts/agent49-source-carmine-first-own-turn-native.json',result);
  console.log('AGENT49_SOURCE_CARMINE_NATIVE',JSON.stringify(result.summary));
  if(!result.summary.allPhysicallyMatched)process.exitCode=1;
}
module.exports={VERSION,registered,nativeOptions,sourceContinuation,run};
