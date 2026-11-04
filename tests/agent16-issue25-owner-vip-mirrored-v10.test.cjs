'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {withVipAfterPassAndThreePrintedAttacks,runVipIssue25V10}=
  require('../simulation/evaluation/agent16-issue25-owner-vip-mirrored-v10.cjs');

test('existing three printed attacks surround same two-seat VIP with unchanged next',()=>{
  const order=[];
  const wrapped=withVipAfterPassAndThreePrintedAttacks(
    ()=>{order.push('native');return 'authentic-native-result';},{
      attackLayer:next=>{
        order.push('three-before');
        const result=next();
        order.push('three-after');
        return {result,audit:{printedThree:true}};
      },
      vipLayer:next=>{
        order.push('vip-before');
        const result=next();
        order.push('vip-after');
        return {result,audit:{originalPassRoots:5,acceptedItems:1}};
      }
    });
  assert.deepEqual(order,[
    'three-before','vip-before','native','vip-after','three-after'
  ]);
  assert.equal(wrapped.result,'authentic-native-result');
  assert.equal(wrapped.audit.printedThree,true);
  assert.equal(wrapped.audit.ownerVipAfterPass.acceptedItems,1);
  assert.equal(wrapped.audit.paperGameQualified,false);
  assert.equal(wrapped.audit.competitivelyQualifiedGames,0);
});

test('v10 actually retains eight frozen trial IDs and never qualifies stubbed games',()=>{
  const {SELECTED_OUTER_TO_INNER}=
    require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');
  const layers={};
  for(const name of SELECTED_OUTER_TO_INNER.slice(0,-1))
    layers[name]=next=>({result:next(),audit:{name}});
  let received=null;
  const executed=runVipIssue25V10({
    layers,
    attackLayer:next=>withVipAfterPassAndThreePrintedAttacks(next,{
      attackLayer:next=>({result:next(),audit:{threePrinted:true}}),
      vipLayer:next=>({result:next(),audit:{
        originalPassRoots:8,eligiblePassRoots:2,proposedItems:2,
        acceptedItems:2,acceptedSearches:2,
        bySeat:{0:{items:1,searches:1},1:{items:1,searches:1}}
      }})
    }),
    runner:options=>{
      received=options;
      return {
        sourceIndependentCommonPolicyOptIn:true,
        rows:options.registeredTrials.map(trial=>({
          trial,status:'synthetic-development-only',
          sourceSeat:trial.candidateSlot==='A'?1:0,
          candidateSeat:trial.candidateSlot==='A'?0:1,
          finished:false,rootActionLedger:[]
        }))
      };
    }
  });
  assert.equal(received.nativeRootActionLimit,48);
  assert.equal(received.sourceIndependentCommonPolicy,true);
  assert.equal(received.registeredTrials.length,8);
  assert.equal(executed.diagnostic.registered.length,8);
  assert.equal(executed.diagnostic.attemptedRows.length,8);
  assert.equal(executed.diagnostic.ownerVipAfterPassSummary.acceptedItems,2);
  assert.equal(executed.diagnostic.sourceIndependentOwnerVipAfterPassObserved,true);
  assert.deepEqual(executed.diagnostic.ownerVipAfterPassSummary.bySeat,
    {0:{items:1,searches:1},1:{items:1,searches:1}});
  assert.equal(executed.manifest.sameEightOriginalV6Registrations,true);
  assert.equal(executed.manifest.releaseQualified,false);
  assert.equal(executed.diagnostic.competitiveGamesQualified,0);
  assert.match(executed.diagnostic.verdict,/unqualified/);
});

test('reject malformed injected wrapper contracts immediately',()=>{
  assert.throws(()=>withVipAfterPassAndThreePrintedAttacks(
    ()=>1,{attackLayer:next=>({result:next(),audit:{}}),
      vipLayer:()=>null
    }));
});
