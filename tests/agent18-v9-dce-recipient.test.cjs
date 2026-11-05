'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  REGISTRATION,auditV9SourceDce,runAgent18V9SourceDce,VERSION
}=require('../simulation/evaluation/agent18-v9-dce-recipient-audit.cjs');

const PRINT='Double Colorless Energy SUM';
const POKEMON='Iron Thorns ex TWM';

function selectedFixture(){
  const rows=REGISTRATION.all_original_trial_ids.map(id=>({
    trial:{id},status:'root-cap-reached',rootActionLedger:[],
    nativeAcceptedTargetSidecar:{
      schema:'actual-store-declared-target-sidecar-v1',
      rootOrdinalLinked:true,acceptedTargetDispatches:0,events:[]
    }
  }));
  const attempt=REGISTRATION.all_original_trial_ids.map(id=>{
    const t=REGISTRATION.tracked_targets.find(x=>x.id===id);
    return {
      id,sourceSeat:id.includes(':A:')?1:0,
      sourcePhysicalDealFingerprint:t?.source_deal_sha256??'untracked',
      fullPhysicalDealFingerprint:t?.full_deal_sha256??'untracked'
    };
  });
  for(const t of REGISTRATION.tracked_targets){
    const row=rows.find(r=>r.trial.id===t.id);
    row.rootActionLedger.push({
      actionOrdinal:t.source_dce_root_ordinal,
      turnBefore:2,playerSlot:0,action:'PlayCardAction',
      card:'Double Colorless Energy',pendingPrompt:null
    });
    row.nativeAcceptedTargetSidecar.events.push({
      schema:'actual-store-declared-target-sidecar-v1',
      rootActionOrdinal:t.source_dce_root_ordinal,
      turnBefore:2,playerSlot:0,action:'PlayCardAction',
      declared:{
        kind:'play-card',status:'captured',
        ownerHandPrinting:PRINT,
        target:{player:0,slot:0,index:0}
      },
      storeAccepted:true,visibility:'public-after-dispatch',
      publicBoardChanges:[{
        seat:0,position:'active',index:0,
        before:{pokemon:POKEMON,energies:[],tools:[]},
        after:{pokemon:POKEMON,energies:[PRINT],tools:[]}
      }]
    });
    row.nativeAcceptedTargetSidecar.acceptedTargetDispatches=1;
  }
  return {diagnostic:{
    registered:[...REGISTRATION.all_original_trial_ids],
    selectedNativeAttempts:attempt
  },rawDevelopment:{rows}};
}

test('exact frozen eight source ids and two authenticated native DCE owners',()=>{
  const fixture=selectedFixture();
  const before=JSON.stringify(fixture);
  const output=auditV9SourceDce(fixture);
  assert.equal(output.schema,VERSION);
  assert.equal(output.originalAttemptCount,8);
  assert.equal(output.targets.length,2);
  assert.equal(output.physicallySettledDceTargets,2);
  assert.ok(output.targets.every(x=>
    x.originalSourceDealParity&&x.fullPhysicalOpeningParity&&
    x.nativeStoreRootOrdinalsLinked&&x.custody.destination.position==='active'&&
    x.custody.destination.pokemon===POKEMON));
  assert.equal(output.qualifiedCompetitiveGames,0);
  assert.equal(JSON.stringify(fixture),before);
});

test('an owner Energy attachment without linked physical Store root is uncertified',()=>{
  const fixture=selectedFixture();
  fixture.rawDevelopment.rows[2].nativeAcceptedTargetSidecar.rootOrdinalLinked=false;
  const output=auditV9SourceDce(fixture);
  assert.equal(output.physicallySettledDceTargets,1);
  assert.equal(output.targets[0].nativePhysicalRecipientSettled,false);
});

test('an accepted root without physical Energy multiset delta is uncertified',()=>{
  const fixture=selectedFixture();
  const ev=fixture.rawDevelopment.rows[2].nativeAcceptedTargetSidecar.events[0];
  ev.publicBoardChanges[0].after.energies=[];
  const output=auditV9SourceDce(fixture);
  assert.equal(output.targets[0].nativePhysicalRecipientSettled,false);
  assert.equal(output.targets[0].custody.nativePhysicalAttachmentVerified,undefined);
});

test('unmatched source opening is rejected despite plausible native attachment',()=>{
  const fixture=selectedFixture();
  fixture.diagnostic.selectedNativeAttempts[2].fullPhysicalDealFingerprint='different';
  const output=auditV9SourceDce(fixture);
  assert.equal(output.targets[0].fullPhysicalOpeningParity,false);
  assert.equal(output.physicallySettledDceTargets,1);
});

test('an owner Bench recipient remains an observed different destination',()=>{
  const fixture=selectedFixture();
  const ev=fixture.rawDevelopment.rows[2].nativeAcceptedTargetSidecar.events[0];
  ev.declared.target={player:0,slot:1,index:0};
  ev.publicBoardChanges[0].position='bench';
  const output=auditV9SourceDce(fixture);
  assert.equal(output.targets[0].custody.destination.position,'bench');
  assert.equal(output.targets[0].nativePhysicalRecipientSettled,true);
});

test('runner injects only existing native accepted targets observer',()=>{
  let forwarded;
  const result=runAgent18V9SourceDce({
    selectedRunner:options=>{
      forwarded=options.runner({ownerGenericTrainerFrontier:false});
      return selectedFixture();
    },
    developmentRunner:options=>options
  });
  assert.equal(forwarded.nativeAcceptedTargets,true);
  assert.equal(forwarded.ownerGenericTrainerFrontier,false);
  assert.equal(result.physicallySettledDceTargets,2);
});
