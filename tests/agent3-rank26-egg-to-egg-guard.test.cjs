'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {exeggcutePumpMoves} =
  require('../simulation/twinleaf/rank26-exeggcute-pump-policy.cjs');

/** @param {string|null} name @param {number} damage */
function slot(name,damage) {
  return {damage,getPokemonCard() {return name?{name}:null;}};
}

/** @param {number} eggADamage @param {number} eggBDamage */
function source(eggADamage=20,eggBDamage=20) {
  const own={bench:[
    slot('Meloetta ex',0),slot('Tapu Koko ♢',0),
    slot('Exeggcute',eggADamage),slot('Exeggcute',eggBDamage),
    slot(null,0)
  ]};
  Object.defineProperty(own,'deck',{
    get() {throw new Error('K0 deck inspected');}
  });
  Object.defineProperty(own,'prizes',{
    get() {throw new Error('Face-down Prize contents inspected');}
  });
  return own;
}

test('default-off: two damaged Eggs alone cannot be Pump donors',()=>{
  assert.equal(exeggcutePumpMoves(source(),3,5,2),null);
});

test('opt-in: at exactly two opponent Prizes move one counter Egg B to Egg A',()=>{
  assert.deepEqual(exeggcutePumpMoves(source(),3,5,2,true),[{
    from:{player:3,slot:5,index:3},
    to:{player:3,slot:5,index:2}
  }]);
});

test('the fifth-KO option cannot start earlier or score a sixth KO',()=>{
  for(const remaining of [6,5,4,3,1,0]){
    assert.equal(exeggcutePumpMoves(source(),3,5,remaining,true),null,
      'Prize boundary '+remaining);
  }
});

test('both Eggs must be exactly 20 damaged and physically distinct',()=>{
  assert.equal(exeggcutePumpMoves(source(10,20),3,5,2,true),null);
  assert.equal(exeggcutePumpMoves(source(20,10),3,5,2,true),null);
  assert.equal(exeggcutePumpMoves(source(20,30),3,5,2,true),null);
  const own=source();
  own.bench[3]=slot('Unown',20);
  assert.deepEqual(exeggcutePumpMoves(own,3,5,2,true),[{
    from:{player:3,slot:5,index:3},
    to:{player:3,slot:5,index:2}
  }], 'existing non-Egg donor priority applies');
});

test('a paid non-Egg source continues to take priority over the new option',()=>{
  const own=source();
  own.bench[0].damage=10;
  assert.deepEqual(exeggcutePumpMoves(own,3,5,2,true),[{
    from:{player:3,slot:5,index:0},
    to:{player:3,slot:5,index:2}
  }]);
});

test('same printed 30-HP Egg donor is always different from target',()=>{
  const own=source();
  const move=exeggcutePumpMoves(own,3,5,2,true)[0];
  assert.notEqual(move.from.index,move.to.index);
  assert.equal(own.bench[move.from.index].damage,20);
  assert.equal(own.bench[move.to.index].damage,20);
  console.log('AGENT3_RANK26_EGG_DONOR',JSON.stringify({
    source:'original rank26; staged public Bench only',
    opponentPrizesBefore:2,
    donorIndex:move.from.index,recipientIndex:move.to.index,
    donorAfterDamage:10,recipientAfterDamage:30,
    expectedOpponentPrizesAfter:1,
    nativePaymentVerified:false,wholeGameQualified:false
  }));
});
