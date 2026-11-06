'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,evidenceLedger,firstDifference,activation,audit}=
  require('../simulation/evaluation/agent10-abort-aware-aba-audit.cjs');

/** @param {number} ordinal @param {string} [action] @param {number} [seat] */
function root(ordinal,action='PassTurnAction',seat=1){
  return {actionOrdinal:ordinal,action,playerSlot:seat};
}

/** @param {string} id @param {object[]} ledger @param {object} [extra] */
function row(id,ledger,extra={}){
  return {
    trial:{id},sourceSeat:1,candidateSeat:0,
    sourceDealFingerprint:'source-sha',fullPhysicalDealFingerprint:'physical-sha',
    actualStarterSeat:0,rootActionLedger:ledger,
    status:'root-cap',finished:false,winner:null,error:null,
    ...extra
  };
}

/** @param {object[]} rows @param {boolean|undefined} installed */
function phase(rows,installed){
  const p={rows};
  if(typeof installed==='boolean')
    p.runtimeWrapperReceipt={
      origin:'live-scopedRoot-predicate',installed
    };
  return p;
}

/** @param {object} a @param {object} b @param {object} a2 @param {Array<boolean|undefined>} [install] */
function run(a,b,a2,install=[false,true,false]){
  return audit({
    trials:[{id:'t',sourceSeat:1}],
    phases:[phase([a],install[0]),phase([b],install[1]),
      phase([a2],install[2])]
  });
}

test('v1 exposes explicit non-qualification and recorded wrapper status',()=>{
  const a=row('t',[root(0),root(1)]);
  const b=row('t',[root(0),root(1,'RetreatAction')]);
  const result=run(a,b,a);
  assert.equal(result.version,VERSION);
  assert.equal(result.activationStatus,'B_WRAPPER_INSTALLATION_RECORDED');
  assert.equal(result.sourceRetreatDivergenceCandidates,1);
  assert.equal(result.rows[0].treatmentWitness,
    'SOURCE_RETREAT_DIVERGENCE_NEEDS_STORE_CUSTODY');
  assert.equal(result.verifiedStoreCustody,false);
  assert.equal(result.competitivelyQualifiedGames,0);
  assert.equal(result.rows[0].paperQualifiedGame,false);
});

test('native abort ledger is preserved and never called a complete game',()=>{
  const a=row('t',undefined,{status:'error',error:'quarantine',
    nativeAbortEvidence:{rootActionLedger:[root(0)]}});
  const result=run(a,a,a);
  assert.deepEqual(result.rows[0].ledgerOrigins,
    ['ABORT_PRESERVED','ABORT_PRESERVED','ABORT_PRESERVED']);
  assert.equal(result.censoredControlPrefixReplays,1);
  assert.equal(result.completedControlReplays,0);
  assert.equal(result.rows[0].controlReplay,'CENSORED_PREFIX_REPLAY');
  assert.equal(result.rows[0].treatmentWitness,'ACTIVE_NO_DIVERGENCE');
});

test('top-level and abort-preserved ledgers must agree when both exist',()=>{
  const a=row('t',[root(0)],{
    nativeAbortEvidence:{rootActionLedger:[root(1)]}});
  assert.equal(evidenceLedger(a).kind,'CONFLICTING_LEDGER_COPIES');
  assert.equal(run(a,a,a).rows[0].treatmentWitness,
    'MISSING_OR_CONFLICTING_LEDGER');
});

test('missing ledgers stay unknown rather than becoming empty ledgers',()=>{
  const a=row('t',undefined);
  assert.equal(evidenceLedger(a).kind,'MISSING');
  assert.equal(firstDifference(null,[]),null);
  const result=run(a,a,a);
  assert.equal(result.rows[0].controlReplay,
    'MISSING_OR_CONFLICTING_CONTROL_LEDGER');
  assert.equal(result.rows[0].treatmentWitness,
    'MISSING_OR_CONFLICTING_LEDGER');
});

test('missing B ledger does not erase a provable A/A control prefix',()=>{
  const a=row('t',[root(0)]);
  const b=row('t',undefined);
  const result=run(a,b,a);
  assert.equal(result.rows[0].controlReplay,'BOUNDED_ROOT_REPLAY');
  assert.equal(result.rows[0].treatmentWitness,
    'MISSING_OR_CONFLICTING_LEDGER');
});

test('absent live wrapper receipts cannot prove requested activation',()=>{
  const a=row('t',[root(0)]);
  assert.equal(run(a,a,a,[undefined,undefined,undefined]).activationStatus,
    'ACTIVATION_UNVERIFIED');
  assert.equal(run(a,a,a,[undefined,undefined,undefined])
    .rows[0].treatmentWitness,'ACTIVATION_UNVERIFIED');
});

test('historical A/A/A wrapper absence is not a negative retreat trial',()=>{
  const a=row('t',[root(0)]);
  const result=run(a,a,a,[false,false,false]);
  assert.equal(result.activationStatus,'NO_TREATMENT_APPLIED');
  assert.equal(result.sourceRetreatDivergenceCandidates,0);
  assert.equal(result.rows[0].treatmentWitness,'NO_TREATMENT_APPLIED');
});

test('null divergence with installed B never passes positive witness gate',()=>{
  const a=row('t',[root(0)]);
  const result=run(a,a,a);
  assert.equal(result.rows[0].treatmentDifference,null);
  assert.equal(result.rows[0].treatmentWitness,'ACTIVE_NO_DIVERGENCE');
});

test('B action from candidate seat is rejected as source retreat',()=>{
  const a=row('t',[root(0),root(1)]);
  const b=row('t',[root(0),root(1,'RetreatAction',0)]);
  assert.equal(run(a,b,a).rows[0].treatmentWitness,
    'WRONG_ACTION_OR_SEAT_OR_ORDINAL');
});

test('B retreat without accepted-action ordinal is rejected',()=>{
  const a=row('t',[root(0),root(1)]);
  const b=row('t',[root(0),{action:'RetreatAction',playerSlot:1}]);
  assert.equal(run(a,b,a).rows[0].treatmentWitness,
    'WRONG_ACTION_OR_SEAT_OR_ORDINAL');
});

test('post-abort extension cannot be attributed to a live treatment',()=>{
  const a=row('t',undefined,{error:'abort',status:'error',
    nativeAbortEvidence:{rootActionLedger:[root(0)]}});
  const b=row('t',[root(0),root(1,'RetreatAction')]);
  const result=run(a,b,a);
  assert.equal(result.rows[0].controlReplay,'CENSORED_PREFIX_REPLAY');
  assert.equal(result.rows[0].treatmentWitness,
    'CONTROL_ENDED_BEFORE_DIVERGENCE');
});

test('physical source mismatch independently vetoes treatment witness',()=>{
  const a=row('t',[root(0)]);
  const b=row('t',[root(0),root(1,'RetreatAction')],
    {sourceDealFingerprint:'different'});
  const result=run(a,b,a);
  assert.equal(result.allOpeningsMatched,false);
  assert.equal(result.rows[0].treatmentWitness,'PHYSICAL_OPENING_MISMATCH');
});

test('actual starter mismatch independently vetoes treatment witness',()=>{
  const a=row('t',[root(0)]);
  const b=row('t',[root(0),root(1,'RetreatAction')],
    {actualStarterSeat:1});
  assert.equal(run(a,b,a).rows[0].treatmentWitness,
    'PHYSICAL_OPENING_MISMATCH');
});

test('identical ledgers with different control outcomes do not replay',()=>{
  const a=row('t',[root(0)]);
  const a2=row('t',[root(0)],{winner:1,finished:true,status:'terminal'});
  assert.equal(run(a,a,a2).rows[0].controlReplay,'OUTCOME_MISMATCH');
});

test('different A-repeat ledger never passes control replay',()=>{
  const a=row('t',[root(0)]);
  const a2=row('t',[root(1)]);
  assert.equal(run(a,a,a2).rows[0].controlReplay,'ROOT_HISTORY_MISMATCH');
});

test('invalid or duplicated trial sets fail before any comparisons',()=>{
  const a=row('t',[root(0)]);
  assert.throws(()=>audit({trials:[{id:'t',sourceSeat:1}],
    phases:[phase([a,a],false),phase([a],true),phase([a],false)]}),
    /Missing or duplicate/);
  assert.throws(()=>audit({trials:[{id:'t',sourceSeat:1}],
    phases:[phase([a],false),phase([],true),phase([a],false)]}),
    /every registered attempt/);
  assert.throws(()=>audit({trials:[{id:'t',sourceSeat:2}],
    phases:[phase([a],false),phase([a],true),phase([a],false)]}),
    /Invalid registered trial/);
});

test('invalid A/B/A activation pattern is flagged',()=>{
  const a=row('t',[root(0)]);
  assert.equal(run(a,a,a,[true,true,false]).activationStatus,
    'INVALID_ABA_WRAPPER_ACTIVATION');
});

test('a treatment-only extension after an earlier cap is not a causal first root',()=>{
  const control=row('t',[root(0)],{status:'root-cap'});
  const treatment=row('t',[root(0),root(1,'RetreatAction')]);
  const report=run(control,treatment,control);
  assert.equal(report.rows[0].treatmentDifference.kind,'LENGTH_MISMATCH');
  assert.equal(report.rows[0].treatmentWitness,
    'CONTROL_ENDED_BEFORE_DIVERGENCE');
  assert.equal(report.sourceRetreatDivergenceCandidates,0);
});

test('top-level ledger accompanied by native error is censored, not complete',()=>{
  const a=row('t',[root(0)],{
    status:'returned-unqualified',nativeError:'OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED'});
  const result=run(a,a,a);
  assert.deepEqual(result.rows[0].ledgerOrigins,
    ['TOP_LEVEL','TOP_LEVEL','TOP_LEVEL']);
  assert.equal(result.rows[0].controlReplay,'CENSORED_PREFIX_REPLAY');
  assert.equal(result.completedControlReplays,0);
});

test('error-like status with top-level ledger stays an error prefix',()=>{
  const a=row('t',[root(0)],{status:'ENGINE_ERROR'});
  assert.equal(run(a,a,a).rows[0].controlReplay,'CENSORED_PREFIX_REPLAY');
});

test('invalid starter and candidate-seat metadata fail closed',()=>{
  const a=row('t',[root(0)]);
  const b=row('t',[root(0),root(1,'RetreatAction')]);
  const invalidStarter=row('t',[root(0)],{actualStarterSeat:2});
  const invalidSeat=row('t',[root(0)],{candidateSeat:1});
  assert.equal(run(invalidStarter,b,invalidStarter).allOpeningsMatched,false);
  assert.equal(run(invalidSeat,b,invalidSeat).allOpeningsMatched,false);
});

test('A and A-repeat native decoder errors must have matching provenance',()=>{
  const a=row('t',[root(0)],{nativeError:'MISSING_CHOICE_A'});
  const a2=row('t',[root(0)],{nativeError:'MISSING_CHOICE_B'});
  assert.equal(run(a,a,a2).rows[0].controlReplay,'OUTCOME_MISMATCH');
});
