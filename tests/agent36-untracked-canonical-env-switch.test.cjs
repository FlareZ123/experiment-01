'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withCanonicalActorOnlyPolicy}=
  require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');

/** @param {()=>unknown} execute */
const shim=execute=>({result:execute(),audit:{version:'fixture'}});
const components={
  root:shim,fog:shim,select:shim,option:shim,attack:shim,
  vipAfterPass:shim
};

test('untracked inherited VIP environment setting changes canonical wrapper',()=>{
  const key='AGENT9_BATTLE_VIP_AFTER_PASS_DEV';
  const original=process.env[key];
  try {
    delete process.env[key];
    const baseline=withCanonicalActorOnlyPolicy(
      ()=>({source60Unchanged:true}),components,{});
    process.env[key]='true';
    const treatment=withCanonicalActorOnlyPolicy(
      ()=>({source60Unchanged:true}),components,{});
    assert.equal(baseline.audit.ownerVipAfterPassOptIn,false);
    assert.equal(treatment.audit.ownerVipAfterPassOptIn,true);
    assert.equal(baseline.audit.componentVersions.vipAfterPass,undefined);
    assert.equal(treatment.audit.componentVersions.vipAfterPass,'fixture');
    assert.deepEqual(baseline.result,treatment.result);
  } finally {
    if(original===undefined)delete process.env[key];
    else process.env[key]=original;
  }
});
