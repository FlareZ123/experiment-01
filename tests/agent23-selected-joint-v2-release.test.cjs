'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,withMode,runRelease,conciseSource}=
  require('../simulation/evaluation/agent23-selected-joint-v2-release.cjs');

test('frozen selected source profile is identical to independent prior registration',()=>{
  const m=preflight();
  assert.equal(m.expectedAttempts,52);
  assert.equal(m.registeredTrials.length,26);
  assert.equal(m.referenceJointProfileBlobSha,
    'f6ba98e6a259daa835397689799dc35550a1c14d');
  assert.equal(m.uniqueFreshSourceSeedGroups,3);
  assert.equal(m.policyOptions.actorOnlySingleSearch,false);
  assert.equal(m.policyOptions.actorDceMewMobilityRoot,true);
});

test('native VIP selected module is symmetric and always restores ambient state',()=>{
  const vip=process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV;
  const payment=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  delete process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV;
  delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  try{
    assert.equal(withMode(false,()=>[
      process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV,
      process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV
    ]).join('|'),'|true');
    assert.deepEqual(withMode(true,()=>[
      process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV,
      process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV
    ]),['true','true']);
    assert.throws(()=>withMode(true,()=>{throw Error('native abort');}),
      /native abort/);
    assert.equal(process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV,undefined);
    assert.equal(process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV,undefined);
  }finally{
    if(vip===undefined)delete process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV;
    else process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV=vip;
    if(payment===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=payment;
  }
});

/** @param {object} trial @param {boolean} vip */
function fakeRow(trial,vip){
  const sourceSeat=trial.candidateSlot==='A'?1:0;
  const effect=vip&&trial.rank===5&&trial.repeat===1;
  const ledger=[{
    playerSlot:sourceSeat,
    action:'PlayCardAction',card:effect?'Battle VIP Pass FST':'Psychic Energy',
    actionOrdinal:1
  }];
  if(effect)ledger.push({
    playerSlot:sourceSeat,action:'ChooseAttackAction',
    pendingPrompt:'ChooseAttackPrompt',
    initiatingRootActionOrdinal:11,
    actionOrdinal:12,
    attackChoice:{printing:'Genesect V FST',attackName:'Techno Blast'}
  });
  return {trial,sourceSeat,status:'capped',endReason:'max-actions',
    finished:false,actionCount:260,actualStarterSeat:0,
    sourceDealFingerprint:'deal-'+trial.rank+'-'+trial.repeat+'-'+
      trial.candidateSlot+'-'+trial.candidateId,
    rootActionLedgerSha256:effect?'d'.repeat(64):'a'.repeat(64),
    rootActionLedger:ledger,finalPrizes:[6,6],
    sourceAttackSettlement:{attacks:effect?[{
      attackName:'Cross Fusion Strike',actionOrdinal:11,
      settledPromptChain:true,settlementCrossesClockReset:false
    }]:[]}};
}

test('all 52 native arms preserve original printed contexts and selected-mode copy audit',()=>{
  let calls=0;
  const out=runRelease(opts=>{
    calls++;
    const vip=process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV==='true';
    assert.equal(vip,calls===2);
    assert.equal(process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV,'true');
    assert.equal(opts.registeredTrials.length,26);
    assert.equal(opts.nativeRootActionLimit,260);
    const rows=opts.registeredTrials.map(trial=>fakeRow(trial,vip));
    return {attempted:26,rows};
  });
  assert.equal(calls,2);
  assert.equal(out.attemptCount,52);
  assert.equal(out.candidateContexts,26);
  assert.equal(out.matchedSourcePhysicalDeals,26);
  assert.equal(out.allControlsMatched,true);
  assert.equal(out.competitivelyQualifiedGames,0);
  assert.equal(out.modes[0].rows.reduce((n,x)=>n+x.sourceVipCount,0),0);
  assert.equal(out.modes[1].rows.reduce((n,x)=>n+x.sourceVipCount,0),2);
  assert.equal(out.modes[1].rows.reduce((n,x)=>n+
    (x.sourceCopiedAttackChoices?.selectedGenesectTechnoBlast??0),0),2);
});

test('physical source-deal mismatch remains explicit in complete retained row count',()=>{
  let calls=0;
  const out=runRelease(opts=>{
    calls++;
    return {attempted:26,rows:opts.registeredTrials.map((t,i)=>{
      const row=fakeRow(t,calls===2);
      if(calls===2&&i===1)row.sourceDealFingerprint='changed';
      return row;
    })};
  });
  assert.equal(out.attemptCount,52);
  assert.equal(out.modes[0].rows.length,26);
  assert.equal(out.modes[1].rows.length,26);
  assert.equal(out.matchedSourcePhysicalDeals,25);
  assert.equal(out.allControlsMatched,false);
  assert.equal(out.comparison.filter(x=>!x.originalSourceDealMatch).length,1);
});

test('native runner omission is a hard error, never a favorable game result',()=>{
  assert.throws(()=>runRelease(opts=>({attempted:25,rows:
    opts.registeredTrials.slice(0,25).map(t=>fakeRow(t,false))})),
  /registered context/);
});

test('the source copy-choice reader rejects made-up Techno Blast counts',()=>{
  const original=conciseSource(fakeRow({
    rank:5,repeat:1,candidateSlot:'A',
    candidateId:'champion-reference'
  },true));
  assert.equal(original.sourceNativeAttackCount,1);
  assert.equal(original.sourceCopiedAttackChoices.selectedGenesectTechnoBlast,1);
  assert.equal(original.competitivelyQualified,false);
});
