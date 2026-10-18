'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {nextOpponentRootChoices}=
  require('../simulation/twinleaf/rank9-horror-house-nextturn-source-reply.cjs');

test('exclude source own attacks, speculative action proposals and other turns',()=>{
  const sourceAttack={actionOrdinal:21,turnBefore:2};
  const rows=[
    {actionOrdinal:20,turnBefore:2,playerSlot:0,action:'PassTurnAction'},
    {actionOrdinal:21,turnBefore:2,playerSlot:1,action:'AttackAction'},
    {actionOrdinal:22,turnBefore:3,playerSlot:0,action:'PlayCardAction',
      card:'Ultra Ball',prizesAfter:[6,6],decksAfter:[40,39],
      decisionHandBefore:{ownHandPrintings:['Ultra Ball','Psychic Energy']}},
    {actionOrdinal:23,turnBefore:3,playerSlot:0,action:'PassTurnAction'},
    {actionOrdinal:24,turnBefore:4,playerSlot:1,action:'AttackAction'}
  ];
  const observed=nextOpponentRootChoices(rows,sourceAttack,1);
  assert.deepEqual(observed.map(x=>x.ordinal),[22,23]);
  assert.equal(observed[0].card,'Ultra Ball');
  assert.deepEqual(observed[0].ownHandBefore,['Ultra Ball','Psychic Energy']);
  assert.equal(observed[1].chosenRootAction,'PassTurnAction');
});

test('zero recorded choices is distinct from asserting the opponent did nothing',()=>{
  const rows=nextOpponentRootChoices([], {actionOrdinal:2,turnBefore:3},1);
  assert.deepEqual(rows,[]);
});
