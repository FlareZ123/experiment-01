'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditRow,run}=
  require('../simulation/evaluation/agent4-rank6-underworld-visible-guard-holdout-16.cjs');
const REG=require('../results/aichi-2026/registrations/agent4-rank6-underworld-visible-guard-holdout-16-v1-20261106.json');
const {manifestWithDriftAudit}=
  require('../simulation/evaluation/agent4-v3-two-unknown-power-readout.cjs');
function stub(overrides={}){
  let count=0;
  return run({
    runtime:fn=>fn(),
    typed:fn=>({result:fn(),audit:{liveGameCount:8,abilityActions:[]}}),
    guard:fn=>({result:fn(),audit:{provenVetoes:2,
      onlyDetatchedOwnerView:true,readsOpponentHidden:false,
      readsDeckOrPrizes:false}}),
    native:opts=>{
      assert.equal(opts.registeredTrials.length,8);
      const treatment=count++===1;
      return {attempted:8,rows:opts.registeredTrials.map((trial,i)=>({
        trial,finished:false,status:treatment?null:(i===0?'engine-error':null),
        fullPhysicalDealFingerprint:overrides.mismatch&&treatment&&i===0?
          'divergent':'whole'+i,
        sourceDealFingerprint:'source'+i,
        rootActionLedger:[{actionOrdinal:0,action:'PassTurnAction'}],
        nativeAbortEvidence:null
      }))};
    }
  });
}
test('true seeded 4 source groups preserve two candidate IDs per draw',()=>{
  assert.equal(REG.predeclaredTrials.length,8);
  assert.equal(new Set(REG.seedDraws).size,4);
  assert.deepEqual(REG.predeclaredTrials.map(x=>x.candidateId)
    .filter(x=>x==='champion-reference').length,4);
  assert.equal(REG.predeclaredTrials[0].seed,2562060802);
});
test('native holdout score fails closed and never promotes wins',()=>{
  const x=stub();
  assert.ok(Object.values(x.gates).every(Boolean));
  assert.equal(x.nativeGamesAttempted,16);
  assert.equal(x.pairs.length,8);
  assert.equal(x.nativeControlErrors,1);
  assert.equal(x.qualifiedPaperGames,0);
  assert.equal(x.fullFieldWinRate,null);
  assert.equal(x.publicPolicyGuardAudit.guard.provenVetoes,2);
});
test('mismatched deal rejected by holdout source parity gate',()=>{
  const x=stub({mismatch:true});
  assert.equal(x.gates.sameSourceAndFullPhysicalDeals,false);
  assert.equal(x.qualifiedPaperGames,0);
});
test('native attempt root and error class never emit concealed cards',()=>{
  const row=auditRow({
    trial:{id:'a'},status:'engine-error',nativeAbortEvidence:{
      actionName:'UseAbilityAction',turnBefore:3,actionOrdinal:22,
      rootActionCount:22,sourceDealFingerprint:'a',fullPhysicalDealFingerprint:'b',
      preDispatchPrivateHiddenHand:['PRIVATE'],errorMessage:'text'
    }
  },[{name:'Underworld Door',rejection:'UNKNOWN_POWER'}]);
  assert.equal(row.typedUnderworldUnknownPowerRejections,1);
  assert.equal(row.acceptedNativeRoots,22);
  assert.equal(row.preDispatchPrivateHiddenHand,undefined);
  assert.equal(row.paperQualifiedGame,false);
});
