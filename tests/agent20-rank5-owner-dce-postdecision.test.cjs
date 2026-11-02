'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {auditOwnerDce,isDce}=require(
  '../simulation/evaluation/agent20-rank5-owner-dce-postdecision.cjs');

test('counts exact source-owned postselection DCE with correct native ledger',()=>{
  const hand=(seat,x)=>({
    perspectiveSeat:seat,ownHandPrintings:x});
  const roots=[
    {actionOrdinal:0,playerSlot:1,action:'PlayCardAction'},
    {actionOrdinal:1,playerSlot:0,action:'PassTurnAction'},
    {actionOrdinal:2,playerSlot:1,action:'PassTurnAction'}];
  const decisions=[
    {actionOrdinal:0,playerSlot:1,turnBefore:3,
      action:'PlayCardAction',card:'Genesect V',
      decisionHandBefore:hand(1,['Genesect V FST','Double Colorless Energy SUM'])},
    {actionOrdinal:1,playerSlot:0,turnBefore:4,
      action:'PassTurnAction',
      decisionHandBefore:hand(0,['Double Colorless Energy SUM'])},
    {actionOrdinal:2,playerSlot:1,turnBefore:5,
      action:'PassTurnAction',
      decisionHandBefore:hand(1,['Double Colorless Energy SUM'])}];
  const r=auditOwnerDce(decisions,roots,1);
  assert.equal(r.observedOwnerActions,2);
  assert.equal(r.passesWithDce,1);
  assert.equal(r.heldEvents.length,2);
  assert.equal(r.acceptedDcePlays,0);
});

test('card printing filter and ownership reject invalid state',()=>{
  assert.equal(isDce('Double Colorless Energy SUM'),true);
  assert.equal(isDce('Double Dragon Energy ROS'),false);
  const d={actionOrdinal:0,turnBefore:2,playerSlot:0,
    action:'PassTurnAction',
    decisionHandBefore:{perspectiveSeat:1,ownHandPrintings:[]}};
  assert.throws(()=>auditOwnerDce([d],[{
    actionOrdinal:0,playerSlot:0,action:'PassTurnAction'}],0));
});
