'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const registration=require('../results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json');
const {plannedTrials}=
  require('../simulation/evaluation/agent41-prospective-canonical-scout.cjs');
const {SCHEMA,auditRegisteredSourceDeals}=
  require('../simulation/evaluation/agent8-prospective-source-deal-audit.cjs');

const trials=plannedTrials(registration);
const digest=label=>createHash('sha256').update(label).digest('hex');
const groupId=trial=>[trial.rank,trial.repeat,trial.candidateSlot].join(':');
function makeFixture(){
  const rows=trials.map(trial=>{
    const sourceSeat=trial.candidateSlot==='A'?1:0;
    const sourceActuallyFirst=trial.repeat%2===0;
    return {trial,sourceSeat,candidateSeat:1-sourceSeat,
      sourceActuallyFirst,
      actualStarterSeat:sourceActuallyFirst?sourceSeat:1-sourceSeat,
      verifiedFirstTurn:true,
      sourceDealFingerprint:digest(groupId(trial)),
      qualifiesForCompetitiveInference:false,finished:true};
  });
  const sourcePairs=[...new Set(trials.map(groupId))].map(pairId=>({
    pairId,sameSourcePhysicalDeal:true,sameActualStarter:true
  }));
  return {attempted:32,rows,sourcePairs};
}

test('authenticates all registered source-deal pairs and counts seed cells, not arms',()=>{
  const result=auditRegisteredSourceDeals(trials,makeFixture());
  assert.equal(result.schema,SCHEMA);
  assert.equal(result.attemptedArms,32);
  assert.equal(result.registeredSeedCells,16);
  assert.equal(result.alignedSourceDealCells,16);
  assert.equal(result.alignedSourceFirstCells,8);
  assert.equal(result.alignedSourceSecondCells,8);
  assert.deepEqual(result.perRank.map(x=>x.alignedSourceDealCells),[8,8]);
  assert.equal(result.competitiveQualifiedGames,0);
});

test('one false same-source claim vetoes independent-cell collapse',()=>{
  const result=makeFixture();
  const changed=result.rows.find(row=>row.trial.id===
    '6:3:B:new-moon-lockbreaker-v1');
  changed.sourceDealFingerprint=digest('another actual source deal');
  const metadata=result.sourcePairs.find(pair=>pair.pairId==='6:3:B');
  metadata.sameSourcePhysicalDeal=false;
  const audit=auditRegisteredSourceDeals(trials,result);
  assert.equal(audit.mismatchedSourceDealCells,1);
  assert.equal(audit.alignedSourceDealCells,15);
  assert.equal(audit.pairs.find(pair=>pair.pairId==='6:3:B').status,
    'mismatched-source-deal');
  metadata.sameSourcePhysicalDeal=true;
  assert.throws(()=>auditRegisteredSourceDeals(trials,result),
    /source deal-pair flag contradicts/);
});

test('a native exception retains both scheduled arms and excludes unverified pair',()=>{
  const result=makeFixture();
  const changed=result.rows.find(row=>row.trial.id===
    '11:1:B:new-moon-lockbreaker-v1');
  changed.status='engine-error';
  changed.finished=false;
  changed.sourceDealFingerprint=null;
  changed.verifiedFirstTurn=false;
  const metadata=result.sourcePairs.find(pair=>pair.pairId==='11:1:B');
  metadata.sameSourcePhysicalDeal=false;
  metadata.sameActualStarter=false;
  const audit=auditRegisteredSourceDeals(trials,result);
  assert.equal(audit.unverifiedSourcePairCells,1);
  assert.equal(audit.alignedSourceDealCells,15);
  assert.equal(audit.attemptedArms,32);
  assert.ok(audit.pairs.find(pair=>pair.pairId==='11:1:B')
    .armStatuses.includes('engine-error'));
});

test('opposite actual starters reject a supposedly paired start',()=>{
  const result=makeFixture();
  const changed=result.rows.find(row=>row.trial.id===
    '11:0:A:new-moon-lockbreaker-v1');
  changed.actualStarterSeat=0;
  changed.sourceActuallyFirst=false;
  const metadata=result.sourcePairs.find(pair=>pair.pairId==='11:0:A');
  metadata.sameActualStarter=false;
  const audit=auditRegisteredSourceDeals(trials,result);
  assert.equal(audit.mismatchedActualStarterCells,1);
  assert.equal(audit.alignedSourceDealCells,15);
  metadata.sameActualStarter=true;
  assert.throws(()=>auditRegisteredSourceDeals(trials,result),
    /starter-pair flag contradicts/);
});

test('fake or missing registration coordinates, pair receipts or competitive claim fail closed',()=>{
  const changedSeed=makeFixture();
  changedSeed.rows[0]={...changedSeed.rows[0],
    trial:{...changedSeed.rows[0].trial,seed:42}};
  assert.throws(()=>auditRegisteredSourceDeals(trials,changedSeed),
    /preregistration/);
  const missingPair=makeFixture();
  missingPair.sourcePairs.pop();
  assert.throws(()=>auditRegisteredSourceDeals(trials,missingPair));
  const fraud=makeFixture();
  fraud.rows[0].qualifiesForCompetitiveInference=true;
  assert.throws(()=>auditRegisteredSourceDeals(trials,fraud));
  const badActor=makeFixture();
  badActor.rows[0].sourceActuallyFirst=false;
  badActor.sourcePairs[0].sameActualStarter=false;
  const audit=auditRegisteredSourceDeals(trials,badActor);
  assert.equal(audit.unverifiedSourcePairCells,1);
});
