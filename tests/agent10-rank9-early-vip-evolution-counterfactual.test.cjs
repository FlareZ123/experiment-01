'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const existing=require('../simulation/evaluation/agent10-rank9-natural-evolution-counterfactual.cjs');
const treatment=require('../simulation/evaluation/agent10-rank9-early-vip-evolution-counterfactual.cjs');
const profile=require('../simulation/evaluation/agent41-frozen-bilateral-development-v2.json');
test('frozen candidate lists and original four seed groups remain exactly matched',()=>{
 const c=existing.treatmentOptions(),t=treatment.treatmentOptions();
 assert.equal(t.registeredTrials.length,4);
 assert.deepEqual(t.registeredTrials,c.registeredTrials);
 assert.deepEqual(t.registeredTrials.map(x=>x.seed),
   [3060075246,3060075246,690229661,690229661]);
 assert.equal(profile.policyOptions.actorVipBeforeAttack,undefined);
 assert.equal(t.actorVipBeforeAttack,true);
 assert.equal(t.actorNaturalEvolutionRoot,true);
 const {registeredFrameName:oldFrame,...comparison}=c;
 const {actorVipBeforeAttack,registeredFrameName:newFrame,...treated}=t;
 assert.deepEqual(treated,comparison,'Only one actor policy factor may differ');
 assert.notEqual(oldFrame,newFrame);
});
