'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,REG}=
  require('../simulation/evaluation/agent1-rank17-bomb-native-positive-retrospective.cjs');

test('exact one prior disclosed positive native deal is frozen retrospectively',()=>{
  assert.strictEqual(preflight(),REG);
  assert.equal(REG.seed,2128426800);
  assert.equal(REG.sourcePhysicalSeat,1);
  assert.equal(REG.nativeActionCap,180);
  assert.equal(REG.arms.length,2);
  assert.equal(REG.nativeEnginePin.length,40);
  assert.equal(REG.abilityTrigger.minPhysicallyDiscardedEnergyCards,3);
});
test('probe is mechanically restricted to one after-Pass source ability',()=>{
  assert.equal(REG.abilityTrigger.oncePerMatch,true);
  assert.equal(REG.abilityTrigger.onlyAfterSourceAcceptedPass,true);
  assert.equal(REG.abilityTrigger.ability,'Extra Energy Bomb');
  assert.equal(REG.abilityTrigger.exactSourcePrinting,'Electrode-GX CES');
  assert.ok(REG.limitations.includes(
    'Mechanism stress test, chosen after earlier positive physical context'));
  assert.equal(REG.arms[0],'same-deal-composed-owner-control');
});
