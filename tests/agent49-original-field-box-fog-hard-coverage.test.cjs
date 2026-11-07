'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const roster=require('../results/aichi-2026/full-decklists.json');
const {auditFixedOneEnergyBoxFogCoverage,countName}=
  require('../simulation/evaluation/agent49-original-field-box-fog-hard-coverage.cjs');

test('29 authenticated original 60s have zero Secret Box + Fog Crystal overlap',()=>{
  const report=auditFixedOneEnergyBoxFogCoverage(roster);
  assert.equal(report.source60sChecked,29);
  assert.deepEqual(report.missingRanks,[23,25,28]);
  assert.deepEqual(report.boxRanks,[4,5,8,9,11,16,17,19,22,30]);
  assert.deepEqual(report.fogRanks,[1,31]);
  assert.deepEqual(report.boxFogOverlapRanks,[]);
  assert.deepEqual(report.hookHandPrerequisiteRanks,[9,17,30]);
  assert.deepEqual(report.entireExactHookInventoryRanks,[]);
  assert.equal(report.thisHookCanImproveAnyAuthenticatedOriginalByExactRecipe,
    false);
  assert.equal(report.sameBothSeatCodeDoesNotImplyBothDecksCanTrigger,true);
  assert.equal(report.paperCompetitiveGamesQualified,0);
});

test('inventory gate needs exact Box and Fog names and actual full 60',()=>{
  const make=(counts,rank)=>({
    rank,archetype:'synthetic',
    cards:Object.entries(counts).map(([name,count])=>({name,count}))
  });
  const complete=make({
    'Secret Box':1,'Fog Crystal':1,
    'Battle VIP Pass':2,'Rescue Carrier':1,
    'Psychic Energy':1,'Other Trainer':54
  },1);
  assert.equal(countName(complete,'Secret Box'),1);
  const good=auditFixedOneEnergyBoxFogCoverage({decks:[complete]});
  assert.deepEqual(good.entireExactHookInventoryRanks,[1]);
  assert.equal(good.paperCompetitiveGamesQualified,0);
  assert.equal(good.rows[0].nativeActionCertified,false);
  const wrongPrint=make({
    'Secret Box':1,'Mysterious Treasure':1,
    'Battle VIP Pass':2,'Rescue Carrier':1,
    'Psychic Energy':1,'Other Trainer':54
  },2);
  assert.deepEqual(
    auditFixedOneEnergyBoxFogCoverage({decks:[wrongPrint]})
      .boxFogOverlapRanks,[]);
  const noBasic=make({
    'Secret Box':1,'Fog Crystal':1,
    'Battle VIP Pass':2,'Rescue Carrier':1,
    'Other Trainer':55
  },3);
  const noEnergyResult=auditFixedOneEnergyBoxFogCoverage({decks:[noBasic]});
  assert.deepEqual(noEnergyResult.boxFogOverlapRanks,[3]);
  assert.deepEqual(noEnergyResult.entireExactHookInventoryRanks,[]);
  const incomplete=make({
    'Secret Box':1,'Fog Crystal':1,'Other Trainer':57
  },4);
  assert.throws(()=>auditFixedOneEnergyBoxFogCoverage({decks:[incomplete]}),
    /Only complete original printed 60s admitted/);
});

test('a two-seat same policy cannot bypass absence of a required source card',()=>{
  const report=auditFixedOneEnergyBoxFogCoverage(roster);
  for(const row of report.rows){
    assert.equal(row.boxFogBothInPrinted60,false);
    assert.equal(row.originalExactOwnerHookInventoryCompatible,false);
    assert.equal(row.source60Authenticated,true);
    assert.equal(row.counts.box>0&&row.counts.fog>0,false);
    assert.equal(row.paperPlayabilityCertified,false);
  }
});
