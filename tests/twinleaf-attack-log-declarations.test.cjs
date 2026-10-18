'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {newlyLoggedAttackDeclarations} =
  require('../simulation/evaluation/twinleaf-attack-log-declarations.cjs');

test('captures ordinary printed AttackAction from newly appended Store log', () => {
  const old = [{message:'LOG_PLAYER_DRAWS_CARDS',params:{name:'Player A'}}];
  const logs = [...old,
    {message:'LOG_PLAYER_USES_ATTACK',params:{name:'Player B',attack:'Poltergeist'}},
    {message:'LOG_PLAYER_TAKES_PRIZE',params:{name:'Player B'}}
  ];
  assert.deepEqual(newlyLoggedAttackDeclarations(logs,old.length,{
    actionOrdinal:7,turnBefore:2,triggerAction:'AttackAction'
  }),[{
    kind:'engine-attack-declaration',logIndex:1,actionOrdinal:7,
    turnBefore:2,triggerAction:'AttackAction',playerName:'Player B',
    attackName:'Poltergeist'
  }]);
});

test('captures delegated Perfection copy from ResolvePromptAction rather than AttackAction', () => {
  const previous = [
    {message:'LOG_PLAYER_USES_ABILITY',params:{name:'Player B',ability:'Perfection'}}
  ];
  const newLogs = [...previous,{
    message:'LOG_PLAYER_USES_ATTACK',
    params:{name:'Player B',attack:'Horror House-GX'}
  }];
  assert.deepEqual(newlyLoggedAttackDeclarations(newLogs,previous.length,{
    actionOrdinal:19,turnBefore:4,triggerAction:'ResolvePromptAction'
  }).map(x=>[x.triggerAction,x.attackName]),[
    ['ResolvePromptAction','Horror House-GX']
  ]);
});

test('canceling a copy prompt cannot be counted as an attack', () => {
  const logs=[{message:'LOG_PLAYER_USES_ABILITY',params:{name:'Player B',ability:'Perfection'}}];
  assert.deepEqual(newlyLoggedAttackDeclarations(logs,logs.length,{
    actionOrdinal:11,turnBefore:4,triggerAction:'ResolvePromptAction'
  }),[]);
});

test('only new tail log events are counted, including two logs in one dispatch', () => {
  const logs=[
    {message:'LOG_PLAYER_USES_ATTACK',params:{name:'A',attack:'Earlier attack'}},
    {message:'LOG_PLAYER_USES_ATTACK',params:{name:'B',attack:'First new'}},
    {message:'LOG_PLAYER_USES_ATTACK',params:{name:'B',attack:'Second new'}}
  ];
  assert.deepEqual(newlyLoggedAttackDeclarations(logs,1,{
    actionOrdinal:21,turnBefore:9,triggerAction:'ResolvePromptAction'
  }).map(x=>x.attackName),['First new','Second new']);
});

test('rejects invalid log offsets instead of replaying an entire prior log', () => {
  for (const position of [-1,0.5,2,NaN]) {
    assert.throws(()=>newlyLoggedAttackDeclarations([],position,{
      actionOrdinal:0,turnBefore:0,triggerAction:'AttackAction'
    }),TypeError);
  }
});
