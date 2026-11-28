'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,openingPrizeAccessibility}=require(
  './agent47-three-basic-heavyball-prize-model.cjs');

const config={deckSize:60,handSize:7,prizeCount:6,
  basicCount:14,criticalBasics:3};
const close=(actual,expected)=>assert.ok(
  Math.abs(actual-expected)<1e-12,
  'Expected '+expected+' observed '+actual
);

test('exact binomial counts and invalid selections',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(53,6),22957480n);
  assert.equal(choose(5,6),0n);
  assert.equal(choose(5,-1),0n);
  assert.equal(choose(5,0),1n);
  assert.equal(choose(0,0),1n);
});

test('valid opening condition is 1 - no Basic mulligan probability',()=>{
  const p=openingPrizeAccessibility({...config,heavyBalls:1});
  const expected=1-Number(choose(46,7))/Number(choose(60,7));
  close(p.validOpeningRate,expected);
  close(p.validOpeningRate,0.8614093191287199);
});

test('three singleton Basic core, no Heavy Ball: 26.99061698% prize inaccessible',()=>{
  const p=openingPrizeAccessibility({...config,heavyBalls:0});
  close(p.prizeOnlyUnrecoverable,0.26990616983335836);
  close(p.atLeastOneCriticalPrized,p.prizeOnlyUnrecoverable);
  close(p.atLeastTwoCriticalPrized,0.023177884211597537);
  close(p.exactCriticalPrized.reduce((a,b)=>a+b),1);
});

test('actual candidate one Heavy Ball: 4.49515324% necessary opening collapse',()=>{
  const p=openingPrizeAccessibility({...config,heavyBalls:1});
  close(p.prizeOnlyUnrecoverable,0.04495153241630378);
  close(p.prizeOnlyPotentiallyRecoverable,0.9550484675836962);
  close(p.atLeastOneCriticalPrized,0.26990616983335836);
  close(p.atLeastTwoCriticalPrized,0.023177884211597537);
});

test('second Heavy Ball: 0.52193225%; 3.973221 percentage-point reduction',()=>{
  const one=openingPrizeAccessibility({...config,heavyBalls:1});
  const two=openingPrizeAccessibility({...config,heavyBalls:2});
  close(two.prizeOnlyUnrecoverable,0.005219322476844074);
  close(one.prizeOnlyUnrecoverable-two.prizeOnlyUnrecoverable,
    0.039732209939459705);
  assert.ok(two.prizeOnlyUnrecoverable<one.prizeOnlyUnrecoverable);
});

test('third Heavy Ball: 0.04215964%, diminishing returns',()=>{
  const one=openingPrizeAccessibility({...config,heavyBalls:1});
  const two=openingPrizeAccessibility({...config,heavyBalls:2});
  const three=openingPrizeAccessibility({...config,heavyBalls:3});
  close(three.prizeOnlyUnrecoverable,0.0004215963985223137);
  assert.ok((one.prizeOnlyUnrecoverable-two.prizeOnlyUnrecoverable)>
    (two.prizeOnlyUnrecoverable-three.prizeOnlyUnrecoverable));
});

test('all core counts k=0..3 sum to one and do not depend on Heavy Ball count',()=>{
  const baseline=openingPrizeAccessibility({...config,heavyBalls:0});
  for(const n of [1,2,3,4]){
    const next=openingPrizeAccessibility({...config,heavyBalls:n});
    for(let k=0;k<=3;k++)
      close(next.exactCriticalPrized[k],baseline.exactCriticalPrized[k]);
  }
});

test('zero critical Basics has no impossible prize-recovery configurations',()=>{
  for(const n of [0,1,2]){
    const p=openingPrizeAccessibility({...config,criticalBasics:0,
      heavyBalls:n});
    close(p.prizeOnlyUnrecoverable,0);
    close(p.atLeastOneCriticalPrized,0);
  }
});

test('reject invalid deck and impossible valid-Basic setup',()=>{
  assert.throws(()=>openingPrizeAccessibility({...config,deckSize:12}),
    /DECK_COMPOSITION_INVALID|PARAMETER_OUT_OF_RANGE/);
  assert.throws(()=>openingPrizeAccessibility({...config,basicCount:0,
    criticalBasics:0}),/NO_VALID_BASIC_OPENING/);
  assert.throws(()=>openingPrizeAccessibility({...config,heavyBalls:60}),
    /DECK_COMPOSITION_INVALID/);
});

test('Prize-recovery numerator/denominator exactly partition all valid openings',()=>{
  for(let balls=0;balls<=4;balls++){
    const p=openingPrizeAccessibility({...config,heavyBalls:balls});
    const numerator=BigInt(p.exactCounts.unrecoverable);
    const denominator=BigInt(p.exactCounts.denominator);
    assert.ok(numerator>=0n&&numerator<=denominator);
    close(Number(numerator)/Number(denominator),
      p.prizeOnlyUnrecoverable);
  }
});
