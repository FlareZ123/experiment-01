'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const original=require('../results/aichi-2026/full-decklists.json').decks
  .find(x=>x.rank===11);
const pal=require('../resources/cards/en/sv2.json');
const {VERSION,certify,hitProbability}=
  require('../simulation/evaluation/agent15-rank11-squawk-source-pass11.cjs');

test('SFT original first owner turn source Squawk print and unused ability',()=>{
  const x=certify(original,pal);
  assert.equal(x.version,VERSION);
  assert.equal(x.sourceRegistration,'11:103:B:champion-reference');
  assert.equal(x.originalSourceSeat,0);
  assert.equal(x.actualGlobalTurn,2);
  assert.equal(x.firstOwnerTurn,true);
  assert.equal(x.activatedAbilityObserved,false);
  assert.equal(x.printedOptionalDrawCount,6);
  assert.equal(x.qualifiedCompetitiveGames,0);
});

test('SFT required discard-all real hand is not a free draw-six',()=>{
  const x=certify(original,pal);
  assert.equal(x.originalHand.length,4);
  assert.deepEqual(x.handCardsStrategicallyProtected,
    ['VS Seeker PHF','Quick Ball FST','Dark Patch ASR','Garbodor BKP']);
  assert.match(x.abilityPayment,/entire four-card hand/);
  assert.match(x.importantLimitation,/no better-play assertion/);
});

test('SFT exact conservative energy and K0 prize-marginal draw probabilities',()=>{
  const x=certify(original,pal);
  assert.equal(x.actualDeckCardCountIfNoOmittedZoneTransfers,46);
  assert.equal(x.minimumDarknessEnergyInDeckByPrizeExclusion,1);
  assert.equal(x.k0UnseenDeckAndPrizes,52);
  assert.equal(x.k0UnseenDarknessEnergy,7);
  assert.ok(Math.abs(x.lowerEnergyHitAmongSixIfNoDeckManipulation-
    6/46)<1e-12);
  assert.ok(Math.abs(x.k0EnergyHitAmongSixIfUniformUnseenPermutation-
    0.5999188546122214)<1e-12);
});

test('SFT wrong source rank, print, energy count or ability timing fails',()=>{
  assert.throws(()=>certify({...original,rank:6},pal));
  const wrong=structuredClone(original);
  wrong.cards.find(c=>c.name==='Squawkabilly ex').printing.number='170';
  assert.throws(()=>certify(wrong,pal));
  const missing=pal.filter(c=>c.id!=='sv2-169');
  assert.throws(()=>certify(original,missing));
  const mutated=structuredClone(pal);
  mutated.find(c=>c.id==='sv2-169').abilities[0].text='During your third turn only';
  assert.throws(()=>certify(original,mutated));
  const badEnergy=structuredClone(original);
  badEnergy.cards.find(c=>c.name==='Darkness Energy').count=7;
  badEnergy.cards.find(c=>c.name==='Quick Ball').count=5;
  assert.throws(()=>certify(badEnergy,pal));
});

test('SFT hypergeometric boundaries, never invent impossible draws',()=>{
  assert.equal(hitProbability(46,0,6),0);
  assert.equal(hitProbability(46,46,6),1);
  assert.equal(hitProbability(46,7,0),0);
  assert.throws(()=>hitProbability(0,0,0));
  assert.throws(()=>hitProbability(46,47,1));
  assert.throws(()=>hitProbability(46,7,47));
});

test('SFT reproduce concise resource-opportunity receipt',()=>{
  const x=certify(original,pal);
  console.log('ORIGINAL_RANK11_SQUAWK_FIRSTTURN_PAPER',JSON.stringify({
    ownerHandCount:x.originalHand.length,
    energyMin:x.minimumDarknessEnergyInDeckByPrizeExclusion,
    conservativeDrawSixEnergy:x.lowerEnergyHitAmongSixIfNoDeckManipulation,
    k0DrawSixEnergy:x.k0EnergyHitAmongSixIfUniformUnseenPermutation,
    nativeAbilityPlays:0,qualifiedGames:0
  }));
});
