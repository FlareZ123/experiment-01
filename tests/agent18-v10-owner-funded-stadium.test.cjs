'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,HASH_PATHS,
  withOwnerFundedStadiumAfterNativeV9
}=require('../simulation/evaluation/agent18-v10-owner-funded-stadium.cjs');

test('v10 composes actual Tag→paid G&H→existing owner-Stadium policy for each native physical request',()=>{
  const calls=[];
  const mockRefs={kind:'native-owned-printed-catalog'};
  const result=withOwnerFundedStadiumAfterNativeV9(
    ()=>{calls.push('selected-batch');return 'native-batch';},{
      nativeRefs:()=>mockRefs,
      compositionLayer:(next,options)=>{
        const returned=[];
        for(const id of ['original-a','original-b']){
          const paid=options.halaLayer(
            ['physical-sixty-owner-a','physical-sixty-owner-b'],
            ()=>{calls.push('realStore:'+id);return 'live:'+id;},
            options.halaOptions);
          returned.push(paid);
        }
        return {result:next(),audit:{
          actualNativeMatchCalls:2,
          nativeTagThenHalaAttempts:returned.map((x,i)=>({
            matchLabel:i,status:'returned-unqualified',halaAudit:x.audit
          }))
        }};
      },
      halaLayer:(decks,realGame,options)=>{
        assert.deepEqual(decks,
          ['physical-sixty-owner-a','physical-sixty-owner-b']);
        assert.equal(options.maxDiscardPenalty,Infinity);
        calls.push('owner-paid-G&H');
        return {result:realGame(),audit:{nativeGHSupporterRootsAccepted:1}};
      },
      stadiumLayer:(execute,refs)=>{
        assert.strictEqual(refs,mockRefs);
        calls.push('funded-Stadium-wrapped');
        const result=execute();
        return {result,audit:{
          nativePassRootsExamined:1,selectedActions:1,
          nativeStoreStatus:'accepted'
        }};
      }
    });
  assert.equal(result.result,'native-batch');
  assert.equal(result.audit.fundedStadiumAttempts.length,2);
  assert.ok(result.audit.fundedStadiumAttempts.every(x=>
    x.fundedStadiumAudit.nativeStoreStatus==='accepted'));
  assert.ok(result.audit.nativeTagThenHalaAttempts.every(x=>
    x.halaAudit.nativeGHSupporterRootsAccepted===1));
  assert.deepEqual(calls,[
    'funded-Stadium-wrapped','owner-paid-G&H','realStore:original-a',
    'funded-Stadium-wrapped','owner-paid-G&H','realStore:original-b',
    'selected-batch'
  ]);
});

test('v10 preserves actual engine exception instead of fabricating Stadium or match',()=>{
  const marker=Error('authentic Store blocked a legal suspect');
  const calls=[];
  assert.throws(()=>withOwnerFundedStadiumAfterNativeV9(
    ()=>true,{
      nativeRefs:()=>({}),
      compositionLayer:(next,options)=>{
        options.halaLayer([],()=>true,{});
        return {result:next(),audit:{actualNativeMatchCalls:1}};
      },
      halaLayer:(decks,next)=>{
        calls.push('original-run');
        return {result:next(),audit:{}};
      },
      stadiumLayer:()=>{
        marker.agent7FundedAudit={
          nativeStoreStatus:'rejected',nativePassRootsExamined:1
        };
        throw marker;
      }
    }),error=>error===marker);
  assert.deepEqual(calls,[]);
});

test('v10 added data lineage is explicit and never claims matches',()=>{
  assert.match(VERSION,/retro/);
  assert.ok(HASH_PATHS.some(x=>x.includes('registrations/agent18-v10')));
  assert.ok(HASH_PATHS.some(x=>x.includes('agent7-funded-stadium')));
});
