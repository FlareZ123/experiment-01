'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOpeningDiscards,planOpeningHand}=
  require('../simulation/twinleaf/rank6-broad-thorns-policy.cjs');

/** @param {string[]} names */
const hand=names=>names.map(name=>({name}));

test('direct DCE and Thunder route consumes no Supporter',()=>{
  const plan=planOpeningHand(hand([
    'Iron Thorns ex','Double Colorless Energy','Thunder Mountain Prism Star'
  ]));
  assert.deepEqual(plan,{channel:'direct',needDce:false,
    needThunder:false,discardCount:0});
});

test('G&H finds missing Thunder and DCE from one legal prompted search',()=>{
  const h=hand(['Iron Thorns ex','Guzma & Hala',
    'Camping Gear','Crushing Hammer','VS Seeker']);
  assert.deepEqual(planOpeningHand(h),{
    channel:'held-guzma-hala',needDce:true,
    needThunder:true,discardCount:2
  });
  assert.deepEqual(chooseOpeningDiscards(h).map(c=>c.name),
    ['Camping Gear','Crushing Hammer']);
});

test('Tag Call is a K0 connector when G&H is absent',()=>{
  const h=hand(['Iron Thorns ex','Tag Call','Plumeria',
    'Crushing Hammer','Palace Book']);
  assert.equal(planOpeningHand(h)?.channel,'tag-call-to-guzma-hala');
});

test('held DCE with missing Stadium can search without discards',()=>{
  assert.deepEqual(planOpeningHand(hand([
    'Iron Thorns ex','Guzma & Hala','Double Colorless Energy'
  ])),{
    channel:'held-guzma-hala',needDce:false,
    needThunder:true,discardCount:0
  });
});

test('in-play Thunder Mountain removes the Stadium search need',()=>{
  const h=hand(['Iron Thorns ex','Double Colorless Energy','Tag Call']);
  assert.deepEqual(planOpeningHand(h,true),{
    channel:'direct',needDce:false,needThunder:false,discardCount:0
  });
});

test('decline when no supporter connector or insufficient discard material',()=>{
  assert.equal(planOpeningHand(hand([
    'Iron Thorns ex','Crushing Hammer','Plumeria'
  ])),null);
  assert.equal(planOpeningHand(hand([
    'Iron Thorns ex','Guzma & Hala','Thunder Mountain Prism Star',
    'Double Dragon Energy','VS Seeker','Megaton Blower'
  ])),null);
});

test('exclude physical ACE SPEC and DCE from discard payments',()=>{
  const h=hand(['Megaton Blower','Double Colorless Energy',
    'Thunder Mountain Prism Star','Guzma & Hala','Tag Call',
    'Tropical Beach','Crushing Hammer']);
  const paid=chooseOpeningDiscards(h);
  assert.deepEqual(paid.map(c=>c.name),['Tropical Beach','Crushing Hammer']);
  assert.ok(paid.every(c=>h.includes(c)));
});
