'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseK1AlternateSpecialEnergy}=require('../simulation/twinleaf/rank6-broad-thorns-policy.cjs');
const hand=names=>names.map(name=>({name}));

test('K1 DCE still in own deck vetoes alternate search',()=>{
  assert.equal(chooseK1AlternateSpecialEnergy(hand(['Double Colorless Energy','Speed Lightning Energy'])),null);
});
test('source K1 alternate prioritizes Speed, Capture and Spiky in order',()=>{
  assert.equal(chooseK1AlternateSpecialEnergy(hand(['Spiky Energy','Capture Energy','Speed Lightning Energy'])),'Speed Lightning Energy');
  assert.equal(chooseK1AlternateSpecialEnergy(hand(['Spiky Energy','Capture Energy'])),'Capture Energy');
  assert.equal(chooseK1AlternateSpecialEnergy(hand(['Spiky Energy'])),'Spiky Energy');
});
test('K1 alternate refuses absent or unrelated Energy',()=>{
  assert.equal(chooseK1AlternateSpecialEnergy(hand([])),null);
  assert.equal(chooseK1AlternateSpecialEnergy(hand(['Double Dragon Energy','Basic Lightning Energy'])),null);
});
