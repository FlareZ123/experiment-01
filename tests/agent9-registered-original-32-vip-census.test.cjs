'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {analyze,SCHEMA}=
  require('../simulation/evaluation/agent9-registered-original-32-vip-census.cjs');

const REGISTER={
  schema:'agent9-registered-existing-32-arm-vip-coverage-probe-v1',
  attempts:32,parentRegistrationExpectedBlob:'frozen-blob',
  enginePin:'pinned-twinleaf'
};

/** @param {boolean} treatment */
function fixture(treatment){
  const rows=Array.from({length:32},(_,i)=>{
    const slot=i%2?'B':'A';
    const sourceSeat=slot==='A'?1:0;
    const zero={items:0,searches:0,benchConfirmed:0};
    const one={items:1,searches:1,benchConfirmed:1};
    const bySeat={
      0:sourceSeat===0&&i===1?one:zero,
      1:sourceSeat===1&&i===0?one:zero
    };
    return {
      trial:{id:'trial-'+i,rank:i<16?6:11,
        candidateSlot:slot,candidateId:'champion-reference',seed:i},
      sourceDealFingerprint:'source-'+i,
      fullPhysicalDealFingerprint:'setup-'+i,
      actualStarterSeat:sourceSeat,
      finished:i%4===0,
      qualifiesForCompetitiveInference:false,
      actorOnlyDecisionCoverage:{
        ownerVipAfterPassOptIn:treatment,
        ...(treatment?{detailedComponentAudits:{
          ownerVipAfterPass:{
            originalPassRoots:3,bySeat,
            passOpportunities:i===0?[{seat:1,turn:1,
              heldVip:true,selected:true}]:[],
            unresolvedOwnerSearches:0,
            nativeBenchUnconfirmed:0,
            rejectedItems:0,rejectedSearches:0,
            examples:[]
          }
        }}:{})
      }
    };
  });
  return {
    registrationBlob:'frozen-blob',
    developmentResult:{enginePin:'pinned-twinleaf',
      attempted:32,competitiveQualifiedGames:0,
      errors:0,rows},
    summary:{attempts:32,censored:24}
  };
}

test('all 32 arms are paired without hiding one per-seat native success',()=>{
  const control=fixture(false),treated=fixture(true);
  const found=analyze(control,treated,REGISTER);
  assert.equal(found.schema,SCHEMA);
  assert.equal(found.attempts,32);
  assert.equal(found.matchedCompleteAttempts,32);
  assert.equal(found.sourceVipPhysicalPositiveArms,2);
  assert.equal(found.sourceVipAcceptedItems,2);
  assert.equal(found.sourceVipAcceptedOwnerSearches,2);
  assert.equal(found.sourceVipPhysicalBenchConfirmed,2);
  assert.equal(found.sourceFirstObservedHeldVipPassArms,1);
  assert.equal(found.candidateVipAcceptedItems,0);
  assert.deepEqual(found.incompleteAttempts,[]);
  assert.equal(found.gatePassed,true);
  assert.equal(found.competitiveQualifiedGames,0);
  assert.ok(found.attemptRows.every(row=>
    row.competitiveQualified===false));
});

test('missing full physical receipt and unresolved native prompt fail closed',()=>{
  const control=fixture(false),treated=fixture(true);
  treated.developmentResult.rows[0].fullPhysicalDealFingerprint='changed';
  treated.developmentResult.rows[1].actorOnlyDecisionCoverage
    .detailedComponentAudits.ownerVipAfterPass.unresolvedOwnerSearches=1;
  const found=analyze(control,treated,REGISTER);
  assert.equal(found.gatePassed,false);
  assert.deepEqual(found.incompleteAttempts,['trial-0']);
  assert.equal(found.unresolvedOwnerSearches,1);
  assert.equal(found.matchedCompleteAttempts,31);
  assert.equal(found.competitiveQualifiedGames,0);
});
