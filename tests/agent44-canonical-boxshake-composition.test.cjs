'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withCanonicalAndBoxShake}=
  require('../simulation/evaluation/agent44-canonical-boxshake-composition.cjs');

test('default-off canonical actor result and action order unchanged',()=>{
  const trace=[];
  const canonical=fn=>{
    trace.push('install-canonical');
    const result=fn();
    return {result,audit:{version:'canon',qualification:{fullyActorOnly:false}}};
  };
  const box=()=>{throw Error('default-off Box must not install');};
  const x=withCanonicalAndBoxShake(()=>{trace.push('native-run');return 42;},
    {canonical,box});
  assert.equal(x.result,42);
  assert.deepEqual(trace,['install-canonical','native-run']);
  assert.equal(x.audit.boxOptIn,false);
  assert.equal(x.audit.box,null);
});
test('enabled Box is the inner, later-installed actor and delegates result',()=>{
  const trace=[];
  const canonical=fn=>{
    trace.push('canonical-hook-install');
    const result=fn();
    return {result,audit:{version:'shared-v3',
      nativeDecisionCounts:{roots:3},qualification:{fullyActorOnly:false}}};
  };
  const box=(fn,options)=>{
    trace.push('box-hook-install');
    assert.equal(options.flexible,true);
    const result=fn();
    return {result,audit:{offers:[{seat:0}],completeNativeEvolutions:1}};
  };
  const x=withCanonicalAndBoxShake(()=>{
    trace.push('native-game');return 'game';
  },{enableBoxShake:true,flexible:true,canonical,box});
  assert.equal(x.result,'game');
  assert.deepEqual(trace,
    ['canonical-hook-install','box-hook-install','native-game']);
  assert.equal(x.audit.boxOptIn,true);
  assert.equal(x.audit.flexibleBoxOptIn,true);
  assert.equal(x.audit.box.completeNativeEvolutions,1);
  assert.equal(x.audit.actorVersion,'shared-v3');
  assert.equal(x.audit.competitiveGames,0);
});
test('enabled integration rejects an adapter that skipped native Box',()=>{
  assert.throws(()=>withCanonicalAndBoxShake(()=>7,{
    enableBoxShake:true,
    canonical:fn=>({result:6,audit:{version:'skipping'}}),
    box:()=>({result:7,audit:{offers:[]}})
  }),/did not install inside canonical actor/);
});
