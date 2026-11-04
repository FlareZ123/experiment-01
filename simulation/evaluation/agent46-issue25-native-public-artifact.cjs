'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=require('./agent20-frozen-rank6-canary-v1.cjs');

const SCHEMA='agent46-issue25-actual-native-public-evidence-v1';

/** @param {string} value @returns {string} */
const sha256=value=>createHash('sha256').update(value).digest('hex');

/**
 * A machine-readable post-execution receipt. Archive the native public
 * post-Store root ledger for every admitted, failed, capped or aborted arm.
 * Never infer wins from terminal status or action limits.
 *
 * @param {{manifest:object,diagnostic:object,rawDevelopment?:object|null}} run
 * @returns {object}
 */
function buildNativePublicReceipt(run){
  assert.ok(run&&typeof run==='object');
  const {manifest,diagnostic,rawDevelopment}=run;
  assert.ok(manifest&&typeof manifest==='object');
  assert.ok(diagnostic&&typeof diagnostic==='object');
  assert.ok(Array.isArray(diagnostic.registered));
  assert.ok(Array.isArray(diagnostic.attemptedRows));
  assert.equal(manifest.competitiveGamesQualified,0);
  assert.equal(diagnostic.competitiveGamesQualified,0);
  const rawRows=Array.isArray(rawDevelopment?.rows)?rawDevelopment.rows:[];
  const allNative=rawRows.map(row=>({
    id:row.trial?.id??row.id??null,
    row
  }));
  const attempts=diagnostic.attemptedRows.map(status=>{
    const original=allNative.filter(entry=>entry.id===status.id);
    assert.ok(original.length<=1,
      'Duplicate native run row would make a public receipt ambiguous');
    const raw=original[0]?.row??null;
    const roots=Array.isArray(raw?.rootActionLedger)?
      raw.rootActionLedger:null;
    return {
      ...status,
      nativeRowPresent:raw!==null,
      actualNativeRootLedger:roots,
      rootLedgerSha256ComputedFromArchivedPublicRows:roots===null?
        null:sha256(JSON.stringify(roots)),
      rootLedgerSha256ReportedByRunner:raw?.rootActionLedgerSha256??null,
      rootActionLedgerProtocol:raw?.rootActionLedgerProtocol??null,
      nativeFinishReason:raw?.endReason??null,
      nativeWinnerSeatUnqualified:raw?.winner??null,
      nativeErrorCode:raw?.errorCode??null,
      nativeAbortProvenance:raw?.nativeAbortProvenance??null,
      paperPaymentCertified:false,
      opponentCompetenceCertified:false,
      officialPaperClockCertified:false,
      competitivelyQualified:false
    };
  });
  return {
    schema:SCHEMA,
    scope:'actual-execution-historical-development-public-postdispatch',
    evidenceIntegrity:'must match recorded SHA256 sidecar and pinned checkout',
    registeredIds:diagnostic.registered,
    registryReconciliation:diagnostic.registeredAttemptReconciliation??null,
    rawRowIdentityReconciliation:diagnostic.rawRowIdentityReconciliation??null,
    manifest,
    diagnostic,
    attempts,
    rawNativeRowsFound:rawRows.length,
    actualPublicLedgersArchived:attempts.filter(x=>
      x.actualNativeRootLedger!==null).length,
    qualifiedCompetitiveGames:0,
    releaseQualified:false,
    explicitDisposition:'UNQUALIFIED-DEVELOPMENT-ONLY'
  };
}

/**
 * Writes receipt and detached checksum with the repository's existing
 * lock-and-atomic-rename utility. The caller must invoke after a genuine
 * native run and before process exit; no policy reads these postgame files.
 *
 * @param {object} run
 * @param {string} destination Absolute or relative file path.
 * @returns {{path:string,sha256:string,byteLength:number}}
 */
function writeNativePublicReceipt(run,destination){
  assert.equal(typeof destination,'string');
  const filename=path.resolve(destination);
  const payload=JSON.stringify(buildNativePublicReceipt(run),null,2)+'\n';
  const digest=sha256(payload);
  fs.mkdirSync(path.dirname(filename),{recursive:true});
  writeAtomicLocked(filename,payload);
  writeAtomicLocked(filename+'.sha256',
    digest+'  '+path.basename(filename)+'\n');
  return {path:filename,sha256:digest,
    byteLength:Buffer.byteLength(payload)};
}

module.exports={SCHEMA,buildNativePublicReceipt,
  writeNativePublicReceipt};
