'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {actionSignature,summarize,digest}=
  require('../simulation/twinleaf/hood-rank8-stone-policy-contrast.cjs');

test('source comparison uses stable ordered action signatures with explicit seat',()=>{
  const row={action:'UseAbilityAction',playerSlot:1,ability:'Star Alchemy'};
  assert.equal(actionSignature(row),'UseAbilityAction|1|||Star Alchemy');
  assert.notEqual(actionSignature({...row,playerSlot:0}),actionSignature(row));
  assert.notEqual(actionSignature({...row,ability:'Underworld Door'}),
    actionSignature(row));
});

test('pure source report counts actual Star Alchemy root decisions separately from Tool attachment',()=>{
  const game={
    seed:1260748957,firstTurnSlot:0,verifiedByDrawLog:true,
    attachedToolPowerPolicy:true,policy:'+AttachedToolPowerCandidate-v1',
    finished:true,winner:1,actions:5,turns:3,prizesRemaining:[6,5],
    deckHashes:['a','b'],
    cardsPlayedBySeat:[{'Forest Seal Stone':1},{'Forest Seal Stone':1}],
    abilityTrace:[{name:'Underworld Door'},{name:'Star Alchemy'}],
    attackTrace:[{seat:0},{seat:1},{seat:1}],
    decisionTrace:[
      {actionOrdinal:0,action:'PlayCardAction',playerSlot:0,card:'Forest Seal Stone'},
      {actionOrdinal:1,action:'UseAbilityAction',playerSlot:1,ability:'Star Alchemy',
        turnBefore:2},
      {actionOrdinal:2,action:'UseAbilityAction',playerSlot:1,ability:'Underworld Door',
        turnBefore:2}
    ]
  };
  const s=summarize(game);
  assert.deepEqual(s.stonePlaysBySeat,[1,1]);
  assert.equal(s.starAlchemyRootActions.length,1);
  assert.equal(s.starAlchemyRootActions[0].ordinal,1);
  assert.equal(s.starAlchemyRootActions[0].physicalSeat,1);
  assert.equal(s.abilityTraceStarCount,1);
  assert.deepEqual(s.attacksBySeat,[1,2]);
  assert.equal(s.fullActionAndPromptReplay,false);
  assert.equal(s.decisionSignatures.length,3);
  assert.match(digest(s),/^[0-9a-f]{64}$/);
});

test('empty action stream never fabricates a Star Alchemy opportunity',()=>{
  const s=summarize({cardsPlayedBySeat:[{},{}],
    abilityTrace:[],attackTrace:[],decisionTrace:[]});
  assert.deepEqual(s.stonePlaysBySeat,[0,0]);
  assert.deepEqual(s.starAlchemyRootActions,[]);
  assert.equal(s.abilityTraceStarCount,0);
});
