'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {boxShakeOpponentReplyPacket:packet}=
  require('../simulation/evaluation/agent44-boxshake-opponent-reply-packet.cjs');

const source=[
  {actionOrdinal:11,turnBefore:1,playerSlot:0,
    action:'PlayCardAction',card:'Secret Box',pendingPrompt:null},
  {actionOrdinal:12,turnBefore:1,playerSlot:0,
    action:'ResolvePromptAction',pendingPrompt:'ChooseCardsPrompt'},
  {actionOrdinal:13,turnBefore:1,playerSlot:0,
    action:'PlayCardAction',card:'Trubbish',pendingPrompt:null},
  {actionOrdinal:14,turnBefore:1,playerSlot:0,
    action:'PlayCardAction',card:'Float Stone',pendingPrompt:null},
  {actionOrdinal:15,turnBefore:1,playerSlot:0,
    action:'PlayCardAction',card:'Boost Shake',pendingPrompt:null},
  {actionOrdinal:16,turnBefore:1,playerSlot:0,
    action:'ResolvePromptAction',pendingPrompt:'ChoosePokemonPrompt'},
  {actionOrdinal:17,turnBefore:2,playerSlot:1,
    action:'PlayCardAction',card:'Stealthy Hood',pendingPrompt:null},
  {actionOrdinal:18,turnBefore:2,playerSlot:1,
    action:'PassTurnAction',pendingPrompt:null},
  {actionOrdinal:19,turnBefore:3,playerSlot:0,
    action:'AttackAction',attack:'Claw of Darkness',pendingPrompt:null}
];
const audit={
  offers:[{seat:0,turn:1}],
  opponentContinuations:[{sourceSeat:0,turn:2,equippedGarbodor:true}]
};
test('accepted source Tool Garbodor and first opponent chronological roots',()=>{
  const x=packet({rootActionLedger:source},audit,0);
  assert.equal(x.strictPublicContinuationAccepted,true);
  assert.equal(x.sourceActionOrderValid,true);
  assert.equal(x.opponentRootCount,2);
  assert.equal(x.sourceBoxRootOrdinal,11);
  assert.equal(x.sourceShakeRootOrdinal,15);
  assert.deepEqual(x.opponentPublicRoots.map(row=>row.action),
    ['PlayCardAction','PassTurnAction']);
  assert.deepEqual(x.sourceNextTurnAttackNames,
    [{turn:3,attack:'Claw of Darkness'}]);
});
test('prompt-only native roots do not count as opposing actor decisions',()=>{
  const game={rootActionLedger:source.filter(row=>
    !(row.playerSlot===1&&row.pendingPrompt===null))};
  const x=packet(game,audit,0);
  assert.equal(x.opponentRootCount,0);
  assert.equal(x.strictPublicContinuationAccepted,false);
});
test('wrong turn, incomplete Tool or source failure never credit strict reply',()=>{
  const late={...audit,
    opponentContinuations:[{sourceSeat:0,turn:4,equippedGarbodor:true}]};
  assert.equal(packet({rootActionLedger:source},late,0)
    .strictPublicContinuationAccepted,false);
  const noTool={rootActionLedger:source.filter(row=>
    row.card!=='Float Stone')};
  assert.equal(packet(noTool,audit,0)
    .strictPublicContinuationAccepted,false);
  const failed={...audit,
    opponentContinuations:[{sourceSeat:0,turn:2,equippedGarbodor:false}]};
  assert.equal(packet({rootActionLedger:source},failed,0)
    .strictPublicContinuationAccepted,false);
});
test('same packet applies to reversed physical source seat',()=>{
  const inverted=source.map(row=>({...row,playerSlot:1-row.playerSlot}));
  const a={offers:[{seat:1,turn:1}],
    opponentContinuations:[{sourceSeat:1,turn:2,equippedGarbodor:true}]};
  const x=packet({rootActionLedger:inverted},a,1);
  assert.equal(x.strictPublicContinuationAccepted,true);
  assert.equal(x.opponentPublicRoots[0].card,'Stealthy Hood');
});
