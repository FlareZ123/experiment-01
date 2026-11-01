'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {scheduledArms}=require('../simulation/evaluation/agent17-original-rank5-mew-genesect-development.cjs');
const {VERSION,PRIOR_ARTIFACT,PRIOR_SHA256,PRIOR_DEALS}=
  require('../simulation/evaluation/agent17-rank5-vip-retrospective.cjs');

test('retrospective version and native baseline artifact stay explicit',()=>{
  assert.match(VERSION,/retrospective-bothseat-vip/);
  assert.equal(PRIOR_ARTIFACT,13096070625);
  assert.match(PRIOR_SHA256,/^[a-f0-9]{64}$/);
  assert.equal(Object.keys(PRIOR_DEALS).length,4);
});

test('original prospectively registered eight arms remain unchanged',()=>{
  assert.equal(scheduledArms().length,8);
  const ids=scheduledArms().map(x=>x.id);
  assert.equal(new Set(ids).size,8);
  assert.equal(Object.keys(PRIOR_DEALS).every(x=>ids.includes(x)),true);
  for(const value of Object.values(PRIOR_DEALS))
    assert.match(value,/^[0-9a-f]{64}$/);
});

test('comparison only has four valid original Store physical deal baselines',()=>{
  assert.equal(Object.keys(PRIOR_DEALS).filter(x=>x.includes(':champion-reference')).length,3);
  assert.equal(Object.keys(PRIOR_DEALS).filter(x=>x.includes(':new-moon-lockbreaker-v1')).length,1);
  assert.equal(Object.keys(PRIOR_DEALS).filter(x=>x.startsWith('5:1:B:')).length,2);
});
