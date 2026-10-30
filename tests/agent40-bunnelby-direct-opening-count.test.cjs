'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {choose,countConjunction,run}=
  require('../simulation/evaluation/agent40-bunnelby-direct-opening-count.cjs');

test('integer combinatorics count the whole eight-card population',()=>{
  assert.equal(choose(60,8),2558620845n);
  assert.equal(choose(6,2),15n);
  assert.equal(choose(60,0),1n);
});
test('frozen rank2/15 source direct conjunction exact numerator',()=>{
  const rows=run().results;
  assert.equal(rows.length,2);
  assert.deepEqual(rows.map(x=>x.rank),[2,15]);
  assert.deepEqual(rows[0].counts,[2,6,4,4,2,2,40]);
  assert.deepEqual(rows[1].counts,[2,6,3,4,2,2,41]);
  assert.equal(rows[0].direct8ConjunctionNumerator,'228532145');
  assert.equal(rows[1].direct8ConjunctionNumerator,'210475593');
  assert.equal(rows[0].denominator,'2558620845');
  assert.equal(rows[1].denominator,'2558620845');
  assert.ok(rows[0].direct8ConjunctionProbability>
    rows[1].direct8ConjunctionProbability);
  assert.ok(rows.every(x=>x.competitiveQualifiedGames===0));
});
test('Guzma-Hala/Tag and held pair sets overlap rather than add',()=>{
  for(const gh of [3,4]){
    const group=[2,6,gh,4,2,2,60-(2+6+gh+4+2+2)];
    const r=countConjunction(group);
    assert.ok(r.conjunction<r.supporter+r.heldPair,
      'Two sufficient access routes overlap in the opening population');
  }
});
