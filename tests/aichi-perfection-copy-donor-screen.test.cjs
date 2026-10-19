'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  isPerfectionDonor,scanPerfection,scanNewMoon
}=require('../scripts/aichi-perfection-copy-donor-screen.cjs');

/** @param {object[]} cards */
function fixture(cards) {
  const entries=cards.map(card=>({
    count:1,type:'Pokémon',english_proxy_card_id:card.id,name_en:card.name
  }));
  entries.push({count:60-entries.length,type:'Trainer',name_en:'Supporter'});
  const map=new Map(cards.map(card=>[card.id,card]));
  return scanPerfection(entries,id=>map.get(id));
}

test('case-sensitive Perfection eligibility separates old EX from modern ex',()=>{
  assert.equal(isPerfectionDonor({subtypes:['Basic','EX']}),true);
  assert.equal(isPerfectionDonor({subtypes:['TAG TEAM','GX']}),true);
  assert.equal(isPerfectionDonor({subtypes:['Basic','ex']}),false);
  assert.equal(isPerfectionDonor({subtypes:['Basic','V']}),false);
  assert.equal(isPerfectionDonor({subtypes:['Basic']}),false);
  assert.equal(isPerfectionDonor({}),false);
});

test('modern ex cannot manufacture a Perfection same-name collision',()=>{
  const result=fixture([
    {id:'legacy-1',name:'Legacy-EX',subtypes:['EX'],attacks:[
      {name:'Echo',damage:'30',cost:['Colorless'],text:'One'}]},
    {id:'modern-1',name:'Modern ex',subtypes:['ex'],attacks:[
      {name:'Echo',damage:'220',cost:['Colorless'],text:'Two'}]}
  ]);
  assert.equal(result.potentialEligiblePrintings,1);
  assert.deepEqual(result.differentEffectSameNameCollisions,[]);
  assert.deepEqual(result.excludedModernEx,[
    {cardId:'modern-1',name:'Modern ex',copies:1}
  ]);
});

test('different attack identities on two actual eligible donors are reported',()=>{
  const result=fixture([
    {id:'legacy-1',name:'Legacy-EX',subtypes:['EX'],attacks:[
      {name:'Echo',damage:'30',cost:['Colorless'],text:'One'}]},
    {id:'tagteam-2',name:'TAG TEAM-GX',subtypes:['GX'],attacks:[
      {name:'Echo',damage:'40',cost:['Colorless'],text:'Two'}]}
  ]);
  assert.equal(result.differentEffectSameNameCollisions.length,1);
  assert.equal(result.differentEffectSameNameCollisions[0].name,'Echo');
});

test('candidate printing names, printing IDs and complete 60 must match',()=>{
  const pokemon={id:'legacy-1',name:'Legacy-EX',subtypes:['EX']};
  assert.throws(()=>scanPerfection([
    {count:60,type:'Pokémon',english_proxy_card_id:'bad',name_en:'Legacy-EX'}
  ],()=>pokemon),/exact English printing/);
  assert.throws(()=>scanPerfection([
    {count:60,type:'Pokémon',english_proxy_card_id:'legacy-1',name_en:'Wrong'}
  ],()=>pokemon),/Printing name differs/);
  assert.throws(()=>scanPerfection([
    {count:59,type:'Trainer',english_proxy_card_id:'x'}
  ],()=>null),/complete fixed 60/);
});

test('the frozen New Moon 60 has seven distinct eligible printed attack names',()=>{
  const result=scanNewMoon();
  assert.equal(result.completeCardCount,60);
  assert.equal(result.potentialEligiblePrintings,4);
  assert.equal(result.potentialEligiblePhysicalCopies,5);
  assert.deepEqual(result.excludedModernEx.map(row=>row.name).sort(),[
    'Latias ex',"Lillie's Clefairy ex",'Squawkabilly ex'
  ]);
  assert.deepEqual(result.differentEffectSameNameCollisions,[]);
  assert.equal(result.eligibleDonors.flatMap(row=>row.attacks).length,7);
});
