'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const field=require('../results/aichi-2026/full-decklists.json');
const {choose,sourceCounts,jointChainPrizeCapacity}=
  require('../scripts/agent45-raichu-dual-chain-prize-capacity.cjs');

test('two distinct Basic predecessors survive 6 Prizes in 98.14% unconditioned placements',()=>{
  assert.equal(choose(60,6),50063860n);
  for(const rank of [4,17]){
    const deck=field.decks.find(x=>x.rank===rank);
    const counts=sourceCounts(deck);
    assert.deepEqual(counts,{voltorb:2,electrode:3,
      pikachu:1,ditto:1,raichu:2,basicTotal:13});
    const result=jointChainPrizeCapacity(counts);
    assert.equal(result.unconditional.numerator,'7701');
    assert.equal(result.unconditional.denominator,'7847');
    assert.equal(result.legalSevenConditioned.numerator,'1821901575072697');
    assert.equal(result.legalSevenConditioned.denominator,'1855626827824770');
    assert.equal(result.validSevenProbability.numerator,'9797437');
    assert.equal(result.validSevenProbability.denominator,'11703240');
    assert.ok(result.legalSevenConditioned.probability>0.9818);
    assert.ok(result.legalSevenConditioned.probability<0.9819);
  }
});

test('Ditto is one physical Basic, so a sole Ditto cannot support both chains',()=>{
  const counts={voltorb:2,electrode:3,pikachu:1,ditto:1,
    raichu:2,basicTotal:13};
  const result=jointChainPrizeCapacity(counts);
  assert.ok(BigInt(result.unconditionalFailureCounts.basicAllocationUnavailable)>0n);
  assert.equal(
    Object.values(result.unconditionalFailureCounts)
      .reduce((a,x)=>a+BigInt(x),0n),
    choose(60,6)-
      BigInt(result.unconditional.numerator)*(choose(60,6)/7847n)
  );
});

test('reject a different evolution source rather than generalize silently',()=>{
  assert.throws(()=>jointChainPrizeCapacity({
    voltorb:1,electrode:3,pikachu:1,ditto:1,raichu:2,basicTotal:13
  }));
  assert.throws(()=>sourceCounts({rank:9,cards:[]}));
});
