'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withOwnerPrizePromotionAndCustody,VERSION}=
  require('../simulation/evaluation/agent20-issue25-prize-custody-v14.cjs');

test('zone-count observer is innermost read-only and returns audit',()=>{
  const order=[];
  const execute=()=>{order.push('native');return 3;};
  const result=withOwnerPrizePromotionAndCustody(execute,{
    composition:fn=>{
      order.push('composition-before');
      const returned=fn();
      order.push('composition-after');
      return {result:returned,audit:{ownerPrize:{accepted:1}}};
    },
    zone:fn=>{
      order.push('zone-before');
      const returned=fn();
      order.push('zone-after');
      return {result:returned,audit:{acceptedPrizePromptActions:1,
        postDispatchZoneTransfersObserved:1}};
    }
  });
  assert.equal(result.result,3);
  assert.deepEqual(order,[
    'composition-before','zone-before','native',
    'zone-after','composition-after']);
  assert.equal(result.audit.version,VERSION);
  assert.equal(result.audit.nativePrizeZoneCustody.postDispatchZoneTransfersObserved,1);
  assert.equal(result.audit.noConcealedPrizeFaceInspection,true);
  assert.equal(result.audit.competitiveGamesQualified,0);
});

test('aborted native Store surfaces numeric audit without making a game qualified',()=>{
  const error=new Error('unsettled engine prompt');
  error.agent20PrizeZoneCustodyAudit={postDispatchZoneTransfersObserved:1};
  error.agent21OwnerPrizeAudit={ownerPrizeChoiceSubmitted:1};
  assert.throws(()=>withOwnerPrizePromotionAndCustody(
    ()=>{throw error;},{
      composition:fn=>fn(),
      zone:fn=>fn()
    }),/unsettled/);
  assert.equal(error.agent21OwnerPrizeAudit.nativePrizeZoneCustody
    .postDispatchZoneTransfersObserved,1);
  assert.equal(error.agent21OwnerPrizeAudit.competitiveGamesQualified,0);
});
