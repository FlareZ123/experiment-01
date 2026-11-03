'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,withSelectedVipMode,actualSourceWitness,runRelease}=
  require('../simulation/evaluation/agent13-rank5-vip-after-pass-20261103.cjs');

test('exact preregistration, pinned bilateral source runner, and authenticated four source trials',()=>{
  const {registration,base,trials}=preflight();
  assert.equal(registration.registeredAttempts,8);
  assert.equal(trials.length,4);
  assert.equal(base.policyOptions.actorOnlyComposition,true);
});

test('existing VIP env toggle is fully restored after each successful selected trial',()=>{
  const name='AGENT9_BATTLE_VIP_AFTER_PASS_DEV';
  const prior=process.env[name];
  delete process.env[name];
  try{
    assert.equal(withSelectedVipMode(true,()=>process.env[name]),'true');
    assert.equal(process.env[name],undefined);
    assert.equal(withSelectedVipMode(false,()=>process.env[name]),undefined);
    assert.equal(process.env[name],undefined);
  }finally{
    if(prior===undefined)delete process.env[name];else process.env[name]=prior;
  }
});

test('VIP env toggle restored on real callback failure',()=>{
  const name='AGENT9_BATTLE_VIP_AFTER_PASS_DEV';
  const prior=process.env[name];
  delete process.env[name];
  try{
    assert.throws(()=>withSelectedVipMode(true,()=>{throw Error('test');}),/test/);
    assert.equal(process.env[name],undefined);
  }finally{
    if(prior===undefined)delete process.env[name];else process.env[name]=prior;
  }
});

test('actual source witness does not credit candidate VIP or copied attacks to source',()=>{
  const input={trial:{candidateSlot:'B'},rootActionLedger:[
    {playerSlot:0,action:'PlayCardAction',card:'Battle VIP Pass FST'},
    {playerSlot:1,action:'PlayCardAction',card:'Battle VIP Pass FST'},
    {playerSlot:0,action:'PlayCardAction',card:'Mew VMAX FST'}],
  actorOnlyDecisionCoverage:{detailedComponentAudits:{chooseAttack:{selections:[
    {seat:0,printing:'Genesect V FST',attack:'Techno Blast'},
    {seat:1,printing:'Genesect V FST',attack:'Techno Blast'}]
  },ownerVipAfterPass:{proposedItems:2,acceptedItems:2,rejectedItems:0,
    acceptedSearches:2,rejectedSearches:0,nativeBenchConfirmed:2,
    bySeat:{0:{items:1,searches:1,benchConfirmed:1},1:{items:1,searches:1,benchConfirmed:1}}
  }}},attackDeclarations:{source:1}};
  const x=actualSourceWitness(input);
  assert.equal(x.sourceVipRootPlayReceipts.length,1);
  assert.equal(x.sourceVmaxEvolutions.length,1);
  assert.equal(x.sourceCopiedTechnoBlast.length,1);
  assert.equal(x.originalSourceVipPolicyAudit.sourceSeatNativeItems,1);
  assert.equal(x.competitiveGameQualified,false);
});

test('paired modes execute exact eight arms and retain all original raw rows',()=>{
  const modes=[];
  const output=runRelease(opts=>{
    const enabled=process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV==='true';
    modes.push(enabled);
    return {attempted:4,rows:opts.registeredTrials.map(row=>({
      trial:row,sourceDealFingerprint:row.id,
      rootActionLedgerSha256:(enabled?'treatment-':'baseline-')+row.id,
      rootActionLedger:[{
        playerSlot:row.candidateSlot==='A'?1:0,
        action:enabled?'PlayCardAction':'PassTurnAction',
        card:enabled?'Battle VIP Pass FST':null
      }],attackDeclarations:{source:0}
    }))};
  });
  assert.deepEqual(modes,[false,true]);
  assert.equal(output.attempts,8);
  assert.equal(output.sourceIdenticalPairs,4);
  assert.ok(output.physicalComparison.every(x=>!x.rootLedgerIdentical));
  assert.ok(output.physicalComparison.every(x=>
    x.treatment.sourceVipRootPlayReceipts.length===1));
  assert.equal(output.competitiveQualifiedGames,0);
  assert.equal(output.modes[1].native.rows.length,4);
});

test('source fingerprint mismatches are never silently treated as paired',()=>{
  const output=runRelease(opts=>{
    const enabled=process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV==='true';
    return {attempted:4,rows:opts.registeredTrials.map(row=>({
      trial:row,sourceDealFingerprint:
        (enabled?'changed-':'original-')+row.id,
      rootActionLedger:[]
    }))};
  });
  assert.equal(output.sourceIdenticalPairs,0);
  assert.ok(output.physicalComparison.every(x=>
    x.sourcePhysicalDeal==='UNVERIFIED_OR_DIFFERENT'));
});
