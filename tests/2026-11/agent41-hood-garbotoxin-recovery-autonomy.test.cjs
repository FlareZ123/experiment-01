'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  hoodedDoorRecoveryEntry,hoodedDoorEffectReceipt
}=require('../../simulation/twinleaf/hood-garbotoxin-recovery-autonomy.cjs');

const energy=()=>({name:'Psychic Energy',fullName:'Psychic Energy TEST'});
const item=name=>({name,fullName:name+' TEST'});

test('direct route uses the exact Psychic Energy already in hand without Items or Field Blower',()=>{
  const psychic=energy();
  const own={hand:{cards:[psychic]},discard:{cards:[]},deck:{cards:[]}};
  const entry=hoodedDoorRecoveryEntry(own);
  assert.equal(entry.plan,'direct');
  assert.equal(entry.phase,'door');
  assert.strictEqual(entry.energyCard,psychic);
});

test('Night Stretcher route retains the exact Psychic Energy already in discard',()=>{
  const psychic=energy();
  const own={hand:{cards:[item('Night Stretcher')]},
    discard:{cards:[psychic]},deck:{cards:[]}};
  const entry=hoodedDoorRecoveryEntry(own);
  assert.equal(entry.plan,'stretcher');
  assert.equal(entry.phase,'stretcher');
  assert.strictEqual(entry.energyCard,psychic);
});

test('Battle Compressor plus Night Stretcher route waits for a real deck prompt',()=>{
  const psychic=energy();
  const own={hand:{cards:[item('Battle Compressor'),item('Night Stretcher')]},
    discard:{cards:[]},deck:{cards:[psychic]}};
  const entry=hoodedDoorRecoveryEntry(own);
  assert.equal(entry.plan,'compressor-stretcher');
  assert.equal(entry.phase,'compressor-choice');
  assert.equal(entry.energyCard,null);
});

test('no executable Energy route returns no recovery entry',()=>{
  const own={hand:{cards:[item('Night Stretcher')]},
    discard:{cards:[]},deck:{cards:[]}};
  assert.equal(hoodedDoorRecoveryEntry(own),null);
});

function receiptState({energyCard,deckCount=2,energyZone='bench',
  markerSpent=true,garbotoxinStillLive=true,fieldBlower=false}={}) {
  const target={energies:{cards:energyZone==='bench'?[energyCard]:[]}};
  const own={
    bench:[target],
    hand:{cards:fieldBlower?[item('Field Blower')]:[]},
    discard:{cards:energyZone==='discard'?[energyCard]:[]},
    deck:{cards:Array.from({length:deckCount},(_,i)=>({id:'drawn-'+i}))},
    prizes:[{cards:[]},{cards:[]}]
  };
  const result=hoodedDoorEffectReceipt({
    own,selectedEnergyCard:energyCard,targetBenchIndex:0,
    deckBefore:4,markerSpent,garbotoxinStillLive
  });
  return {own,result};
}

test('physical effect receipt qualifies exact attachment, draw-two and spent marker without Field Blower',()=>{
  const psychic=energy();
  const {result}=receiptState({energyCard:psychic,fieldBlower:false});
  assert.equal(result.attached,true);
  assert.equal(result.drawnTwo,true);
  assert.equal(result.markerSpent,true);
  assert.equal(result.garbotoxinStillLive,true);
  assert.equal(result.physicalConserved,true);
  assert.equal(result.fieldBlowerRetained,false);
  assert.equal(result.successfulEffect,true);
});

test('Field Blower retention is telemetry, not a success prerequisite',()=>{
  const psychic=energy();
  const absent=receiptState({energyCard:psychic,fieldBlower:false}).result;
  const present=receiptState({energyCard:psychic,fieldBlower:true}).result;
  assert.equal(absent.successfulEffect,true);
  assert.equal(present.successfulEffect,true);
  assert.equal(absent.fieldBlowerRetained,false);
  assert.equal(present.fieldBlowerRetained,true);
});

test('receipt rejects duplicate or unsettled physical Energy',()=>{
  const psychic=energy();
  const {own,result}=receiptState({energyCard:psychic});
  own.discard.cards.push(psychic);
  const duplicated=hoodedDoorEffectReceipt({
    own,selectedEnergyCard:psychic,targetBenchIndex:0,deckBefore:4,
    markerSpent:true,garbotoxinStillLive:true
  });
  assert.equal(duplicated.attached,true);
  assert.equal(duplicated.physicalConserved,false);
  assert.equal(duplicated.successfulEffect,false);
  assert.equal(result.successfulEffect,true);
});

test('receipt fails closed on incomplete draw, unspent marker or missing live lock',()=>{
  const psychic=energy();
  for(const failure of [
    {deckCount:3,markerSpent:true,garbotoxinStillLive:true},
    {deckCount:2,markerSpent:false,garbotoxinStillLive:true},
    {deckCount:2,markerSpent:true,garbotoxinStillLive:false}
  ]) {
    const {result}=receiptState({energyCard:psychic,...failure});
    assert.equal(result.successfulEffect,false);
  }
});
