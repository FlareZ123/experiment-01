'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {compareConservationNativePairs}=
  require('../simulation/evaluation/agent38-plumeria-cost-conservation-native-pair.cjs');

/** @param {boolean} conserve */
function fixture(conserve){
  return {
    validation:{passed:true},enginePin:'pinned-engine',
    registrationGitBlob:'frozen-registered-source',originalSourceSeed:296638747,
    actualNativeAttempts:4,competitiveQualifiedGames:0,
    paired:[0,1].map((n)=>({
      id:'source-original-'+n,sourceSeat:1,
      control:{
        rootActionLedgerSha256:'baseline-control-'+n,
        sourceDealFingerprint:'source-'+n,
        fullPhysicalDealFingerprint:'full-'+n
      },
      treatment:{
        rootActionLedgerSha256:conserve?'held-'+n:'paid-'+n,
        sourceDealFingerprint:'source-'+n,
        fullPhysicalDealFingerprint:'full-'+n,
        status:'censored',acceptedPlumeria:conserve?0:2,
        settledPhysicalEnergyDiscards:conserve?0:2,
        selectedPlumeriaOwnerRoots:[],physicalOwnerPayments:[],
        plumeriaCostConservationOptIn:conserve
      }
    }))
  };
}

test('same original native deals and exactly toggled root policy qualify comparison',()=>{
  const result=compareConservationNativePairs(fixture(false),fixture(true));
  assert.equal(result.validation.passed,true);
  assert.equal(result.nativeAttempts,8);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.equal(result.pairs.length,2);
  assert.ok(result.pairs.every(p=>p.matchedFullOriginalDeal&&
    p.controlRootLedgerUnchanged&&p.exactPolicyToggleWitness));
  assert.ok(result.pairs.every(p=>p.changedNativeRootLedger&&
    p.sourceRootPaymentSavings===2));
});

test('different exact printed physical deal must reject comparison',()=>{
  const guarded=fixture(true);
  guarded.paired[0].treatment.fullPhysicalDealFingerprint='different';
  const result=compareConservationNativePairs(fixture(false),guarded);
  assert.equal(result.validation.passed,false);
  assert.ok(result.validation.failures.some(x=>x.startsWith('physical-deal-drift:')));
});

test('silent policy toggle failure cannot be called a treatment',()=>{
  const guarded=fixture(true);
  guarded.paired[1].treatment.plumeriaCostConservationOptIn=false;
  const result=compareConservationNativePairs(fixture(false),guarded);
  assert.equal(result.validation.passed,false);
  assert.ok(result.validation.failures.some(x=>x.startsWith('missing-true-policy-toggle:')));
});

test('control action divergence rejects interpretation as isolated gate change',()=>{
  const guarded=fixture(true);
  guarded.paired[1].control.rootActionLedgerSha256='changed-bot-action';
  const result=compareConservationNativePairs(fixture(false),guarded);
  assert.equal(result.validation.passed,false);
  assert.ok(result.validation.failures.some(x=>x.startsWith('baseline-control-root-policy-drift:')));
});

test('missing treatment and competitive claims fail closed',()=>{
  const guarded=fixture(true);
  guarded.paired.pop();
  guarded.competitiveQualifiedGames=1;
  const result=compareConservationNativePairs(fixture(false),guarded);
  assert.equal(result.validation.passed,false);
  assert.ok(result.validation.failures.includes('incomplete-original-pairing'));
  assert.ok(result.validation.failures.includes('unexpected-competitive-game-claim'));
});
