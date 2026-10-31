'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {canPaySymbols,energyUnits,printedEnergyPayability,
  registeredSixtyAttackEnergyCeiling}=
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

test('published Aichi Unit Energy LPM is one flexible physical unit',()=>{
  assert.deepEqual(energyUnits('Unit Energy LPM UPR',basic),[['L','P','M']]);
  assert.equal(readiness(['P'],['Unit Energy LPM UPR']).payable,true);
  assert.equal(readiness(['P','M'],['Unit Energy LPM UPR']).payable,false);
  assert.equal(readiness(['P','M'],[
    'Unit Energy LPM UPR','Psychic Energy MEE'
  ]).payable,true);
});

test('Counter Energy prize and GX-EX eligibility needs explicit public condition',()=>{
  const counter='Counter Energy CIN';
  assert.deepEqual(energyUnits(counter,basic),[['C']]);
  const behind={...basic,behindOnPrizes:true};
  assert.equal(energyUnits(counter,behind),null);
  assert.equal(readiness(['P'],[counter],behind).payable,null);
  const eligible={...behind,isPokemonGXorEX:false};
  assert.equal(energyUnits(counter,eligible).length,2);
  assert.equal(readiness(['P','M'],[counter],eligible).payable,true);
  assert.equal(readiness(['P','M','F'],[counter],eligible).payable,false);
  const excluded={...behind,isPokemonGXorEX:true};
  assert.deepEqual(energyUnits(counter,excluded),[['C']]);
  assert.equal(readiness(['P'],[counter],excluded).payable,false);
});

test('original source Colorless and typed attached Special numerics',()=>{
  for(const energy of ['Jet Energy PAL','Recycle Energy UNM',
    'Memory Energy LOT','Powerful Colorless Energy DAA']){
    assert.deepEqual(energyUnits(energy,basic),[['C']]);
  }
  assert.deepEqual(energyUnits('Telepathic Psychic Energy POR',basic),[['P']]);
  assert.deepEqual(energyUnits('Telepath [P] Energy M3',basic),[['P']]);
  assert.equal(readiness(['P'],['Telepathic Psychic Energy POR']).payable,true);
  assert.equal(readiness(['P','C'],['Telepathic Psychic Energy POR']).payable,
    false);
});

test('rank21 Regidrago cannot fund Dedenne-GX Lightning from own printed Energy',()=>{
  const fs=require('node:fs');
  const path=require('node:path');
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const rank21=roster.decks.find(d=>d.rank===21);
  assert.ok(rank21);
  assert.equal(rank21.cards.filter(x=>x.category==='Energy')
    .reduce((n,x)=>n+x.count,0),10);
  const dedenne=registeredSixtyAttackEnergyCeiling(
    ['L','C'],rank21.cards,{
      ...basic,hasRuleBox:true,isPokemonGXorEX:true,isDragon:false
    });
  assert.equal(dedenne.possible,false);
  assert.equal(dedenne.unknownEnergyPrintings.length,0);
  assert.equal(dedenne.excludedEnergyCopies,3);
  const koraidon=registeredSixtyAttackEnergyCeiling(
    ['C','C'],rank21.cards,{
      ...basic,hasRuleBox:true,isPokemonGXorEX:false,isDragon:true
    });
  assert.equal(koraidon.possible,true);
  assert.equal(koraidon.excludedEnergyCopies,0);
});

test('full exact Aichi 29-source Dedenne Energy ceiling has explicit denominator',()=>{
  const fs=require('node:fs');
  const path=require('node:path');
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const sources=roster.decks.filter(d=>Array.isArray(d.cards));
  assert.equal(sources.length,29);
  const carrying=sources.filter(d=>d.cards.some(c=>
    c.name==='Dedenne-GX'&&c.printing?.set==='UNB'));
  assert.equal(carrying.length,18);
  const missing=carrying.filter(d=>
    registeredSixtyAttackEnergyCeiling(['L','C'],d.cards,{
      ...basic,hasRuleBox:true,isPokemonGXorEX:true,isDragon:false
    }).possible===false);
  assert.deepEqual(missing.map(d=>d.rank).sort((a,b)=>a-b),
    [5,10,12,13,14,16,18,20,21,27,30,32]);
  const uncertain=carrying.filter(d=>
    registeredSixtyAttackEnergyCeiling(['L','C'],d.cards,{
      ...basic,hasRuleBox:true,isPokemonGXorEX:true,isDragon:false
    }).possible===null);
  assert.deepEqual(uncertain,[]);
});

test('unknown source Energy is uncertainty, Dragon-only DDE is ineligible on Lightning',()=>{
  const cards=[
    {category:'Energy',name:'Double Dragon Energy',
      count:4,printing:{set:'ROS'}},
    {category:'Energy',name:'Unmodeled Experimental Energy',
      count:1,printing:{set:'XYZ'}}
  ];
  const unknown=registeredSixtyAttackEnergyCeiling(['L','C'],cards,
    {...basic,hasRuleBox:true,isDragon:false});
  assert.equal(unknown.possible,null);
  assert.deepEqual(unknown.unknownEnergyPrintings,
    ['Unmodeled Experimental Energy XYZ']);
  assert.equal(unknown.excludedEnergyCopies,4);
  assert.equal(registeredSixtyAttackEnergyCeiling(['L','C'],cards.slice(0,1),
    {...basic,hasRuleBox:true,isDragon:false}).possible,false);
});
