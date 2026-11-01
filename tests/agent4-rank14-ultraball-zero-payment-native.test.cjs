'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {probeUltraBallZeroPayment}=require(
  '../simulation/twinleaf/agent4-ultra-ball-zero-payment-native.cjs');

test('authentic published rank14 source physically contains the mandatory-search printing family',()=>{
  const document=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const source=document.decks.find(x=>x.rank===14);
  assert.equal(source.player,'Manaya Asano');
  for(const [name,count,set,number] of [
    ['Ultra Ball',1,'MEG','131'],
    ['Regidrago V',4,'SIT','135'],
    ['Grass Energy',4,'MEE','9'],
    ['Fire Energy',2,'MEE','10']
  ]){
    const c=source.cards.find(x=>x.name===name);
    assert.deepEqual([c.count,c.printing.set,c.printing.number],
      [count,set,number]);
  }
});

test('rank14 genuine Ultra Ball choose-cards mandatory 2-payment and native Store zero-reply are recorded on both seats',()=>{
  for(const seat of [0,1]){
    const result=probeUltraBallZeroPayment(seat);
    console.log('AGENT4_RANK14_ULTRABALL_ZERO_NATIVE '+
      JSON.stringify(result));
    assert.equal(result.seat,seat);
    assert.equal(result.originalPrintedCard,'Ultra Ball MEG 131');
    assert.equal(result.originalPrintedTarget,'Regidrago V SIT 135');
    assert.equal(result.originalMin,2);
    assert.equal(result.originalMax,2);
    assert.equal(result.originalValidatorAccepted,false);
  }
});

test('same printed rank14 native Ultra Ball pairs a valid two-card payment against the forbidden free search in both seats',()=>{
  for(const seat of [0,1]){
    const free=probeUltraBallZeroPayment(seat,'zero');
    const paid=probeUltraBallZeroPayment(seat,'two');
    console.log('AGENT4_RANK14_ULTRABALL_PAIRED '+JSON.stringify({free,paid}));
    assert.equal(free.originalValidatorAccepted,false);
    assert.equal(free.chosenValidatorAccepted,false);
    assert.match(free.strictError,/invalid result to ChooseCardsPrompt/);
    assert.equal(free.zeroPaymentError,null);
    assert.equal(free.regidragoAddedToHand,true);
    assert.equal(free.grassDiscarded,false);
    assert.equal(free.fireDiscarded,false);
    assert.deepEqual(free.ownerHandAfter,
      ['Grass Energy MEE','Fire Energy MEE','Regidrago V SIT']);
    assert.deepEqual(free.promptsPending,[]);
    assert.equal(paid.chosenValidatorAccepted,true);
    assert.equal(paid.strictError,null);
    assert.equal(paid.zeroPaymentError,null);
    assert.equal(paid.regidragoAddedToHand,true);
    assert.equal(paid.grassDiscarded,true);
    assert.equal(paid.fireDiscarded,true);
    assert.deepEqual(paid.ownerHandAfter,['Regidrago V SIT']);
    assert.deepEqual(paid.promptsPending,[]);
    assert.equal(free.continuation.length,paid.continuation.length);
  }
});
