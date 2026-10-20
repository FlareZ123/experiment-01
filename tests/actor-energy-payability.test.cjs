'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {canPaySymbols,energyUnits,printedEnergyPayability}=
  require('../simulation/twinleaf/actor-energy-payability.cjs');
const basic={isBasic:true,isEvolution:false,isDragon:false,
  hasRuleBox:false,behindOnPrizes:false};

/** @param {string[]} cost @param {string[]} energy @param {object} [change] */
const readiness=(cost,energy,change={})=>
  printedEnergyPayability(cost,energy,{...basic,...change});

test('physical two-unit Colorless cannot pay colored requirements',()=>{
  assert.equal(readiness(['C','C'],['Double Colorless Energy XY1']).payable,true);
  assert.equal(readiness(['P'],['Double Colorless Energy XY1']).payable,false);
  assert.equal(readiness(['P','P'],['Double Colorless Energy XY1']).payable,false);
});

test('Basic Prism and Dragon-only Double Dragon eligibility',()=>{
  assert.equal(readiness(['P','C','C'],[
    'Prism Energy NXD','Double Colorless Energy XY1']).payable,true);
  assert.equal(readiness(['P'],['Prism Energy NXD'],{isBasic:false}).payable,false);
  assert.equal(readiness(['P','R'],['Double Dragon Energy ROS'],
    {isDragon:true}).payable,true);
  assert.equal(readiness(['P'],['Double Dragon Energy ROS']).payable,null);
});

test('exact colored matching backtracks over flexible unit assignment',()=>{
  assert.equal(readiness(['P','L'],[
    'Unit Energy LightningPsychicMetal UPR','Psychic Energy MEE']).payable,true);
  assert.equal(readiness(['P','L'],['Unit Energy LightningPsychicMetal UPR']).payable,false);
  assert.equal(canPaySymbols(['P','L'],[['P','L'],['P']]),true);
  assert.equal(canPaySymbols(['P','L'],[['P'],['P']]),false);
});

test('Reversal and Ignition do not overproduce in the wrong public condition',()=>{
  const reversal=['Reversal Energy PAL'];
  assert.equal(readiness(['P','P','P'],reversal,{
    isBasic:false,isEvolution:true,behindOnPrizes:true}).payable,true);
  assert.equal(readiness(['P'],reversal,{
    isBasic:false,isEvolution:true,behindOnPrizes:true,
    hasRuleBox:true}).payable,false);
  assert.equal(readiness(['C'],reversal,{
    isBasic:false,isEvolution:true,behindOnPrizes:false}).payable,true);
  assert.equal(readiness(['C','C','C'],['Ignition Energy WHT'],{
    isBasic:false,isEvolution:true}).payable,true);
  assert.equal(readiness(['C','C'],['Ignition Energy WHT']).payable,false);
});

test('unknown printings preserve uncertainty except when known units suffice',()=>{
  assert.equal(readiness(['P'],['Unmodeled Energy XYZ']).payable,null);
  const enough=readiness(['P'],[
    'Psychic Energy MEE','Unmodeled Energy XYZ']);
  assert.equal(enough.payable,true);
  assert.deepEqual(enough.unknownPrintings,['Unmodeled Energy XYZ']);
  assert.equal(energyUnits('Unmodeled Energy XYZ',basic),null);
});

test('one any-type unit cannot pay two typed requirements',()=>{
  assert.equal(readiness(['P','F'],['Aurora Energy SSH']).payable,false);
  assert.equal(readiness(['P','C'],[
    'Rainbow Energy SUM','Darkness Energy MEE']).payable,true);
  assert.equal(readiness(['P'],['Legacy Energy TWM']).payable,true);
  assert.throws(()=>canPaySymbols(['P','unrecognized'],[['P']]),
    {name:'AssertionError'});
});

test('published Iron Thorns source Speed, Capture and Spiky provide one typed unit each',()=>{
  assert.deepEqual(energyUnits('Speed Lightning Energy RCL',basic),[['L']]);
  assert.deepEqual(energyUnits('Capture Energy RCL',basic),[['C']]);
  assert.deepEqual(energyUnits('Spiky Energy JTG',basic),[['C']]);
  assert.equal(readiness(['L','C','C'],[
    'Speed Lightning Energy RCL','Capture Energy RCL','Spiky Energy JTG'
  ]).payable,true);
  assert.equal(readiness(['L','C','C'],[
    'Speed Lightning Energy RCL','Double Colorless Energy SUM'
  ]).payable,true);
  assert.equal(readiness(['C','C'],[
    'Speed Lightning Energy RCL','Capture Energy RCL'
  ]).payable,true);
  assert.equal(readiness(['L','C','C'],[
    'Speed Lightning Energy RCL','Capture Energy RCL'
  ]).payable,false);
  assert.equal(readiness(['L','C','C'],[
    'Double Colorless Energy SUM','Capture Energy RCL'
  ]).payable,false);
});
