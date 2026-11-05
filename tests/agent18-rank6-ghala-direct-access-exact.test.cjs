'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,choose,gcd,sourceCounts,exactOpeningAccess
}=require('../simulation/evaluation/agent18-rank6-ghala-direct-access-exact.cjs');

test('real rank6 fixed original sixty provides exact enumerated count categories',()=>{
  assert.deepEqual(sourceCounts(),[4,2,2,1,1,50]);
  assert.equal(VERSION,
    'agent18-original-rank6-tagcall-ghala-direct-access-exact-v1');
});

test('BigInt hypergeometric arithmetic is exact and produces canonical fractions',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(56,7),231917400n);
  assert.equal(choose(53,6),22957480n);
  assert.equal(choose(60,0),1n);
  assert.equal(choose(7,8),0n);
  assert.equal(gcd(8n,12n),4n);
});

test('all Basic-conditioned 7 / 6 / 1 physical deals enumerated exactly',()=>{
  const exact=exactOpeningAccess();
  assert.equal(exact.sampleSpace.exactlyEnumeratedAllConditionedDeals,true);
  assert.equal(exact.qualifiedCompetitiveGames,undefined);
  assert.equal(exact.qualifiesCompetitiveGames,0);
  const p=exact.probabilities;
  assert.deepEqual(
    [p.ghOrTagRoute.numerator,p.ghOrTagRoute.denominator],
    ['83798447','204433614']);
  assert.deepEqual(
    [p.thunderAndDceNotPrized.numerator,
      p.thunderAndDceNotPrized.denominator],
    ['1726933','2142910']);
  assert.deepEqual(
    [p.routePlusBothResources.numerator,
      p.routePlusBothResources.denominator],
    ['24781820963','75299714490']);
  assert.deepEqual(
    [p.physicallyPayableDirectRoute.numerator,
      p.physicallyPayableDirectRoute.denominator],
    ['148690835231','451798286940']);
  assert.deepEqual(
    [p.payableDirectRouteWithBench.numerator,
      p.payableDirectRouteWithBench.denominator],
    ['1364752073','22589914347']);
  assert.ok(p.physicallyPayableDirectRoute.probability <
    p.routePlusBothResources.probability);
  assert.ok(p.payableDirectRouteWithBench.probability <
    p.physicallyPayableDirectRoute.probability);
});

test('mutated rank6 input/card counts fail closed instead of publishing wrong estimates',()=>{
  assert.throws(()=>exactOpeningAccess([5,2,2,1,1,49]),
    /deepStrictEqual|Expected values to be strictly deep-equal/);
  assert.throws(()=>sourceCounts({decks:[{rank:6,cards:[] }]}));
});
