'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const original=require('../results/aichi-2026/full-decklists.json');
const {
  benchAbilityEntryContract,printingKey,summarizeVipHandEntryExposure
}=require('../scripts/agent9-vip-bench-entry-provenance.cjs');

const card=(name,set,number)=>({
  name,printing:{set,number:String(number)},category:'Pokémon',count:1
});

test('VIP direct deck-to-Bench cannot activate four exact hand-play entry triggers',()=>{
  for(const [c,ability] of [
    [card('Dedenne-GX','UNB',57),'Dedechange'],
    [card('Crobat V','DAA',104),'Dark Asset'],
    [card('Tapu Lele-GX','GRI',60),'Wonder Tag'],
    [card('Eldegoss V','RCL',19),'Happy Match']
  ]){
    const fromDeck=benchAbilityEntryContract(c,'direct-deck-to-bench');
    assert.equal(fromDeck.ability,ability);
    assert.equal(fromDeck.handEntryConditionMet,false);
    assert.equal(fromDeck.otherActivationConditionsVerified,false);
    const fromHand=benchAbilityEntryContract(c,'from-hand');
    assert.equal(fromHand.handEntryConditionMet,true);
    assert.equal(fromHand.otherActivationConditionsVerified,false,
      'meeting entry condition does not prove the whole Ability can activate');
  }
});

test('Squawkabilly remains distinct: the first-turn Ability is not hand-entry-triggered',()=>{
  const squawk=card('Squawkabilly ex','PAL',169);
  assert.deepEqual(benchAbilityEntryContract(squawk,'direct-deck-to-bench'),{
    ability:'Squawk and Seize',
    handEntryConditionMet:true,
    otherActivationConditionsVerified:false
  });
  assert.equal(benchAbilityEntryContract(card('Squawkabilly ex','PAL',170),'direct-deck-to-bench'),null);
  assert.throws(()=>benchAbilityEntryContract(squawk,'discard-to-bench'),RangeError);
});

test('exact print identity prevents extending a hand-only ruling to another printing',()=>{
  assert.equal(benchAbilityEntryContract(card('Dedenne-GX','UNB',58),'direct-deck-to-bench'),null);
  assert.equal(printingKey(card('Dedenne-GX','UNB',57)),'Dedenne-GX|UNB|57');
});

test('field-wide original source census preserves all 29 and the 15 eligible VIP decks',()=>{
  const c=summarizeVipHandEntryExposure(original);
  assert.equal(c.authenticatedSourceCount,29);
  assert.equal(c.vipSourceCount,15);
  assert.equal(c.vipSourceWithHandOnlyBenchAbility,14);
  assert.equal(c.handOnlyPhysicalCopies,39);
  assert.equal(c.vipPhysicalCopies,42);
  assert.deepEqual(c.rows.filter(row=>row.physicalHandOnlyCopies===0).map(row=>row.rank),[17]);
  assert.equal(c.rows.reduce((n,row)=>n+row.printings.reduce((a,p)=>a+p.copies,0),0),39);
});

test('rank9 evidence maps the actual Battle VIP target to a nontriggering ability',()=>{
  const c=summarizeVipHandEntryExposure(original);
  const rank9=c.rows.find(row=>row.rank===9);
  assert.equal(rank9.vipCopies,4);
  assert.equal(rank9.physicalHandOnlyCopies,1);
  assert.deepEqual(rank9.printings,[{
    name:'Dedenne-GX',printing:'Dedenne-GX|UNB|57',
    copies:1,ability:'Dedechange'
  }]);
  assert.equal(c.rows.find(row=>row.rank===11).physicalHandOnlyCopies,2);
  assert.equal(c.rows.find(row=>row.rank===4).physicalHandOnlyCopies,6);
});
