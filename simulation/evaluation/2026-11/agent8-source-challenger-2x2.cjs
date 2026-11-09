'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const reg=require('../../../results/aichi-2026/registrations/agent8-source-challenger-prospective-20261109.json');
const {runNativeBatch,summarizeRow}=require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {firstRootDivergence}=require('../agent24-v8-perfection-paired-native.cjs');

const VERSION='agent8-source-only-adversarial-2x2-prospective-v1';
const PHASES=Object.freeze([
  Object.freeze({id:'P0S0',pivot:false,sourceChallenge:false}),
  Object.freeze({id:'P1S0',pivot:true,sourceChallenge:false}),
  Object.freeze({id:'P0S1',pivot:false,sourceChallenge:true}),
  Object.freeze({id:'P1S1',pivot:true,sourceChallenge:true})
]);

/** @returns {object[]} Exactly the already-registered eight physical deals. */
function registered(){
  assert.equal(reg.schema,'agent8-prospective-original-source-adversarial-2x2-v1');
  assert.equal(reg.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(reg.groups.length,8);
  assert.equal(reg.expectedNativeAttempts,32);
  assert.deepEqual(reg.originalSourceRanks,[5,11,13,31]);
  assert.equal(new Set(reg.groups.map(row=>row.id)).size,8);
  assert.equal(new Set(reg.groups.map(row=>row.seed)).size,8);
  for(const row of reg.groups){
    assert.equal(row.id,[row.rank,row.repeat,row.candidateSlot,row.candidateId].join(':'));
    assert.equal(row.candidateId,reg.fixedCandidate);
    assert.ok(['A','B'].includes(row.candidateSlot));
    assert.ok(Number.isSafeInteger(row.seed)&&row.seed>=0&&row.seed<=0xffffffff);
  }
  for(const rank of reg.originalSourceRanks){
    assert.deepEqual(reg.groups.filter(row=>row.rank===rank)
      .map(row=>row.candidateSlot).sort(),['A','B']);
  }
  return reg.groups.map(row=>({...row}));
}

/**
 * Native selector switches for an adversarial original-source actor.
 * Candidate's root policy stays identical across S0/S1. Shared Guzma
 * owner-prompt continuation is deliberately enabled in all four phases.
 * @param {boolean} enabled
 * @returns {object}
 */
function sourceChallengeRootOptions(enabled){
  assert.equal(typeof enabled,'boolean');
  return {
    actorGuzmaPromptContinuation:true,
    actorPotentialKoRoot:enabled,
    actorPotentialKoSourceOnly:enabled,
    actorGenericFundedFloatStoneRoot:enabled,
    actorGenericFundedFloatStoneSourceOnly:enabled,
    actorSeekerGuzmaNominalKo:enabled,
    actorSeekerGuzmaSourceOnly:enabled
  };
}

/** @param {object} phase @param {Function} [nativeRunner] */
function runPhase(phase,nativeRunner=runDevelopment){
  assert.ok(PHASES.some(candidate=>candidate.id===phase.id));
  const registeredTrials=registered();
  const source=sourceChallengeRootOptions(phase.sourceChallenge);
  return runNativeBatch(true,options=>nativeRunner({
    ...options,...source
  }),{
    registeredTrials,
    registeredFrameName:reg.schema+'-'+phase.id,
    nativeRootActionLimit:reg.nativeRootActionLimit,
    vipAfterPass:true,
    vipPreferMewtwoDonor:true,
    perfectionTransition:phase.pivot
  });
}

/**
 * Keep exact full-source initial physical fingerprints in all four arms.
 * Missing fingerprints and any mismatch disqualify a matched outcome.
 * @param {object[]} rows Four native summaries in PHASES order.
 * @param {object} original Registered physical trial.
 * @returns {object}
 */
function compareGroup(rows,original){
  assert.equal(rows.length,4);
  for(const row of rows){
    assert.equal(row.id,original.id);
    assert.equal(row.seed,original.seed);
    assert.equal(row.rank,original.rank);
    assert.equal(row.candidateSeat,original.candidateSlot==='A'?0:1);
  }
  const [p0s0,p1s0,p0s1,p1s1]=rows;
  const physical=rows.every(row=>
    row.fullPhysicalDealFingerprint!==null&&
    row.sourceDealFingerprint!==null)&&
    rows.every(row=>
      JSON.stringify(row.fullPhysicalDealFingerprint)===
        JSON.stringify(p0s0.fullPhysicalDealFingerprint)&&
      JSON.stringify(row.sourceDealFingerprint)===
        JSON.stringify(p0s0.sourceDealFingerprint));
  const terminal=rows.every(row=>row.status==='native-terminal');
  const outcome=(row)=>row.status==='native-terminal'?{
    status:row.status,winner:row.winner,
    candidateWin:row.winner===row.candidateSeat,
    remainingPrizes:row.remainingPrizes
  }:{status:row.status,winner:null,candidateWin:null,
    remainingPrizes:row.remainingPrizes};
  const candidatePivotBefore=physical&&terminal&&
    p0s0.winner!==p1s0.winner;
  const candidatePivotAfter=physical&&terminal&&
    p0s1.winner!==p1s1.winner;
  const sourceEffectWithoutPivot=physical&&terminal&&
    p0s0.winner!==p0s1.winner;
  const sourceEffectWithPivot=physical&&terminal&&
    p1s0.winner!==p1s1.winner;
  const difference=(a,b)=>Array.isArray(a.rootActionLedger)&&
    Array.isArray(b.rootActionLedger)?
    firstRootDivergence(a.rootActionLedger,b.rootActionLedger):null;
  return {
    id:original.id,rank:original.rank,seed:original.seed,
    sourceSeat:1-p0s0.candidateSeat,candidateSeat:p0s0.candidateSeat,
    physicallyMatchedAcrossFour:physical,
    fourNativeTerminals:terminal,
    qualifiedPaperGames:0,
    P0S0:outcome(p0s0),P1S0:outcome(p1s0),
    P0S1:outcome(p0s1),P1S1:outcome(p1s1),
    sourceChallengerFirstDifferenceWithoutPivot:difference(p0s0,p0s1),
    sourceChallengerFirstDifferenceWithPivot:difference(p1s0,p1s1),
    pivotFirstDifferenceWithoutSourceChallenge:difference(p0s0,p1s0),
    pivotFirstDifferenceWithSourceChallenge:difference(p0s1,p1s1),
    winnerChangedByPivotBeforeSourceChallenge:candidatePivotBefore,
    winnerChangedByPivotAfterSourceChallenge:candidatePivotAfter,
    winnerChangedBySourceChallengeWithoutPivot:sourceEffectWithoutPivot,
    winnerChangedBySourceChallengeWithPivot:sourceEffectWithPivot
  };
}

/**
 * Pure all-arm admission and winner comparison; caller supplies actual native
 * summaries or purpose-built test fixtures. Errors and caps remain present.
 * @param {Record<string,object[]>} byPhase
 * @param {object[]} groups Registered deals.
 */
function analyze(byPhase,groups){
  assert.equal(groups.length,8);
  const byName=new Map(PHASES.map(p=>{
    const rows=byPhase[p.id];
    assert.ok(Array.isArray(rows)&&rows.length===groups.length,
      'Every phase must return all eight registered original games');
    const entries=new Map(rows.map(row=>[row.id,row]));
    assert.equal(entries.size,groups.length,'Duplicate native trial in phase');
    return [p.id,entries];
  }));
  const pairs=groups.map(group=>compareGroup(
    PHASES.map(phase=>{
      const row=byName.get(phase.id).get(group.id);
      assert.ok(row,'Missing registered phase trial '+phase.id+'/'+group.id);
      return row;
    }),group));
  const allRows=PHASES.flatMap(phase=>byPhase[phase.id]);
  const physicallyMatched=pairs.filter(x=>x.physicallyMatchedAcrossFour).length;
  const fullyTerminated=pairs.filter(x=>
    x.physicallyMatchedAcrossFour&&x.fourNativeTerminals).length;
  return {
    version:VERSION,registration:reg.schema,enginePin:reg.enginePin,
    registeredGroups:groups.length,nativeAttempts:allRows.length,
    status:physicallyMatched===groups.length?
      'PHYSICAL-MATCHED-DEVELOPMENT-ONLY':
      'INVALID-PHYSICAL-MATCH-OR-MISSING-FINGERPRINT',
    qualifiedPaperGames:0,
    totals:{
      fullPhysicalMatchFourWays:physicallyMatched,
      fourWayNaturalTerminalGroups:fullyTerminated,
      nativeErrors:allRows.filter(r=>r.status==='engine-error').length,
      rootCaps:allRows.filter(r=>r.status==='root-cap').length,
      otherUnqualified:allRows.filter(r=>
        !['engine-error','root-cap','native-terminal'].includes(r.status)).length,
      winnerChangedByPivotBeforeSourceChallenge:pairs.filter(x=>
        x.winnerChangedByPivotBeforeSourceChallenge).length,
      winnerChangedByPivotAfterSourceChallenge:pairs.filter(x=>
        x.winnerChangedByPivotAfterSourceChallenge).length,
      winnerChangedBySourceChallengeWithPivot:pairs.filter(x=>
        x.winnerChangedBySourceChallengeWithPivot).length
    },pairs
  };
}

/**
 * Run the frozen 2x2 on one unchanged source/candidate 60 and physical deal
 * in each rank/seat group. All raw native diagnostics stay in the artifact.
 * @param {{runPhase?:Function}} [deps]
 */
function run(deps={}){
  const groups=registered();
  const summaries={};
  const raw={};
  for(const phase of PHASES){
    const outcome=(deps.runPhase??runPhase)(phase);
    const rows=outcome.selected.rawDevelopment.rows;
    assert.equal(rows.length,groups.length);
    summaries[phase.id]=rows.map(row=>summarizeRow(row,true));
    raw[phase.id]=rows;
  }
  const comparison=analyze(summaries,groups);
  return {
    ...comparison,phaseOrder:PHASES,
    sourceChallengeRootOptions:sourceChallengeRootOptions(true),
    unchangedPrintedSixties:true,
    noPostSelectionSeedChanges:true,
    sourceOpponentPolicyCompetenceUnqualified:true,
    nativeRootLimit:reg.nativeRootActionLimit,
    phaseSummaries:summaries,rawNativeRows:raw
  };
}

/**
 * Lock a writable destination and replace a temporary complete JSON file.
 * @param {string} dest
 * @param {object} value
 */
function save(dest,value){
  const full=path.resolve(dest);
  fs.mkdirSync(path.dirname(full),{recursive:true});
  const lock=full+'.lock';
  const fd=fs.openSync(lock,'wx');
  const tmp=full+'.'+process.pid+'.tmp';
  try{
    fs.writeFileSync(tmp,JSON.stringify(value,null,2)+'\n');
    fs.renameSync(tmp,full);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

if(require.main===module){
  const result=run();
  save(process.env.AGENT8_SOURCE_CHALLENGER_OUTPUT??
    'artifacts/agent8-source-challenger-2x2.json',result);
  const {rawNativeRows,phaseSummaries,...header}=result;
  process.stdout.write(JSON.stringify(header.totals)+'\n');
  if(result.status!=='PHYSICAL-MATCHED-DEVELOPMENT-ONLY')
    process.exitCode=1;
}

module.exports={
  VERSION,PHASES,registered,sourceChallengeRootOptions,
  runPhase,compareGroup,analyze,run,save
};
