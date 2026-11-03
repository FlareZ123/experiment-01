'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {auditSelectedV2Archive}=
  require('../simulation/evaluation/agent48-archive-selected-v2-census.cjs');

/**
 * Analyze a previously archived immutable source release in read-only mode.
 * Print digest-only first-turn provenance and compact statuses; never show
 * hidden cards, source hands, decks, Prize identities or root transcripts.
 *
 * @param {string} archiveFile Already downloaded native Actions JSON path.
 * @returns {object} Independent posthoc evidence, no qualification.
 */
function inspectFile(archiveFile){
  assert.ok(typeof archiveFile==='string'&&archiveFile.length>0);
  const raw=fs.readFileSync(archiveFile);
  const artifactSha256=createHash('sha256').update(raw).digest('hex');
  const archive=JSON.parse(raw.toString('utf8'));
  const audit=auditSelectedV2Archive(archive);
  const summarize=mode=>({
    groups:mode.groups,digestCompared:mode.sourceDigestCompared,
    physicalMatched:mode.sourceDigestMatched,
    physicalMismatched:mode.sourceDigestMismatched,
    physicalUnknown:mode.sourceDigestUnknown,
    groupsWithRecoveredAbortSideDigest:
      mode.groupsWithRecoveredAbortSideDigest,
    starterCompared:mode.starterCompared,
    starterMatched:mode.starterMatched,
    candidatePhysicalContrastSupported:
      mode.pairedCandidatePhysicalContrastSupported,
    groupReceipts:mode.records.map(x=>({
      group:x.groupId,physicalKnown:x.digestKnown,
      physicalMatched:x.originalSourcePhysicalMatch,
      starterKnown:x.starterKnown,starterMatched:x.firstTurnSeatMatch
    }))
  });
  return {
    schema:audit.schema,
    sourceArchiveFile:path.basename(archiveFile),
    sourceArchiveSha256:artifactSha256,
    frozenAttemptCount:audit.attemptedNativeGames,
    originalFrozenPhysicalPairGate:audit.frozenSourcePairsAccepted+'/26',
    censoredOriginalRank6Posthoc:audit.censoredRank6Posthoc,
    crossCandidate:{
      baseline:summarize(audit.crossCandidateOriginalSourceDeals.baseline),
      selected:summarize(audit.crossCandidateOriginalSourceDeals.selected)
    },
    crossCandidateIncludingVerifiedAbortDigests:{
      baseline:summarize(audit.crossCandidateOriginalSourceDealsIncludingVerifiedAborts.baseline),
      selected:summarize(audit.crossCandidateOriginalSourceDealsIncludingVerifiedAborts.selected)
    },
    originalReleaseAcceptanceUnchanged:true,
    gameWinsQualified:0
  };
}

if(require.main===module){
  const result=inspectFile(process.argv[2]);
  process.stdout.write('AGENT48_ARCHIVE_RECHECK '+JSON.stringify(result)+'\n');
}
module.exports={inspectFile};
