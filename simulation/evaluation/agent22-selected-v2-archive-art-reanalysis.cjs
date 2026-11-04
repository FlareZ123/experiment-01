'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {
  auditBilateralOriginalSourceArt
}=require('./agent22-bilateral-source-art-sidecar.cjs');
const {
  loadPinnedSource,SOURCE_BLOB_SHA
}=require('./agent22-aichi-source-print-crosswalk.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {loadNewMoonCandidate}=
  require('../../scripts/aichi-new-moon-candidate.cjs');
const {writeAtomicLocked}=
  require('./agent49-pinned-source-print-census.cjs');

const VERSION='agent22-archived-selected-v2-source-art-reanalysis-v1';
const FROZEN_ARCHIVE_SHA256=
  'e7f7fa2a104585cedc3e7d0e1df7491b9a1e9d32eb0cbaf906a1c2b4a2b366e9';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const OUTPUT=path.resolve(process.cwd(),
  'agent22-archived-selected-v2-original-provenance.json');
const MODES=['joint-v1-control','selected-v2-symmetric-vip'];

/**
 * Reattach pinned live source-resolution details to the frozen 52-arm archive
 * without replaying games, altering historical results, or projecting winners.
 *
 * @param {object} archived Frozen 3 Nov historical selected-v2 artifact.
 * @param {object} original Original unchanged name/count source manifest.
 * @param {Map<string,object>} actualNativePlans Independent actual planAichi
 *   resolver results for the two originally selected candidates.
 * @returns {object}
 */
function auditFrozenSelectedV2(
  archived,original,actualNativePlans
){
  assert.equal(archived.schema,
    'agent23-selected-symmetric-joint-v2-native-source-audit-v1');
  assert.equal(archived.pinnedVendorGitRevision,PIN);
  assert.equal(archived.attemptCount,52);
  assert.equal(archived.originalSourceSixtiesAuthenticated,true);
  assert.equal(archived.competitivelyQualifiedGames,0);
  assert.equal(original.decks.length,29);
  assert.deepEqual(archived.originalMissingRanks,[23,25,28]);
  assert.deepEqual(archived.modes.map(x=>x.id),MODES);
  assert.equal(actualNativePlans.size,2);
  const outputs=archived.modes.map(mode=>{
    assert.equal(mode.native.rows.length,26);
    assert.equal(mode.native.sourcePairs.length,13);
    assert.equal(mode.native.enginePin,PIN);
    assert.equal(mode.native.competitiveQualifiedGames,0);
    const result=auditBilateralOriginalSourceArt(
      mode.native,original,actualNativePlans);
    const tally={};
    for(const pair of result.sourceOpeningPairs) {
      const k=pair.sourceOpeningStatus;
      tally[k]=(tally[k]??0)+1;
    }
    const postEventCopiesByRank={};
    for(const row of result.sourceInputProvenanceReceipts){
      const n=row.originalSourceProvenance.postEventArtCopies;
      if(n>0){
        const rank=row.sourceRank;
        postEventCopiesByRank[rank]=(postEventCopiesByRank[rank]??0)+n;
      }
    }
    return {
      archivedMode:mode.id,
      sourceRowsObserved:result.sourceInputProvenanceReceipts.length,
      originalSourceGroups:result.sourceOpeningPairs.length,
      sourceOpeningStatuses:tally,
      postEventArtworkCopiesAcrossRepeatedContexts:postEventCopiesByRank,
      sourceArtOriginalRank11ContextCopies:postEventCopiesByRank[11]??0,
      sourceNativeAliasesAccountedFor:
        result.allNativeSourceArtRowsCovered,
      historicalPhysicalArtCertified:
        result.historicalPhysicalArtCertified,
      competivelyQualifiedGames:result.competitiveQualifiedGames,
      rowReceipts:result.sourceInputProvenanceReceipts,
      physicalPairReceipts:result.sourceOpeningPairs
    };
  });
  assert.ok(outputs.every(x=>x.sourceNativeAliasesAccountedFor===true));
  assert.ok(outputs.every(x=>x.sourceRowsObserved===26));
  assert.ok(outputs.every(x=>x.originalSourceGroups===13));
  assert.ok(outputs.every(x=>x.competivelyQualifiedGames===0));
  return {
    schema:VERSION,originalSourceGitBlobSha:SOURCE_BLOB_SHA,
    archiveSha256:FROZEN_ARCHIVE_SHA256,
    vendorPin:PIN,archiveAttemptCount:52,
    sourceHistoricalPhysicalPrinting:'unknown',
    actualNativeBasicEnergyPrintingValidatedSeparateAudit:
      'agent22-pinned-may2026-energy-proxy-native-id-audit-v1',
    originalSourceRankCount:29,
    originalSourceMissingRanks:[23,25,28],
    sourceGameplaySemanticsCertified:false,
    fullSourcePhysicalDealEquivalenceCertified:false,
    selectedOpponentPolicyCertified:false,
    officialMatchClockCertified:false,
    competitivelyQualifiedGames:0,
    modes:outputs
  };
}

/** Actual read-only pinned archive plus compiled native resolver run. */
function run(archivePath){
  assert.ok(typeof archivePath==='string'&&archivePath.length>0);
  const archiveBytes=fs.readFileSync(archivePath);
  const fingerprint=createHash('sha256')
    .update(archiveBytes).digest('hex');
  assert.equal(fingerprint,FROZEN_ARCHIVE_SHA256,
    'Archived full 52-arm JSON changed from recorded immutable source');
  const archived=JSON.parse(archiveBytes.toString('utf8'));
  const original=loadPinnedSource();
  const champion=original.decks.find(x=>x.rank===1);
  assert.ok(champion);
  const newMoon=loadNewMoonCandidate();
  const options={
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  };
  const actualNativePlans=new Map([
    ['champion-reference',
      planAichi({label:'champion-reference',cards:champion.cards},options)],
    ['new-moon-lockbreaker-v1',
      planAichi({label:'new-moon-lockbreaker-v1',cards:newMoon.cards},options)]
  ]);
  assert.ok([...actualNativePlans.values()].every(
    x=>x.sourceDeckCount===29&&x.engineRevision===PIN));
  const result=auditFrozenSelectedV2(
    archived,original,actualNativePlans);
  writeAtomicLocked(OUTPUT,JSON.stringify(result,null,2)+'\n');
  console.log('AGENT22_FROZEN_SOURCE_PROVENANCE',JSON.stringify({
    version:result.schema,source:result.originalSourceGitBlobSha,
    archiveSha256:result.archiveSha256,
    pinnedVendor:result.vendorPin,
    modes:result.modes.map(x=>({
      id:x.archivedMode,
      arms:x.sourceRowsObserved,
      pairs:x.originalSourceGroups,
      sourceOpeningStatuses:x.sourceOpeningStatuses,
      historicalArtCopiesRepeatedContexts:
        x.sourceArtOriginalRank11ContextCopies,
      liveNativeMapped:x.sourceNativeAliasesAccountedFor
    })),
    qualifiedGames:0,output:path.basename(OUTPUT)
  }));
  return result;
}

if(require.main===module){
  assert.equal(process.argv.length,3,
    'Provide only frozen downloaded archive JSON path');
  run(process.argv[2]);
}
module.exports={VERSION,FROZEN_ARCHIVE_SHA256,auditFrozenSelectedV2,run};
