'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,SOURCE_PATHS,withOwnerTagCallInsideSelectedV5
}=require('../simulation/evaluation/agent45-issue25-owner-tagcall-v7.cjs');

const source60=Array(60).fill('Owner source card TEST');
const contender60=Array(60).fill('Owner contender card TEST');

test('actual native boundary offers each actor only its own registered 60',()=>{
  const steps=[],headless={
    runMatch(request){
      steps.push('actual-original-match');
      return {label:request.label,actualNativeMatch:true};
    }
  };
  const prior=headless.runMatch;
  const request={label:'original-registered-arm',
    deckA:[...source60],deckB:[...contender60]};
  const selected=withOwnerTagCallInsideSelectedV5(()=>{
    steps.push('v5-batch');
    return headless.runMatch(request);
  },{
    headless,
    ownerLayer:(next,opts)=>{
      assert.strictEqual(opts.headless,headless);
      steps.push('v5-owner-before');
      const result=next();
      steps.push('v5-owner-after');
      return {result,audit:{
        nativeMatchCalls:1,
        nativeMatchAttempts:[{nativeMatchLabel:request.label,
          status:'returned-unqualified'}]
      }};
    },
    tagLayer:(ownRegisteredSixtiesBySeat,next)=>{
      steps.push('tag-before');
      assert.deepEqual(ownRegisteredSixtiesBySeat[0],source60);
      assert.deepEqual(ownRegisteredSixtiesBySeat[1],contender60);
      assert.notStrictEqual(ownRegisteredSixtiesBySeat[0],
        ownRegisteredSixtiesBySeat[1]);
      const result=next();
      steps.push('tag-after');
      return {result,audit:{ownerBySeat:{
        0:{acceptedRoots:1,physicalGHHandGained:1},
        1:{acceptedRoots:0,physicalGHHandGained:0}
      }}};
    }
  });
  assert.deepEqual(steps,[
    'v5-owner-before','v5-batch','tag-before','actual-original-match',
    'tag-after','v5-owner-after'
  ]);
  assert.deepEqual(selected.result,{
    label:'original-registered-arm',actualNativeMatch:true});
  assert.equal(selected.audit.nativeTagCallMatchCalls,1);
  assert.equal(selected.audit.nativeTagCallAttempts[0].status,
    'returned-unqualified');
  assert.equal(selected.audit.nativeTagCallAttempts[0]
    .ownerTagCallAudit.ownerBySeat[0].acceptedRoots,1);
  assert.strictEqual(headless.runMatch,prior);
  assert.equal(selected.audit.competitiveGamesQualified,0);
});

test('native aborted owner Tag Call keeps error audit and restores original boundary',()=>{
  const prior=()=>null;
  const headless={runMatch:prior};
  const source=new Error('native Store rejected real Tag Call');
  source.ownerTagCallHalaNativeAudit={
    ownerBySeat:{0:{acceptedRoots:0}}
  };
  const seen=[];
  assert.throws(()=>withOwnerTagCallInsideSelectedV5(()=>{
    return headless.runMatch({
      label:'registered-abort',deckA:[...source60],
      deckB:[...contender60]});
  },{
    headless,
    ownerLayer:(next,opts)=>{
      try{return {result:next(),audit:{}};}
      catch(error){
        seen.push(error);
        throw error;
      }
    },
    tagLayer:()=>{throw source;}
  }),/native Store rejected/);
  assert.strictEqual(seen[0],source);
  assert.strictEqual(headless.runMatch,prior);
});

test('malformed deck or missing source sixty rejected before policy invocation',()=>{
  const headless={runMatch:()=>null};
  const prior=headless.runMatch;
  let tagCalled=false;
  assert.throws(()=>withOwnerTagCallInsideSelectedV5(
    ()=>headless.runMatch({deckA:Array(60).fill('A'),deckB:['B']}),{
      headless,
      ownerLayer:next=>({result:next(),audit:{}}),
      tagLayer:()=>{
        tagCalled=true;
        return {result:null,audit:{}};
      }
    }),{name:'AssertionError'});
  assert.equal(tagCalled,false);
  assert.strictEqual(headless.runMatch,prior);
});

test('frozen registered source scope retained, no competitive claim',()=>{
  assert.ok(VERSION.includes('v7'));
  assert.equal(SOURCE_PATHS.length,6);
  assert.ok(SOURCE_PATHS.some(path=>
    path.endsWith('agent45-issue25-tagcall-v7-frozen-eight-20261105.json')));
});
