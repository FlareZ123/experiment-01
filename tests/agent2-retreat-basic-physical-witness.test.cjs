'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {captureBasicRetreatPhysicalWitness} = require(
  '../simulation/twinleaf/agent2-retreat-basic-physical-witness.cjs');

function slot(pokemon, energy=[], damage=0, tools=[]) {
  return {
    getPokemonCard: () => pokemon,
    energies: {cards: energy},
    damage, tools
  };
}
function fixture(targetIndex=0) {
  const source = {fullName: 'Dialga-GX UPR 100', retreat: [1,1]};
  const recipient = {fullName: 'Shadow Rider Calyrex V CRE 74'};
  const energyA = {name: 'Psychic Energy'};
  const energyB = {name: 'Psychic Energy'};
  const recipientEnergy = {name: 'Psychic Energy'};
  const active = slot(source, [energyA,energyB], 20);
  const bench = Array.from({length: targetIndex+1}, () => slot(null));
  bench[targetIndex] = slot(recipient,[recipientEnergy],10);
  const pre = {turn:33,players:[{
    active,bench,discard:{cards:[]}
  }]};
  const post = {turn:33,players:[{
    active:slot(recipient,[recipientEnergy],10),
    bench:[slot(source,[],20)],
    discard:{cards:[energyA,energyB]}
  }]};
  return {pre,post,source,recipient,energyA,energyB,recipientEnergy};
}

test('exact physical owner retreat and Basic payment pass together', () => {
  const f=fixture();
  const witness=captureBasicRetreatPhysicalWitness(f.pre,0,0);
  assert.equal(witness.printedFeeUnits,2);
  assert.deepEqual(witness.verify(f.post),{
    version:'agent2-retreat-basic-physical-identity-witness-v1',
    valid:true,actorSeat:0,printedFeeUnits:2,nativeTurnUnchanged:true,
    exactRecipientPhysicalIdentity:true,exactOutgoingPhysicalIdentity:true,
    originalPokemonDamagePreserved:true,
    originalTargetAttachmentsPreserved:true,
    exactBasicPaymentToOwnDiscard:true
  });
});

test('same-printing different physical Pokemon cannot spoof destination',()=>{
  const f=fixture();
  const impostor={fullName:f.recipient.fullName};
  f.post.players[0].active=slot(impostor,[f.recipientEnergy],10);
  const result=captureBasicRetreatPhysicalWitness(f.pre,0,0).verify(f.post);
  assert.equal(result.exactRecipientPhysicalIdentity,false);
  assert.equal(result.valid,false);
});

test('exact fee cards must enter owner discard',()=>{
  const f=fixture();
  f.post.players[0].discard.cards=[f.energyA,{name:'Psychic Energy'}];
  const result=captureBasicRetreatPhysicalWitness(f.pre,0,0).verify(f.post);
  assert.equal(result.exactBasicPaymentToOwnDiscard,false);
  assert.equal(result.valid,false);
});

test('original target Energy, tools and damage must persist',()=>{
  const f=fixture();
  f.post.players[0].active=slot(f.recipient,[],10);
  const result=captureBasicRetreatPhysicalWitness(f.pre,0,0).verify(f.post);
  assert.equal(result.originalTargetAttachmentsPreserved,false);
  assert.equal(result.valid,false);
});

test('physical bench index survives empty gaps without compression',()=>{
  const f=fixture(2);
  const result=captureBasicRetreatPhysicalWitness(f.pre,0,2).verify(f.post);
  assert.equal(result.valid,true);
});

test('special Energy, costs not paid exactly, and tools are excluded',()=>{
  const f=fixture();
  f.pre.players[0].active.energies.cards[0]={name:'Double Colorless Energy'};
  assert.throws(()=>captureBasicRetreatPhysicalWitness(f.pre,0,0),
    /excludes Special Energy/);
  f.pre.players[0].active.energies.cards=[f.energyA];
  assert.throws(()=>captureBasicRetreatPhysicalWitness(f.pre,0,0),
    /exact Basic-only printed fee/);
  f.pre.players[0].active.energies.cards=[f.energyA,f.energyB];
  f.pre.players[0].active.tools=[{name:'Air Balloon'}];
  assert.throws(()=>captureBasicRetreatPhysicalWitness(f.pre,0,0),
    /excludes Tools/);
});

test('retreat does not establish an independent printed-rule permission',()=>{
  const f=fixture();
  f.post.turn=34;
  const result=captureBasicRetreatPhysicalWitness(f.pre,0,0).verify(f.post);
  assert.equal(result.nativeTurnUnchanged,false);
  assert.equal(result.valid,false);
});
