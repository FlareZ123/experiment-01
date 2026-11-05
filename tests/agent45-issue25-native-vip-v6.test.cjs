'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  withAgent45NativeVipInsideStewardV5,SOURCE_PATHS,VERSION
}=require('../simulation/evaluation/agent45-issue25-native-vip-continuation-v6.cjs');

test('native-selected VIP sits inside unchanged Prize and Pokémon owner layers',()=>{
  const stages=[];
  const selected=withAgent45NativeVipInsideStewardV5(()=>{
    stages.push('native-execute');
    return 'native-result';
  },{
    ownerLayer:(next,options)=>{
      stages.push('owner-start');
      const out=options.prize(next);
      stages.push('owner-finish');
      return {result:out.result,audit:{owner:'original-v5'}};
    },
    prizeLayer:next=>{
      stages.push('prize-start');
      const result=next();
      stages.push('prize-finish');
      return {result,audit:{prize:'unchanged'}};
    },
    vipLayer:next=>{
      stages.push('vip-start');
      const result=next();
      stages.push('vip-finish');
      return {result,audit:{observedPrintedVipRoots:1}};
    }
  });
  assert.deepEqual(stages,[
    'owner-start','prize-start','vip-start','native-execute',
    'vip-finish','prize-finish','owner-finish'
  ]);
  assert.equal(selected.result,'native-result');
  assert.equal(selected.audit.owner,'original-v5');
  assert.equal(selected.audit.selectedNativeVipOwnerAttemptCount,1);
  assert.equal(selected.audit.selectedNativeVipOwnerAttemptAudits[0]
    .audit.observedPrintedVipRoots,1);
  assert.equal(selected.audit.competitiveGamesQualified,0);
});

test('native failure is retained and propagated without fabricating a settled search',()=>{
  const error=new Error('staged native Store abort');
  error.agent45NativeSelectedVipAudit={observedPrintedVipRoots:1,
    acceptedOwnerSearches:0};
  const observed=[];
  assert.throws(()=>withAgent45NativeVipInsideStewardV5(
    ()=>undefined,{
      ownerLayer:(next,options)=>{
        try{return options.prize(next);}
        catch(cause){observed.push(cause);throw cause;}
      },
      prizeLayer:next=>next(),
      vipLayer:()=>{throw error;}
    }),/staged native Store abort/);
  assert.strictEqual(observed[0],error);
  assert.equal(error.agent45NativeSelectedVipAudit.acceptedOwnerSearches,0);
});

test('original registered cap and unqualified framing stay explicit',()=>{
  assert.ok(VERSION.includes('v6'));
  assert.ok(SOURCE_PATHS.includes(
    'simulation/twinleaf/agent45-native-selected-vip-owner-search.cjs'));
  assert.equal(SOURCE_PATHS.length,5);
});
