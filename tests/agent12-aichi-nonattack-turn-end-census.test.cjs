'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {runInventory,verifyTriggerTexts,TRIGGERS,fieldTerminalEffects} =
  require('../scripts/agent12-aichi-nonattack-turn-end-census.cjs');

const {verifiedTriggers,census} = runInventory(path.join(__dirname,'..'));

test('all six exact English printings have explicit verified end-turn text',()=>{
  assert.equal(verifiedTriggers.length,6);
  assert.deepEqual(verifiedTriggers.map(row=>row.cardId).sort(),
    TRIGGERS.map(row=>row.cardId).sort());
  assert.ok(verifiedTriggers.every(row=>row.matchedClauseOrigins.length>0));
  console.log('PASS:',verifiedTriggers.map(row=>row.cardId).join(', '));
});

test('29 exact source 60s contain 11 identified rows, 19 copies in eight ranks',()=>{
  assert.equal(census.sourceDecks,29);
  assert.deepEqual(census.affectedRanks,[1,3,6,7,8,11,16,29]);
  assert.equal(census.matchedDeckRows,11);
  assert.equal(census.triggerCopies,19);
  assert.equal(census.actualUseCount,null);
  assert.equal(census.nativeSettledTurnEndCount,null);
  assert.equal(census.competitiveGameQualified,false);
  console.log('PASS: ranks',census.affectedRanks.join(','),'rows',census.matchedDeckRows,
    'copies',census.triggerCopies);
});

test('root trigger discriminates playing versus USING Stadium and Ability',()=>{
  const byName=new Map(verifiedTriggers.map(x=>[x.name,x]));
  assert.equal(byName.get('Tropical Beach').trigger,'activated-stadium-effect');
  assert.equal(byName.get('Rotom V').trigger,'activated-ability');
  assert.equal(byName.get('Radiant Eternatus').trigger,'on-bench-optional-ability');
  assert.equal(byName.get('Camping Gear').trigger,'played-item');
  assert.equal(byName.get('Boost Shake').trigger,'played-item');
  assert.equal(byName.get("Steven's Resolve").trigger,'played-supporter');
  console.log('PASS: playing Tropical Beach and benching Rotom do not alone end turn');
});

test('same name with wrong printing is excluded, never an inferred terminal effect',()=>{
  const fake=[
    {rank:3,archetype:'Snorlax',cards:[
      {name:'Snorlax',count:3,printing:{set:'PGO',number:'55'}},
      {name:'Rotom V',count:1,printing:{set:'LOR',number:'59'}},
      {name:'Tropical Beach',count:1,printing:{set:'BWP',number:'50'}}
    ]},
    {rank:11,archetype:'Garbodor',cards:[
      {name:'Boost Shake',count:1,printing:{set:'EVS',number:'229'}},
      {name:'Camping Gear',count:2,printing:{set:'BST',number:'122'}}
    ]}
  ];
  const report=fieldTerminalEffects(fake,verifiedTriggers);
  assert.deepEqual(report.rows.map(row=>row.name),['Tropical Beach','Camping Gear']);
  assert.equal(report.triggerCopies,3);
  assert.equal(report.affectedDeckCount,2);
  console.log('PASS: printing-resolved match only, false positives excluded');
});

test('claimed terminal effect with mismatched printed Ability is rejected',()=>{
  const find=id=>({
    id,name:'Radiant Eternatus',abilities:[
      {name:'Wrong Ability',text:'If you use this Ability, your turn ends.'}]
  });
  assert.throws(()=>verifyTriggerTexts([TRIGGERS[0]],find));
  console.log('PASS: wrong Ability cannot authenticate source print');
});
