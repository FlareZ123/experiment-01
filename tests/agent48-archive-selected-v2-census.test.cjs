'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {censusCrossCandidateSourceDeals}=
  require('../simulation/evaluation/agent48-archive-selected-v2-census.cjs');

/** @param {string} label */
const digest=label=>createHash('sha256').update(label).digest('hex');

/** @param {string} candidateId @param {string} [source] */
function row(candidateId,source='physical-A'){
  return {
    trial:{
      id:'5:0:A:'+candidateId,rank:5,repeat:0,candidateSlot:'A',
      seed:3423099534,candidateId
    },
    sourceDealFingerprint:digest(source),
    verifiedFirstTurn:true,actualStarterSeat:0
  };
}
const a='champion-reference',b='new-moon-lockbreaker-v1';

test('same registered seed cannot be interpreted as source physical parity',()=>{
  const census=censusCrossCandidateSourceDeals([row(a),row(b,'physical-B')]);
  assert.equal(census.groups,1);
  assert.equal(census.sourceDigestCompared,1);
  assert.equal(census.sourceDigestMismatched,1);
  assert.equal(census.sourceDigestMatched,0);
  assert.equal(census.starterMatched,1);
  assert.equal(census.pairedCandidatePhysicalContrastSupported,false);
  assert.equal(census.competitiveGameQualified,false);
});

test('exact source digest and independently verified native starter can match',()=>{
  const census=censusCrossCandidateSourceDeals([row(a),row(b)]);
  assert.equal(census.sourceDigestMatched,1);
  assert.equal(census.starterMatched,1);
  assert.equal(census.pairedCandidatePhysicalContrastSupported,true);
  assert.equal(census.records[0].sameSeed,true);
});

test('equal source deal alone cannot erase a different real first player',()=>{
  const other=row(b);other.actualStarterSeat=1;
  const census=censusCrossCandidateSourceDeals([row(a),other]);
  assert.equal(census.sourceDigestMatched,1);
  assert.equal(census.starterMatched,0);
  assert.equal(census.pairedCandidatePhysicalContrastSupported,false);
});

test('source digest or native starter absent keeps physical contrast unverified',()=>{
  const other=row(b);other.sourceDealFingerprint=null;
  other.verifiedFirstTurn=false;
  const census=censusCrossCandidateSourceDeals([row(a),other]);
  assert.equal(census.sourceDigestUnknown,1);
  assert.equal(census.starterCompared,0);
  assert.equal(census.pairedCandidatePhysicalContrastSupported,false);
});

test('a source group requires exactly two distinct fixed candidates and equal seeds',()=>{
  assert.throws(()=>censusCrossCandidateSourceDeals([row(a)]),
    /missing its second fixed candidate/);
  assert.throws(()=>censusCrossCandidateSourceDeals([row(a),row(a)]),
    /Duplicate candidate/);
  const other=row(b);other.trial.seed++;
  assert.throws(()=>censusCrossCandidateSourceDeals([row(a),other]),
    /Seed changed/);
});

test('trials must agree with claimed registered IDs',()=>{
  const other=row(b);other.trial.id='malformed-id';
  assert.throws(()=>censusCrossCandidateSourceDeals([row(a),other]));
});
