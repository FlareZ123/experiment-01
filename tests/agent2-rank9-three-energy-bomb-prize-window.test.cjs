'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {partialBombPrizeWindow,allThreePhysicalSubsetsCanFundClaw}=
  require('../scripts/agent2-rank9-three-energy-bomb-prize-window.cjs');
const {prizeWindow:originalFive}=
  require('../scripts/agent29-rank9-electrode-mega-prize-window.cjs');

test('physical three-Energy partial-Bomb prerequisites exactly enumerate original valid-seven Prize states',()=>{
  const v=partialBombPrizeWindow(3);
  const actual=v.availabilityConditionalBasicValidOpening;
  assert.equal(actual.numerator,'4371513615743');
  assert.equal(actual.denominator,'5411520174720');
  assert.ok(Math.abs(actual.probability-0.807816191125849)<1e-12);
  assert.equal(v.countsOnlyUnprizedPhysicalPrerequisites,true);
  assert.equal(v.preparationAttackAndWinProbabilityCertified,false);
  console.log('RANK9_PARTIAL_BOMB_EXACT_SOURCE_PRIZE_BOUND',JSON.stringify(v));
});

test('five-card reference reproduces previous verified full Bomb source bound exactly',()=>{
  const five=partialBombPrizeWindow(5).availabilityConditionalBasicValidOpening;
  const baseline=originalFive().prerequisiteAvailabilityGivenLegalFirstSeven;
  assert.deepEqual(five,baseline);
  assert.ok(partialBombPrizeWindow(3).availabilityConditionalBasicValidOpening.probability>
    five.probability);
});

test('every three-card original physical Energy subset can pay Mega Absol DDC absent modifiers',()=>{
  const a=allThreePhysicalSubsetsCanFundClaw();
  assert.equal(a.physicalSubsets,35);
  assert.equal(a.allPayableAbsentModifiers,true);
  assert.ok(a.compositions.every(x=>x.payable===true));
});

test('increasing the number of physically required unprized Energy cards cannot improve availability',()=>{
  let last=1;
  for(let n=1;n<=7;n++){
    const current=partialBombPrizeWindow(n)
      .availabilityConditionalBasicValidOpening.probability;
    assert.ok(current<=last+Number.EPSILON);
    last=current;
  }
});
