'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {sourceFirstOwnedAffordances, NAMES}=
  require('../simulation/evaluation/agent1-source-first-owned-affordances.cjs');

/** @param {number} seat @param {number} turn @param {number} ordinal
 * @param {string} action @param {string[]} hand @param {string|null} card */
function row(seat,turn,ordinal,action,hand,card=null){
  return {playerSlot:seat,turnBefore:turn,actionOrdinal:ordinal,action,
    ...(card?{card}:{}),decisionHandBefore:{perspectiveSeat:seat,
      ownHandPrintings:hand,opponentHandSize:7}};
}

test('rank6 source first owner-hand Speed is visible and redacted',()=>{
  const trace=[row(1,1,1,'PlayCardAction',
    ['Speed Lightning Energy RCL','Iron Thorns ex TWM'],'Speed Lightning Energy'),
  row(1,1,2,'PassTurnAction',['Iron Thorns ex TWM'])];
  const a=sourceFirstOwnedAffordances(trace,1,true);
  assert.equal(a.status,'observed');
  assert.equal(a.firstOwnHand.resources['Speed Lightning Energy'],1);
  assert.equal(a.terminalPassOwnHand.resources['Speed Lightning Energy'],0);
  assert.deepEqual(a.playedResources,[{ordinal:1,name:'Speed Lightning Energy'}]);
  assert.equal(JSON.stringify(a).includes('Iron Thorns ex'),false);
});

test('rank11 source first unique held VIP and Quick Ball despite pass',()=>{
  const a=sourceFirstOwnedAffordances([
    row(0,1,8,'PassTurnAction',['Battle VIP Pass FST','Quick Ball FST',
      'Boost Shake EVS','Garbodor BKP'])],0,true);
  assert.equal(a.status,'observed');
  assert.equal(a.firstOwnHand.handSize,4);
  assert.equal(a.terminalPassOwnHand.resources['Quick Ball'],1);
  assert.equal(a.terminalPassOwnHand.resources['Battle VIP Pass'],1);
  assert.equal(a.firstOwnHand.resources['Boost Shake'],1);
  assert.equal(a.firstOwnHand.resources['Carmine'],0);
});

test('actual source second uses global second turn, ignores foreign hand',()=>{
  const a=sourceFirstOwnedAffordances([
    row(1,1,1,'PassTurnAction',['Carmine TWM']),
    row(0,2,2,'PlayCardAction',['Carmine TWM'],'Carmine'),
    row(0,2,3,'PassTurnAction',[])],0,false);
  assert.equal(a.sourceFirstOwnTurn,2);
  assert.equal(a.firstOwnHand.resources.Carmine,1);
  assert.equal(a.terminalPassOwnHand.resources.Carmine,0);
  assert.equal(a.sourceTurnRootCount,2);
});

test('missing owner-trace source pass fails closed without a claimed opportunity',()=>{
  const a=sourceFirstOwnedAffordances([row(0,1,2,'PlayCardAction',
    ['Quick Ball FST'],'Quick Ball')],0,true);
  assert.equal(a.status,'incomplete');
  assert.equal(a.terminalPassOwnHand,null);
});

test('opponent-side decision cannot supply a source hand',()=>{
  const a=sourceFirstOwnedAffordances([
    row(1,1,1,'PassTurnAction',['Carmine TWM'])],0,true);
  assert.equal(a.status,'incomplete');
  assert.equal(a.firstOwnHand,null);
});

test('reject invalid physical source seats and unverified starting-status type',()=>{
  assert.throws(()=>sourceFirstOwnedAffordances([],2,true));
  assert.throws(()=>sourceFirstOwnedAffordances([],0,null));
  assert.equal(new Set(NAMES).size,NAMES.length);
});


test('successful Boost Shake turn-ending effect has observed first hand but no separate Pass',()=>{
  const trace=[
    row(1,2,12,'PlayCardAction',['Trubbish FST','Boost Shake EVS',
      'Float Stone PLF'],'Trubbish'),
    row(1,2,13,'PlayCardAction',['Boost Shake EVS',
      'Float Stone PLF'],'Float Stone'),
    row(1,2,14,'PlayCardAction',['Boost Shake EVS'],
      'Boost Shake')
  ];
  const accepted=[
    {actionOrdinal:12,playerSlot:1,turnBefore:2,turnAfter:2,
      action:'PlayCardAction',card:'Trubbish'},
    {actionOrdinal:13,playerSlot:1,turnBefore:2,turnAfter:2,
      action:'PlayCardAction',card:'Float Stone'},
    {actionOrdinal:14,playerSlot:1,turnBefore:2,turnAfter:2,
      action:'PlayCardAction',card:'Boost Shake'},
    {actionOrdinal:15,playerSlot:1,turnBefore:2,turnAfter:2,
      action:'ResolvePromptAction',initiatingRootActionOrdinal:14},
    {actionOrdinal:16,playerSlot:1,turnBefore:2,turnAfter:3,
      action:'ResolvePromptAction',initiatingRootActionOrdinal:14}
  ];
  const a=sourceFirstOwnedAffordances(trace,1,false,accepted);
  assert.equal(a.status,'observed');
  assert.equal(a.schema,'agent1-source-first-owned-affordances-v2');
  assert.equal(a.terminalKind,'native-nonpass-turn-end');
  assert.deepEqual(a.nativeTurnClosure,{
    ordinal:16,action:'ResolvePromptAction',initiatingRootActionOrdinal:14
  });
  assert.equal(a.firstRootAction,'PlayCardAction');
  assert.equal(a.firstOwnHand.resources['Boost Shake'],1);
  assert.equal(a.firstOwnHand.resources['Trubbish'],1);
  assert.equal(a.terminalPassOwnHand,null);
  assert.equal(a.sourceFirstOwnTurn,2);
});

test('without accepted roots, Boost Shake appearance cannot certify turn closure',()=>{
  const trace=[row(0,2,3,'PlayCardAction',['Boost Shake EVS'],'Boost Shake')];
  const a=sourceFirstOwnedAffordances(trace,0,false);
  assert.equal(a.status,'incomplete');
  assert.equal(a.terminalKind,null);
  assert.equal(a.nativeTurnClosure,null);
});

test('native source terminal rejects another seat, wrong turn, and bare Pass',()=>{
  const trace=[row(0,1,3,'PlayCardAction',['Quick Ball FST'],'Quick Ball')];
  const invalid=[
    {actionOrdinal:3,playerSlot:0,turnBefore:1,turnAfter:1,action:'PlayCardAction'},
    {actionOrdinal:4,playerSlot:1,turnBefore:1,turnAfter:2,action:'ResolvePromptAction'},
    {actionOrdinal:5,playerSlot:0,turnBefore:2,turnAfter:3,action:'AttackAction'},
    {actionOrdinal:6,playerSlot:0,turnBefore:1,turnAfter:2,action:'PassTurnAction'}
  ];
  const a=sourceFirstOwnedAffordances(trace,0,true,invalid);
  assert.equal(a.status,'incomplete');
  assert.equal(a.nativeTurnClosure,null);
});

test('native next-turn witness cannot be spliced across an epoch reset',()=>{
  const trace=[row(0,1,3,'PlayCardAction',['Boost Shake EVS'],'Boost Shake')];
  const native=[
    {actionOrdinal:3,playerSlot:0,turnBefore:1,turnAfter:1,action:'PlayCardAction'},
    {actionOrdinal:4,playerSlot:0,turnBefore:1,turnAfter:1,action:'ResolvePromptAction'},
    {actionOrdinal:5,playerSlot:1,turnBefore:2,turnAfter:0,action:'ResolvePromptAction'},
    {actionOrdinal:6,playerSlot:0,turnBefore:1,turnAfter:2,action:'ResolvePromptAction'}
  ];
  const a=sourceFirstOwnedAffordances(trace,0,true,native);
  assert.equal(a.status,'incomplete');
});

test('native clock without an owner-private first decision remains unobserved',()=>{
  const a=sourceFirstOwnedAffordances([],1,false,[
    {actionOrdinal:9,playerSlot:1,turnBefore:2,turnAfter:3,
      action:'AttackAction'}
  ]);
  assert.equal(a.status,'incomplete');
  assert.equal(a.firstOwnHand,null);
});

test('ordinary Pass retains the actual pre-Pass hand rather than native inference',()=>{
  const trace=[row(0,1,2,'PassTurnAction',['Battle VIP Pass FST'])];
  const a=sourceFirstOwnedAffordances(trace,0,true,[
    {actionOrdinal:2,playerSlot:0,turnBefore:1,turnAfter:2,
      action:'PassTurnAction'}
  ]);
  assert.equal(a.status,'observed');
  assert.equal(a.terminalKind,'pass');
  assert.equal(a.terminalPassOwnHand.resources['Battle VIP Pass'],1);
  assert.equal(a.nativeTurnClosure,null);
});

test('native argument must be a root array',()=>{
  assert.throws(()=>sourceFirstOwnedAffordances([],0,true,null));
});
