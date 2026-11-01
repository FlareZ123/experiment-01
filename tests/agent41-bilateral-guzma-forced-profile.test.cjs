'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,pairedForcedGuzmaOptions:profile}=
  require('../simulation/evaluation/agent41-bilateral-guzma-forced-profile.cjs');

test('default-off proposer and two-prompt bridge stay jointly absent',()=>{
  assert.match(VERSION,/forced-singlebench-guzma/);
  const disabled=profile({enabled:false,actorOnlyComposition:false,
    actorGuzmaPromptContinuation:false});
  assert.equal(disabled.enabled,false);
  assert.deepEqual(disabled.root,{});
  assert.deepEqual(disabled.prompt,{});
  assert.ok(Object.isFrozen(disabled));
});

test('one enabled flag produces equal actor proposer and prompt continuation',()=>{
  const enabled=profile({enabled:true,actorOnlyComposition:true,
    actorGuzmaPromptContinuation:true});
  assert.equal(enabled.enabled,true);
  assert.deepEqual(enabled.root,{forcedGuzmaNominalKo:true});
  assert.deepEqual(enabled.prompt,{forcedGuzmaNominalKo:true});
  assert.ok(Object.isFrozen(enabled.root)&&Object.isFrozen(enabled.prompt));
});

test('rejects any proposed root without the same owner prompt bridge',()=>{
  for(const flags of [
    {enabled:true,actorOnlyComposition:false,actorGuzmaPromptContinuation:true},
    {enabled:true,actorOnlyComposition:true,actorGuzmaPromptContinuation:false},
    {enabled:1,actorOnlyComposition:true,actorGuzmaPromptContinuation:true}
  ]) assert.throws(()=>profile(flags));
});
