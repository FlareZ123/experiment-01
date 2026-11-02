'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {nativeIncapacitatingStatus}=
  require('../simulation/twinleaf/rank6-broad-thorns-policy.cjs');

const PINNED_NATIVE={PARALYZED:0,CONFUSED:1,ASLEEP:2,POISONED:3,BURNED:4};

test('native numeric Paralysis zero blocks the scripted original source attack',()=>{
  assert.equal(nativeIncapacitatingStatus([0],PINNED_NATIVE),true);
});

test('Asleep two blocks the scripted original source attack',()=>{
  assert.equal(nativeIncapacitatingStatus([2],PINNED_NATIVE),true);
});

test('Burned, Confused and Poisoned do not categorically forbid attack',()=>{
  for(const condition of [[1],[3],[4],[1,3,4],[]]){
    assert.equal(nativeIncapacitatingStatus(condition,PINNED_NATIVE),false);
  }
});

test('both simultaneous Conditions still forbid attacking',()=>{
  assert.equal(nativeIncapacitatingStatus([0,3],PINNED_NATIVE),true);
  assert.equal(nativeIncapacitatingStatus([2,4],PINNED_NATIVE),true);
});

test('every scripted Volt Cyclone declaration uses shared native-condition gate',()=>{
  const source=fs.readFileSync(path.resolve(__dirname,
    '../simulation/twinleaf/rank6-broad-thorns-policy.cjs'),'utf8');
  assert.equal((source.match(/new AttackAction\(player.id,'Volt Cyclone'\)/g)??[]).length,1);
  assert.equal((source.match(/chooseNativeAttackOrPass\(state,p,/g)??[]).length,3);
  assert.equal(source.includes('AGENT38_RANK6_SCRIPTED_SPECIAL_CONDITION_GUARD_DEV'),true);
  assert.equal(source.includes('new PassTurnAction(player.id)'),true);
});
