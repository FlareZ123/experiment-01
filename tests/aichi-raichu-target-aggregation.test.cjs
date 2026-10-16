'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {aggregateDamageTargets}=require('../simulation/twinleaf/electro-rain-damage-hook.cjs');

test('flat damage modifier is applied once after grouping repeated selections',()=>{
  const t={player:1,slot:2,index:0};
  const u={player:1,slot:2,index:1};
  assert.deepEqual(aggregateDamageTargets([
    {target:t,damage:30},
    {target:u,damage:30},
    {target:{...t},damage:60}
  ]),[
    {target:t,damage:90},
    {target:u,damage:30}
  ]);
});
test('ordinary unique target rows are preserved and input stays unchanged',()=>{
  const initial=[
    {target:{player:1,slot:1,index:0},damage:60},
    {target:{player:1,slot:2,index:0},damage:30}
  ];
  const before=structuredClone(initial);
  assert.deepEqual(aggregateDamageTargets(initial),initial);
  assert.deepEqual(initial,before);
});
test('empty damage allocation remains empty',()=>{
  assert.deepEqual(aggregateDamageTargets([]),[]);
});
