'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {inventoryScriptedNativeAttacks,proximityEvidence}=
  require('../scripts/agent38-native-scripted-attack-condition-inventory.cjs');

test('native constructor inventory is deterministic, source-local, and private-safe',()=>{
  const a=inventoryScriptedNativeAttacks();
  const b=inventoryScriptedNativeAttacks();
  assert.deepEqual(a,b);
  assert.ok(a.scannedJavaScriptModules>0);
  assert.ok(a.explicitAttackConstructors>0);
  assert.equal(a.competitiveQualifiedGames,0);
  assert.ok(a.records.every(r=>r.path.startsWith('simulation/')&&
    !r.path.includes('private/')&&
    Number.isSafeInteger(r.line)&&r.line>0));
  assert.equal(a.explicitAttackConstructors,a.records.length);
  assert.ok(a.constructorsWithoutLocalConditionTokens>=0);
});

test('known corrected rank6 scripted Volt Cyclone has nearby native guard',()=>{
  const a=inventoryScriptedNativeAttacks();
  const relevant=a.records.filter(x=>
    x.path==='simulation/twinleaf/rank6-broad-thorns-policy.cjs');
  assert.equal(relevant.length,1);
  assert.equal(relevant[0].nearbyConditionToken,true);
});

test('lexical proximity is only a review heuristic',()=>{
  const guarded='const locked=specialConditions.includes(0);\n'+
    'if (locked) return pass;\nnew AttackAction(actor,attack);';
  const unguarded='const x=1;\nnew AttackAction(actor,attack);';
  assert.equal(proximityEvidence(guarded,3).localConditionTokensBefore,true);
  assert.equal(proximityEvidence(unguarded,2).localConditionTokensBefore,false);
});
