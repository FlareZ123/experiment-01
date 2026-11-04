'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {
  sourceProvenanceReceipt
}=require('./agent22-source-provenance-receipt.cjs');
const {
  auditCrossCandidateSourcePair,physicalDigest,verifiedStarter
}=require('./agent44-cross-candidate-source-pair-status.cjs');
const {
  SOURCE_BLOB_SHA,auditMay2026SourcePrints
}=require('./agent22-aichi-source-print-crosswalk.cjs');

const VERSION='agent22-bilateral-original-source-art-sidecar-v1';

/**
 * Read-only post-run ledger. The raw game-result JSON is preserved unchanged.
 * It is safe to add to a new prospective release without changing any bot
 * decision, shuffle, physical deal, or frozen historical artifact.
 *
 * @param {object} run Completed canonical bilateral development output.
 * @param {object} original Pinned original 29-rank name/count manifest.
 * @param {Map<string,object>} actualNativePlans Real planAichi result for
 *   each compared candidate, keyed by the original trial.candidateId.
 * @returns {object} Independent provenance sidecar only, never game strength.
 */
function auditBilateralOriginalSourceArt(
  run,original,actualNativePlans
){
  assert.ok(Array.isArray(run?.rows));
  assert.ok(Array.isArray(run?.sourcePairs));
  assert.ok(actualNativePlans instanceof Map);
  assert.ok(run.rows.length>0);
  const chronology=auditMay2026SourcePrints(original);
  assert.equal(chronology.sourceGitBlobSha,SOURCE_BLOB_SHA);
  const rowsById=new Map();
  const ranked=new Map();
  for(const row of run.rows){
    const t=row.trial;
    assert.ok(t && typeof t.id==='string' && t.id.length>0);
    assert.ok(!rowsById.has(t.id),'Duplicate game-result trial '+t.id);
    assert.equal(t.id.split(':').at(-1),t.candidateId);
    assert.ok(original.decks.some(d=>d.rank===t.rank));
    assert.ok(actualNativePlans.has(t.candidateId),
      'Missing actual resolver plan for '+t.candidateId);
    rowsById.set(t.id,row);
    const pairId=t.id.slice(0,t.id.lastIndexOf(':'));
    if(!ranked.has(pairId))ranked.set(pairId,[]);
    ranked.get(pairId).push(row);
  }
  assert.equal(ranked.size,run.sourcePairs.length,
    'Bilateral original trial groups must match sourcePairs census');
  const sourcePairById=new Map();
  for(const pair of run.sourcePairs){
    assert.ok(!sourcePairById.has(pair.pairId));
    sourcePairById.set(pair.pairId,pair);
  }
  const checked=new Map();
  const paired=[];
  for(const [pairId,parties] of ranked){
    assert.equal(parties.length,2,'Expected exactly two candidate policies');
    const first=parties.find(x=>x.trial.candidateId==='champion-reference');
    const second=parties.find(x=>x.trial.candidateId==='new-moon-lockbreaker-v1');
    assert.ok(first && second,'Expected original two fixed candidate identities');
    const advertised=sourcePairById.get(pairId);
    assert.ok(advertised,'No common runner pair receipt for '+pairId);
    const evaluated=auditCrossCandidateSourcePair(first,second);
    // Historical sourcePairs report boolean witnesses, while later common
    // runners may publish the richer three-state parity strings. Verify the
    // actual recorded form without upgrading legacy false to a proven mismatch.
    if(typeof advertised.sourceDealStatus==='string'){
      assert.equal(advertised.sourceDealStatus,evaluated.sourceDealStatus);
    }else{
      assert.equal(advertised.sameSourcePhysicalDeal,
        evaluated.sameSourcePhysicalDeal);
    }
    if(typeof advertised.actualStarterStatus==='string'){
      assert.equal(advertised.actualStarterStatus,
        evaluated.actualStarterStatus);
    }else{
      assert.equal(advertised.sameActualStarter,
        evaluated.sameActualStarter);
    }
    if(Array.isArray(advertised.sourceDealFingerprints)){
      assert.deepEqual(advertised.sourceDealFingerprints,[
        first.sourceDealFingerprint??null,second.sourceDealFingerprint??null
      ],'Frozen sourcePairs physical digests differ from actual rows');
    }
    const bothPhysical=physicalDigest(first.sourceDealFingerprint)&&
      physicalDigest(second.sourceDealFingerprint);
    const bothStarter=verifiedStarter(first)!==null &&
      verifiedStarter(second)!==null;
    const observation=bothPhysical&&bothStarter?{
      matched:evaluated.sameSourcePhysicalDeal&&evaluated.sameActualStarter,
      evidenceDigest:createHash('sha256').update(JSON.stringify({
        pairId,first:first.trial.id,second:second.trial.id,
        firstPhysical:first.sourceDealFingerprint,
        secondPhysical:second.sourceDealFingerprint,
        firstStarter:verifiedStarter(first),
        secondStarter:verifiedStarter(second)
      })).digest('hex')
    }:null;
    checked.set(pairId,observation);
    paired.push({
      pairId,firstTrialId:first.trial.id,secondTrialId:second.trial.id,
      sourceOpeningStatus:evaluated.crossCandidateOpeningStatus,
      sourcePhysicalStatus:evaluated.sourceDealStatus,
      sameStarterStatus:evaluated.actualStarterStatus,
      physicalPairObserved:observation!==null,
      physicalPairEvidenceSha256:observation?.evidenceDigest??null,
      competitivelyQualified:false
    });
  }
  const receipts=run.rows.map(row=>{
    const trial=row.trial;
    const pairId=trial.id.slice(0,trial.id.lastIndexOf(':'));
    const evidence=checked.get(pairId);
    const receipt=sourceProvenanceReceipt(original,trial.rank,
      actualNativePlans.get(trial.candidateId),evidence);
    assert.equal(receipt.sourceOriginalExists,true);
    return {
      trialId:trial.id,sourceRank:trial.rank,
      sourceCandidateId:trial.candidateId,
      originalSourceProvenance:receipt,
      sharedCrosswalkRevision:chronology.crosswalkSha256,
      postgameOnly:true,
      paperPolicyQualified:false,
      competitivelyQualified:false
    };
  });
  return {
    schema:VERSION,
    originalSourceGitBlobSha:SOURCE_BLOB_SHA,
    crosswalkRevision:chronology.crosswalkSha256,
    sourceOriginalCount:original.decks.length,
    sourceInputProvenanceReceipts:receipts,
    sourceOpeningPairs:paired,
    allNativeSourceArtRowsCovered:receipts.every(r=>
      r.originalSourceProvenance.engine_proxy_map
        .datedArtRowsAccountedFor===true),
    historicalPhysicalArtCertified:false,
    sourceNativeGameSemanticsCertified:false,
    sourceOwnerPolicyCertified:false,
    officialPaperClockCertified:false,
    competitiveQualifiedGames:0
  };
}
module.exports={VERSION,auditBilateralOriginalSourceArt};
