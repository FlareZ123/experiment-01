'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {preflight,withSelectedQuickBallMode,sourceEvidence,runRelease}=
  require('../simulation/evaluation/agent13-rank5-vip-quickball-20261103.cjs');

test('exact three-mode native preregistration, code and original source identity',()=>{
  const x=preflight();
  assert.equal(x.reg.expectedNativeAttempts,12);
  assert.equal(x.trials.length,4);
  assert.equal(x.reg.originalPrintedSource60Sha256,
    'a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05');
});

test('owner Quick Ball temporary environment switch restores prior value',()=>{
  const key='AGENT8_ACTOR_QUICK_BALL_DEV',before=process.env[key];
  delete process.env[key];
  try{
    assert.equal(withSelectedQuickBallMode(true,()=>process.env[key]),'true');
    assert.equal(process.env[key],undefined);
    assert.equal(withSelectedQuickBallMode(false,()=>process.env[key]),undefined);
  }finally{
    if(before===undefined)delete process.env[key];else process.env[key]=before;
  }
});

test('owner Quick Ball temporary environment switch restores on throw',()=>{
  const key='AGENT8_ACTOR_QUICK_BALL_DEV',before=process.env[key];
  delete process.env[key];
  try{
    assert.throws(()=>withSelectedQuickBallMode(true,()=>{
      throw Error('injected-native-abort');
    }),/injected-native-abort/);
    assert.equal(process.env[key],undefined);
  }finally{
    if(before===undefined)delete process.env[key];else process.env[key]=before;
  }
});

test('owner-only sources exclude candidate Quick Ball when observing native roots',()=>{
  const row={trial:{candidateSlot:'B'},rootActionLedger:[
    {playerSlot:0,action:'PlayCardAction',card:'Quick Ball'},
    {playerSlot:1,action:'PlayCardAction',card:'Quick Ball'},
    {playerSlot:0,action:'PlayCardAction',card:'Battle VIP Pass'},
    {playerSlot:1,action:'PlayCardAction',card:'Battle VIP Pass'}],
  actorOnlyDecisionCoverage:{detailedComponentAudits:{
    root:{quickBallRootOptIn:true,quickBallRootOwnerSeat:null},
    ownerSearch:{accepted:1},handDiscard:{accepted:1},
    chooseAttack:{selections:[]}
  }}};
  const x=sourceEvidence(row);
  assert.equal(x.sourceQuickBallRoots.length,1);
  assert.equal(x.sourceVipRootPlayReceipts.length,1);
  assert.equal(x.actorQuickBallRootEnabled,true);
  assert.equal(x.actorQuickBallRootOwnerSeat,null);
  assert.equal(x.ownerSearchPromptAudit.accepted,1);
});

test('twelve actual attempted modes preserve all native rows and physical source pairs',()=>{
  const seen=[];
  const result=runRelease(opts=>{
    const qb=process.env.AGENT8_ACTOR_QUICK_BALL_DEV==='true';
    const vip=process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV==='true';
    seen.push({qb,vip,s:opts.actorOnlySingleSearch,d:opts.actorHandDiscard});
    return {attempted:4,rows:opts.registeredTrials.map(trial=>({
      trial,sourceDealFingerprint:trial.id,
      rootActionLedger:[{
        playerSlot:trial.candidateSlot==='A'?1:0,
        action:'PlayCardAction',card:qb?'Quick Ball':'Battle VIP Pass'}],
      actorOnlyDecisionCoverage:{detailedComponentAudits:{root:{
        quickBallRootOptIn:qb,quickBallRootOwnerSeat:null
      }}},attackDeclarations:{source:Number(qb)}
    }))};
  });
  assert.deepEqual(seen,[
    {qb:false,vip:true,s:false,d:false},
    {qb:true,vip:true,s:false,d:false},
    {qb:true,vip:true,s:true,d:true}
  ]);
  assert.equal(result.attempts,12);
  assert.equal(result.matchedSourcePhysicalDeals,4);
  assert.deepEqual(result.comparisons[0].evidence.map(x=>x.sourceQuickBallRoots.length),
    [0,1,1]);
  assert.equal(result.qualifiedCompetitiveGames,0);
  assert.equal(result.modes[2].native.rows.length,4);
});

test('same seed does not confer physical pair status when native source deals differ',()=>{
  const result=runRelease(opts=>{
    const qb=process.env.AGENT8_ACTOR_QUICK_BALL_DEV==='true';
    return {attempted:4,rows:opts.registeredTrials.map(trial=>({
      trial,sourceDealFingerprint:(qb?'treat-':'control-')+trial.id,
      rootActionLedger:[]
    }))};
  });
  assert.equal(result.matchedSourcePhysicalDeals,0);
  assert.ok(result.comparisons.every(x=>
    x.sourcePhysical==='UNVERIFIED_OR_DIFFERENT'));
});
