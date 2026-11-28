'use strict';
const assert=require('node:assert/strict');
const strict=require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const hook=require('../../simulation/twinleaf/agent1-gladion-owner-prize-projection.cjs');
const entry=require('../../simulation/twinleaf/agent1-newmoon-v3g-runtime-projection.cjs');
let failed=false;
try{entry.forV3gGladion({policyVersion:'agent1-newmoon-dusknoir-v3-finisher-research-v1'})}
catch(e){failed=e.message==='GLADION_PRIZE_PROJECTION_NOT_AUTHORIZED_FOR_POLICY'}
assert.equal(failed,true);
const enabled=entry.forV3gGladion({policyVersion:entry.POLICY_VERSION});
assert.equal(Object.isFrozen(enabled),true);
assert.equal(enabled.projectPrompt,hook.projectPromptWithGladionOwnerPrize);
for(const [key,value] of Object.entries(strict))
 if(key!=='projectPrompt')assert.equal(enabled[key],value);
assert.equal(typeof enabled.resolveHostOnlyPrompt,'function');
assert.notEqual(enabled.projectPrompt,strict.projectPrompt);
console.log('v3g runner opt-in promptProjection injection preserves all existing projector functions');
