'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {inspectRank8K0BoxShake,VERSION}=
  require('../simulation/twinleaf/agent44-rank8-box-k0-window.cjs');

/** @param {string[]} names @param {object} extra */
function view(names,extra={}){
  return {handNames:names,benchNames:[null,null,null,null,null],
    benchTools:[[],[],[],[],[]],itemLocked:false,toolLocked:false,...extra};
}

test('K0 Secret Box can hold Trubbish and pay three physical cards',()=>{
  const result=inspectRank8K0BoxShake(view([
    'Secret Box','Trubbish','Dark Patch','VS Seeker','Iono',
    'Float Stone','Darkness Energy']));
  assert.equal(result.version,VERSION);
  assert.equal(result.shakeHeld,false);
  assert.equal(result.boxFetchShake,true);
  assert.equal(result.boxThreePhysicalDiscardCapacity,true);
  assert.equal(result.prioritizedBasicSearcher,null);
});

test('K0 Box may reserve Battle VIP Pass, paying three other cards',()=>{
  const result=inspectRank8K0BoxShake(view([
    'Secret Box','Battle VIP Pass','Dark Patch','VS Seeker','Iono',
    'Darkness Energy','Lightning Energy']));
  assert.equal(result.boxFetchShake,true);
  assert.equal(result.prioritizedBasicSearcher,'Battle VIP Pass');
  assert.equal(result.additionalSearchDiscardCost,0);
});

test('Ultra Ball needs two remaining physical cards after Box payment',()=>{
  const viable=inspectRank8K0BoxShake(view([
    'Secret Box','Ultra Ball','Dark Patch','Iono','VS Seeker',
    'Crispin','Lightning Energy']));
  assert.equal(viable.boxFetchShake,true);
  assert.equal(viable.additionalSearchDiscardCost,2);
  const short=inspectRank8K0BoxShake(view([
    'Secret Box','Ultra Ball','Dark Patch','Iono',
    'VS Seeker','Crispin']));
  assert.equal(short.boxThreePhysicalDiscardCapacity,true);
  assert.equal(short.additionalSearchDiscardCapacity,false);
  assert.equal(short.boxFetchShake,false);
});

test('no held Basic searcher cannot fetch Shake and missing Trubbish together',()=>{
  const result=inspectRank8K0BoxShake(view([
    'Secret Box','Dark Patch','Iono','VS Seeker','Crispin',
    'Float Stone','Darkness Energy']));
  assert.equal(result.boxFetchShake,false);
  assert.equal(result.missingTrubbish,true);
});

test('Box and Shake held use independent route; direct held Shake without Box',()=>{
  const held=inspectRank8K0BoxShake(view([
    'Secret Box','Boost Shake','Trubbish',
    'Float Stone','Iono','VS Seeker','Dark Patch']));
  assert.equal(held.boxFetchShake,false);
  assert.equal(held.boxHeldShake,true);
  assert.equal(held.directShake,true);
  const direct=inspectRank8K0BoxShake(view([
    'Boost Shake','Trubbish','Float Stone','Iono']));
  assert.equal(direct.boxFetchShake,false);
  assert.equal(direct.boxHeldShake,false);
  assert.equal(direct.directShake,true);
});

test('Item or Tool public lock vetoes candidate root before any native play',()=>{
  const names=['Secret Box','Trubbish','Iono','VS Seeker',
    'Dark Patch','Crispin','Lightning Energy'];
  assert.equal(inspectRank8K0BoxShake(view(names,{itemLocked:true}))
    .boxFetchShake,false);
  assert.equal(inspectRank8K0BoxShake(view(names,{toolLocked:true}))
    .boxFetchShake,false);
});

test('full Bench without Trubbish denies an unplaceable evolution line',()=>{
  const result=inspectRank8K0BoxShake(view([
    'Secret Box','Trubbish','Dark Patch','Iono','VS Seeker',
    'Crispin','Lightning Energy'],
    {benchNames:['Budew','Crobat V','Mega Absol ex','Dedenne-GX',
      'Tapu Lele-GX']}));
  assert.equal(result.boxFetchShake,false);
  assert.equal(result.benchFree,false);
});

test('already benched Trubbish can evolve with no open Bench',()=>{
  const result=inspectRank8K0BoxShake(view([
    'Secret Box','Dark Patch','Iono','VS Seeker','Crispin',
    'Lightning Energy','Darkness Energy'],
    {benchNames:['Trubbish','Crobat V','Mega Absol ex','Dedenne-GX',
      'Tapu Lele-GX']}));
  assert.equal(result.boxFetchShake,true);
  assert.equal(result.inPlayTrubbish,true);
  assert.equal(result.benchFree,false);
});

test('already Active Trubbish qualifies as a legal Shake evolution target',()=>{
  const result=inspectRank8K0BoxShake(view([
    'Secret Box','Dark Patch','VS Seeker','Iono',
    'Crispin','Lightning Energy','Darkness Energy'],
    {activeName:'Trubbish',
      benchNames:['Budew','Crobat V','Mega Absol ex','Dedenne-GX',
        'Tapu Lele-GX']}));
  assert.equal(result.inPlayTrubbish,true);
  assert.equal(result.benchFree,false);
  assert.equal(result.boxFetchShake,true);
});

test('Box Supporter and Stadium searches may subsidize later Ultra Ball payment',()=>{
  const oneMissing=inspectRank8K0BoxShake(view([
    'Secret Box','Ultra Ball','Dark Patch','Iono',
    'VS Seeker','Crispin']));
  assert.equal(oneMissing.boxThreePhysicalDiscardCapacity,true);
  assert.equal(oneMissing.boxFetchShake,false);
  assert.equal(oneMissing.postBoxSearcherDiscardShortfall,1);
  assert.equal(oneMissing.boxFetchShakePotentialAuxiliaryPayment,true);
  assert.equal(oneMissing.anyK0Window,false);
  assert.equal(oneMissing.anyK0OrConditionalAuxiliaryWindow,true);
  const twoMissing=inspectRank8K0BoxShake(view([
    'Secret Box','Ultra Ball','Dark Patch','Iono','VS Seeker']));
  assert.equal(twoMissing.postBoxSearcherDiscardShortfall,2);
  assert.equal(twoMissing.boxFetchShakePotentialAuxiliaryPayment,true);
});

test('Box own upfront three discards cannot be funded from its future searches',()=>{
  const short=inspectRank8K0BoxShake(view([
    'Secret Box','Ultra Ball','Dark Patch','Iono']));
  assert.equal(short.boxThreePhysicalDiscardCapacity,false);
  assert.equal(short.boxFetchShakePotentialAuxiliaryPayment,false);
  assert.equal(short.anyK0OrConditionalAuxiliaryWindow,false);
});

test('K0 present-day Quick Ball payment remains strict unless auxiliary search is required',()=>{
  const held=inspectRank8K0BoxShake(view([
    'Secret Box','Quick Ball','Iono','Dark Patch','VS Seeker','Crispin']));
  assert.equal(held.boxThreePhysicalDiscardCapacity,true);
  assert.equal(held.postBoxSearcherDiscardShortfall,0);
  assert.equal(held.boxFetchShake,true);
  assert.equal(held.boxFetchShakePotentialAuxiliaryPayment,false);
});
