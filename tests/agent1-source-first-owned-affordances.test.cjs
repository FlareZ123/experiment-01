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
