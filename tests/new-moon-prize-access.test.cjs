'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {choose,assess} = require('../simulation/evaluation/new-moon-prize-access.cjs');

test('exact combinatorial helper and complete six-Prize partition', () => {
  assert.equal(choose(60,6),50063860n);
  assert.equal(choose(2,1),2n);
  assert.equal(choose(60,61),0n);
  const result = assess();
  assert.equal(result.sampleSpace,50063860);
  assert.equal(result.scenarios.length,12);
  assert.equal(result.scenarios.reduce((n,r)=>n+r.prizeConfigurations,0),50063860);
});

test('source-preserved one-one-two prize risks have exact counts', () => {
  const result = assess();
  assert.deepEqual(result.composition,{
    lunatone:1,solrock:1,hisuianHeavyBall:2,other:56
  });
  assert.equal(result.atLeastOneKeyPrized.configurations,9588502);
  assert.equal(result.bothKeyPrized.configurations,424270);
  assert.equal(result.physicallyInsufficientUnprizedHeavyBalls.configurations,112420);
  assert.equal(result.decomposition.exactlyOneKeyWithBothBallsPrized.configurations,55440);
  assert.equal(result.decomposition.bothKeysWithAtLeastOneBallPrized.configurations,56980);
  assert.equal(
    result.decomposition.exactlyOneKeyWithBothBallsPrized.configurations+
    result.decomposition.bothKeysWithAtLeastOneBallPrized.configurations,
    result.physicallyInsufficientUnprizedHeavyBalls.configurations
  );
});
