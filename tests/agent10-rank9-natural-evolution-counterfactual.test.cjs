'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const profile=require('../simulation/evaluation/agent41-frozen-bilateral-development-v2.json');
const {scheduledArms,preflight}=
  require('../simulation/evaluation/agent10-original-rank9-absol-electrode-development.cjs');
const {treatmentOptions,VERSION}=
  require('../simulation/evaluation/agent10-rank9-natural-evolution-counterfactual.cjs');

test('the exact previously preregistered original source attempts remain unchanged',()=>{
  const opts=treatmentOptions();
  assert.deepEqual(opts.registeredTrials,scheduledArms());
  assert.deepEqual(opts.registeredTrials.map(x=>x.seed),
    [3060075246,3060075246,690229661,690229661]);
  assert.equal(preflight().originalRank,9);
  assert.ok(VERSION.includes('natural-evolution'));
});

test('ordinary evolution is the only two-seat native policy option changed',()=>{
  const opts=treatmentOptions();
  assert.equal(profile.policyOptions.actorNaturalEvolutionRoot,undefined);
  assert.equal(opts.actorNaturalEvolutionRoot,true);
  assert.equal(opts.actorOnlyComposition,true);
  assert.equal(opts.allowAdditionalOriginalSourceRanks,true);
  const {actorNaturalEvolutionRoot,registeredTrials,
    registeredFrameName,allowAdditionalOriginalSourceRanks,...unchanged}=opts;
  assert.deepEqual(unchanged,profile.policyOptions);
  assert.equal(registeredFrameName,VERSION);
  assert.equal(registeredTrials.length,4);
});
