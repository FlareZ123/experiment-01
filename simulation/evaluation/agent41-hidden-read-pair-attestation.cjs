'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');

const VERSION='agent41-hidden-read-live-root-pair-attestation-v1';

/**
 * An unqualified direct-original-game comparison for an off/on native-read
 * observer on the exact four archived rank6/rank11 trial identities.
 * Matching public output cannot establish hidden-information safety.
 *
 * @param {object} row One canonical development-arm record.
 * @returns {object} Source deal, physical starter, Store roots and consequences.
 */
function physicalPlaybackProjection(row) {
  return {
    trial:row.trial,
    status:row.status??null,
    seed:row.trial?.seed??null,
    actualStarterSeat:row.actualStarterSeat??null,
    verifiedFirstTurn:row.verifiedFirstTurn??null,
    sourceActuallyFirst:row.sourceActuallyFirst??null,
    candidateSeat:row.candidateSeat??null,
    sourceSeat:row.sourceSeat??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    sourceFirstOwnHandSha256:row.sourceFirstOwnHandSha256??null,
    rootActionLedgerSha256:row.rootActionLedgerSha256??null,
    actionCount:row.actionCount??null,
    turns:row.turns??null,
    attackDeclarations:row.attackDeclarations??null,
    settledPublicAttackCount:row.settledPublicAttackCount??null,
    firstSettledPublicAttack:row.firstSettledPublicAttack??null,
    finalPrizes:row.finalPrizes??null,
    finalBoard:row.finalBoard??null,
    finished:row.finished??null,
    winner:row.winner??null,
    endReason:row.endReason??null
  };
}

/**
 * Fail-closed comparison of the two deliberately independently run archives.
 * Archive equality is only a noninterference prerequisite to interpreting
 * the read counters; it is not a counterfactual comparison of hidden cards.
 *
 * @param {object} control Default-off four-arm canonical archive.
 * @param {object} observed Identical seeds/printed decks with read audit on.
 * @returns {object} Per-arm failure-inclusive classifications.
 */
function compareNativeReadArchives(control,observed) {
  assert.equal(control?.nativeOpponentHiddenReadAuditOptIn,false);
  assert.equal(observed?.nativeOpponentHiddenReadAuditOptIn,true);
  assert.equal(control?.enginePin,observed?.enginePin);
  assert.equal(control?.candidatePolicy,observed?.candidatePolicy);
  assert.ok(Array.isArray(control.rows)&&Array.isArray(observed.rows));
  assert.equal(control.rows.length,4);
  assert.equal(observed.rows.length,4);
  const controlIds=control.rows.map(r=>r.trial?.id);
  const observedIds=observed.rows.map(r=>r.trial?.id);
  assert.equal(new Set(controlIds).size,4);
  assert.equal(new Set(observedIds).size,4);
  assert.deepEqual([...controlIds].sort(),[...observedIds].sort());
  const pairs=[];
  for(const id of controlIds) {
    const base=control.rows.find(r=>r.trial?.id===id);
    const probe=observed.rows.find(r=>r.trial?.id===id);
    const b=physicalPlaybackProjection(base);
    const p=physicalPlaybackProjection(probe);
    const physicallyVerified=Boolean(
      b.sourceDealFingerprint&&p.sourceDealFingerprint&&
      b.rootActionLedgerSha256&&p.rootActionLedgerSha256&&
      b.verifiedFirstTurn===true&&p.verifiedFirstTurn===true);
    const equalPlayback=isDeepStrictEqual(b,p);
    const audit=probe.nativeOpponentHiddenReadAudit??null;
    const status=!physicallyVerified?'insufficient-native-deal-or-root-evidence':
      !equalPlayback?'instrumentation-altered-physical-playback':
      !audit?'observer-report-missing':
      audit.observedNativeRoot!==true?'target-native-decision-unobserved':
      audit.nativeRootChangedDuringDecision!==false?
        'original-state-mutated-during-observed-decision':
        'noninterfering-native-read-census-only';
    pairs.push({
      trialId:id,status,
      sourceDealMatched:Boolean(b.sourceDealFingerprint&&
        b.sourceDealFingerprint===p.sourceDealFingerprint),
      sourceRootMatched: Boolean(b.rootActionLedgerSha256&&
        b.rootActionLedgerSha256===p.rootActionLedgerSha256),
      fullPhysicalPlaybackMatched:equalPlayback&&physicallyVerified,
      proposalReads:audit?.proposalReads??null,
      validationReads:audit?.validationReads??null,
      observedNativeRoot:audit?.observedNativeRoot??null,
      actorInformationSetCertified:false,
      competitiveGameQualified:false
    });
  }
  return {
    schema:VERSION,attempted:pairs.length,pairs,
    fullyNoninterferingNativeReadCensuses:pairs.filter(x=>
      x.status==='noninterfering-native-read-census-only').length,
    completeNativeReadCensusQualified:pairs.every(x=>
      x.status==='noninterfering-native-read-census-only'),
    actorInformationSetCertified:false,
    competitiveQualifiedGames:0,
    caveat:'Four historical development deals only; observational read counts cannot establish hidden-information causal action sensitivity or match strength.'
  };
}
module.exports={VERSION,physicalPlaybackProjection,compareNativeReadArchives};
