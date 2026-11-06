'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withGuardAndTypedWitness,runStatistics,run}=
  require('../simulation/evaluation/agent4-rank6-owner-underworld-veto-paired-24.cjs');
const REG=require('../results/aichi-2026/registrations/agent4-rank6-owner-underworld-veto-paired-24-v1-20261106.json');
const sourceIDs=[
  REG.historicalAbortTargets[0],
  '6:401:A:new-moon-lockbreaker-v1',
  REG.historicalAbortTargets[1],
  '6:402:B:new-moon-lockbreaker-v1'
];
function fakeRun(treatment=false){
  const modes=REG.sourceModes.map(modeId=>({
    modeId,nativeAttemptCount:4,observedLiveStoreCount:4,
    publicUnderworldVetoAudit:treatment?{
      onlyDetatchedOwnerView:true,provenVetoes:2
    }:null,
    rows:sourceIDs.map((id,i)=>({
      id,status:i%2===0?(treatment?null:'engine-error'):null,
      originalSourceDealFingerprint:'s'+i,
      originalFullPhysicalDealFingerprint:'f'+i,
      acceptedRootLedgerSha256:(treatment?'t':'b')+i,
      acceptedRootCount:100+i,
      nativeFinished:false,
      rejectedUnknownPowerActions:i%2===0&&!treatment?
        [{name:'Underworld Door',rejection:'UNKNOWN_POWER'}]:[]
    }))
  }));
  return {
    actualNativeAttemptCount:12,modes,
    paired:sourceIDs.map(id=>({id,
      aRepeatExactAcceptedPrefixAndDisposition:true}))
  };
}
test('paired scorer retains exact source contexts and companion source 60s',()=>{
  const control=fakeRun(false),guarded=fakeRun(true);
  const result=run({
    controlRunner:()=>control,
    guardRunner:()=>guarded
  });
  assert.equal(result.targetComparisons.length,6);
  assert.equal(result.matchedRows.length,12);
  assert.equal(result.observedVetoCount,6);
  assert.ok(Object.values(result.checks).every(Boolean));
  assert.equal(result.fieldWinRate,null);
  assert.equal(result.targetComparisons[0].controlNamedUnderworldRejections,1);
  assert.equal(result.targetComparisons[0].treatmentNamedUnderworldRejections,0);
});
test('mismatched physical source deal remains visible and fails admission',()=>{
  const ctrl=fakeRun(false),guard=fakeRun(true);
  guard.modes[0].rows[0].originalFullPhysicalDealFingerprint='different';
  const result=run({controlRunner:()=>ctrl,guardRunner:()=>guard});
  assert.equal(result.checks.allPairedPhysicalDealsMatch,false);
  assert.equal(result.noQualifiedCompetitiveGames,true);
});
test('missed historical native abort fails honest control replay gate',()=>{
  const ctrl=fakeRun(false);
  ctrl.modes[0].rows[0].rejectedUnknownPowerActions=[];
  const r=run({controlRunner:()=>ctrl,guardRunner:()=>fakeRun(true)});
  assert.equal(r.checks.controlSixErrorsReproduced,false);
});
test('guard and typed observer provide distinct read-only audit slots',()=>{
  const original=require('../simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs')
    .chooseUnderworldDoorRoot;
  const wrapped=withGuardAndTypedWitness(()=>true);
  assert.equal(wrapped.result,true);
  assert.equal(wrapped.audit.liveGameCount,0);
  assert.equal(wrapped.audit.publicUnderworldVetoAudit.provenVetoes,0);
  assert.equal(require('../simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs')
    .chooseUnderworldDoorRoot,original);
});
test('statistics preserve null status, failed root identity and no win rate',()=>{
  const stats=runStatistics(fakeRun(false));
  assert.equal(stats.allRows.length,12);
  assert.equal(stats.modes.length,3);
  assert.equal(stats.modes[0].rank6ChampionAbortTargets.length,2);
});
