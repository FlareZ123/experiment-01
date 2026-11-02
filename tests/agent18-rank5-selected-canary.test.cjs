'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {profile,preflight}=require(
  '../simulation/evaluation/agent18-rank5-selected-canary.cjs');
const root=path.resolve(__dirname,'..');

test('selected original rank5 has two physical-seat pairs with one immutable policy',()=>{
  const p=preflight(root,{});
  assert.equal(p.originalRank,5);
  assert.equal(p.sourceCards,60);
  assert.equal(p.trials.length,4);
  assert.deepEqual(p.trials.map(x=>x.candidateSlot),['A','A','B','B']);
  assert.deepEqual(p.trials.map(x=>x.seed),
    [67151115,67151115,1865046151,1865046151]);
  assert.equal(p.options.actorOnlyComposition,true);
  assert.equal(p.options.actorMewGenesectTechnoBlast,true);
  assert.equal(p.options.paperSecretBoxPayment,true);
  assert.equal(p.options.paperQuickBallPayment,true);
  assert.equal(p.options.sameRootChoiceApply,true);
  assert.equal(p.options.sourceFirstRetrospective,false);
  assert.equal(p.options.candidateOnlyKnownDeadRoot,false);
  assert.equal(p.options.registeredTrials,null);
  assert.equal(profile.competitiveQualified,false);
  assert.equal(p.closurePinned,true,
    'Only previously observed exact static source closure may run');
  assert.equal(p.closureFiles,302);
});
test('ambient experimental toggle fails closed, including a nominal false override',()=>{
  assert.throws(()=>preflight(root,{
    AGENT7_CANONICAL_ACTOR_POLICY_DEV:'false'}),/Ambient agent environment/);
  assert.throws(()=>preflight(root,{
    AGENT4_NATIVE_PAYMENT_RECEIPT_DEV:'true'}),/Ambient agent environment/);
});
test('unknown added named policy switch cannot become selected implicitly',()=>{
  const p=preflight(root,{});
  assert.equal(Object.keys(p.options).length,profile.expectedRunnerOptions);
  assert.equal(new Set(profile.enabled).size,profile.enabled.length);
  assert.ok(profile.enabled.every(name=>p.options[name]===true));
  assert.equal(profile.allowedAmbientAgentVariables.length,0);
  assert.equal(profile.sourceRank,undefined);
});
