'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,COST_BY_PRINT,combinations,
  physicalHandPayment,ownerTrainerDiscardContention
}=require('../simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs');

function view(hand){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:1,
    ownHand:hand,
    opponentPublic:{handCount:99,deckCount:99}
  };
}
function rows(hand,types={},blocks={}){
  return hand.map((printing,handIndex)=>({
    printing,handIndex,type:types[printing]??'Item',
    publicBlocker:blocks[printing]??null
  }));
}
test('catalog distinguishes BW/older Quick Ball from FST discard Quick Ball',()=>{
  assert.equal(COST_BY_PRINT.get('Quick Ball FST').options[0].discards,1);
  assert.equal(COST_BY_PRINT.get('Quick Ball SSH').options[0].discards,1);
  assert.equal(COST_BY_PRINT.get('Quick Ball MD'),undefined);
  assert.equal(COST_BY_PRINT.get('Secret Box TWM').options[0].discards,3);
  assert.equal(COST_BY_PRINT.get('Ultra Ball MEG').options[0].discards,2);
  assert.equal(COST_BY_PRINT.get("Trainers' Mail ROS").options[0].discards,0);
  assert.ok(VERSION.startsWith('agent27-owner-trainer'));
});

test('Secret Box needs three OTHER physical cards, independent of strategic protection',()=>{
  const hand=['Secret Box TWM','Boss\'s Orders PAL','Psychic Energy MEG','Regidrago V SIT'];
  const alone=physicalHandPayment(hand,[0],3);
  assert.equal(alone.physicallyAffordable,true);
  assert.equal(alone.physicalPaymentWays,'1');
  const protect=new Set([1,3]);
  const guarded=physicalHandPayment(hand,[0],3,0,protect);
  assert.equal(guarded.physicallyAffordable,true);
  assert.equal(guarded.affordablePreservingProtected,false);
  assert.equal(guarded.forcedProtectedSacrifices,2);
  assert.equal(guarded.unprotectedPaymentWays,'0');
  assert.equal(guarded.illustrativeUnprotectedPayment,null);
  const fewer=physicalHandPayment(hand.slice(0,3),[0],3);
  assert.equal(fewer.physicallyAffordable,false);
  assert.equal(fewer.physicalPaymentWays,'0');
});

test('two individually payable Ultra Balls cannot consume each other if both planned',()=>{
  const hand=['Ultra Ball MEG','Ultra Ball MEG','Energy A','Energy B'];
  assert.equal(physicalHandPayment(hand,[0],2).physicallyAffordable,true);
  assert.equal(physicalHandPayment(hand,[1],2).physicallyAffordable,true);
  const jointly=physicalHandPayment(hand,[0,1],2,2);
  assert.equal(jointly.physicallyAffordable,false);
  assert.equal(jointly.unprotectedPaymentWays,'0');
  const frontier=ownerTrainerDiscardContention(
    view(hand),rows(hand.filter(x=>x==='Ultra Ball MEG')),new Set());
  assert.equal(frontier.pairs.length,1);
  assert.equal(frontier.pairs[0].variants[0].physicallyAffordable,false);
});

test('first selected Trainer is reserved from second payment even when first is free',()=>{
  const hand=['Battle VIP Pass FST','Secret Box TWM','A','B','C'];
  const a=physicalHandPayment(hand,[0,1],0,3);
  assert.equal(a.physicallyAffordable,true);
  assert.deepEqual(a.illustrativeUnprotectedPayment,{
    firstIndices:[],secondIndices:[2,3,4]
  });
  assert.equal(a.unprotectedPaymentWays,'1');
  assert.equal(physicalHandPayment(hand.slice(0,4),[0,1],0,3)
    .physicallyAffordable,false);
});

test('optional Guzma and Hala premium payment is separate from free Stadium-only mode',()=>{
  const hand=['Guzma & Hala CEC','Battle VIP Pass FST','A'];
  const r=ownerTrainerDiscardContention(view(hand),
    [rows(hand)[0],rows(hand)[1]]);
  assert.deepEqual(r.rows[0].variants.map(v=>v.mode),
    ['stadium-only','enhanced-tool-energy']);
  assert.deepEqual(r.rows[0].variants.map(v=>v.discards),[0,2]);
  assert.equal(r.rows[0].variants[1].physicallyAffordable,true);
  assert.equal(r.pairs[0].variants.find(v=>
    v.firstMode==='enhanced-tool-energy').physicallyAffordable,false);
});

test('per-turn Supporter quota recorded separately from physical ability to pay',()=>{
  const hand=['Guzma & Hala CEC','Guzma & Hala CEC','A','B','C','D'];
  const r=ownerTrainerDiscardContention(view(hand),
    rows(hand.slice(0,2),{'Guzma & Hala CEC':'Supporter'}));
  assert.equal(r.pairs[0].genericBlocker,'one-supporter-per-turn');
  assert.equal(r.pairs[0].variants.at(-1).physicallyAffordable,true);
  assert.equal(r.cannotCertifyPaperAction,true);
  assert.equal(r.cannotCertifyGamePerformance,true);
});

test('generic item lock propagates without treating a full hand as legal play',()=>{
  const hand=['Secret Box TWM','A','B','C'];
  const r=ownerTrainerDiscardContention(view(hand),
    [rows(hand,{}, {'Secret Box TWM':'public-item-lock'})[0]]);
  assert.equal(r.rows[0].publicBlocker,'public-item-lock');
  assert.equal(r.rows[0].variants[0].physicallyAffordable,true);
  assert.equal(r.cannotCertifyTargetOrSearch,true);
});

test('physical payments are indexed and two-cost combinations counted exactly',()=>{
  const hand=['A','B','C','D','E','F','G'];
  const result=physicalHandPayment(hand,[0,1],2,1);
  assert.equal(result.physicalPaymentWays,'30');
  assert.equal(result.unprotectedPaymentWays,'30');
  assert.deepEqual(result.illustrativeUnprotectedPayment,
    {firstIndices:[2,3],secondIndices:[4]});
  assert.equal(combinations(60,6),50063860n);
});

test('input mismatches fail closed',()=>{
  assert.throws(()=>ownerTrainerDiscardContention(
    view(['Quick Ball FST']),[{
      handIndex:0,printing:'Secret Box TWM',type:'Item'
    }]),/strictEqual|Expected values/);
  assert.throws(()=>physicalHandPayment(['A'],[1],0),/AssertionError/);
  assert.throws(()=>physicalHandPayment(['A'],[0],0,0,new Set([99])),
    /AssertionError/);
});

test('owner view and input records are never mutated or inferred from opponent secrets',()=>{
  const hand=Object.freeze(['Quick Ball FST','Battle VIP Pass FST','Energy']);
  const v=Object.freeze(view(hand));
  const rr=Object.freeze(rows(hand).slice(0,2).map(Object.freeze));
  const out=ownerTrainerDiscardContention(v,rr);
  assert.equal(out.noOpponentHiddenCards,true);
  assert.equal(out.rows[0].costKnown,true);
  assert.equal(out.rows[1].costKnown,true);
  assert.equal(v.ownHand.length,3);
});
