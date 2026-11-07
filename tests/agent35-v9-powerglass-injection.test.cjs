'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withPowerglassNestedInsideLillie}=
  require('../simulation/evaluation/agent35-v9-powerglass-after-lillie-development.cjs');

test('new Powerglass seam runs inside one existing Lillie and restores',()=>{
  const order=[];
  const lil={withActorOnlyLillieAfterPass(fn){
    order.push('outer Lillie');return {result:fn(),audit:{}};
  }};
  const prev=lil.withActorOnlyLillieAfterPass;
  const runner=()=>lil.withActorOnlyLillieAfterPass(()=>{
    order.push('native');return 42;
  });
  const selected=withPowerglassNestedInsideLillie(runner,{
    lillieModule:lil,
    powerglassLayer:fn=>{
      order.push('inner Powerglass');
      return {result:fn(),audit:{hit:true}};
    }
  });
  assert.equal(selected.result.result,42);
  assert.equal(selected.audit.compositions,1);
  assert.deepEqual(selected.audit.powerglass,[{hit:true}]);
  assert.deepEqual(order,['outer Lillie','inner Powerglass','native']);
  assert.strictEqual(lil.withActorOnlyLillieAfterPass,prev);
});

test('actual native error restores shared Lillie module export',()=>{
  const mod={withActorOnlyLillieAfterPass:fn=>({result:fn(),audit:{}})};
  const before=mod.withActorOnlyLillieAfterPass;
  assert.throws(()=>withPowerglassNestedInsideLillie(
    ()=>mod.withActorOnlyLillieAfterPass(()=>{
      throw Error('real-game-abort');
    }),{
      lillieModule:mod,
      powerglassLayer:fn=>({result:fn(),audit:{}})
    }),/real-game-abort/);
  assert.strictEqual(mod.withActorOnlyLillieAfterPass,before);
});
