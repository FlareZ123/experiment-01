'use strict';

const assert = require('node:assert/strict');
const {auditV7SourceOwnerContinuation} =
  require('./agent9-v7-own-turn-continuation-audit.cjs');
const registration = require('../results/aichi-2026/registrations/agent9-v7-owner-readonly-exact-v1-20261106.json');

/**
 * Read-only replay admission: an identical digest of accepted source roots
 * matters more than a native bot proposal. Retain all eight abort/caps.
 * @param {object} nativeReceipt Exact v7 buildReceipt from new execution.
 * @param {Array<object>} attempts Owner observer native per-match receipts.
 * @param {object} [baseline] Frozen original native-v7 registration.
 * @returns {object}
 */
function reconcileOwnerObservation(nativeReceipt, attempts, baseline = registration) {
  assert.equal(baseline.schema,
    'agent9-v7-owner-readonly-exact-public-noninterference-v1');
  const raw = nativeReceipt.attempts;
  assert.ok(Array.isArray(raw)&&Array.isArray(attempts));
  assert.equal(raw.length, baseline.baselineArms.length);
  assert.equal(attempts.length, baseline.baselineArms.length);
  const rawById = new Map(raw.map(row => [row.id,row]));
  assert.equal(rawById.size,raw.length);
  const auditById = new Map();
  for (const a of attempts) {
    const found = baseline.baselineArms.filter(x =>
      a.label === 'agent41-bilateral-v2-common-policy-development-'+x.id);
    assert.equal(found.length,1,'Native observer label must bind one trial');
    const id=found[0].id;
    assert.ok(!auditById.has(id),'Observer must emit one receipt per trial');
    auditById.set(id,a);
  }
  const rows=[];
  for (const expected of baseline.baselineArms) {
    const row=rawById.get(expected.id), observed=auditById.get(expected.id);
    assert.ok(row&&observed,'Missing registered raw or observer row');
    const equal=(key)=>row[key]===expected[key];
    const checks={id:expected.id,
      disposition:equal('status'),
      rootCount:equal('publicRootActionCount'),
      realStoreRoots:equal('publicRootLedgerSha256Computed'),
      sourcePhysicalDeal:equal('sourceDealFingerprint'),
      entirePhysicalDeal:equal('fullPhysicalDealFingerprint')};
    const eligible=Object.entries(checks).every(([key,value])=>
      key==='id'||value===true);
    rows.push({...checks,fullReplayNoninterference:eligible,
      genuineOwnerObservations:observed.volt?.agent9RealOwnerDecisionAudit?.
        actorOwnedRootObservations??null,
      nativeDisposition:row.status});
  }
  assert.ok(rows.every(x=>x.fullReplayNoninterference),
    'Read-only observation changed actual Store execution or physical deals');
  const next=auditV7SourceOwnerContinuation(nativeReceipt);
  const returns=next.attackRecords.map(record=>{
    const match=auditById.get(record.id);
    const read=match.volt?.agent9RealOwnerDecisionAudit;
    const ownerRecords=(read?.realStoreRootProposals??[]).filter(x=>
      x.seat===record.sourceSeat&&x.globalTurn===record.nextOwnerTurn);
    const pass=ownerRecords.filter(x=>
      x.nativeProposedAction==='PassTurnAction');
    const hasAnAcceptedPass=record.ownerActions.some(a=>
      a.action==='PassTurnAction');
    const matchStatus=record.nextOwnerTurn===null?'not-encountered':
      !read?'owner-observer-missing':
      !hasAnAcceptedPass?'owner-turn-not-ended-by-pass':
      pass.length===1?'one-observed-pass-proposal':'ambiguous-pass-proposals';
    return {id:record.id,sourceSeat:record.sourceSeat,
      sourceDealFingerprint:record.sourceDealFingerprint,
      settledSourceAttackOrdinal:record.attackOrdinal,
      nextOwnerTurn:record.nextOwnerTurn,
      acceptedOwnerActions:record.ownerActions,
      matchedObservationStatus:matchStatus,
      matchingPassProposalCount:pass.length,
      ownerHandAtNativePass:pass.length===1?[...pass[0].ownerHand]:null,
      ownerPublicAtNativePass:pass.length===1?pass[0].ownerPublic:null,
      opponentPublicAtNativePass:pass.length===1?pass[0].opponentPublic:null,
      ownerResourcesAtNativePass:pass.length===1?pass[0].ownerResources:null,
      usedSupporterQuotaBeforeBot:pass.length===1?
        pass[0].supporterQuotaBeforeBot:null,
      usedSupporterQuotaAfterBot:pass.length===1?
        pass[0].supporterQuotaAfterBot:null,
      paperPaidAlternativeCertified:false,
      opponentChoiceCompetenceCertified:false,
      gameQualified:false};
  });
  return {schema:'agent9-v7-genuine-owner-hand-readonly-replay-v1',
    originalArchiveSha256:baseline.originalArchiveSha256,
    pinnedVendor:baseline.originalVendorPin,
    registeredArms:rows.length,
    fullPublicReplayNoninterference:true,
    sourceReturnAttackCount:next.knownSettledSourceAttacks,
    sourceOwnerReturnObserved:next.attacksWithObservedOwnerReturn,
    ownerReadOnlyReturns:returns,
    ownerObservationMatches:returns.filter(x=>
      x.matchedObservationStatus==='one-observed-pass-proposal').length,
    unknownSourceAborts:next.unknownAttackSettlementRows,
    rows,competitiveGamesQualified:0,estimatedWinRate:null};
}

module.exports={reconcileOwnerObservation};
