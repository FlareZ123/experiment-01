'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {choosePotentialKnockout}=require(
  '../simulation/twinleaf/agent49-actor-potential-knockout.cjs');

const move=(name,damage,extra={})=>({name,damage,cost:[],...extra});
const sample=(damage)=>({
  decisionKind:'owner-root',
  ownPublic:{active:{printing:'Mega Absol ex M1L',name:'Mega Absol ex'}},
  opponentPublic:{active:{hp:160,damage},discard:[]}
});

test('exact six counters preserves Terminal Period direct knockout',()=>{
  const first=move('Terminal Period',0);
  const second=move('Claw of Darkness',200);
  assert.strictEqual(choosePotentialKnockout(sample(60),[first,second]),first);
});
test('unmet exact-six requirement chooses printable Claw by source-specific proof',()=>{
  const first=move('Terminal Period',0);
  const second=move('Claw of Darkness',200);
  assert.strictEqual(choosePotentialKnockout(sample(30),[first,second]),second);
});
test('unknown zero/variable leading attack is protected from generic score',()=>{
  const s=sample(0);
  const other=move('Fixed',300);
  const zero=move('Unhandled effect',0);
  const variable=move('Variable effect',10,{damageCalculation:2});
  assert.strictEqual(choosePotentialKnockout(s,[zero,other]),zero);
  assert.strictEqual(choosePotentialKnockout(s,[variable,other]),variable);
});
