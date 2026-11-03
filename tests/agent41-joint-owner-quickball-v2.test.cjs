'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {inspect,summarize,gitBlob}=
  require('../simulation/evaluation/agent41-joint-owner-quickball-v2.cjs');
const profile=require('../simulation/evaluation/agent41-joint-owner-quickball-v2.json');

test('new prospective source code and 93 effective flags are pinned',()=>{
  const i=inspect();
  assert.equal(i.optionCount,93);
  assert.equal(i.pinnedDependencyCount,13);
  assert.equal(i.pairedAttempts,16);
  assert.equal(i.fullSourceSeedGroups,4);
  assert.equal(i.competitivelyQualified,0);
});
test('only 3 intentionally selected owner-policy flags differ',()=>{
  assert.deepEqual(Object.keys(profile.exactSelectedToggleDelta),
    ['bilateralQuickBallRoot','actorOnlySingleSearch','actorHandDiscard']);
  for(const key of Object.keys(profile.exactSelectedToggleDelta)){
    assert.deepEqual([profile.baselinePolicyOptions[key],
      profile.treatmentPolicyOptions[key]],[false,true]);
  }
});
test('all source physical seed groups contain both fixed candidate sixties',()=>{
  assert.equal(profile.registeredTrials.length,8);
  const byGroup=new Map();
  for(const trial of profile.registeredTrials){
    const key=[trial.rank,trial.candidateSlot].join(':');
    const group=byGroup.get(key)??[];
    group.push(trial);
    byGroup.set(key,group);
  }
  assert.equal(byGroup.size,4);
  for(const group of byGroup.values()){
    assert.equal(group.length,2);
    assert.equal(group[0].seed,group[1].seed);
    assert.deepEqual(group.map(x=>x.candidateId),
      ['champion-reference','new-moon-lockbreaker-v1']);
  }
});
test('native summary exposes errors and treats every winner as noncompetitive',()=>{
  const native=summarize({
    trial:profile.registeredTrials[0],
    sourceSeat:1,candidateSeat:0,
    finished:true,endReason:'engine-game-end',winner:1,
    sourceAttackSettlement:{attacks:[{
      actionOrdinal:26,turnBefore:9,
      attackName:'Cross Fusion Strike',settledPromptChain:true,
      prizesBefore:[6,6],prizesAfter:[6,4]
    }]}
  });
  assert.equal(native.nativeDisposition,'ENGINE_TERMINAL');
  assert.equal(native.nativeSourceAttacks[0].name,'Cross Fusion Strike');
  assert.equal(native.paperQualified,false);
  assert.equal(native.competitiveQualified,false);
});
test('git blob helper matches Git hash for canonical bytes',()=>{
  assert.equal(gitBlob(Buffer.from('hello\n')),
    'ce013625030ba8dba906f756967f9e9ca394464a');
});
