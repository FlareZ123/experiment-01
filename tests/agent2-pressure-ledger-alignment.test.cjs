'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {pressureEvidence}=require('../simulation/evaluation/agent2-bilateral-unconditional-census.cjs');

/** @returns {object} Fixture with a physical source actor at seat 1. */
function rowFixture(){
  const roots=Array.from({length:30},(_,i)=>({
    actionOrdinal:i,playerSlot:i===10||i===12?1:0,
    turnBefore:i===10||i===12?2:1,action:'PlayCardAction'
  }));
  return {status:'engine-terminal',rootActionCount:30,rootActionLedger:roots,
    sourcePressure:{accepted:true,effectVerified:true,traceAuthenticated:true,
      actorSeat:1,rootActionOrdinal:10,completionOrdinal:12,
      turnBefore:2,completionTurnBefore:2}};
}

test('claimed source pressure is rejected when Store root actor or turn differs',()=>{
  const row=rowFixture();
  assert.equal(pressureEvidence(row,1),'verified-effect');
  row.rootActionLedger[10].playerSlot=0;
  assert.equal(pressureEvidence(row,1),'no-witness-in-terminal');
  row.rootActionLedger[10].playerSlot=1;
  row.rootActionLedger[12].turnBefore=3;
  assert.equal(pressureEvidence(row,1),'no-witness-in-terminal');
});

test('a neutral prompt close needs a linked source-owned originating root',()=>{
  const row=rowFixture();
  row.rootActionLedger[12]={actionOrdinal:12,playerSlot:-1,turnBefore:2,
    action:'ResolvePromptAction',initiatingRootActionOrdinal:10};
  assert.equal(pressureEvidence(row,1),'verified-effect');
  row.rootActionLedger[12].initiatingRootActionOrdinal=9;
  assert.equal(pressureEvidence(row,1),'no-witness-in-terminal');
  row.rootActionLedger[12].initiatingRootActionOrdinal=10;
  row.rootActionLedger.pop();
  assert.equal(pressureEvidence(row,1),'no-witness-in-terminal');
});

test('legacy rows without a root ledger remain descriptive producer assertions',()=>{
  const row=rowFixture();
  delete row.rootActionLedger;
  assert.equal(pressureEvidence(row,1),'verified-effect');
});
