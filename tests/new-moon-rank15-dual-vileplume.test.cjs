'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {inspectDualVileplume}=
  require('../scripts/new-moon-rank15-dual-vileplume.cjs');

const root=path.resolve(__dirname,'..');
const field=JSON.parse(fs.readFileSync(path.join(root,
  'results/aichi-2026/full-decklists.json'),'utf8'));
const candidate=JSON.parse(fs.readFileSync(path.join(root,
  'results/als/new-moon-lockbreak-english-proxy-60.json'),'utf8'));

test('rank15 distinct Item and Basic attack locks use correct printed cards',()=>{
  const x=inspectDualVileplume(field,candidate);
  assert.equal(x.opponent.vileplumeItem.ability.name,'Irritating Pollen');
  assert.equal(x.opponent.vileplumeBasic.ability.name,'Disgusting Pollen');
  assert.deepEqual([x.opponent.vileplumeItem.count,
    x.opponent.vileplumeBasic.count,x.opponent.oddish,
    x.opponent.gloom,x.opponent.stealthyHood],[2,1,2,2,2]);
  assert.match(x.opponent.vileplumeBasic.ability.text,/Basic Pokémon can't attack/);
  assert.match(x.opponent.stealthyHoodEffect,/opponent's Abilities/);
});

test('New Moon has a Stage 1 escape attack despite all its GX attackers being Basic',()=>{
  const x=inspectDualVileplume(field,candidate);
  assert.deepEqual(x.candidate.nonBasicAttackers,[{
    name:'Dusclops',id:'sv6pt5-19',count:2,stage:'Stage 1',
    attacks:[{name:'Will-O-Wisp',cost:['Psychic','Psychic'],damage:'50'}]
  }]);
  assert.deepEqual(x.candidate.namedItemCounts,{
    'Field Blower':2,'Canceling Cologne':2,
    'Escape Rope':1,'Counter Catcher':1
  });
  assert.ok(x.candidate.supporterNames.every(row=>
    !['Guzma','Boss\'s Orders','Serena'].includes(row.name)));
  assert.equal(x.qualifiedForCompetitiveInference,false);
});
