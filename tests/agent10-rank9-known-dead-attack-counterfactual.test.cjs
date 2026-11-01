'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const before=require('../simulation/evaluation/agent10-rank9-mega-absol-vip-target-counterfactual.cjs');
const after=require('../simulation/evaluation/agent10-rank9-known-dead-attack-counterfactual.cjs');
const {chooseKnownDeadLeadingAttack}=require('../simulation/twinleaf/agent1-actor-dead-first-attack-frontier.cjs');
test('known-dead source attack is exactly one both-seat policy factor on immutable source seeds',()=>{
 const a=before.treatmentOptions(),b=after.treatmentOptions();
 assert.equal(a.bilateralKnownDeadAttackRoot,undefined);
 assert.equal(b.bilateralKnownDeadAttackRoot,true);
 assert.equal(b.actorVipMegaAbsolTarget,true);
 assert.equal(b.actorVipBeforeAttack,true);
 assert.equal(b.actorNaturalEvolutionRoot,true);
 assert.deepEqual(a.registeredTrials,b.registeredTrials);
 const {registeredFrameName:ac,...original}=a;
 const {registeredFrameName:bc,bilateralKnownDeadAttackRoot,...treatment}=b;
 assert.deepEqual(treatment,original);
 assert.notEqual(ac,bc);
});
test('only known face-up non-60 damage and payable Claw of Darkness permit native alternative',()=>{
 const view=(d)=>({decisionKind:'owner-root',
  ownPublic:{active:{name:'Mega Absol ex',printing:'Mega Absol ex M1L'}},
  opponentPublic:{active:{name:'Klefki',damage:d}}});
 const attacks=[{name:'Terminal Period',damage:0},
  {name:'Claw of Darkness',damage:200}];
 assert.equal(chooseKnownDeadLeadingAttack(view(0),attacks)?.attackName,
   'Claw of Darkness');
 assert.equal(chooseKnownDeadLeadingAttack(view(60),attacks),null);
 assert.equal(chooseKnownDeadLeadingAttack(view(0),attacks.slice(0,1)),null);
});
