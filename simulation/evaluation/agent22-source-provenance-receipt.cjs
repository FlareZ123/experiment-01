'use strict';

const assert = require('node:assert/strict');
const {
  SOURCE_BLOB_SHA, auditMay2026SourcePrints, compositionDigest
} = require('./agent22-aichi-source-print-crosswalk.cjs');

const VERSION = 'agent22-original-source-provenance-receipt-v1';

/** @param {object} entry @param {object} substitution @returns {boolean} */
function sameTranscribedRow(entry, substitution) {
  return substitution.sourceName === entry.name &&
    substitution.count === entry.count &&
    substitution.sourcePrinting?.set === entry.transcribedPrinting.set &&
    String(substitution.sourcePrinting?.number) ===
      entry.transcribedPrinting.number &&
    substitution.sourcePrinting?.language ===
      entry.transcribedPrinting.language;
}

/**
 * Read-only relationship between one untouched original source roster,
 * the published-time artwork audit and an *actual* planAichi resolver result.
 * This function never chooses/changes a card or constructs a native game.
 *
 * @param {object} source Pinned 29-rank full-decklists manifest.
 * @param {number} rank Published source rank.
 * @param {{opponents:object[],engineRevision:string}|null} plan Actual
 *   planAichi result; null means native resolution was not observed.
 * @param {{matched:boolean,evidenceDigest:string}|null} physicalDealPair
 *   Independent actual Store-derived matched-physical-deal attestation.
 * @returns {object}
 */
function sourceProvenanceReceipt(
  source,rank,plan=null,physicalDealPair=null
) {
  assert.ok(Number.isInteger(rank)&&rank>=1&&rank<=32);
  const audit=auditMay2026SourcePrints(source);
  assert.equal(audit.sourceGitBlobSha,SOURCE_BLOB_SHA);
  const sourceRow=source.decks.find(deck=>deck.rank===rank);
  if(!sourceRow) return {
    schema:VERSION,rank,sourceOriginalExists:false,
    sourceGitBlobSha:SOURCE_BLOB_SHA,
    composition_match:'not-assessed-missing-original',
    historical_print_match:'unknown',
    engine_proxy_map:{status:'not-assessed-missing-original',entries:[]},
    native_physical_deal_match:'not-compared',
    competitiveQualified:false
  };
  const scoped=audit.entries.filter(entry=>entry.rank===rank);
  const nativePlan=plan?.opponents?.find(row=>row.rank===rank);
  if(plan!==null){
    assert.ok(Array.isArray(plan.opponents));
    assert.ok(nativePlan,'Expected planAichi row for source rank');
  }
  const aliases=nativePlan?.substitutions??[];
  assert.ok(Array.isArray(aliases));
  const mappings=scoped.map(entry=>{
    const found=aliases.filter(alias=>sameTranscribedRow(entry,alias));
    assert.ok(found.length<=1,'Ambiguous resolver substitution for source art');
    const observed=found[0]??null;
    const aliasesAvailable=Boolean(nativePlan);
    return {
      name:entry.name,count:entry.count,
      archivedPrinting:entry.transcribedPrinting,
      historicalPhysicalPrinting:'unknown',
      proposedRepresentative:entry.preEventRepresentative,
      observedNativeId:observed?.resolvedId??null,
      observedResolverReason:observed?.reason??null,
      nativeResolutionStatus:!aliasesAvailable?'not-assessed':
        nativePlan.status!=='ready'?'not-resolved':
          observed?'native-alias-observed':'native-exact-or-unexplained',
      actualNativePrinting:'unverified',
      paperSemanticEquivalence:'unverified'
    };
  });
  // All dated-art rows should have a corresponding explicit substitution if
  // the actual resolver claims this full 60 is ready. A native ID that silently
  // omits source printing cannot be certified as an exact-source mapping.
  const datedRowsAccountedFor=Boolean(nativePlan?.status==='ready') &&
    mappings.every(x=>x.nativeResolutionStatus==='native-alias-observed');
  const physical=physicalDealPair===null?'not-compared':(()=>{
    assert.equal(typeof physicalDealPair.matched,'boolean');
    assert.match(physicalDealPair.evidenceDigest,/^[0-9a-f]{64}$/u);
    return physicalDealPair.matched?'observed-match':'observed-mismatch';
  })();
  return {
    schema:VERSION,rank,sourceOriginalExists:true,
    sourceGitBlobSha:SOURCE_BLOB_SHA,
    sourceCompositionSha256:compositionDigest(source),
    sourceCardCount:sourceRow.cards.reduce((n,c)=>n+c.count,0),
    composition_match:'source-derived-name-count-preserved',
    historical_print_match:'unknown',
    archiveHasPostEventArt:scoped.length>0,
    postEventArtCopies:scoped.reduce((n,x)=>n+x.count,0),
    engine_proxy_map:{
      status:!nativePlan?'not-assessed':
        nativePlan.status!=='ready'?'native-deck-unresolved':
          datedRowsAccountedFor?'resolver-receipts-present':'missing-art-receipts',
      planEngineRevision:plan?.engineRevision??null,
      nativeDeckStatus:nativePlan?.status??null,
      nativeSubstitutionCount:aliases.length,
      datedArtRowsAccountedFor:datedRowsAccountedFor,
      entries:mappings
    },
    native_physical_deal_match:physical,
    physicalDealEvidenceSha256:physicalDealPair?.evidenceDigest??null,
    engineSemanticsCertified:false,
    paperClockCertified:false,
    competitiveQualified:false
  };
}

module.exports={VERSION,sameTranscribedRow,sourceProvenanceReceipt};
