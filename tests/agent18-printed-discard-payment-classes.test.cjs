'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {groupTwoDiscardSupporterPayments:group}=
  require('../simulation/twinleaf/agent18-printed-discard-payment-classes.cjs');

test('real original rank24 Plumeria hand: 21 physical pairs collapse to 12 printed costs',()=>{
  const hand=["Player's Ceremony SP 127",'Plumeria BUS',
    'VS Seeker PHF','Guzma & Hala CEC','VS Seeker PHF',
    'Speed Lightning Energy RCL','Guzma & Hala CEC',
    'Team Flare Grunt XY'];
  const a=group(hand,'Plumeria BUS');
  assert.equal(a.physicalChoices,21);
  assert.equal(a.uniquePrintingCosts,12);
  assert.equal(a.classes.reduce((n,x)=>n+x.physicalChoices.length,0),21);
  assert.equal(a.classes.filter(x=>
    x.discardPrintings.includes('Team Flare Grunt XY'))
    .reduce((n,x)=>n+x.physicalChoices.length,0),6);
  assert.equal(a.classes.filter(x=>
    x.discardPrintings.includes('Team Flare Grunt XY')).length,4);
  assert.equal(a.classes.find(x=>x.discardPrintings.includes('VS Seeker PHF')&&
    x.discardPrintings.includes('Guzma & Hala CEC'))
    .physicalChoices.length,4);
});
test('original rank29 two Plumeria options represent 42 physical choices but 21 printed costs',()=>{
  const hand=['Megaton Blower SSP','Camping Gear BST','Team Skull Grunt SUM',
    'Handheld Fan TWM','Plumeria BUS','Guzma & Hala CEC',
    'Target Whistle PHF','Plumeria BUS'];
  const a=group(hand,'Plumeria BUS');
  assert.equal(a.physicalChoices,42);
  assert.equal(a.uniquePrintingCosts,21);
  assert.ok(a.classes.every(x=>x.physicalChoices.length===2));
  assert.ok(a.classes.some(x=>x.discardPrintings.includes('Plumeria BUS')));
});
test('no Supporter or insufficient other cards yields no physical or printed alternatives',()=>{
  for(const hand of [[],['Plumeria BUS'],['Plumeria BUS','Guzma BUS'],
    ['VS Seeker PHF','Quick Ball FST','Basic Energy']]){
    const a=group(hand,'Plumeria BUS');
    assert.equal(a.physicalChoices,0);
    assert.equal(a.uniquePrintingCosts,0);
  }
});
test('identical Supporter and discard printings preserve exact physical witnesses',()=>{
  const a=group(Array(4).fill('Plumeria BUS'),'Plumeria BUS');
  assert.equal(a.physicalChoices,12);
  assert.equal(a.uniquePrintingCosts,1);
  assert.equal(a.classes[0].physicalChoices.length,12);
  const k=new Set(a.classes[0].physicalChoices.map(x=>
    JSON.stringify([x.supporterIndex,x.discardIndices])));
  assert.equal(k.size,12);
});
