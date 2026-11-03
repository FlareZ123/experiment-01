'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ownerZeroEnergyFrontier}=require(
  '../simulation/twinleaf/agent37-owner-physical-energy-starvation.cjs');
const LILLIE="Lillie's Determination M1L";
const ACE='Ace Trainer AOR';
const CATCHER='Counter Catcher PAR';
const SEAL='Forest Seal Stone SIT';
const catalog={basicEnergies:new Set(['Psychic Energy MEE']),
  specialEnergies:new Set(['Telepathic Psychic Energy ME03'])};
/** Synthetic owner-only root shape; no actual gameplay represented. */
function fixture(){
  return {decisionKind:'owner-root',ownHand:[
    LILLIE,ACE,CATCHER,SEAL,'Unown AOR','Unown AOR','Duskull FLI',
    'Duskull FLI','Rescue Carrier EVS','Secret Box TWM',
    'Battle VIP Pass FST','Sky Field ROS','Fog Crystal CRE','Klefki SVI'],
  ownPublic:{
    active:{printing:'Duskull',energies:[]},
    bench:[{printing:'Galarian Articuno V',energies:[]},null,null,null,null],
    prizeCount:6},
  opponentPublic:{active:{printing:'Mega Absol ex',energies:[]},
    prizeCount:5}};
}
test('unpowered 14-card hand offers printed draw8 and behind-on-Prizes draw6',()=>{
  const result=ownerZeroEnergyFrontier(fixture(),catalog);
  assert.equal(result.handCount,14);
  assert.equal(result.zeroPhysicalEnergy,true);
  assert.equal(result.printedShuffleOffers.length,2);
  assert.equal(result.printedShuffleOffers[0].printedDrawCount,8);
  assert.equal(result.printedShuffleOffers[1].opponentPrintedDrawCount,3);
  assert.equal(result.heldCounterCatcher,true);
  assert.equal(result.heldForestSealStone,true);
  assert.equal(result.supporterNativeCanPlayCertified,false);
});
test('Basic Energy in own hand means not zero-energy',()=>{
  const f=fixture();f.ownHand.push('Psychic Energy MEE');
  assert.equal(ownerZeroEnergyFrontier(f,catalog).zeroPhysicalEnergy,false);
});
test('Special Energy in own hand means not zero-energy',()=>{
  const f=fixture();f.ownHand.push('Telepathic Psychic Energy ME03');
  assert.equal(ownerZeroEnergyFrontier(f,catalog).ownerPhysicalEnergyHand,1);
});
test('physically attached Energy means not zero-energy',()=>{
  const f=fixture();f.ownPublic.bench[0].energies.push('Psychic Energy MEE');
  assert.equal(ownerZeroEnergyFrontier(f,catalog).zeroPhysicalEnergy,false);
});
test('equal Prize state blocks printed Ace Trainer offer',()=>{
  const f=fixture();f.opponentPublic.prizeCount=6;
  assert.equal(ownerZeroEnergyFrontier(f,catalog).printedShuffleOffers.length,1);
});
test('five Prizes changes Lillie printing to six cards',()=>{
  const f=fixture();f.ownPublic.prizeCount=5;f.opponentPublic.prizeCount=4;
  assert.equal(ownerZeroEnergyFrontier(f,catalog)
    .printedShuffleOffers[0].printedDrawCount,6);
});
test('Supporters absent means zero offers even though unpowered',()=>{
  const f=fixture();f.ownHand=f.ownHand.filter(x=>x!==LILLIE&&x!==ACE);
  const r=ownerZeroEnergyFrontier(f,catalog);
  assert.equal(r.zeroPhysicalEnergy,true);
  assert.equal(r.printedShuffleOffers.length,0);
});
test('nonphysical free-attack permission is not inferred',()=>{
  const r=ownerZeroEnergyFrontier(fixture(),catalog);
  assert.equal(r.attackAvailabilityCertified,false);
  assert.equal(r.knownEnergyRemainingInDeck,null);
});
test('actor view is seat-relative without rival hidden data',()=>{
  const a=ownerZeroEnergyFrontier(fixture(),catalog);
  const b=fixture();b.physicalSeat=1;
  assert.equal(ownerZeroEnergyFrontier(b,catalog).zeroPhysicalEnergy,
    a.zeroPhysicalEnergy);
});
