'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const original=require('../results/als/new-moon-lockbreak-english-proxy-60.json');
const {twoTargetSearchAvailability}=
  require('../simulation/evaluation/agent21-root93-k0-two-target-availability.cjs');
const {recoveryOrFogAvailability,initialSevenAtLeastOne}=
  require('../simulation/evaluation/agent21-secretbox-retrieval-item-fork.cjs');

const frozen={
  deckCount:35,prizeCount:6,basicUnresolved:1,
  fogUnresolved:2,retrievalUnresolved:1,basicInDiscard:2
};

/** @param {string} name @returns {number} */
const copies=name=>original.entries.filter(x=>x.name_en===name)
  .reduce((sum,x)=>sum+x.count,0);

test('historical frozen 60 has four Fog and no Energy Retrieval',()=>{
  assert.equal(original.counts.total,60);
  assert.equal(copies('Fog Crystal'),4);
  assert.equal(copies('Energy Retrieval'),0);
  assert.equal(copies('Basic Psychic Energy'),3);
  assert.equal(copies('Telepathic Psychic Energy'),3);
  assert.equal(copies('Secret Box'),1);
});

test('exact conditional 1 Fog swap preserves 60 physical cards',()=>{
  const counterfactual=original.entries.map(row=>({
    name:row.name_en,count:row.count
  }));
  counterfactual.find(row=>row.name==='Fog Crystal').count--;
  counterfactual.push({name:'Energy Retrieval',count:1});
  assert.equal(counterfactual.reduce((n,row)=>n+row.count,0),60);
  assert.equal(counterfactual.find(row=>row.name==='Fog Crystal').count,3);
  assert.equal(counterfactual.find(row=>
    row.name==='Energy Retrieval').count,1);
});

test('ER plus Fog baseline exact 41 unknown physical slots',()=>{
  const originalResult=twoTargetSearchAvailability({
    deckCount:35,prizeCount:6,firstTargetRemaining:1,
    secondTargetRemaining:3
  });
  const proposed=recoveryOrFogAvailability(frozen);
  assert.deepEqual(originalResult.bothAvailable,{
    numerator:'17255',denominator:'20254',
    decimal:17255/20254
  });
  assert.equal(proposed.bothRoutesAccessible.numerator,'39697');
  assert.equal(proposed.bothRoutesAccessible.denominator,'40508');
  assert.equal(proposed.residualFailure.numerator,'811');
  assert.equal(proposed.residualFailure.denominator,'40508');
  assert.ok(proposed.empiricalNativeGameProbability===false);
  assert.equal(proposed.gameWinRateEstimate,null);
  const improvement=proposed.bothRoutesAccessible.decimal-
    originalResult.bothAvailable.decimal;
  assert.ok(Math.abs(improvement-21/164)<1e-12);
});

test('with no Basic discarded, Energy Retrieval is an inert Item',()=>{
  const r=recoveryOrFogAvailability({...frozen,basicInDiscard:0});
  const two=twoTargetSearchAvailability({
    deckCount:35,prizeCount:6,
    firstTargetRemaining:1,secondTargetRemaining:2
  });
  assert.equal(r.bothRoutesAccessible.decimal,two.bothAvailable.decimal);
  assert.equal(r.recoveredBasicInDiscard,false);
});

test('both card channels available when no Prize slots exist',()=>{
  const r=recoveryOrFogAvailability({
    deckCount:4,prizeCount:0,basicUnresolved:1,
    fogUnresolved:2,retrievalUnresolved:1,basicInDiscard:1
  });
  assert.equal(r.bothRoutesAccessible.decimal,1);
  assert.equal(r.residualFailure.decimal,0);
});

test('both channels fail if every unresolved card is Prized',()=>{
  const r=recoveryOrFogAvailability({
    deckCount:0,prizeCount:4,basicUnresolved:1,
    fogUnresolved:2,retrievalUnresolved:1,basicInDiscard:1
  });
  assert.equal(r.bothRoutesAccessible.decimal,0);
  assert.equal(r.residualFailure.decimal,1);
});

test('independent enumeration of distinct three-card owner placements',()=>{
  // A, F, R have distinguishable identities and cannot share a slot.
  // First two positions are Prized; the next three remain in owner's deck.
  let total=0,viable=0;
  for(let basic=0;basic<5;basic++) {
    for(let fog=0;fog<5;fog++) {
      for(let retrieval=0;retrieval<5;retrieval++) {
        if(new Set([basic,fog,retrieval]).size!==3)continue;
        total++;
        if(retrieval>=2||(basic>=2&&fog>=2))viable++;
      }
    }
  }
  const r=recoveryOrFogAvailability({
    deckCount:3,prizeCount:2,basicUnresolved:1,
    fogUnresolved:1,retrievalUnresolved:1,basicInDiscard:1
  });
  assert.equal(total,60);
  assert.equal(r.bothRoutesAccessible.decimal,viable/total);
});

test('early seven-card Fog incidence falls by exactly observed delta',()=>{
  const withFour=initialSevenAtLeastOne(4);
  const withThree=initialSevenAtLeastOne(3);
  assert.equal(withFour.numerator,'38962');
  assert.equal(withFour.denominator,'97527');
  assert.equal(withThree.numerator,'5397');
  assert.equal(withThree.denominator,'17110');
  assert.ok(Math.abs((withFour.decimal-withThree.decimal)-
    0.08407005239574682)<1e-12);
});

test('reject hidden-count, negative and zero-route inputs',()=>{
  const invalid=[
    {...frozen,basicUnresolved:0},
    {...frozen,fogUnresolved:0},
    {...frozen,retrievalUnresolved:0},
    {...frozen,basicInDiscard:-1},
    {...frozen,prizeCount:7},
    {...frozen,deckCount:60},
    {...frozen,deckCount:0,prizeCount:2}
  ];
  for(const x of invalid)
    assert.throws(()=>recoveryOrFogAvailability(x));
});
