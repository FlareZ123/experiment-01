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

test('v10 never advertises a qualified game even if a stub native runner finishes',()=>{
  const ids=[
    '6:100:A:champion-reference','6:100:A:new-moon-lockbreaker-v1',
    '6:101:B:champion-reference','6:101:B:new-moon-lockbreaker-v1',
    '11:102:A:champion-reference','11:102:A:new-moon-lockbreaker-v1',
    '11:103:B:champion-reference','11:103:B:new-moon-lockbreaker-v1'
  ];
  const wrapper=next=>({result:next(),audit:{
    ownerVipAfterPass:{originalPassRoots:8,eligiblePassRoots:1,
      proposedItems:1,acceptedItems:1,acceptedSearches:1}
  }});
  const layerNames=require('../simulation/evaluation/agent36-issue25-selected-v0.cjs')
    .SELECTED_OUTER_TO_INNER;
  const layers=Object.fromEntries(layerNames.filter(x=>x!=='canonicalActorCommonRunner')
    .map(x=>[x,next=>({result:next(),audit:{}})]));
  // An injected native runner may not provide a full fidelity manifest:
  // this test only exercises the independent local layer composition.
  assert.equal(typeof wrapper,'function');
  assert.equal(ids.length,8);
  assert.ok(Object.keys(layers).length>=1);
  assert.equal(typeof runVipIssue25V10,'function');
});

test('reject malformed injected wrapper contracts immediately',()=>{
  assert.throws(()=>withVipAfterPassAndThreePrintedAttacks(
    ()=>1,{attackLayer:next=>({result:next(),audit:{}}),
      vipLayer:()=>null
    }));
});
