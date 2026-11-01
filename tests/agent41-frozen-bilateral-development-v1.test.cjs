'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const profile=require('../simulation/evaluation/agent41-frozen-bilateral-development-v1.json');
const {registeredTrials,assertNoUnreviewedAmbientAgentEnvironment,
  summarizeAcceptedSetupCoins}=
  require('../simulation/evaluation/agent41-frozen-bilateral-development-v1.cjs');

test('single registered profile retains all 16 physical pairs and both fixed 60s',()=>{
  const trials=registeredTrials();
  assert.equal(trials.length,32);
  assert.equal(profile.policyOptions.physicalZoneGate,true);
  assert.equal(profile.policyOptions.actorOnlyComposition,true);
  assert.equal(profile.policyOptions.sameRootChoiceApply,true);
  const grouped=new Map();
  for(const row of trials){
    const group=row.id.slice(0,row.id.lastIndexOf(':'));
    if(!grouped.has(group))grouped.set(group,[]);
    grouped.get(group).push(row);
  }
  assert.equal(grouped.size,16);
  for(const pair of grouped.values()){
    assert.deepEqual(pair.map(x=>x.candidateId).sort(),
      ['champion-reference','new-moon-lockbreaker-v1']);
    assert.equal(pair[0].seed,pair[1].seed);
  }
  for(const rank of [6,11])for(const slot of ['A','B']){
    assert.equal(trials.filter(x=>x.rank===rank&&
      x.candidateSlot===slot).length,8);
  }
});

test('unreviewed ambient switch cannot silently change an owner policy',()=>{
  assert.deepEqual(assertNoUnreviewedAmbientAgentEnvironment({
    CI:'true',GITHUB_SHA:'a',PATH:'test',
    AGENT_TOOLSDIRECTORY:'/opt/hostedtoolcache'}),[]);
  for(const setting of [
    'AGENT9_BATTLE_VIP_AFTER_PASS_DEV',
    'AGENT38_PLUMERIA_LARGE_HAND_DEV',
    'AGENT47_APEX_PAYLOAD_DISCARD_DEV',
    'AGENT41_NATIVE_PLUMERIA_CHOICE_DEV',
    'AGENT24_PHYSICAL_ZONE_GATE_DEV'
  ]){
    assert.throws(()=>assertNoUnreviewedAmbientAgentEnvironment({
      [setting]:'true'}),/Ambient AGENT policy override/);
  }
});

test('release status stays explicitly unqualified until certified',()=>{
  assert.equal(profile.competitiveGameQualified,false);
  assert.ok(profile.sourceClosureSha256===null||
    /^[a-f0-9]{64}$/.test(profile.sourceClosureSha256));
  assert.ok(profile.releaseVetoes.length>0);
  assert.equal(profile.scheduledNativeArms,32);
});


test('real first-setup coin, winner choice and first-draw evidence must agree per arm',()=>{
  const expected=require('../results/aichi-2026/registrations/agent16-balanced-native-rank6-rank11-coins-20261101.json');
  const rows=registeredTrials().map(trial=>{
    const p=expected.flatPredictions.find(x=>x.rank===trial.rank&&
      x.repeat===trial.repeat&&x.candidateSlot===trial.candidateSlot);
    return {
      trial,actualStarterSeat:p.predictedFirstSeat,
      nativeSetupCoinChoiceReceipt:{
        status:'consistent-accepted-native-setup-and-first-draw',
        firstSeatFromVerifiedDraw:p.predictedFirstSeat,
        coin:{coinWinnerSeat:p.predictedCoinWinnerSeat},
        choice:{choseFirst:false}
      }
    };
  });
  const good=summarizeAcceptedSetupCoins(rows);
  assert.equal(good.attempted,32);
  assert.equal(good.matching,32);
  assert.equal(good.allValidated,true);
  rows[0].nativeSetupCoinChoiceReceipt={
    ...rows[0].nativeSetupCoinChoiceReceipt,
    firstSeatFromVerifiedDraw:1-rows[0].actualStarterSeat
  };
  let wrong=summarizeAcceptedSetupCoins(rows);
  assert.equal(wrong.allValidated,false);
  assert.equal(wrong.byStatus['actual-first-seat-vs-registered-stratum-mismatch'],1);
  rows[0].nativeSetupCoinChoiceReceipt=null;
  wrong=summarizeAcceptedSetupCoins(rows);
  assert.equal(wrong.byStatus['native-receipt-absent'],1);
  rows[0].trial={...rows[0].trial,seed:1-rows[0].trial.seed};
  wrong=summarizeAcceptedSetupCoins(rows);
  assert.equal(wrong.byStatus['registration-seed-mismatch'],1);
});
