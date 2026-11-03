'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {toolCounterFieldCensus,printingMatches}=
  require('../scripts/agent38-garbotoxin-tool-counter-census.cjs');
const field=require('../results/aichi-2026/full-decklists.json');

test('explicit exact printings distinguish Tool Jammer on Active vs Bench',()=>{
  const card=(name,set,number)=>({name,printing:{set,number}});
  assert.equal(printingMatches(card('Tool Jammer','BST','136'),{
    name:'Tool Jammer',set:'BST',number:'136'}),true);
  assert.equal(printingMatches(card('Tool Jammer','BST','136'),{
    name:'Field Blower',set:'GRI',number:'125'}),false);
});

test('real 29-source census maintains original printed rank and every physical 60',()=>{
  const report=toolCounterFieldCensus(field);
  assert.equal(report.knownSourceDecks,29);
  assert.equal(report.rows.length,29);
  assert.equal(report.directBenchedToolCounterRanks,20);
  assert.deepEqual(report.noListedDirectBenchedToolCounterRanks,
    [4,9,11,15,16,17,18,26,27]);
  assert.deepEqual(report.activeOnlyToolJammerRanks,[3,6,7,24,29]);
  assert.deepEqual(report.directToolAnswerCopies,{
    'Field Blower GRI 125':11,
    'Lost Vacuum LOR 162':1,
    'Megaton Blower SSP 182':10,
    'Faba LOT 173':8
  });
});

test('rank 7 carries four direct Tool answers and rank 30 three',()=>{
  const r=toolCounterFieldCensus(field).rows;
  const rank7=r.find(row=>row.rank===7),rank30=r.find(row=>row.rank===30);
  assert.equal(rank7.directCounterCopies,4);
  assert.equal(rank30.directCounterCopies,3);
  assert.equal(rank7.activeOnlyToolJammer,true);
  assert.equal(rank30.activeOnlyToolJammer,false);
});

test('synthetic malformed deck and duplicated source rank fail closed',()=>{
  const source=JSON.parse(JSON.stringify(field.decks[0]));
  source.cards[0].count+=1;
  assert.throws(()=>toolCounterFieldCensus({decks:[source]}));
  source.cards[0].count-=1;
  assert.throws(()=>toolCounterFieldCensus({decks:[source,source]}));
});

test('printed Tool Jammer alone is excluded from Benched Tool counters',()=>{
  const source=JSON.parse(JSON.stringify(field.decks.find(d=>d.rank===6)));
  source.cards=source.cards.filter(c=>!['Faba','Megaton Blower'].includes(c.name));
  source.cards.find(c=>c.name==='Guzma').count+=1;
  source.cards.find(c=>c.name==='Team Flare Grunt').count+=1;
  const result=toolCounterFieldCensus({decks:[source]});
  assert.equal(result.directBenchedToolCounterRanks,0);
  assert.equal(result.activeOnlyToolJammerRanks[0],6);
});
