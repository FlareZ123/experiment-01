'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withOriginal120Custody,VERSION}=
  require('../simulation/evaluation/agent5-rank9-original120-custody-pair.cjs');

/** @returns {object} Already-enabled native physical settled-root gate. */
function request(){return {
  capturePhysicalZoneIntegrity:true,
  enforceSettledPhysicalZoneIntegrity:true,
  captureOriginalOwnerIntegrity:false,seed:12345
};}

test('read-only native request is enhanced without mutating caller options',()=>{
  const native={runMatch(req){return {physicalZoneIntegrity:{
    originalOwnerCustodyRequested:req.captureOriginalOwnerIntegrity,
    originalOwnerCardCount:120,settledRootsChecked:3,
    settledRootsWithAnomaly:0,firstSettledRootAnomaly:null}};}};
  const original=native.runMatch,input=request();
  const audit=withOriginal120Custody(()=>native.runMatch(input),{headless:native});
  assert.strictEqual(native.runMatch,original);
  assert.equal(input.captureOriginalOwnerIntegrity,false);
  assert.equal(audit.result.physicalZoneIntegrity.originalOwnerCustodyRequested,true);
  assert.equal(audit.audit.attempts,1);
  assert.equal(audit.audit.receipts[0].originalOwnerCardCount,120);
  assert.equal(audit.audit.receipts[0].settledRootsWithAnomaly,0);
  assert.equal(audit.audit.schema,VERSION);
});

test('reject absent preexisting settled custody gate before running native',()=>{
  const native={runMatch(){throw new Error('must never execute');}};
  const original=native.runMatch;
  assert.throws(()=>withOriginal120Custody(()=>native.runMatch({
    capturePhysicalZoneIntegrity:true,
    enforceSettledPhysicalZoneIntegrity:false
  }),{headless:native}),/settled-root physical gate/);
  assert.strictEqual(native.runMatch,original);
});

test('physical invalidity propagates while native export is restored',()=>{
  const error=Object.assign(new Error('physical invalid'),{
    code:'TWINLEAF_SETTLED_PHYSICAL_60_VIOLATION',
    physicalConservationWitness:{actionOrdinal:19}
  });
  const native={runMatch(){throw error;}},original=native.runMatch;
  assert.throws(()=>withOriginal120Custody(()=>native.runMatch(request()),{
    headless:native
  }),err=>err===error);
  assert.strictEqual(native.runMatch,original);
});

test('multi-attempt order retained without changing chosen action policy',()=>{
  let calls=0;
  const native={runMatch(req){calls++;
    return {physicalZoneIntegrity:{
      originalOwnerCustodyRequested:req.captureOriginalOwnerIntegrity,
      originalOwnerCardCount:120,settledRootsChecked:calls,
      settledRootsWithAnomaly:0,firstSettledRootAnomaly:null}};
  }};
  const result=withOriginal120Custody(()=>[
    native.runMatch(request()),native.runMatch(request())
  ],{headless:native});
  assert.equal(result.audit.receipts.length,2);
  assert.deepEqual(result.audit.receipts.map(x=>x.settledRootsChecked),[1,2]);
  assert.equal(result.audit.policyAltered,false);
  assert.equal(result.audit.ownerFactsPassedToPolicy,false);
  assert.equal(result.audit.competitivelyQualifiedGames,0);
});
