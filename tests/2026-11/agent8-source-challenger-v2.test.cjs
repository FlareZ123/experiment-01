'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {
  PHASES,registered,options,sourceActions,run
}=require('../../simulation/evaluation/2026-11/agent8-source-challenger-2x2-v2.cjs');

test('v2 frozen original-source physical deals are independent and complete',()=>{
  const rows=registered();
  assert.equal(rows.length,8);
  assert.equal(new Set(rows.map(row=>row.seed)).size,8);
  assert.ok(rows.every(row=>row.repeat>=3200&&row.repeat<=3207));
});

test('source-only search Item roots never enable on common S0 controls',()=>{
  const on=options(true),off=options(false);
  for(const key of ['sourceScopedQuickBallRoot','actorOwnerMailAfterPass',
    'actorOwnerMailAfterPassSourceOnly','actorSeekerGuzmaSourceOnly',
    'actorPotentialKoSourceOnly','actorGenericFundedFloatStoneSourceOnly']){
    assert.equal(on[key],true,key+' enabled for source challenger');
    assert.equal(off[key],false,key+' disabled for source control');
  }
  for(const key of ['actorOnlySingleSearch','actorHandDiscard',
    'actorGuzmaPromptContinuation']){
    assert.equal(on[key],true);
    assert.equal(off[key],true);
  }
  assert.deepEqual(PHASES.map(phase=>phase.id),['P0S0','P1S0','P0S1','P1S1']);
});

test('native source action receipts discriminate exact card and actual physical seat',()=>{
  const result=sourceActions({
    trial:{candidateSlot:'A'},finished:true,
    rootActionLedger:[
      {playerSlot:1,action:'PlayCardAction',card:'Quick Ball'},
      {playerSlot:1,action:'PlayCardAction',card:"Trainers' Mail"},
      {playerSlot:0,action:'PlayCardAction',card:'Quick Ball'},
      {playerSlot:1,action:'PlayCardAction',card:'VS Seeker PHF'},
      {playerSlot:1,action:'AttackAction',attack:'Technoblast'}
    ]
  });
  assert.equal(result.seat,1);
  assert.equal(result.quickBall,1);
  assert.equal(result.trainersMail,1);
  assert.equal(result.vsSeeker,1);
  assert.equal(result.attacks,1);
  const printed=sourceActions({trial:{candidateSlot:'A'},
    rootActionLedger:[
      {playerSlot:1,action:'PlayCardAction',card:'Quick Ball FST'},
      {playerSlot:1,action:'PlayCardAction',card:"Trainers' Mail ROS"}
    ]});
  assert.equal(printed.quickBall,1);
  assert.equal(printed.trainersMail,1);
});

test('four phase integration keeps all native errors, caps and physical comparisons',()=>{
  const groups=registered();
  const calls=[];
  const output=run({runPhase:phase=>{
    calls.push(phase.id);
    const rows=groups.map(group=>({
      trial:group,
      finished:phase.id==='P0S0',
      winner:phase.id==='P0S0'?1:null,
      error:phase.id==='P1S0'?'planned engine error':null,
      actionCount:0,rootActionLedger:[],
      fullPhysicalDealFingerprint:{same:group.id},
      sourceDealFingerprint:{same:'src-'+group.id},
      finalPrizes:[6,6]
    }));
    return {selected:{rawDevelopment:{rows}}};
  }});
  assert.deepEqual(calls,PHASES.map(phase=>phase.id));
  assert.equal(output.registration,'agent8-prospective-original-source-adversarial-2x2-v2');
  assert.equal(output.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(output.nativeAttempts,32);
  assert.equal(output.totals.nativeErrors,8);
  assert.equal(output.totals.sourceChangedFirstRootWithPivot,0);
  assert.equal(output.totals.sourceQuickBallRootsS1,0);
  assert.equal(output.totals.sourceMailRootsS1,0);
  assert.equal(output.status,'PHYSICAL-MATCHED-DEVELOPMENT-ONLY');
  assert.equal(output.qualifiedPaperGames,0);
});
