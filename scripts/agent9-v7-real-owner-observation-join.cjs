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
function reconcileOwnerObservation(nativeReceipt, attempts, baseline = registration, deps = {}) {
  const screen = deps.screen ?? require(
    '../simulation/evaluation/agent9-v7-postvolt-necessary-screen.cjs'
  ).screenPostVoltNecessaryRoutes;
  assert.equal(typeof screen, 'function');
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
    const acceptedPass=pass.filter(x=>x.isAcceptedStoreRoot===true);
    const acceptedPassRoots=record.ownerActions.filter(a=>
      a.action==='PassTurnAction');
    const matchedPass = acceptedPassRoots.length===1&&
      acceptedPass.length===1 ? acceptedPass[0] : null;
    const batonScreen = matchedPass ? screen({
      decisionKind: 'owner-root',
      globalTurn: matchedPass.globalTurn,
      actorSeat: matchedPass.seat,
      ownHand: matchedPass.ownerHand,
      ownPublic: matchedPass.ownerPublic,
      opponentPublic: matchedPass.opponentPublic,
      ownTurnResources: matchedPass.ownerResources
    }) : null;
    const matchStatus=record.nextOwnerTurn===null?'not-encountered':
      !read?'owner-observer-missing':
      acceptedPassRoots.length===0?'owner-turn-not-ended-by-pass':
      acceptedPassRoots.length>1?'ambiguous-accepted-public-pass-roots':
      acceptedPass.length===1?'one-store-accepted-pass-proposal':
      acceptedPass.length>1?'ambiguous-store-accepted-pass-proposals':
      pass.length>0?'pass-proposed-but-not-store-accepted':
      'pass-proposal-not-observed';
    return {id:record.id,sourceSeat:record.sourceSeat,
      sourceDealFingerprint:record.sourceDealFingerprint,
      settledSourceAttackOrdinal:record.attackOrdinal,
      nextOwnerTurn:record.nextOwnerTurn,
      acceptedOwnerActions:record.ownerActions,
      matchedObservationStatus:matchStatus,
      matchingPassProposalCount:pass.length,
      matchingStoreAcceptedPassCount:acceptedPass.length,
      matchingPublicPassRootCount:acceptedPassRoots.length,
      acceptedOwnerPassRootOrdinal:matchedPass?
        acceptedPassRoots[0].ordinal:null,
      printedDceBatonNecessaryScreen:batonScreen,
      screenIsPaidNativeAction:false,
      ownerHandAtNativePass:matchedPass?[...matchedPass.ownerHand]:null,
      ownerPublicAtNativePass:matchedPass?.ownerPublic??null,
      opponentPublicAtNativePass:matchedPass?.opponentPublic??null,
      ownerResourcesAtNativePass:matchedPass?.ownerResources??null,
      usedSupporterQuotaBeforeBot:matchedPass?.
        supporterQuotaBeforeBot??null,
      usedSupporterQuotaAfterBot:matchedPass?.
        supporterQuotaAfterBot??null,
      paperPaidAlternativeCertified:false,
      opponentChoiceCompetenceCertified:false,
      gameQualified:false};
  });
  return {schema:'agent9-v7-genuine-owner-hand-readonly-replay-v2',
    originalArchiveSha256:baseline.originalArchiveSha256,
    pinnedVendor:baseline.originalVendorPin,
    registeredArms:rows.length,
    fullPublicReplayNoninterference:true,
    sourceReturnAttackCount:next.knownSettledSourceAttacks,
    sourceOwnerReturnObserved:next.attacksWithObservedOwnerReturn,
    ownerReadOnlyReturns:returns,
    ownerObservationMatches:returns.filter(x=>
      x.matchedObservationStatus==='one-store-accepted-pass-proposal').length,
    unknownSourceAborts:next.unknownAttackSettlementRows,
    rows,competitiveGamesQualified:0,estimatedWinRate:null};
}

module.exports={reconcileOwnerObservation};
