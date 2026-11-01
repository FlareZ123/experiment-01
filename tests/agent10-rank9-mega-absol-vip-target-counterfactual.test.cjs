'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const control=require('../simulation/evaluation/agent10-rank9-early-vip-evolution-counterfactual.cjs');
const treated=require('../simulation/evaluation/agent10-rank9-mega-absol-vip-target-counterfactual.cjs');
test('rank9 Mega Absol VIP target fork changes only the registered owner-prompt factor',()=>{
 const a=control.treatmentOptions(),b=treated.treatmentOptions();
 assert.equal(a.actorVipMegaAbsolTarget,undefined);
 assert.equal(b.actorVipMegaAbsolTarget,true);
 assert.equal(b.actorVipBeforeAttack,true);
 assert.equal(b.actorNaturalEvolutionRoot,true);
 assert.equal(b.registeredTrials.length,4);
 assert.deepEqual(b.registeredTrials,a.registeredTrials);
 const {actorVipMegaAbsolTarget,registeredFrameName:caseA,...rest}=b;
 const {registeredFrameName:caseB,...baseline}=a;
 assert.deepEqual(rest,baseline);
 assert.notEqual(caseA,caseB);
});
