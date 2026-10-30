'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {STRICT_FIELDS,originalStoreParity}=
  require('../simulation/evaluation/agent1-preregistered-native-root-parity.cjs');

/** @param {boolean} withObserver */
function sample(withObserver){
  const rows=Array.from({length:32},(_,i)=>({
    trial:{id:`11:${i}:A:reference`,rank:11,seed:100+i,candidateId:'reference'},
    sourceDealFingerprint:`source-${i}`,
    fullPhysicalDealFingerprint:`full-${i}`,
    rootActionLedgerSha256:`root-${i}`,rootActionCount:12,
    candidateDeckFingerprint:'candidate',sourceDeckFingerprint:'rank11',
    verifiedFirstTurn:true,actualStarterSeat:i%2,
    sourceActuallyFirst:i%2===0,
    actionCount:12,finished:i%2===0,winner:i%2===0?0:null,
    endReason:i%2===0?'native-ko':null,finalPrizes:[2,4],
    qualifiesForCompetitiveInference:false,
    ...(withObserver?{
      sourceFirstOwnedAffordances:{
        schema:'agent1-source-first-owned-affordances-v2',
        status:'observed',terminalKind:'pass'
      }}:{})
  }));
  return {schema:'agent41-preregistered-32-arm-canonical-scout-v1',
    registrationBlob:'registered-hash',
    preregistration:{attempts:32,enginePin:'pinned'},
    summary:{attempts:32,exceptions:0,censored:16,engineTerminals:16,
      verifiedFirstPlayers:32,competitiveQualifiedGames:0},
    developmentResult:{rows}};
}

test('observer replay attests original 32 full-deal root and outcome parity',()=>{
  const base=sample(false),observed=sample(true);
  const before=JSON.stringify(observed);
  const result=originalStoreParity(base,observed);
  assert.equal(result.compared,32);
  assert.equal(result.changedNativeRootHashes,0);
  assert.equal(result.changedOutcomes,0);
  assert.deepEqual(result.declaredFields,STRICT_FIELDS);
  assert.equal(JSON.stringify(observed),before);
});

test('even one changed accepted root hash or physical source fingerprint fails closed',()=>{
  const a=sample(false),b=sample(true);
  b.developmentResult.rows[7].rootActionLedgerSha256='substituted';
  assert.throws(()=>originalStoreParity(a,b),/rootActionLedgerSha256/);
  b.developmentResult.rows[7].rootActionLedgerSha256='root-7';
  b.developmentResult.rows[7].sourceDealFingerprint='substituted';
  assert.throws(()=>originalStoreParity(a,b),/sourceDealFingerprint/);
});

test('different terminal, winner, source starter or opponent 60 is rejected',()=>{
  for(const key of ['finished','winner','actualStarterSeat',
    'sourceDeckFingerprint','candidateDeckFingerprint','finalPrizes']){
    const a=sample(false),b=sample(true),row=b.developmentResult.rows[2];
    row[key]=key==='finalPrizes'?[0,0]:'different';
    assert.throws(()=>originalStoreParity(a,b),new RegExp(key));
  }
});

test('rejects registration, duplicate or missing attempt and observer absent',()=>{
  const a=sample(false),b=sample(true);
  b.registrationBlob='different';
  assert.throws(()=>originalStoreParity(a,b));
  b.registrationBlob=a.registrationBlob;
  b.developmentResult.rows[2].trial.id=b.developmentResult.rows[3].trial.id;
  assert.throws(()=>originalStoreParity(a,b),/duplicate trial IDs/);
  b.developmentResult.rows[2].trial.id='11:2:A:reference';
  b.developmentResult.rows[9].sourceFirstOwnedAffordances=null;
  assert.throws(()=>originalStoreParity(a,b),/observer missing/);
});

test('rejects declared good counts if summary or sample count changes',()=>{
  const a=sample(false),b=sample(true);
  b.summary.engineTerminals=17;
  assert.throws(()=>originalStoreParity(a,b),/engineTerminals/);
  b.summary.engineTerminals=16;
  b.developmentResult.rows.pop();
  assert.throws(()=>originalStoreParity(a,b));
});
