'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {auditFrozenSourcePhysicalPairs,appendSourcePhysicalPairDisposition}=require(
  '../simulation/evaluation/agent20-frozen-physical-pair-audit.cjs');
const profile=JSON.parse(fs.readFileSync(path.join(__dirname,
  '../simulation/evaluation/agent20-frozen-rank6-canary-v1.json'),'utf8'));

/** @returns {object[]} Four source-physical registered mock observations. */
function fixtureRows(){
  return profile.registeredTrials.map(trial=>({
    trial,candidateSeat:trial.candidateSlot==='A'?0:1,
    sourceSeat:trial.candidateSlot==='A'?1:0,
    verifiedFirstTurn:true,
    sourceDealFingerprint:trial.candidateSlot==='A'?'a'.repeat(64):'b'.repeat(64),
    status:'completed',
    rootActionLedger:[{action:'PlayCardAction'}]
  }));
}

test('same printed source physical deals certify only matched cohort stage',()=>{
  const result=auditFrozenSourcePhysicalPairs(profile,{rows:fixtureRows()});
  assert.equal(result.matchedSourcePhysicalDeals,true);
  assert.equal(result.cohorts.length,2);
  assert.ok(result.cohorts.every(x=>x.status==='EXACT_SOURCE_DEAL_MATCH'));
  assert.equal(result.competitiveGameQualified,false);
});

test('four successful source roots with unequal source deal do not permit pairing',()=>{
  const rows=fixtureRows();
  rows[1].sourceDealFingerprint='c'.repeat(64);
  const result=auditFrozenSourcePhysicalPairs(profile,{rows});
  assert.equal(result.matchedSourcePhysicalDeals,false);
  assert.deepEqual(result.cohorts.map(x=>x.status),
    ['SOURCE_DEAL_DIFFERENT','EXACT_SOURCE_DEAL_MATCH']);
  assert.equal(result.cohorts[0].pairedDeltaAllowed,false);
});

test('matching numeric seeds, missing physical fingerprint still unverified',()=>{
  const rows=fixtureRows();
  delete rows[2].sourceDealFingerprint;
  const result=auditFrozenSourcePhysicalPairs(profile,{rows});
  assert.equal(result.matchedSourcePhysicalDeals,false);
  assert.equal(result.cohorts[1].status,'UNVERIFIED');
});

test('error/missing attempt does not silently enter matched denominator',()=>{
  const rows=fixtureRows().slice(0,3);
  const result=auditFrozenSourcePhysicalPairs(profile,{rows});
  assert.equal(result.matchedSourcePhysicalDeals,false);
  assert.equal(result.missingRows,1);
});

test('row order has no effect on exact registered trial IDs',()=>{
  const rows=fixtureRows().reverse();
  const result=auditFrozenSourcePhysicalPairs(profile,{rows});
  assert.equal(result.matchedSourcePhysicalDeals,true);
});

test('duplicate native row or changed registered seed is rejected',()=>{
  const rows=fixtureRows();
  assert.throws(()=>auditFrozenSourcePhysicalPairs(profile,
    {rows:[...rows,rows[0]]}),/Duplicate native trial/);
  rows[0]={...rows[0],trial:{...rows[0].trial,seed:123}};
  assert.throws(()=>auditFrozenSourcePhysicalPairs(profile,{rows}),
    /Changed registered physical trial/);
});

test('apparent equality without verified seat/turn is insufficient',()=>{
  const rows=fixtureRows();
  rows[0].verifiedFirstTurn=false;
  rows[2].sourceSeat=1;
  const result=auditFrozenSourcePhysicalPairs(profile,{rows});
  assert.equal(result.matchedSourcePhysicalDeals,false);
  assert.deepEqual(result.cohorts.map(x=>x.status),
    ['UNVERIFIED','UNVERIFIED']);
});

test('extra unregistered native rows invalidate complete matched disposition',()=>{
  const rows=fixtureRows();
  rows.push({trial:{id:'unregistered'},status:'completed'});
  const result=auditFrozenSourcePhysicalPairs(profile,{rows});
  assert.equal(result.unregisteredRows,1);
  assert.equal(result.matchedSourcePhysicalDeals,false);
});

test('read-only postprocessor separates both seats from matched source deals',()=>{
  const rows=fixtureRows();
  rows[1].sourceDealFingerprint='f'.repeat(64);
  const input={releaseDisposition:{
    stages:{CONFIG_FROZEN:true,BOTH_SEATS_EXECUTED:true,
      PAPER_PAYMENT_VERIFIED:false,COMPETITIVE_GAME_QUALIFIED:false},
    firstBlocker:'PAPER_PAYMENT_UNVERIFIED'},
    rawNativeResult:{rows},competitiveGameQualified:false};
  const after=appendSourcePhysicalPairDisposition(input,profile);
  assert.equal(after.releaseDisposition.stages.BOTH_SEATS_EXECUTED,true);
  assert.equal(after.releaseDisposition.stages.MATCHED_SOURCE_PHYSICAL_DEALS,false);
  assert.equal(after.releaseDisposition.firstBlocker,
    'SOURCE_PHYSICAL_PAIR_UNVERIFIED_OR_DIFFERENT');
  assert.equal(input.releaseDisposition.stages.MATCHED_SOURCE_PHYSICAL_DEALS,
    undefined);
  assert.equal(after.competitiveGameQualified,false);
});

test('matched source cohort keeps paper-payment first-blocker',()=>{
  const input={releaseDisposition:{stages:{BOTH_SEATS_EXECUTED:true,
    PAPER_PAYMENT_VERIFIED:false},firstBlocker:'PAPER_PAYMENT_UNVERIFIED'},
    rawNativeResult:{rows:fixtureRows()}};
  const after=appendSourcePhysicalPairDisposition(input,profile);
  assert.equal(after.releaseDisposition.stages.MATCHED_SOURCE_PHYSICAL_DEALS,true);
  assert.equal(after.releaseDisposition.firstBlocker,'PAPER_PAYMENT_UNVERIFIED');
});

test('preflight failure is preserved as unpaired and unsuccessful',()=>{
  const input={releaseDisposition:{stages:{CONFIG_FROZEN:false,
    BOTH_SEATS_EXECUTED:false},firstBlocker:'PREFLIGHT_REJECTED'}};
  const after=appendSourcePhysicalPairDisposition(input,profile);
  assert.equal(after.releaseDisposition.stages.MATCHED_SOURCE_PHYSICAL_DEALS,false);
  assert.equal(after.releaseDisposition.firstBlocker,'PREFLIGHT_REJECTED');
  assert.equal(after.sourcePhysicalPairAudit.cohorts.length,0);
  assert.equal(after.competitiveGameQualified,false);
});
