'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {validSevenWithEnergy,rational,firstEightPhysicalDonorExposure}=
  require('../simulation/evaluation/aichi-thorns-first8-donor-resource.cjs');
const {canPayVoltCost}=
  require('../simulation/evaluation/agent45-volt-cyclone-donor-debt.cjs');
const {choose}=
  require('../simulation/evaluation/aichi-thorns-physical-energy-donor-census.cjs');

/** Fixture retains the three exact source Energy distributions and four Basics. */
function field(){
  const make=(rank,energy)=>({
    rank,player:'rank'+rank,cards:[
      {name:'Iron Thorns ex',count:4},{name:'Other trainer',count:48},
      ...energy.map(([name,count])=>({name,count}))
    ]});
  const six=[['Speed Lightning Energy',4],
    ['Capture Energy',2],['Spiky Energy',1],['Double Colorless Energy',1]];
  const twentyFour=[['Speed Lightning Energy',4],
    ['Double Colorless Energy',3],['Capture Energy',1]];
  return {decks:[make(6,six),make(24,twentyFour),make(29,six)]};
}

test('first seven legal opening count incorporates only Basic in first seven',()=>{
  const full=BigInt(choose(60,7));
  const valid=full-BigInt(choose(56,7));
  const count=Array.from({length:9},(_,k)=>validSevenWithEnergy(k))
    .reduce((sum,x)=>sum+x,0n);
  assert.equal(count,valid);
  assert.equal(validSevenWithEnergy(8),0n);
});

test('independent exact rational first-eight three-Energy exposure',()=>{
  const x=firstEightPhysicalDonorExposure(field(),canPayVoltCost);
  assert.equal(x.conditionalValidOpening.fraction,'38962/97527');
  assert.equal(x.jointValidAndExactlyThreeEnergyInFirstEight.fraction,
    '14734832/852873615');
  assert.equal(x.exactlyThreeEnergyGivenLegalSeven.fraction,
    '1052488/24337335');
  assert.equal(x.competitiveQualifiedGames,0);
  assert.equal(x.actualAttachments,false);
});

test('rank24 mixed choices are 42 of 56 energy compositions, not match rates',()=>{
  const x=firstEightPhysicalDonorExposure(field(),canPayVoltCost);
  assert.deepEqual(x.sourceOptions.map(s=>s.mixedDonorOptionPhysicalTriples),
    [18,42,18]);
  assert.deepEqual(x.sourceOptions.map(s=>
    s.mixedCompositionAmongFirstEightGivenLegalSeven.fraction),
  ['789366/56787115','263122/8112445','789366/56787115']);
  assert.deepEqual(x.sourceOptions.map(s=>
    s.payableBeforeTransferPhysicalTriples),[52,52,52]);
  assert.ok(x.sourceOptions.every(s=>
    s.mixedCompositionAmongFirstEightGivenLegalSeven.probability<
    x.exactlyThreeEnergyGivenLegalSeven.probability));
});

test('unknown or incomplete physical sources fail closed',()=>{
  const bad=field();
  bad.decks[1].cards[3]={name:'Double Colorless Energy',count:2};
  assert.throws(()=>firstEightPhysicalDonorExposure(bad,canPayVoltCost),
    /SOURCE_DECK_NOT_FIXED_60_OR_8_ENERGY_24/);
});

test('rational output normalizes and rejects impossible event counts',()=>{
  assert.deepEqual(rational(6n,8n),{fraction:'3/4',probability:0.75});
  assert.throws(()=>rational(9n,8n),/INVALID_PROBABILITY/);
});
