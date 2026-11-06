'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,withRegisteredNativeFilchGuard,matchedNativePass,
  publicOutcome,runAgent1V15FilchAba
}=require('../simulation/evaluation/agent1-v15-bilateral-filch-conservation-aba.cjs');
const {registeredTrials}=
  require('../simulation/evaluation/agent36-issue25-common-v6.cjs');

test('actual per-game native owner action wrapper observes exact registered trial ID',()=>{
  const native={runMatch:request=>({label:request.label,finished:false})};
  const old=native.runMatch;
  const fakeAdapter=execute=>({
    result:execute(),
    audit:{proposedPrintedOwnerFilch:1,acceptedOriginalFilch:0,
      selectedOwnerPasses:1,replacementEvents:[{
        globalTurn:9,ownerSeat:0,ownDeckRemaining:24
      }]}
  });
  const item='11:202:A:champion-reference';
  const audit=withRegisteredNativeFilchGuard(()=>
    native.runMatch({label:
      'agent41-bilateral-v2-common-policy-development-'+item}),
  {headless:native,adapter:fakeAdapter});
  assert.equal(audit.result.finished,false);
  assert.strictEqual(native.runMatch,old);
  assert.equal(audit.audit.length,1);
  assert.equal(audit.audit[0].id,item);
  assert.equal(audit.audit[0].nativeReturned,true);
  assert.equal(audit.audit[0].filch.selectedOwnerPasses,1);
});

test('owner native abort propagates with original error and retained audit',()=>{
  const cause=Error('opaque engine');
  cause.ownerConservativeFilchAudit={selectedOwnerPasses:3,
    replacementEvents:[]};
  const native={runMatch:()=>{throw cause;}};
  const old=native.runMatch;
  const audit=[];
  assert.throws(()=>withRegisteredNativeFilchGuard(()=>
    native.runMatch({label:
      'agent41-bilateral-v2-common-policy-development-6:200:A:champion-reference'}),
    {headless:native,adapter:execute=>execute()}),e=>e===cause);
  assert.strictEqual(native.runMatch,old);
  assert.deepEqual(audit,[]);
});

test('the printed Filch replacement joins exactly one accepted owner Pass root',()=>{
  const roots=[
    {actionOrdinal:8,turnBefore:9,playerSlot:0,
      action:'PassTurnAction'},
    {actionOrdinal:9,turnBefore:10,playerSlot:1,
      action:'AttackAction',attack:'Filch'}
  ];
  assert.equal(matchedNativePass(roots,{globalTurn:9,ownerSeat:0}),8);
  assert.equal(matchedNativePass(roots,{globalTurn:10,ownerSeat:0}),null);
});

test('public summary preserves source role, terminal and counts',()=>{
  const row={
    id:'11:202:A:champion-reference',sourceSeat:1,
    genuineNativeFinished:true,reportedNativeWinner:1,
    publicNativeRootCount:2, nativeFinalPrizes:[6,6],
    nativeEndReason:'engine-game-end',
    originalNativeEndstate:{publicDeckCountsBySeat:[0,29]},
    sourceActualAttacks:[],
    publicNativeRootActions:[
      {actionOrdinal:0,playerSlot:0,action:'AttackAction',attack:'Filch'},
      {actionOrdinal:1,playerSlot:1,action:'PassTurnAction'}
    ]
  };
  const x=publicOutcome(row);
  assert.equal(x.sourceWinner,true);
  assert.deepEqual(x.finalDeckCountsBySeat,[0,29]);
  assert.equal(x.countsBySeat[0].filch,1);
  assert.equal(x.countsBySeat[1].pass,1);
  assert.equal(x.disposition,'native-engine-finished');
  assert.equal(x.rootLedgerSHA256.length,64);
});

test('three-arm eight-registered comparison requires exact A/A prime root replay',()=>{
  const ids=registeredTrials().map(x=>x.id);
  const mk=()=>ids.map(id=>({
    id,sourceSeat:id.includes(':A:')?1:0,
    sourcePhysicalDealFingerprint:'source-'+id,
    fullPhysicalDealFingerprint:'entire-'+id,
    publicNativeRootCount:1,
    publicNativeRootActions:[{
      actionOrdinal:0,turnBefore:0,playerSlot:0,
      action:'PassTurnAction'
    }],
    genuineNativeFinished:false,reportedNativeWinner:null,
    nativeFinalPrizes:[6,6],nativeEndReason:'action-limit'
  }));
  const base=opts=>{
    if(opts?.runner)opts.runner({nativeRootActionLimit:260});
    return {manifest:{version:'synthetic'},diagnostic:{
      publicNativeRows:mk()
    }};
  };
  const mockGuard=execute=>({
    result:execute(),
    audit:ids.map(id=>({id,nativeReturned:true,filch:{
      proposedPrintedOwnerFilch:0,acceptedOriginalFilch:0,
      selectedOwnerPasses:0,replacementEvents:[]
    }}))
  });
  const r=runAgent1V15FilchAba({
    base,runner:()=>({}),withGuard:mockGuard
  });
  assert.equal(r.schema,VERSION);
  assert.equal(r.originalRegisteredTrialCount,8);
  assert.equal(r.fixedOwnerDeckConservationThreshold,24);
  assert.equal(r.recordsByArm.length,3);
  assert.equal(r.provenance.sameAllEightFullPhysicalOpenings,true);
  assert.equal(r.provenance.sameAllEightOriginalSourceOpenings,true);
  assert.equal(r.provenance.exactEightControlRepeatRootsAndOutcomes,true);
  assert.equal(r.provenance.everyTreatmentNativeTrialAudited,true);
  assert.equal(r.provenance.noUnexplainedTreatmentRootChanges,true);
  assert.equal(r.competitiveGamesQualified,0);
});
