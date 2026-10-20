'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {hasPairedTrialSchedule,hasPairedInitialSourceDeals}=
  require('../simulation/evaluation/aichi-evidence-envelope.cjs');

const proof={
  firstTurnSlot:0,firstTurnPlayerId:101,firstTurnPlayerName:'research-A',
  firstDrawLogName:'research-A',verifiedByDrawLog:true
};
const options={strictPromptValidation:true};
const provenance={
  researchRevision:'frozen',engineRevision:'pin',
  rulesetRevision:'paper',candidatePolicyRevision:'same',
  opponentPolicyRevision:'same',rngProtocol:'isolated',
  effectiveMatchOptions:options
};

/** @param {string|null} sourceDigest */
function envelope(sourceDigest){
  const row={
    status:'completed',phase:'pilot',rank:6,repeat:0,seed:20261020,
    observedSeed:20261020,candidateEngineSlot:'A',
    opponentDigest:'original-rank6',candidateTrueTurn:'first',firstTurn:proof,
    expectedEngineDeckHashes:['a'.repeat(64),'b'.repeat(64)],
    observedEngineDeckHashes:['a'.repeat(64),'b'.repeat(64)]
  };
  if(sourceDigest!==null)row.initialSourceDealFingerprint={
    schema:'initial-source-physical-position-sha256-v1',
    seat:1,digestSha256:sourceDigest
  };
  return {archive:{
    planDigest:'registered',phase:'pilot',seedProtocol:'independent-slots-v2',
    records:[row]
  },provenance};
}

test('schedule-only comparison does not certify source card position pairing',()=>{
  const a=envelope('c'.repeat(64));
  const b=envelope('d'.repeat(64));
  assert.equal(hasPairedTrialSchedule(a,b),true);
  assert.equal(hasPairedInitialSourceDeals(a,b),false);
  b.archive.records[0].initialSourceDealFingerprint.digestSha256='c'.repeat(64);
  assert.equal(hasPairedInitialSourceDeals(a,b),true);
  delete b.archive.records[0].initialSourceDealFingerprint;
  assert.equal(hasPairedInitialSourceDeals(a,b),false);
});

test('source position attestation rejects mismatched physical seat and schema',()=>{
  const a=envelope('e'.repeat(64)),b=envelope('e'.repeat(64));
  b.archive.records[0].initialSourceDealFingerprint.seat=0;
  assert.equal(hasPairedInitialSourceDeals(a,b),false);
  b.archive.records[0].initialSourceDealFingerprint.seat=1;
  b.archive.records[0].initialSourceDealFingerprint.schema='early-setup-hash';
  assert.equal(hasPairedInitialSourceDeals(a,b),false);
  b.archive.records[0].initialSourceDealFingerprint.schema=
    'initial-source-physical-position-sha256-v1';
  b.archive.records[0].initialSourceDealFingerprint.digestSha256='bad';
  assert.equal(hasPairedInitialSourceDeals(a,b),false);
});
