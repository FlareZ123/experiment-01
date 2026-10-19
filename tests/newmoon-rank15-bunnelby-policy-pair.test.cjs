'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootPolicyTrace}=require(
  '../simulation/twinleaf/newmoon-rank15-bunnelby-policy-pair.cjs');

test('count only resolved Store root decisions for source opponent',()=>{
  const game={
    rootActionLedger:[
      {playerSlot:0,actionOrdinal:3,turnBefore:2,action:'PlayCardAction',
        card:'Guzma & Hala CEC'},
      {playerSlot:1,actionOrdinal:4,turnBefore:2,action:'AttackAction',
        attack:'Evolution'},
      {playerSlot:0,actionOrdinal:8,turnBefore:4,action:'AttackAction',
        attack:'Evolution'},
      {playerSlot:0,actionOrdinal:9,turnBefore:4,action:'ResolvePromptAction',
        attackChoice:{attackName:'Evolution'}},
      {playerSlot:0,actionOrdinal:10,turnBefore:4,action:'PassTurnAction'}
    ],
    cardsPlayedBySeat:[
      {'Tag Call CEC':1,'Guzma & Hala CEC':1,
        'Technical Machine: Evolution PAR':1,
        'Jet Energy PAL':1},
      {}
    ],
    attackDeclarationTrace:[
      {playerSlot:1,turnBefore:2,actionOrdinal:4,
        triggerAction:'AttackAction',attackName:'Evolution'},
      {playerSlot:0,turnBefore:4,actionOrdinal:9,
        triggerAction:'ResolvePromptAction',attackName:'Evolution'},
      {playerSlot:0,turnBefore:7,actionOrdinal:19,
        triggerAction:'AttackAction',attackName:'Burrow'}
    ]
  };
  const p=rootPolicyTrace(game,0);
  assert.equal(p.rootActions,4);
  assert.deepEqual(p.cardsPlayed,{
    'Tag Call':1,'Guzma & Hala':1,
    'Technical Machine: Evolution':1,'Jet Energy':1,'Grand Tree':0
  });
  assert.equal(p.evolutionRootDecisions.length,2);
  assert.deepEqual(p.evolutionRootDecisions.map(r=>r.actionOrdinal),[8,9]);
  assert.deepEqual(p.nativeSourceAttackDeclarations,{
    total:2,evolutionAnnouncements:1,
    firstEvolution:{turn:4,actionOrdinal:9,triggerAction:'ResolvePromptAction'},
    attackNames:{Burrow:1,Evolution:1},
    scope:'Native Store attack declarations only; not printed-effect completion'
  });
});
