'use strict';

const assert=require('node:assert/strict');
const reg=require(
  '../../results/aichi-2026/registrations/agent32-prospective-vip-perfection-transition-20261108.json');
const {runNativeBatch,summarizeRow,comparePairs}=
  require('./agent32-fresh-perfection-field.cjs');
const {setupEvidence}=
  require('./agent32-fresh-early-vip-perfection.cjs');

const VERSION='agent32-prospective-bilateral-native-funded-perfection-vip-v1';

/** @returns {object[]} Prospective registered unseen full source physical deals. */
function registered(){
  assert.equal(reg.schema,
    'agent32-prospective-vip-perfection-transition-16groups-v1');
  assert.equal(reg.groups.length,16);
  assert.equal(new Set(reg.groups.map(r=>r.id)).size,16);
  assert.equal(new Set(reg.groups.map(r=>r.seed)).size,16);
  for(const r of reg.groups){
    assert.equal(r.id,[r.rank,r.repeat,r.candidateSlot,r.candidateId].join(':'));
    assert.equal(r.candidateId,reg.candidate);
  }
  return reg.groups.map(r=>({...r}));
}

/** @param {object} row Actual native original game row. */
function audit(row){
  const id=row.trial?.id??row.id;
  const detail=row.actorOnlyDecisionCoverage?.detailedComponentAudits??{};
  const list=detail.root?.ownerRootIntents??[];
  const pivot=list.filter(x=>x.intent?.plan===
    'agent35-known-donor-benched-perfection-transition-v1');
  const nativeRoot=row.rootActionLedger??[];
  return {
    id,seat:row.trial?.candidateSlot==='A'?0:1,
    vip:setupEvidence(row),
    pivotBasicEnergyPlans:pivot.filter(x=>
      x.intent.kind==='attach-basic-energy').length,
    pivotRetreatPlans:pivot.filter(x=>
      x.intent.kind==='paid-retreat').length,
    actualNativeRetreatActions:nativeRoot.filter(x=>
      x.action==='RetreatAction').length,
    actualNativeRetreats:nativeRoot.filter(x=>
      x.action==='RetreatAction'),
    actualNativePerfectionActions:nativeRoot.filter(x=>
      x.action==='UseAbilityAction'&&x.ability==='Perfection').length,
    nativeCopiedAttackChoices:detail.chooseAttack?.selections??[]
  };
}

/** @param {{runner?:Function}} [deps] */
function run(deps={}){
  const groups=registered();
  const options={
    registeredTrials:groups,
    registeredFrameName:reg.schema,
    nativeRootActionLimit:reg.nativeRootLimit,
    vipAfterPass:true,vipPreferMewtwoDonor:true
  };
  const base=runNativeBatch(true,deps.runner,options);
  const plus=runNativeBatch(true,deps.runner,{
    ...options,perfectionTransition:true
  });
  const baseRows=base.selected.rawDevelopment.rows;
  const plusRows=plus.selected.rawDevelopment.rows;
  assert.equal(baseRows.length,16);
  assert.equal(plusRows.length,16);
  const control=baseRows.map(r=>summarizeRow(r,true));
  const treatment=plusRows.map(r=>summarizeRow(r,true));
  const pairs=comparePairs(control,treatment);
  const noMismatch=pairs.every(p=>p.physicallyMatched);
  const observations=plusRows.map(audit);
  const sum=(key)=>observations.reduce((n,r)=>n+(r[key]??0),0);
  return {
    version:VERSION,registration:reg.schema,
    nativeEnginePin:reg.nativePin,
    fixedSixty:reg.candidate,
    originalRankList:reg.ranks,
    status:noMismatch?'all-registered-physical-deals-paired':
      'INVALID-PHYSICAL-DEAL-MISMATCH',
    counts:{
      nativeGames:control.length+treatment.length,
      matchingFullAndSourceDeals:pairs.filter(x=>x.physicallyMatched).length,
      terminalControl:control.filter(x=>x.status==='native-terminal').length,
      terminalPivot:treatment.filter(x=>x.status==='native-terminal').length,
      nativeErrors:[...control,...treatment].filter(x=>
        x.status==='engine-error').length,
      rootCaps:[...control,...treatment].filter(x=>
        x.status==='root-cap').length,
      copiedAttacksControl:control.reduce((n,r)=>
        n+r.acceptedPerfectionRootIntents,0),
      copiedAttacksPivot:treatment.reduce((n,r)=>
        n+r.acceptedPerfectionRootIntents,0),
      pivotBasicEnergyPlans:sum('pivotBasicEnergyPlans'),
      pivotRetreatPlans:sum('pivotRetreatPlans'),
      nativeRetreatsPivot:sum('actualNativeRetreatActions'),
      nativePerfectionActionPivot:sum('actualNativePerfectionActions'),
      nativeTerminalWinReversals:pairs.filter(x=>
        x.nativeResultReversed).length,
      competitiveGamesQualified:0
    },
    control, treatment, pairs, observations,
    releaseQualified:false,competitiveGamesQualified:0
  };
}

if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.status!=='all-registered-physical-deals-paired'||
    result.counts.nativeErrors>0)process.exitCode=1;
}

module.exports={VERSION,registered,audit,run};
