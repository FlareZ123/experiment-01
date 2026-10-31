'use strict';

const assert=require('node:assert/strict');
const VERSION='agent25-original32-source-contest-sample-audit-v1';

/**
 * Summarize the original 32-arm source-owned Plumeria/Flare archive.
 * Counts of roots/turns are observed, repeated and correlated.
 * A bounded example list must never be used as a complete denominator.
 *
 * @param {object} archive Original read-only source-root JSON artifact
 * @returns {object} Audit of omitted positive samples and source-deal pairing
 */
function auditOriginalSourceContestArchive(archive){
  assert.equal(archive.frozenBeforeThisObserver,true);
  assert.equal(archive.sourceOwnerReadOnly,true);
  assert.equal(archive.sameRootNativeDispatchCounterfactual,false);
  assert.equal(archive.competitiveQualifiedGames,0);
  assert.ok(Array.isArray(archive.rows)&&archive.rows.length===32);
  const rows=archive.rows;
  const duplicateIds=new Set();
  for(const row of rows){
    assert.ok(!duplicateIds.has(row.id),'duplicate original game identifier');
    duplicateIds.add(row.id);
    assert.ok([6,11].includes(row.rank),'unexpected source rank');
    assert.equal(row.ownerAuditStatus,'actual-original-store');
    assert.ok(Number.isSafeInteger(row.bothHeldSourceRoots)&&
      Number.isSafeInteger(row.bothNativePlayableSourceRoots));
    assert.ok(row.bothNativePlayableSourceRoots<=row.bothHeldSourceRoots);
    assert.ok(Array.isArray(row.sourceExamples));
  }
  const rank6=rows.filter(r=>r.rank===6);
  const rank11=rows.filter(r=>r.rank===11);
  assert.equal(rank6.length,16);
  assert.equal(rank11.length,16);
  const paired=new Map();
  for(const r of rows){
    const parts=r.id.split(':');
    assert.equal(parts.length,4);
    const key=parts.slice(0,3).join(':');
    const group=paired.get(key)??[];
    group.push(r);paired.set(key,group);
  }
  const sourceDealMismatches=[];
  for(const [key,group] of paired){
    assert.equal(group.length,2,`expected two unchanged-source candidate arms per ${key}`);
    if(group[0].sourceDealFingerprint!==group[1].sourceDealFingerprint)
      sourceDealMismatches.push({pair:key,
        trialIds:group.map(r=>r.id),
        sourceDealFingerprints:group.map(r=>r.sourceDealFingerprint)});
  }
  const positiveArms=rank6.filter(r=>r.bothNativePlayableSourceRoots>0);
  const missingPositiveWitnesses=positiveArms.filter(r=>
    !r.sourceExamples.some(sample=>sample.paperScreenedBothPlayable===true));
  const misleadingTruncationFlags=rank6.filter(r=>
    r.sourceExamples.length<r.bothHeldSourceRoots&&
    r.auditSamplesMayBeTruncated===false);
  const witnessedFirstPositive=positiveArms.flatMap(r=>{
    const witness=r.sourceExamples.find(s=>s.paperScreenedBothPlayable===true);
    return witness?[{id:r.id,sourceSeat:r.sourceSeat,
      firstAvailableInBoundedSamplesTurn:witness.turn,
      firstAvailableInBoundedSamplesRootOrdinal:witness.ownerRootOrdinal,
      firstAvailableInBoundedSamplesPaymentPairs:witness.paymentPairs}]:[];
  });
  assert.equal(witnessedFirstPositive.length+
    missingPositiveWitnesses.length,positiveArms.length);
  const knownTimes=witnessedFirstPositive
    .map(w=>w.firstAvailableInBoundedSamplesTurn).sort((a,b)=>a-b);
  const mid=Math.floor(knownTimes.length/2);
  const median=knownTimes.length===0?null:
    knownTimes.length%2===1?knownTimes[mid]:
      (knownTimes[mid-1]+knownTimes[mid])/2;
  const uniqueSourceDeals=new Map();
  for(const r of rank6){
    assert.equal(typeof r.sourceDealFingerprint,'string');
    const key=r.sourceDealFingerprint;
    const prev=uniqueSourceDeals.get(key)??{
      fingerprint:key,trialIds:[],anyPositive:false};
    prev.trialIds.push(r.id);
    prev.anyPositive ||=r.bothNativePlayableSourceRoots>0;
    uniqueSourceDeals.set(key,prev);
  }
  return {
    version:VERSION,
    numberOfOriginalGames:rows.length,
    sourceDecks:['rank6-original-iron-thorns','rank11-original-lock'],
    unchangedSourceCandidatePairs:paired.size,
    sourceDealsIdenticalAcrossPairCount:
      paired.size-sourceDealMismatches.length,
    sourceDealMismatches,
    sourceRank6UniquePhysicalDealFingerprints:uniqueSourceDeals.size,
    rank6UniqueDealsWithAnyPositiveArm:[...uniqueSourceDeals.values()]
      .filter(v=>v.anyPositive).length,
    rank6ObservedOwnerRoots:rank6.reduce((n,r)=>n+r.sourceOwnerRoots,0),
    rank6SourceBothPlayableRootCount:rank6.reduce(
      (n,r)=>n+r.bothNativePlayableSourceRoots,0),
    rank6PositiveOriginalArms:positiveArms.length,
    rank6PositiveArmsWithFirstSampledNativePlayableWitness:
      witnessedFirstPositive.length,
    rank6PositiveArmsWithoutAnyBoundedNativePlayableWitness:
      missingPositiveWitnesses.map(r=>({
        id:r.id,bothNativePlayableSourceRoots:r.bothNativePlayableSourceRoots,
        firstEightSampledTurns:r.sourceExamples.map(s=>s.turn),
        firstEightAllNonplayable:r.sourceExamples.every(
          s=>s.paperScreenedBothPlayable===false),
        sourceExamplesClaimTruncated:r.auditSamplesMayBeTruncated
      })),
    perArmFalseSampleCompletenessClaims:misleadingTruncationFlags
      .map(r=>({id:r.id,totalCoheldRoots:r.bothHeldSourceRoots,
        keptSourceExamples:r.sourceExamples.length,
        reportedMayBeTruncated:r.auditSamplesMayBeTruncated})),
    firstNativePlayableBoundedWitnesses:witnessedFirstPositive,
    medianFirstSampledPositiveWitnessGlobalTurn:median,
    firstSampledPositiveTurnMin:knownTimes.length?knownTimes[0]:null,
    firstSampledPositiveTurnMax:knownTimes.length?
      knownTimes[knownTimes.length-1]:null,
    allSampleWindowsComplete:false,
    estimatedIndependentTrialWinRate:null,
    competitiveQualifiedGames:0
  };
}

module.exports={VERSION,auditOriginalSourceContestArchive};

if(require.main===module){
  const fs=require('node:fs');
  const file=process.argv[2];
  assert.ok(typeof file==='string'&&file.length>0,
    'Provide the downloaded source ZIP extracted JSON path');
  const source=JSON.parse(fs.readFileSync(file,'utf8'));
  process.stdout.write(JSON.stringify(
    auditOriginalSourceContestArchive(source),null,2)+'\n');
}
