'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {IDS}=require('../simulation/evaluation/agent4-mail-postsetup-seat-shuffle-aba-v2.cjs');
const REG=require('../results/aichi-2026/registrations/agent1-issue25-mirrored-r6-r11-20261104.json');
const {
 ACTION_LIMIT,sourceAndCandidatePaidActions,withVerifiedNinetySixRootNativeCap
}=require('../simulation/evaluation/agent4-mail-postsetup-96root-opportunity-v3.cjs');
const seeds=new Map(REG.trials.map(x=>[x.id,x.seed]));
test('source own real attack declaration and next candidate response are joined by accepted public root chronology',()=>{
  const tape=[
    {seat:1,turn:1,ordinal:14,action:'PlayCardAction',
      card:"Trainers' Mail",pendingPrompt:null},
    {seat:1,turn:1,ordinal:15,action:'ResolvePromptAction',
      pendingPrompt:'ChooseCardsPrompt'},
    {seat:1,turn:3,ordinal:33,action:'AttackAction',
      attack:'Volt Cyclone',pendingPrompt:null},
    {seat:0,turn:4,ordinal:35,action:'PlayCardAction',
      card:'Klefki',pendingPrompt:null},
    {seat:0,turn:4,ordinal:40,action:'AttackAction',
      attack:'Shadow Mist',pendingPrompt:null}
  ];
  const x=sourceAndCandidatePaidActions(tape,1);
  assert.deepEqual(x.source.selectedAttackNames,
    [{turn:3,ordinal:33,attack:'Volt Cyclone'}]);
  assert.equal(x.source.cardsPlayed.length,1);
  assert.equal(x.source.cardsPlayed[0].card,"Trainers' Mail");
  assert.equal(x.candidate.selectedAttackNames[0].attack,'Shadow Mist');
  assert.equal(x.sourceAttackCandidateFirstReplies[0]
    .firstCandidateSubsequentRoot.card,'Klefki');
  assert.equal(x.sourceAttackCandidateFirstReplies[0]
    .censoredIfNoCandidateReply,false);
});
test('original deck and public prompt evidence cannot fabricate an actual source attack',()=>{
  const x=sourceAndCandidatePaidActions([
    {seat:1,turn:2,ordinal:4,action:'ResolvePromptAction',
      attack:'Volt Cyclone',pendingPrompt:'ChooseCardsPrompt'},
    {seat:1,turn:3,ordinal:7,action:'PassTurnAction',
      card:null,pendingPrompt:null}
  ],1);
  assert.equal(x.source.selectedAttackNames.length,0);
  assert.equal(x.source.cardsPlayed.length,0);
  assert.deepEqual(x.source.passes,[3]);
});
test('32 original IDs, seeds, actor flags, and actual native request caps verified end-to-end',()=>{
  const accepted=[],headless={runMatch:request=>{
    accepted.push(request);return {native:true};
  }};
  const old=headless.runMatch;
  const out=withVerifiedNinetySixRootNativeCap(()=>{
    for(let phase=0;phase<4;phase++)
      for(const id of IDS)headless.runMatch({
        label:'v3-'+id,seed:seeds.get(id),maxActions:ACTION_LIMIT,
        isolatePolicyRandomness:true,
        isolatePhysicalShuffleRandomnessAfterSetup:phase>0
      });
    return 'all 32 observed';
  },headless);
  assert.strictEqual(headless.runMatch,old);
  assert.equal(out.result,'all 32 observed');
  assert.equal(accepted.length,32);
  assert.equal(out.requestAudit.registeredNative32,true);
  assert.equal(out.requestAudit.all32Actual96RootCap,true);
  assert.equal(out.requestAudit.legacyNoPostsetupIsolation,true);
  assert.equal(out.requestAudit.all24AfterSetupPhysicalIsolation,true);
  assert.equal(out.requestAudit.all32PolicyRandomIsolation,true);
  assert.equal(out.requestAudit.rows[8].id,IDS[0]);
});
test('wrong seed and wrong root cap rejected before executing native Store and patch restored',()=>{
  const accepted=[],headless={runMatch:request=>accepted.push(request)};
  const old=headless.runMatch;
  assert.throws(()=>withVerifiedNinetySixRootNativeCap(()=>
    headless.runMatch({
      label:IDS[0],seed:0,maxActions:ACTION_LIMIT}),headless));
  assert.strictEqual(headless.runMatch,old);
  assert.throws(()=>withVerifiedNinetySixRootNativeCap(()=>
    headless.runMatch({
      label:IDS[0],seed:seeds.get(IDS[0]),maxActions:48}),headless));
  assert.strictEqual(headless.runMatch,old);
  assert.equal(accepted.length,0);
});
