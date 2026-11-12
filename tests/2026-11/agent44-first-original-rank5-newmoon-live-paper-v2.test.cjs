'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {registration,receiptAlignment}=require('../../simulation/evaluation/2026-11/agent44-first-original-rank5-newmoon-live-paper-v2.cjs');

const SCHEMA='agent36-live-paper-root-receipts-v2-attached-energy-custody';

test('fresh V2 case registration is frozen before execution and pins exact trial',()=>{
  const {reg,registrationSha256,sourcePrintedInventorySha256,candidatePrintedInventorySha256}=registration();
  assert.equal(reg.caseId,'agent44-20261112-original-rank5-newmoon-livepaper-v2-2163320309');
  assert.equal(registrationSha256.length,64);
  assert.equal(reg.preRegisteredTrials.length,1);
  assert.equal(reg.preRegisteredTrials[0].id,'5:4411:B:new-moon-lockbreaker-v1');
  assert.equal(reg.preRegisteredTrials[0].seed,2163320309);
  assert.equal(reg.preRegisteredTrials[0].repeat,4411);
  assert.equal(reg.nativeRootCap,320);
  assert.equal(reg.enginePinnedCommit,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(reg.fullRootReceiptSchema,SCHEMA);
  assert.equal(reg.sourceExactJapanesePrintingsVerified,false);
  assert.equal(reg.candidateExactJapanesePrintingsVerified,false);
  assert.equal(sourcePrintedInventorySha256.length,64);
  assert.equal(candidatePrintedInventorySha256.length,64);
});

test('V2 receipts require 120 physical cards and exact root ordinal, actor and action parity',()=>{
  const roots=[{actionOrdinal:0,playerSlot:0,action:'PlayCardAction'},
    {actionOrdinal:1,playerSlot:1,action:'AttackAction'}];
  const paper={schema:SCHEMA,originalPhysicalCards:Array.from({length:120},(_,i)=>({id:String(i)})),
    acceptedStoreRootCount:2,rootOrdinalsUnique:true,settledPhysicalIdentityClean:true,
    rejectedDispatches:[],receipts:[
      {actionOrdinal:0,seat:0,action:'PlayCardAction'},
      {actionOrdinal:1,seat:1,action:'AttackAction'}]};
  const result=receiptAlignment(roots,paper);
  assert.equal(result.complete,true);
  assert.equal(result.exactOrdinalSeatActionParity,true);
  assert.equal(result.rootCountMatches,true);
});

test('V2 receipt alignment fails closed on missing, reordered, mismatched or dirty roots',()=>{
  const roots=[{actionOrdinal:0,playerSlot:0,action:'PlayCardAction'},
    {actionOrdinal:1,playerSlot:1,action:'AttackAction'}];
  const good={schema:SCHEMA,originalPhysicalCards:Array.from({length:120},(_,i)=>({id:String(i)})),
    acceptedStoreRootCount:2,rootOrdinalsUnique:true,settledPhysicalIdentityClean:true,
    rejectedDispatches:[],receipts:[
      {actionOrdinal:0,seat:0,action:'PlayCardAction'},
      {actionOrdinal:1,seat:1,action:'AttackAction'}]};
  assert.equal(receiptAlignment(roots,{...good,receipts:[{actionOrdinal:0,seat:0,action:'PlayCardAction'}]}).complete,false);
  assert.equal(receiptAlignment(roots,{...good,receipts:[good.receipts[1],good.receipts[0]]}).complete,false);
  assert.equal(receiptAlignment(roots,{...good,receipts:[good.receipts[0],{...good.receipts[1],seat:0}]}).complete,false);
  assert.equal(receiptAlignment(roots,{...good,rootOrdinalsUnique:false}).complete,false);
  assert.equal(receiptAlignment(roots,{...good,settledPhysicalIdentityClean:false}).complete,false);
  assert.equal(receiptAlignment(roots,{...good,schema:'agent36-live-paper-root-receipts-v1'}).complete,false);
});
