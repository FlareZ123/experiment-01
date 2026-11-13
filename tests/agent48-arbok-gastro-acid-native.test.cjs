'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {run,ENGINE_PIN} = require('../simulation/twinleaf/agent48-arbok-gastro-acid-native.cjs');

test('pinned Twinleaf Arbok Gastro Acid suppresses Stoutland through Stealthy Hood while Bench Vileplume remains active',()=>{
  const result = run();
  assert.equal(result.status,'PINNED_NATIVE_ATTACK_EFFECT_CONFIRMED',
    JSON.stringify(result));
  assert.equal(result.engine,'twinleafgg/'+ENGINE_PIN);
  assert.equal(result.cases.length,2);
  for(const row of result.cases){
    assert.equal(row.attack.name,'Gastro Acid');
    assert.equal(row.attack.damage,20);
    assert.deepEqual(row.after.sentinel,{blocked:true,visible:false});
    assert.deepEqual(row.after.irritatingPollen,{blocked:false,visible:true});
    assert.equal(row.printedDamage,20);
    assert.equal(row.damageResolution,'not asserted by this direct staged AttackAction probe');
    assert.equal(row.stoutlandStillActive,true);
    assert.equal(row.vileplumeOnBench,true);
    assert.deepEqual(row.unresolvedPrompts,[]);
    assert.ok(row.waitPromptCount >= 0);
  }
  assert.equal(result.cases[0].withStealthyHood,false);
  assert.equal(result.cases[1].withStealthyHood,true);
  assert.equal(result.qualifiedCompetitiveGames,0);
});
