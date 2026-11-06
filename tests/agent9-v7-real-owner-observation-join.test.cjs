'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {reconcileOwnerObservation} =
  require('../scripts/agent9-v7-real-owner-observation-join.cjs');

const ID='6:200:A:champion-reference';
const LABEL='agent41-bilateral-v2-common-policy-development-'+ID;
const classifyBaton=view=>({
  observedOwnerSeat:view.actorSeat,
  ownHandWasPassed:view.ownHand.includes('VS Seeker PHF'),
  paperPaidActionCertified:false
});

/** @returns {object} Synthetic one-row terminal-free native archive. */
function fixture() {
  const baseline = {schema:
    'agent9-v7-owner-readonly-exact-public-noninterference-v1',
    originalArchiveSha256:'original-v7-digest',originalVendorPin:'pin',
    baselineArms:[{id:ID,status:'returned-unqualified',
      publicRootActionCount:3,sourceDealFingerprint:'source-deal',
      fullPhysicalDealFingerprint:'full-deal',
      publicRootLedgerSha256Computed:'root-digest'}]};
  const archive={attempts:[{...baseline.baselineArms[0],
    originalSourceSeat:1,
    publicRootActionsTruncated:false,
    publicRootLedgerDigestConsistent:true,
    publicRootActions:[
      {actionOrdinal:3,turnBefore:14,playerSlot:1,
        action:'AttackAction',attack:'Volt Cyclone'},
      {actionOrdinal:6,turnBefore:15,playerSlot:0,
        action:'PassTurnAction'},
      {actionOrdinal:7,turnBefore:16,playerSlot:1,
        action:'PassTurnAction'}],
    actualSourceAttackSettlement:{auditedActorRole:'source',attacks:[{
      actionOrdinal:3,turnBefore:14,triggerAction:'AttackAction',
      attackName:'Volt Cyclone',completionRootOrdinal:3,
      settledPromptChain:true,settlementCrossesClockReset:false
    }]}}]};
  const audit=[{label:LABEL,volt:{agent9RealOwnerDecisionAudit:{
    actorOwnedRootObservations:1,realStoreRootProposals:[{
      seat:1,globalTurn:16,nativeProposedAction:'PassTurnAction',
      ownerHand:['VS Seeker PHF','Speed Lightning Energy LOT'],
      ownerPublic:{active:{printing:'Iron Thorns ex TWM'}},
      opponentPublic:{active:{printing:'Tapu Lele-GX GRI'}},
      ownerResources:{supporterPlayedTurn:0},
      supporterQuotaBeforeBot:0,supporterQuotaAfterBot:0
    }]}}}];
  return {baseline,archive,audit};
}

test('uses the actual source seat and accepted root; owner hand is observed, not inferred',()=>{
  const f=fixture();const x=reconcileOwnerObservation(f.archive,f.audit,f.baseline,{screen:classifyBaton});
  assert.equal(x.registeredArms,1);
  assert.equal(x.fullPublicReplayNoninterference,true);
  assert.equal(x.ownerObservationMatches,1);
  assert.equal(x.ownerReadOnlyReturns[0].nextOwnerTurn,16);
  assert.deepEqual(x.ownerReadOnlyReturns[0].ownerHandAtNativePass,
    ['VS Seeker PHF','Speed Lightning Energy LOT']);
  assert.equal(x.ownerReadOnlyReturns[0].paperPaidAlternativeCertified,false);
  assert.deepEqual(x.ownerReadOnlyReturns[0].printedDceBatonNecessaryScreen,{
    observedOwnerSeat:1,ownHandWasPassed:true,
    paperPaidActionCertified:false
  });
  assert.equal(x.ownerReadOnlyReturns[0].screenIsPaidNativeAction,false);
  assert.equal(x.competitiveGamesQualified,0);
});

test('refuses changed accepted Store roots or changed opening',()=>{
  for(const key of ['publicRootLedgerSha256Computed',
    'sourceDealFingerprint','fullPhysicalDealFingerprint',
    'status','publicRootActionCount']) {
    const f=fixture();f.archive.attempts[0][key]='tampered';
    assert.throws(()=>reconcileOwnerObservation(f.archive,f.audit,f.baseline,{screen:classifyBaton}),
      /Read-only observation changed/);
  }
});

test('refuses missing or duplicate native trial observers',()=>{
  const f=fixture();
  assert.throws(()=>reconcileOwnerObservation(f.archive,[],f.baseline));
  const two=[f.audit[0],{...f.audit[0]}];
  assert.throws(()=>reconcileOwnerObservation(f.archive,two,f.baseline));
});

test('preserves owner proposal uncertainty when the real bot was not observed',()=>{
  const f=fixture();f.audit[0].volt.agent9RealOwnerDecisionAudit=null;
  const x=reconcileOwnerObservation(f.archive,f.audit,f.baseline,{screen:classifyBaton});
  assert.equal(x.ownerObservationMatches,0);
  assert.equal(x.ownerReadOnlyReturns[0].matchedObservationStatus,
    'owner-observer-missing');
  assert.equal(x.ownerReadOnlyReturns[0].ownerHandAtNativePass,null);
});
