'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {MARNIE,chooseMailSelectedMarnie}=
  require('../../simulation/twinleaf/agent38-owner-mail-selected-marnie.cjs');

function view(overrides={}){
  return {decisionKind:'owner-root',globalTurn:2,
    ownHand:['Marnie SSH','Power Tablet FST'],
    ownTurnResources:{supporterPlayLocked:false,supporterPlayedTurn:0},
    ownPublic:{publicTurnRestrictions:{}},...overrides};
}
test('only an owner Mail-proven physical Marnie in held hand can use supporter slot',()=>{
  assert.deepEqual(chooseMailSelectedMarnie(view(),[0]),{
    kind:'play-physically-mail-selected-marnie',
    handIndex:0,printing:MARNIE
  });
  assert.equal(chooseMailSelectedMarnie(view(),[1]),null);
  assert.equal(chooseMailSelectedMarnie(view(),[]),null);
  assert.equal(chooseMailSelectedMarnie(view(),[-1,99]),null);
  assert.equal(chooseMailSelectedMarnie(view({ownHand:['Power Tablet FST',MARNIE]}),[0]),null);
  assert.deepEqual(chooseMailSelectedMarnie(
    view({ownHand:['Power Tablet FST',MARNIE]}),[1]).handIndex,1);
});
test('reject paid or locked Supporter, wrong player turn, and nonowner evidence',()=>{
  assert.equal(chooseMailSelectedMarnie(view({globalTurn:1}),[0]),null);
  assert.equal(chooseMailSelectedMarnie(view({
    ownTurnResources:{supporterPlayLocked:true,supporterPlayedTurn:0}
  }),[0]),null);
  assert.equal(chooseMailSelectedMarnie(view({
    ownTurnResources:{supporterPlayLocked:false,supporterPlayedTurn:1}
  }),[0]),null);
  assert.equal(chooseMailSelectedMarnie(view({
    ownPublic:{publicTurnRestrictions:{supporterPlayLocked:true}}
  }),[0]),null);
  assert.throws(()=>chooseMailSelectedMarnie(
    view({decisionKind:'opponent-root'}),[0]),/owner-root/);
});
