'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {analyzeBroadRank6Opportunity}=
  require('../scripts/rank6-broad-thorns-opportunity.cjs');

test('source count and exact printed-move access frontier',()=>{
  const r=analyzeBroadRank6Opportunity();
  assert.deepEqual(r.groups,[4,1,1,2,2,38,12]);
  assert.equal(r.direct.fraction,'13697/1071455');
  assert.equal(r.proposedHandTrigger.fraction,'142343653/340722690');
  assert.equal(r.requiredSearchCardsAvailable.fraction,
    '5713020800029/17029320046200');
  assert.ok(r.requiredSearchCardsAvailable.probability<
    r.proposedHandTrigger.probability);
  assert.equal(r.qualifiedForCompetitiveInference,false);
});
