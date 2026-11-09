'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const reg=require('../../results/aichi-2026/registrations/agent32-prospective-29rank-116native-20261109.json');
const {runNativeBatch,summarizeRow}=
  require('./agent32-fresh-perfection-field.cjs');
const {firstRootDivergence}=
  require('./agent24-v8-perfection-paired-native.cjs');
const {audit}=
  require('./agent32-prospective-vip-perfection-transition.cjs');

const VERSION='agent32-unseen-native-all29-physical-bothseats-perfection-pivot-v1';

/** @returns {object[]} Real 60-card Aichi original vs one fixed New Moon across both physical seats. */
function registered(){
  assert.equal(reg.schema,
    'agent32-prospective-all29-authenticated-original-vip-perfection-pivot-v1');
  assert.equal(reg.physicalGroups,58);
  assert.equal(reg.expectedNativeAttempts,116);
  assert.equal(reg.groups.length,58);
  assert.equal(new Set(reg.groups.map(x=>x.id)).size,58);
  assert.equal(new Set(reg.groups.map(x=>x.seed)).size,58);
  const ranks=new Set(reg.groups.map(x=>x.rank));
  assert.equal(ranks.size,29);
  assert.deepEqual([...ranks].sort((a,b)=>a-b),reg.originalSourceRanks);
  for(const group of reg.groups){
    assert.equal(group.candidateId,reg.fixedChallenger);
    assert.equal(group.id,[group.rank,group.repeat,
      group.candidateSlot,group.candidateId].join(':'));
    assert.ok(Number.isSafeInteger(group.seed)&&group.seed>=0&&
      group.seed<=0xffffffff);
  }
  return reg.groups.map(x=>({...x}));
}

/**
 * Original registered physical equality and paired terminal-only winner
 * attribution. A root cap or native error is censored, never a victory.
 * @param {object} control
 * @param {object} treatment
 */
function matched(control,treatment){
  assert.equal(control.id,treatment.id);
  const full=control.fullPhysicalDealFingerprint&&
    treatment.fullPhysicalDealFingerprint&&
    JSON.stringify(control.fullPhysicalDealFingerprint)===
      JSON.stringify(treatment.fullPhysicalDealFingerprint);
  const source=control.sourceDealFingerprint&&
    treatment.sourceDealFingerprint&&
    JSON.stringify(control.sourceDealFingerprint)===
      JSON.stringify(treatment.sourceDealFingerprint);
  const winner=(r)=>r.status==='native-terminal'&&
    r.winner===r.candidateSeat;
  const naturallyBoth=control.status==='native-terminal'&&
    treatment.status==='native-terminal';
  const difference=control.rootActionLedger&&
    treatment.rootActionLedger?
    firstRootDivergence(control.rootActionLedger,
      treatment.rootActionLedger):null;
  return {
    id:control.id,rank:control.rank,seed:control.seed,
    candidateSeat:control.candidateSeat,
    matchedFull:full===true,matchedOriginalSource:source===true,
    firstRootDifference:difference,
    control:{
      status:control.status,winner:control.winner,
      candidateNativeWinner:winner(control),
      rootActions:control.rootActions,
      remainingPrizes:control.remainingPrizes,
      paidPerfection:control.acceptedPerfectionRootIntents
    },
    treatment:{
      status:treatment.status,winner:treatment.winner,
      candidateNativeWinner:winner(treatment),
      rootActions:treatment.rootActions,
      remainingPrizes:treatment.remainingPrizes,
      paidPerfection:treatment.acceptedPerfectionRootIntents
    },
    nativeWinnerReversed:naturallyBoth&&
      control.winner!==treatment.winner,
    actualSourceLossToCandidateWin:naturallyBoth&&
      !winner(control)&&winner(treatment),
    actualCandidateWinToSourceLoss:naturallyBoth&&
      winner(control)&&!winner(treatment)
  };
}

/**
 * Full authenticated opponent expansion under one common two-seat policy.
 * @param {{runner?:Function}} [deps]
 */
function run(deps={}){
  const groups=registered();
  const opts={
    registeredTrials:groups,
    registeredFrameName:reg.schema,
    nativeRootActionLimit:reg.nativeRootLimit,
    vipAfterPass:true,vipPreferMewtwoDonor:true
  };
  const baseline=runNativeBatch(true,deps.runner,opts);
  const pivot=runNativeBatch(true,deps.runner,{
    ...opts,perfectionTransition:true
  });
  const controls=baseline.selected.rawDevelopment.rows
    .map(x=>summarizeRow(x,true));
  const treatments=pivot.selected.rawDevelopment.rows
    .map(x=>summarizeRow(x,true));
  assert.equal(controls.length,58);
  assert.equal(treatments.length,58);
  const byId=new Map(treatments.map(x=>[x.id,x]));
  assert.equal(byId.size,58);
  const pairs=controls.map(x=>{
    assert.ok(byId.has(x.id),'Missing original treatment '+x.id);
    return matched(x,byId.get(x.id));
  });
  const nativeAudits=pivot.selected.rawDevelopment.rows.map(audit);
  const totals={
    nativeTrials:controls.length+treatments.length,
    fullAndOriginalPhysicalMatched:pairs.filter(x=>
      x.matchedFull&&x.matchedOriginalSource).length,
    nativeTerminalsControl:controls.filter(x=>x.status==='native-terminal').length,
    nativeTerminalsTreatment:treatments.filter(x=>x.status==='native-terminal').length,
    nativeErrors:[...controls,...treatments].filter(x=>
      x.status==='engine-error').length,
    rootCaps:[...controls,...treatments].filter(x=>x.status==='root-cap').length,
    nativePerfectionControl:controls.reduce((n,x)=>
      n+x.acceptedPerfectionRootIntents,0),
    nativePerfectionTreatment:treatments.reduce((n,x)=>
      n+x.acceptedPerfectionRootIntents,0),
    nativePivotRetreats:nativeAudits.reduce((n,x)=>
      n+x.actualNativeRetreatActions,0),
    actualNativeSourceLossCandidateWin:pairs.filter(x=>
      x.actualSourceLossToCandidateWin).length,
    actualNativeCandidateWinSourceLoss:pairs.filter(x=>
      x.actualCandidateWinToSourceLoss).length,
    competitivePaperQualifiedGames:0
  };
  const byRank=reg.originalSourceRanks.map(rank=>{
    const subset=pairs.filter(x=>x.rank===rank);
    assert.equal(subset.length,2);
    return {rank,sourceOriginalSixtyAuthenticated:true,
      sampleSizePhysicalSeats:subset.length,
      matched:subset.filter(x=>x.matchedFull&&
        x.matchedOriginalSource).length,
      nativeControlTerminals:subset.filter(x=>
        x.control.status==='native-terminal').length,
      nativeTreatmentTerminals:subset.filter(x=>
        x.treatment.status==='native-terminal').length,
      sourceLossCandidateWin:subset.filter(x=>
        x.actualSourceLossToCandidateWin).length,
      candidateWinSourceLoss:subset.filter(x=>
        x.actualCandidateWinToSourceLoss).length,
      attemptsCensored:subset.reduce((n,x)=>n+
        Number(x.control.status!=='native-terminal')+
        Number(x.treatment.status!=='native-terminal'),0)};
  });
  return {
    version:VERSION,originalSourceRanks:reg.originalSourceRanks,
    missingOriginalSourceRanks:reg.missingOriginalSourceRanks,
    registration:reg.schema,
    fixedCandidate:reg.fixedChallenger,
    nativeEnginePin:reg.enginePin,
    nativeRootLimit:reg.nativeRootLimit,
    comparison:'Only native bilateral default-off donor-specific paid Perfection pivot changes',
    studyStatus:totals.fullAndOriginalPhysicalMatched===58?
      '58-registered-original-physical-deals-matched':
      'INVALID-ONE-OR-MORE-PHYSICAL-DEALS-DIFFER',
    totals,byRank,pairs,
    controls,treatments,nativeAudits,
    releaseQualified:false,competitivePaperQualifiedGames:0
  };
}

if(require.main===module){
  const report=run();
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  if(report.studyStatus!=='58-registered-original-physical-deals-matched'||
    report.totals.nativeErrors>0)process.exitCode=1;
}

module.exports={VERSION,registered,matched,run};
