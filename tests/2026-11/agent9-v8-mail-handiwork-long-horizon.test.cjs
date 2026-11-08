'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,TARGET,withSingleArmHorizon}=
  require('../../simulation/evaluation/agent9-v8-mail-handiwork-long-horizon.cjs');

test('registered one-arm long cap overrides only exact original label',()=>{
  const seen=[];
  const core={runMatch(request){
    seen.push(request);
    return {actionCount:request.maxActions,finished:false,endReason:'action-limit'};
  }};
  const prior=core.runMatch;
  const audit=[];
  const short={label:'another:arm',maxActions:260,seed:2};
  const original={label:'native:'+TARGET,maxActions:260,seed:948758444};
  const actual=withSingleArmHorizon(()=>{
    core.runMatch(short);
    return core.runMatch(original);
  },core,audit);
  assert.equal(VERSION,'agent9-rank3-mail-handiwork-long-horizon-native-v1');
  assert.strictEqual(core.runMatch,prior);
  assert.strictEqual(seen[0],short);
  assert.notStrictEqual(seen[1],original);
  assert.equal(original.maxActions,260);
  assert.equal(seen[1].maxActions,600);
  assert.equal(seen[1].seed,original.seed);
  assert.equal(actual.actionCount,600);
  assert.equal(audit.length,1);
  assert.equal(audit[0].actualActions,600);
});

test('native long-cap hook restores if nested run errors',()=>{
  const core={runMatch:()=>null};
  const original=core.runMatch;
  assert.throws(()=>withSingleArmHorizon(()=>{
    throw Error('fixture stop');
  },core,[]),/fixture stop/);
  assert.strictEqual(core.runMatch,original);
});

test('incorrect native original cap fails before changing physical game',()=>{
  let nativeCalls=0;
  const core={runMatch(){nativeCalls++;}};
  const old=core.runMatch;
  assert.throws(()=>withSingleArmHorizon(()=>
    core.runMatch({label:'v8:'+TARGET,maxActions:259}),core,[]),
    /original frozen 260-root/);
  assert.equal(nativeCalls,0);
  assert.strictEqual(core.runMatch,old);
});
