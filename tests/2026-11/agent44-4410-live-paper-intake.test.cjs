'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {registration,receiptAlignment}=require('../../simulation/evaluation/2026-11/agent44-first-original-rank5-newmoon-case.cjs');

const ROOT=path.resolve(__dirname,'../..');
const RAW_SCHEMA='agent36-live-paper-root-receipts-v2-attached-energy-custody';

test('frozen 4410 registration remains unchanged and is the V2 release producer',()=>{
  const {reg,registrationSha256}=registration();
  assert.equal(reg.schema,'agent44-first-independent-review-case-registration-v1');
  assert.equal(reg.caseId,'agent44-20261109-original-rank5-newmoon-fresh-4410B');
  assert.equal(reg.preRegisteredTrials.length,1);
  assert.equal(reg.preRegisteredTrials[0].id,'5:4410:B:new-moon-lockbreaker-v1');
  assert.equal(reg.preRegisteredTrials[0].seed,3861605836);
  assert.equal(reg.nativeRootCap,320);
  assert.equal(reg.enginePinnedCommit,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(registrationSha256.length,64);
});

test('4410 producer receipt alignment matches the V2 builder's exact join contract',()=>{
  const roots=[{actionOrdinal:0,playerSlot:0,action:'PlayCardAction'},
    {actionOrdinal:1,playerSlot:1,action:'AttackAction'}];
  const raw={schema:RAW_SCHEMA,
    originalPhysicalCards:Array.from({length:120},(_,i)=>({id:String(i)})),
    acceptedStoreRootCount:2,rootOrdinalsUnique:true,settledPhysicalIdentityClean:true,
    rejectedDispatches:[],receipts:[
      {actionOrdinal:0,seat:0,action:'PlayCardAction'},
      {actionOrdinal:1,seat:1,action:'AttackAction'}]};
  assert.deepEqual(receiptAlignment(roots,raw),{
    schema:true,originalPhysicalCardCount:120,ledgerCount:2,receiptCount:2,
    acceptedStoreRootCount:2,rootCountMatches:true,exactOrdinalSeatActionParity:true,
    rootOrdinalsUnique:true,settledPhysicalIdentityClean:true,
    rejectedDispatchCount:0,complete:true
  });
});

test('4410 producer receipt alignment fails closed on any physical or ordinal gap',()=>{
  const roots=[{actionOrdinal:0,playerSlot:0,action:'PlayCardAction'},
    {actionOrdinal:1,playerSlot:1,action:'AttackAction'}];
  const raw={schema:RAW_SCHEMA,
    originalPhysicalCards:Array.from({length:120},(_,i)=>({id:String(i)})),
    acceptedStoreRootCount:2,rootOrdinalsUnique:true,settledPhysicalIdentityClean:true,
    rejectedDispatches:[],receipts:[
      {actionOrdinal:0,seat:0,action:'PlayCardAction'},
      {actionOrdinal:1,seat:1,action:'AttackAction'}]};
  assert.equal(receiptAlignment(roots,{...raw,acceptedStoreRootCount:1}).complete,false);
  assert.equal(receiptAlignment(roots,{...raw,receipts:[raw.receipts[1],raw.receipts[0]]}).complete,false);
  assert.equal(receiptAlignment(roots,{...raw,receipts:[raw.receipts[0],{...raw.receipts[1],action:'PlayCardAction'}]}).complete,false);
  assert.equal(receiptAlignment(roots,{...raw,rootOrdinalsUnique:false}).complete,false);
  assert.equal(receiptAlignment(roots,{...raw,settledPhysicalIdentityClean:false}).complete,false);
  assert.equal(receiptAlignment(roots,{...raw,originalPhysicalCards:raw.originalPhysicalCards.slice(1)}).complete,false);
});

test('4410 intake exposes registration pointer, runtime revision and exact builder parity object',()=>{
  const source=fs.readFileSync(path.join(ROOT,'simulation/evaluation/2026-11/agent44-first-original-rank5-newmoon-case.cjs'),'utf8');
  assert.match(source,/registrationRef:REGPATH/);
  assert.match(source,/researchRevisionSha:process\.env\.GITHUB_SHA/);
  assert.match(source,/rootReceiptAlignment,/);
  assert.match(source,/const rawNativeReceiptCaptureComplete=rootReceiptAlignment\.complete/);
  assert.match(source,/actualEngineCommit,reg\.enginePinnedCommit/);
});

test('V2 builder and fixture target the frozen 4410 producer, never held 4411',()=>{
  const builder=fs.readFileSync(path.join(ROOT,
    'simulation/evaluation/2026-11/agent44-first-release-independent-bundle.cjs'),'utf8');
  const builderTest=fs.readFileSync(path.join(__dirname,
    'agent45-agent44-v2-bundle-builder.test.cjs'),'utf8');
  assert.match(builder,/const REFERENCE='agent44-first-independent-rank5-newmoon-case-v2\\.json'/);
  assert.match(builder,/original\\.registration\\.schema,'agent44-first-independent-review-case-registration-v1'/);
  assert.match(builder,/original\\.intake\\.caseId,'agent44-20261109-original-rank5-newmoon-fresh-4410B'/);
  assert.match(builder,/registrationRef:\\s*'results\\/aichi-2026\\/registrations\\/agent44-first-original-rank5-newmoon-case-20261109\\.json'/);
  assert.match(builderTest,/const TRIAL='5:4410:B:new-moon-lockbreaker-v1'/);
  assert.match(builder,/settledPhysicalIdentityClean/);
  assert.match(builder,/acceptedStoreRootCount/);
  assert.match(builder,/original\\.intake\\.runtime\\?\\.researchRevisionSha/);
  assert.ok(builder.includes('clockReceiptInput'),
    'V2 bundle must accept externally supplied official clock evidence; absent input stays null');
  for(const field of [
    'nativePromptChoices','policyAudit','sourceAudit','supporterModalEvidence',
    'ownerSupporterOpportunityAudit','ownerCompressorOpportunityAudit',
    'candidateRepliesAfterSourceAttacks','candidateAttackSettlement',
    'sourceAttackSettlement','nativeAttackModalityLedger','nativeAttackPhysicalTape',
    'firstSettledPublicAttack','finalBoard','finalPrizes'
  ]) assert.ok(builder.includes(field),`V2 signed evidence envelope must bind ${field}`);
});
