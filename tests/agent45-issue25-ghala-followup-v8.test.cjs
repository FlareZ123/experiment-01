'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,HASH_PATHS,withNativeTagThenGuzmaHalaInsideSelectedV5
}=require('../simulation/evaluation/agent45-issue25-ghala-followup-v8.cjs');

const cards=()=>Array(60).fill('Own printed card TEST');

test('source-independent native composition installs owner then Tag Call then G&H inside',()=>{
  const events=[],headless={
    runMatch:request=>{
      events.push('real-store-match');
      return {seen:request.label};
    }
  };
  const previous=headless.runMatch;
  const selected=withNativeTagThenGuzmaHalaInsideSelectedV5(()=>{
    events.push('v5-batch');
    return headless.runMatch({deckA:cards(),deckB:cards(),label:'original-eight'});
  },{
    headless,
    ownerLayer:(next,options)=>{
      events.push('owner-start');
      assert.strictEqual(options.headless,headless);
      const result=next();
      events.push('owner-end');
      return {result,audit:{nativeMatchCalls:1}};
    },
    tagLayer:(ownSixties,next)=>{
      events.push('tag-start');
      assert.equal(ownSixties.length,2);
      const result=next();
      events.push('tag-end');
      return {result,audit:{acceptedNativeTagItems:1}};
    },
    halaLayer:(ownSixties,next)=>{
      events.push('hala-start');
      assert.equal(ownSixties.length,2);
      const result=next();
      events.push('hala-end');
      return {result,audit:{nativeGHSupporterRootsAccepted:1}};
    }
  });
  assert.deepEqual(events,[
    'owner-start','v5-batch','tag-start','hala-start',
    'real-store-match','hala-end','tag-end','owner-end'
  ]);
  assert.deepEqual(selected.result,{seen:'original-eight'});
  assert.equal(selected.audit.actualNativeMatchCalls,1);
  assert.equal(selected.audit.nativeTagThenHalaAttempts[0]
    .tagAudit.acceptedNativeTagItems,1);
  assert.equal(selected.audit.nativeTagThenHalaAttempts[0]
    .halaAudit.nativeGHSupporterRootsAccepted,1);
  assert.strictEqual(headless.runMatch,previous);
  assert.equal(selected.audit.qualifiedCompetitiveGames,0);
});
test('a native failed G&H continuation retains both error audits and restores headless',()=>{
  const headless={runMatch:()=>null};
  const previous=headless.runMatch;
  const error=new Error('G&H owner card payment declined by native Store');
  error.ownerTagCallHalaNativeAudit={acceptedRoots:1};
  error.agent45NativeGuzmaHalaAudit={physicalTwoCardPayments:0};
  assert.throws(()=>withNativeTagThenGuzmaHalaInsideSelectedV5(
    ()=>headless.runMatch({deckA:cards(),deckB:cards()}),{
      headless,ownerLayer:next=>({result:next(),audit:{}}),
      tagLayer:(registered,next)=>next(),
      halaLayer:()=>{throw error;}
    }),/payment declined/);
  assert.strictEqual(headless.runMatch,previous);
});
test('frozen scope and provenance retain original registered decks',()=>{
  assert.ok(VERSION.includes('v8'));
  assert.equal(HASH_PATHS.length,6);
  assert.ok(HASH_PATHS[0].includes('registration'));
});
