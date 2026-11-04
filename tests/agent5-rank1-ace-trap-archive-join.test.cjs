'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  firstDifference,rootProjection,sourceTurn38
}=require('../simulation/evaluation/agent5-rank1-ace-trap-afterpass-native.cjs');
const {MODES,PRINT}=
  require('../simulation/twinleaf/agent5-rank1-ace-trap-native-fork.cjs');

test('exact declared four-arm intervention order remains fixed',()=>{
  assert.deepEqual([...MODES],[
    'control-original','two-item-trap','two-item-ace','control-repeat'
  ]);
  assert.deepEqual([PRINT.blower,PRINT.catcher,PRINT.ace],[
    'Field Blower GRI','Counter Catcher PAR','Ace Trainer AOR'
  ]);
});

test('root projection requires same-arm clock, seat, action and payment',()=>{
  const baseline=[
    {actionOrdinal:0,turnBefore:36,turnAfter:36,playerSlot:1,
      action:'AttackAction',attack:'Max Geist'},
    {actionOrdinal:1,turnBefore:37,turnAfter:38,playerSlot:0,
      action:'PassTurnAction'}
  ];
  const treatment=[
    {...baseline[0]},
    {actionOrdinal:1,turnBefore:37,turnAfter:37,playerSlot:0,
      action:'PlayCardAction',card:'Field Blower'}
  ];
  const diff=firstDifference(baseline,treatment);
  assert.equal(diff.ordinal,1);
  assert.equal(diff.control.action,'PassTurnAction');
  assert.equal(diff.treatment.card,'Field Blower');
  assert.equal(rootProjection(baseline[0]).attack,'Max Geist');
  assert.equal(firstDifference(baseline,[...baseline]),null);
});

test('different physical action after a shared prefix is not game completion',()=>{
  const baseline=[{turnBefore:37,turnAfter:38,playerSlot:0,
    action:'PassTurnAction'}];
  const prefix=[...baseline,{turnBefore:38,turnAfter:38,
    playerSlot:1,action:'UseAbilityAction'}];
  const diff=firstDifference(baseline,prefix);
  assert.equal(diff.ordinal,1);
  assert.equal(diff.control,null);
  assert.equal(diff.treatment.action,'UseAbilityAction');
});

test('source reply proof requires turn38 actual native action, never a prompt',()=>{
  const row={rootActionLedger:[
    {actionOrdinal:70,playerSlot:0,turnBefore:37,
      action:'PlayCardAction',card:'Ace Trainer'},
    {actionOrdinal:71,playerSlot:1,turnBefore:37,
      action:'ResolvePromptAction'},
    {actionOrdinal:72,playerSlot:1,turnBefore:38,
      action:'ResolvePromptAction'},
    {actionOrdinal:73,playerSlot:1,turnBefore:38,
      action:'UseAbilityAction',ability:'Underworld Door'},
    {actionOrdinal:74,playerSlot:1,turnBefore:38,
      action:'AttackAction',attack:'Max Geist'}
  ]};
  const result=sourceTurn38(row);
  assert.equal(result.firstNonPrompt.actionOrdinal,73);
  assert.equal(result.roots.length,2);
  assert.equal(result.paidMaxGeistSeen,true);
  assert.equal(sourceTurn38({rootActionLedger:[
    {playerSlot:1,turnBefore:38,action:'ResolvePromptAction'}
  ]}).paidMaxGeistSeen,false);
});
