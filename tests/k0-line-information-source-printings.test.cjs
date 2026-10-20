'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const field=require('../results/aichi-2026/full-decklists.json');
const {strictK0Belief}=require('../simulation/twinleaf/strict-k0-unknown.cjs');
const {k0LineInformationFrontier}=require(
  '../simulation/twinleaf/k0-line-information-frontier.cjs');

/** Source-backed physical IDs, with duplicates preserved. */
function printings(source){
  return source.cards.flatMap(row=>
    Array(row.count).fill(row.printing.set+'/'+row.printing.number+'/'+row.name));
}

test('rank24 actual 60 preserves both singleton Stadium opportunities in owner K0',()=>{
  const source=field.decks.find(row=>row.rank===24);
  assert.equal(source?.player,'Ryoya Fujii');
  const registered=printings(source);
  assert.equal(registered.length,60);
  const thunder='LOT/191/Thunder Mountain ♢';
  const labyrinth='TEU/158/Wondrous Labyrinth ♢';
  const known=['CEC/206/Tag Call','TWM/77/Iron Thorns ex',
    'SUM/136/Double Colorless Energy'];
  const belief=strictK0Belief({
    registered,known,deckCount:51,unseenPrizeCount:6
  });
  assert.equal(belief.pool.length,57);
  for(const name of [thunder,labyrinth]){
    assert.equal(belief.pool.filter(x=>x===name).length,1);
  }
  // These are two hypothetically equal-payoff Stadium *access* abstractions.
  // No implication that playing them produces equal attacks or match value.
  const information=k0LineInformationFrontier({
    unknownPool:belief.pool,unknownPrizeCount:6,
    uniformUnknownAllocation:true,
    plans:[thunder,labyrinth].map(id=>({
      id,requirements:[{printing:id,count:1}],
      availableUtility:10,missingUtility:-10
    }))
  });
  assert.equal(information.unknownCardCount,57);
  assert.equal(information.evaluatedJointPrizeCases,4);
  assert.ok(Math.abs(information.preSearchExpectedUtility-150/19)<1e-12);
  assert.ok(Math.abs(information.afterSearchExpectedUtility-
    10*(1-30/(57*56)))<1e-12);
  assert.ok(Math.abs(information.informationValue-
    (10*(1-30/(57*56))-150/19))<1e-12);
});
