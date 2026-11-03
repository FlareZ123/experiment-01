'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditCrossCandidateSourcePair} =
  require('../simulation/evaluation/agent44-cross-candidate-source-pair-status.cjs');
const digestA='a'.repeat(64), digestB='b'.repeat(64);
const trial={rank:5,candidateSlot:'A',seed:101};
/** @param {string|null} digest @param {number|null} starter @param {number[]|null} mulligans @param {number[]|null} bonusDrawn */
function row(digest,starter,mulligans=null,bonusDrawn=null) {
  return {
    trial:{...trial},sourceDealFingerprint:digest,
    verifiedFirstTurn:starter !== null,actualStarterSeat:starter,
    initialSetupCompensation:mulligans && bonusDrawn ? {
      schema:'real-store-initial-setup-compensation-v1',
      mulligans,bonusDrawn
    }:null
  };
}

test('observed rank5 setup shape makes different source deals explicitly unpaired',()=>{
  const report=auditCrossCandidateSourcePair(
    row(digestA,1,[1,0],[0,1]),row(digestB,1,[0,0],[0,0]));
  assert.equal(report.sourceDealStatus,'MISMATCHED');
  assert.equal(report.actualStarterStatus,'MATCHED');
  assert.equal(report.mulliganCountsStatus,'MISMATCHED');
  assert.equal(report.bonusDrawnCountsStatus,'MISMATCHED');
  assert.deepEqual(report.sourceCompensationDrawCounts,[1,0]);
  assert.equal(report.crossCandidateOpeningStatus,'UNPAIRED_SOURCE_DEAL');
  assert.equal(report.sameSourcePhysicalDeal,false);
});

test('matching witnessed source digests and starter qualify initial parity only',()=>{
  const report=auditCrossCandidateSourcePair(row(digestA,0),row(digestA,0));
  assert.equal(report.crossCandidateOpeningStatus,
    'MATCHED_INITIAL_SOURCE_AND_STARTER');
  assert.equal(report.sourceDealStatus,'MATCHED');
  assert.equal(report.mulliganCountsStatus,'UNKNOWN');
  assert.equal(report.bonusDrawnCountsStatus,'UNKNOWN');
  assert.equal(report.sameSourcePhysicalDeal,true);
});

test('aborted or malformed fingerprint retains UNKNOWN instead of mismatch',()=>{
  const report=auditCrossCandidateSourcePair(row(null,null),row('malformed',null));
  assert.equal(report.crossCandidateOpeningStatus,'UNKNOWN');
  assert.equal(report.sourceDealStatus,'UNKNOWN');
  assert.equal(report.actualStarterStatus,'UNKNOWN');
  assert.equal(report.sameSourcePhysicalDeal,false);
});

test('different actual starters independently veto physical pair comparison',()=>{
  const report=auditCrossCandidateSourcePair(row(digestA,0),row(digestA,1));
  assert.equal(report.sourceDealStatus,'MATCHED');
  assert.equal(report.actualStarterStatus,'MISMATCHED');
  assert.equal(report.crossCandidateOpeningStatus,'UNPAIRED_ACTUAL_STARTER');
});

test('cannot compare unrelated seeds or candidate slots',()=>{
  const first=row(digestA,0),second=row(digestB,0);
  second.trial.seed=102;
  assert.throws(()=>auditCrossCandidateSourcePair(first,second));
  second.trial.seed=101;
  second.trial.candidateSlot='B';
  assert.throws(()=>auditCrossCandidateSourcePair(first,second));
});
