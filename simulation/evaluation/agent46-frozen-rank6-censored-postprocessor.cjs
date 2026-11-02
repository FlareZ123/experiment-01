'use strict';

const assert=require('node:assert/strict');
const {registeredSourceFieldPairs}=
  require('./agent46-original-source-field-pair-bridge.cjs');
const {anytimePairedFieldDelta}=
  require('./agent46-anytime-paired-field-delta.cjs');

const VERSION='agent46-frozen-rank6-censored-pair-postprocessor-v1';
const CANDIDATES=['champion-reference','new-moon-lockbreaker-v1'];

/**
 * Postprocess the actual immutable Agent20 v1 source-canary artifact
 * without modifying its runner, archived winner fields or original four
 * attempts. Every native terminal remains CENSORED. This read-only join
 * requires the exact profile roster identity and the archived original
 * source 60 admission manifest. Its status is always noncompetitive.
 *
 * The output can later be passed to an independent paper-game admission
 * process. Never silently promote this v1 experiment to qualified games.
 *
 * @param {object} profile Immutable Agent20 four-trial v1 registration.
 * @param {object} sourceRoster Independently archived Agent48 original-60 ledger.
 * @param {object} archive Entire original Agent20 native output JSON.
 * @returns {object} One exact two-seat developmental sample and 64-cell bound.
 */
function frozenRank6ToCensoredPairs(profile,sourceRoster,archive){
  assert.equal(profile?.schema,'agent20-frozen-bilateral-rank6-canary-v1');
  assert.deepEqual(profile.candidateIds,CANDIDATES);
  assert.ok(Array.isArray(profile.registeredTrials));
  assert.equal(profile.registeredTrials.length,4);
  assert.equal(sourceRoster?.schema,'agent48-aichi-original-printed60-admission-v1');
  assert.equal(sourceRoster.sourceGitBlobSha,profile.printedRosterBlobSha);
  const source=sourceRoster.rows.find(row=>row.rank===6);
  assert.ok(source?.physicalCards===60&&/^[a-f0-9]{64}$/.test(source.printed60Sha256??''));
  assert.ok(Array.isArray(archive?.rawNativeResult?.rows));
  const groups=new Map();
  for(const trial of profile.registeredTrials){
    assert.equal(trial.rank,6);
    assert.ok(CANDIDATES.includes(trial.candidateId));
    const key=[trial.rank,trial.repeat,trial.candidateSlot,trial.seed].join(':');
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(trial);
  }
  assert.equal(groups.size,2);
  const registration=[];
  for(const [key,entries] of groups){
    assert.equal(entries.length,2);
    const reference=entries.find(x=>x.candidateId===CANDIDATES[0]);
    const challenger=entries.find(x=>x.candidateId===CANDIDATES[1]);
    assert.ok(reference&&challenger);
    assert.deepEqual(
      [reference.rank,reference.repeat,reference.candidateSlot,reference.seed],
      [challenger.rank,challenger.repeat,challenger.candidateSlot,challenger.seed]);
    const candidateSeat=reference.candidateSlot==='A'?0:1;
    assert.ok(reference.candidateSlot==='A'||reference.candidateSlot==='B');
    registration.push({
      pairId:key,roundId:'original-rank6-'+reference.repeat,
      rank:6,candidateSeat,originalSourcePrintDigest:source.printed60Sha256,
      referenceTrialId:reference.id,challengerTrialId:challenger.id
    });
  }
  const observations=archive.rawNativeResult.rows.map(row=>({
    trialId:row.trial?.id,candidateId:row.trial?.candidateId,
    candidateSeat:row.candidateSeat,
    verifiedFirstTurn:row.verifiedFirstTurn,
    sourceDealFingerprint:row.sourceDealFingerprint,
    nativeWinnerSeat:row.nativeWinnerSeat,
    finished:row.finished,
    qualifiesForCompetitiveInference:row.qualifiesForCompetitiveInference
  }));
  const paired=registeredSourceFieldPairs({
    referenceId:CANDIDATES[0],challengerId:CANDIDATES[1],
    layout:'RANK_SEAT',registration,observations,
    authenticatedOriginalPrints:sourceRoster.rows
    // DELIBERATELY NO QUALIFIER. Native engine terminals are unknown.
  });
  const interval=anytimePairedFieldDelta({
    candidateOrdinal:1,cells:paired.cells
  });
  return {
    version:VERSION,
    originalReleaseProfile:profile.schema,
    originalRosterBlobSha:profile.printedRosterBlobSha,
    immutableProfileRegistry:registration.map(x=>x.pairId),
    paired,
    statisticalStatus:interval,
    competitiveGameQualified:false,
    note:'Read-only developmental native four-arm postprocessor; zero independently qualified games. The old paper-cost/owner-policy/clock evidence gates remain unresolved.'
  };
}

module.exports={VERSION,frozenRank6ToCensoredPairs};
