'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  auditArtifact,SCHEMA,SELECTED,CONTROL
}=require('../scripts/agent8-v3-floatstone-activation-denominator.cjs');

function fixture(){
  const trial1={id:'1:401:A:champion-reference',rank:1};
  const trial2={id:'6:401:A:champion-reference',rank:6};
  const selectedRows=[
    {trialId:trial1.id,rootLedgerHash:'abc',
      selectedFundedFloatStoneIntents:0},
    {trialId:trial2.id,rootLedgerHash:null,
      selectedFundedFloatStoneIntents:0}
  ];
  const native=[
    {trial:trial1,sourceSeat:1,candidateSeat:0,
      actorOnlyDecisionCoverage:{
        ownerTrainerFrontierAudit:{
          observedAuthenticStore:true,
          roots:[
            {ordinal:0,seat:0,turn:2,
              trainers:[{printing:'Float Stone BKT',
                nativeEnumeratorOffered:true,publicBlocker:null,
                paperEligibility:'unresolved-card-specific'}],
              chosen:{action:'PassTurnAction'}},
            {ordinal:1,seat:0,turn:4,
              trainers:[{printing:'Float Stone BKT',
                nativeEnumeratorOffered:false,publicBlocker:'item-locked',
                paperEligibility:'known-public-blocked'}],
              chosen:{action:'AttackAction'}},
            {ordinal:2,seat:1,turn:5,
              trainers:[{printing:'Float Stone BKT',
                nativeEnumeratorOffered:true,publicBlocker:null,
                paperEligibility:'unresolved-card-specific'}],
              chosen:{action:'PassTurnAction'}},
            {ordinal:3,seat:0,turn:6,trainers:[],
              chosen:{action:'PassTurnAction'}}
          ]
        }
      }},
    {trial:trial2,status:'native-error',
      error:'UseAbilityAction UNKNOWN_POWER'}
  ];
  return {schema:SCHEMA,modes:[
    {id:CONTROL,rows:[
      {trialId:trial1.id,rootLedgerHash:'abc'},
      {trialId:trial2.id,rootLedgerHash:null}
    ]},
    {id:SELECTED,rows:selectedRows,fullNative:{rows:native}}
  ]};
}

test('partitions authentic native offer, paper UNKNOWN, Pass and source role',()=>{
  const got=auditArtifact(fixture());
  assert.deepEqual(got.totals,{
    registeredContexts:2,intactContexts:1,abortedContexts:1,
    candidateOwnerFrames:3,candidatePassFrames:2,
    heldToolCandidateFrames:2,nativeOfferedToolCandidateFrames:1,
    heldToolCandidatePassFrames:1,nativeOfferedToolCandidatePassFrames:1,
    nativeSelectedFundedToolIntents:0,
    identicalIntactControlLedgers:1
  });
  const found=got.summaries[0];
  assert.equal(found.trialId,'1:401:A:champion-reference');
  assert.equal(found.candidatePassToolWindows.length,1);
  assert.equal(found.candidatePassToolWindows[0].globalTurn,2);
  assert.equal(found.candidatePassToolWindows[0].nativeOffered,true);
  assert.equal(found.candidatePassToolWindows[0].paperEligibility[0],
    'unresolved-card-specific');
  assert.equal(found.positivePaperEligibilityCertified,false);
  assert.equal(got.summaries[1].rootStatus,'native-error');
});

test('refuses ungrounded success and corrupted original archive shapes',()=>{
  const wrong=fixture();wrong.schema='mismatched';
  assert.throws(()=>auditArtifact(wrong));
  const missing=fixture();
  missing.modes[1].fullNative.rows[1].error=null;
  assert.throws(()=>auditArtifact(missing));
  const counterfeit=fixture();
  counterfeit.modes[1].fullNative.rows[0]
    .actorOnlyDecisionCoverage.ownerTrainerFrontierAudit.observedAuthenticStore=false;
  assert.throws(()=>auditArtifact(counterfeit));
  const absent=fixture();absent.modes[0].rows.shift();
  assert.throws(()=>auditArtifact(absent));
});
