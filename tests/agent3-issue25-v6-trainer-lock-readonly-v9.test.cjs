'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {auditReadOnlyReplay,REGISTRATION,VERSION}=
  require('../simulation/evaluation/agent3-issue25-v6-trainer-lock-readonly-v9.cjs');

const prereg=JSON.parse(fs.readFileSync(
  path.resolve(__dirname,'..',REGISTRATION),'utf8'));
const sha=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/** @param {{withTrainer?:boolean,reverseSeat?:boolean}} [options] */
function fakeNative(options={}){
  const baselines=prereg.baselineRecordedRows;
  const registered=baselines.map(row=>row.id);
  const statuses=baselines.map(row=>({
    id:row.id,originalSourceSeat:options.reverseSeat?
      1-row.actualSourceSeat:row.actualSourceSeat,
    nativeAbortProvenance:null,
    sourceDealFingerprint:row.sourceDealFingerprint,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
    actualStarterSeat:row.actualFirstPlayer,
    status:row.status
  }));
  const rows=baselines.map((row,index)=>({
    trial:{id:row.id},status:row.status,sourceSeat:row.actualSourceSeat,
    rootActionLedger:[{
      actionOrdinal:0,playerSlot:row.actualSourceSeat,
      turnBefore:1,turnAfter:2,action:'PassTurnAction'
    }],
    actorOnlyDecisionCoverage:options.withTrainer===false&&index===3?
      null:{ownerGenericTrainerFrontierOptIn:true,
      ownerTrainerFrontierAudit:{
        summary:{
          observedRootCount:2,rootsOmittedDueToCap:0,
          nativeCatalogPrintings:450,bySeat:{
            0:{observedRoots:1,acceptedPassWithUnblockedTrainer:1},
            1:{observedRoots:1,acceptedPassWithUnblockedTrainer:1}
          }
        },
        roots:[{seat:0,guaranteedK0VipPassed:false}]
      }}
  }));
  return {manifest:{
    sourceIndependentCommonPolicy:true,developmentTrialCount:8,
    actualRunnerConfirmedOption:true,observedTwinleafGitCommit:'a'.repeat(40)
  },diagnostic:{registered,
    attemptedRows:statuses,
    rawRowIdentityReconciliation:{exactlyReconciled:true}},
  rawDevelopment:{rows,nativePressureWindowsOptIn:true}};
}

test('read-only v6 replay returns complete eight identities with zero qualified games',()=>{
  const got=auditReadOnlyReplay(fakeNative(),prereg);
  assert.equal(got.rows.length,8);
  assert.equal(got.qualifiedCompetitiveGames,0);
  assert.equal(got.gates.completeOriginalNativeParity,false);
  assert.equal(got.gates.observedOwnerTrainerCensusAllEight,true);
  assert.ok(got.rows.every(r=>r.originalNativeSourceSeatProvenance===
    'actual-row'));
  assert.equal(got.rows[0].ownerTrainerFrontier.sourceSeat.observedRoots,1);
  assert.equal(got.rows[0].ownerTrainerFrontier
    .rawOwnerPrivateHandNamesPublished,false);
});

test('all fields of an authentic exact frozen native replay pass A/A',()=>{
  const native=fakeNative();
  for(let i=0;i<8;i++){
    const base=prereg.baselineRecordedRows[i],raw=native.rawDevelopment.rows[i];
    const a=[{actionOrdinal:0,action:'PassTurnAction',
      playerSlot:base.actualSourceSeat,turnBefore:1,turnAfter:2}];
    raw.rootActionLedger=a;
    base.publicRootLedgerSha256=sha(a);
    base.nativeRootCount=1;
  }
  const got=auditReadOnlyReplay(native,prereg);
  assert.equal(got.gates.completeOriginalNativeParity,true);
  assert.ok(got.rows.every(row=>row.allBaselineNativeFieldsEqual));
  assert.equal(got.gates.gameResultsCompetitivelyQualified,false);
});

test('one changed source physical deal fails observational parity',()=>{
  const native=fakeNative();
  native.diagnostic.attemptedRows[0].sourceDealFingerprint='0'.repeat(64);
  const got=auditReadOnlyReplay(native,prereg);
  assert.equal(got.rows[0].baselineExactChecks.sourceDealFingerprint,false);
  assert.equal(got.gates.completeOriginalNativeParity,false);
});

test('one missing genuine owner Trainer observation is visible and unresolved',()=>{
  const got=auditReadOnlyReplay(fakeNative({withTrainer:false}),prereg);
  assert.equal(got.gates.observedOwnerTrainerCensusAllEight,false);
  assert.equal(got.rows[3].ownerTrainerFrontier.observed,false);
});

test('reversed source seat is detected even when all physical hashes stay equal',()=>{
  const got=auditReadOnlyReplay(fakeNative({reverseSeat:true}),prereg);
  assert.equal(got.rows.filter(row=>
    row.baselineExactChecks.actualSourceSeat===false).length,8);
  assert.equal(got.gates.completeOriginalNativeParity,false);
});

test('duplicate, lost and mismatched native registrations never enter results',()=>{
  const duplicate=fakeNative();
  duplicate.rawDevelopment.rows[1].trial.id=
    duplicate.rawDevelopment.rows[0].trial.id;
  assert.throws(()=>auditReadOnlyReplay(duplicate,prereg));
  const missing=fakeNative();
  missing.rawDevelopment.rows.pop();
  assert.throws(()=>auditReadOnlyReplay(missing,prereg));
  const alt=fakeNative();
  alt.diagnostic.registered[0]='FALSIFIED';
  assert.throws(()=>auditReadOnlyReplay(alt,prereg));
});

test('failed or aborted native development remains zero competitive games',()=>{
  const native=fakeNative();
  native.rawDevelopment.rows[5].status='engine-error';
  const got=auditReadOnlyReplay(native,prereg);
  assert.equal(got.qualifiedCompetitiveGames,0);
  assert.equal(got.gates.all32OriginalFieldCertified,false);
  assert.equal(got.gates.paperClockCertified,false);
  assert.equal(VERSION,'agent3-issue25-readonly-owner-trainer-and-passive-pressure-v9');
});
