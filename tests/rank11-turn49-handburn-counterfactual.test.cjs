'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseTrainerDiscard,DISCARD_ORDER}=
  require('../simulation/twinleaf/rank11-turn49-handburn-counterfactual.cjs');

/** @param {string[]} names @returns {{fullName:string}[]} */
const cards=names=>names.map(fullName=>({fullName}));

test('prefers disposable Boost Shake while preserving three Quick Ball copies',()=>{
  const sourceHand=cards([
    'Quick Ball FST','Secret Box TWM','Guzma BUS','Quick Ball FST',
    'Carmine TWM','Boost Shake EVS','Carmine TWM','VS Seeker PHF',
    'Quick Ball FST','Dark Patch ASR'
  ]);
  const first=chooseTrainerDiscard(sourceHand);
  assert.equal(first?.fullName,'Boost Shake EVS');
  assert.equal(sourceHand.filter(c=>c.fullName==='Quick Ball FST').length,3);
  const reduced=sourceHand.filter(c=>c!==first);
  assert.equal(chooseTrainerDiscard(reduced)?.fullName,'VS Seeker PHF');
});

test('third actual Trainer choice is Carmine after Boost Shake and VS Seeker',()=>{
  const sourceHand=cards([
    'Quick Ball FST','Quick Ball FST','Quick Ball FST',
    'Carmine TWM','Carmine TWM','Guzma BUS','Secret Box TWM',
    'Dark Patch ASR'
  ]);
  assert.equal(chooseTrainerDiscard(sourceHand)?.fullName,'Carmine TWM');
});

test('never spends a Quick Ball as the cost for another Quick Ball',()=>{
  assert.equal(chooseTrainerDiscard(cards([
    'Quick Ball FST','Quick Ball FST','Darkness Energy MEE'
  ])),null);
});

test('falls through fixed published source Trainer printings without hidden information',()=>{
  assert.equal(chooseTrainerDiscard(cards([
    'Dark Patch ASR','Secret Box TWM','Guzma BUS'
  ]))?.fullName,'Guzma BUS');
  assert.equal(chooseTrainerDiscard(cards(['Garbodor BKP'])),null);
  assert.equal(new Set(DISCARD_ORDER).size,DISCARD_ORDER.length);
});
