'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withCancelingCologneOncePerTurnHook:scoped}=
  require('../simulation/twinleaf/canceling-cologne-once-per-turn-hook.cjs');

test('the Cologne hook scopes a successful real-game execution',()=>{
  let installs=0,restores=0,active=false;
  const result=scoped(()=>{
    assert.equal(active,true);
    return {game:'completed'};
  },()=>{
    installs++;
    active=true;
    return ()=>{active=false;restores++;};
  });
  assert.deepEqual(result,{game:'completed'});
  assert.deepEqual([installs,restores,active],[1,1,false]);
});

test('the Cologne hook is restored even when a real Store dispatch rejects',()=>{
  const error=new Error('native Store veto');
  let active=false,restores=0;
  assert.throws(()=>scoped(()=>{
    assert.equal(active,true);
    throw error;
  },()=>{
    active=true;
    return ()=>{active=false;restores++;};
  }),caught=>caught===error);
  assert.equal(active,false);
  assert.equal(restores,1);
});

test('invalid executable is rejected without loading pinned engine',()=>{
  assert.throws(()=>scoped(null,()=>{throw Error('should not load');}),TypeError);
});
