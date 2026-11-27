'use strict';
const assert=require('node:assert/strict');
const {evaluate}=require('../../scripts/2026-11/agent15-guzma-eon-relay.cjs');
for(const dna of [true,false]){
  const v=evaluate({dna});
  assert.equal(v.success,true);
  assert.equal(v.ownPrizes,6);
  assert.equal(v.sourcePrizes,0);
  assert.equal(v.energyOnLatias,2);
  assert.equal(v.supporters,2);
  assert.equal(v.retreats,2);
  assert.equal(v.latiasHP,dna?90:30);
}
for(const opts of [
  {valley:false},{fairy:false},{skyliner:false},
  {guzma:false},{vs:false},{items:false},
  {thirdVstar:false},{fourthDragonV:false},
  {replies:['phantom','covert']},{replies:['covert','phantom']},
  {replies:['ryuno','covert']},{initialLatiasDamage:100}
]) assert.equal(evaluate(opts).success,false,JSON.stringify(opts));
const noBand=evaluate({band:false,dna:false});
assert.equal(noBand.success,true);
assert.equal(noBand.latiasHP,70);
console.log('guzma eon conditional route 15 assertions passed');
