'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

/**
 * Classify one canonical bilateral native row by the actual emitted fields.
 * A native engine ending is never evidence of a competitively qualified game.
 * @param {object|null|undefined} row
 * @returns {{category:string,reason:string,observedEngineTerminal:boolean|null}}
 */
function nativeRowStatus(row) {
  if (!row || typeof row !== 'object') return {
    category:'UNKNOWN',reason:'missing-native-row',observedEngineTerminal:null
  };
  if (typeof row.error === 'string' && row.error.length > 0) return {
    category:'NATIVE_ERROR',reason:'archived-native-error',observedEngineTerminal:false
  };
  if (typeof row.status === 'string' && row.status !== 'completed') {
    return {category:'NATIVE_ERROR',reason:'native-status-'+row.status,
      observedEngineTerminal:false};
  }
  if (row.finished === true && row.endReason === 'engine-game-end' &&
      (row.winner === 0 || row.winner === 1)) {
    return {category:'NATIVE_TERMINAL',reason:'finished-engine-game-end',
      observedEngineTerminal:true};
  }
  if (row.finished === false && row.endReason === 'action-limit') {
    return {category:'ACTION_CAP',reason:'unfinished-action-limit',
      observedEngineTerminal:false};
  }
  return {category:'UNKNOWN',reason:'unrecognized-or-conflicting-native-fields',
    observedEngineTerminal:null};
}

/**
 * Read-only derivative of frozen rank6 v1, using the real native-row schema.
 * Joins on immutable registered trial IDs; never upgrades paper-game status.
 * @param {object} archive Original already-published frozen v1 JSON.
 * @returns {object}
 */
function auditFrozenNativeArchive(archive) {
  const expected = archive?.releaseDisposition?.attempts;
  const rows = archive?.rawNativeResult?.rows;
  if (!Array.isArray(expected) || !Array.isArray(rows)) {
    return {
      schema:'agent47-frozen-v1-native-status-derived-v1',
      status:'PRECHECK_FAILURE',
      reason:'expected-registration-or-native-rows-unavailable',
      competitiveGameQualified:false, attempts:[]
    };
  }
  const grouped = new Map();
  for (const row of rows) {
    const id=row?.trial?.id;
    if (typeof id !== 'string' || id.length===0) continue;
    if (!grouped.has(id)) grouped.set(id,[]);
    grouped.get(id).push(row);
  }
  const seen = new Set();
  const attempts=expected.map(original=>{
    const id=original?.trialId;
    const possible=grouped.get(id)??[];
    if (typeof id !== 'string' || seen.has(id) || possible.length!==1) {
      return {trialId:id??null,nativeStatus:'UNKNOWN',
        reason:seen.has(id)?'duplicate-registration':
          possible.length>1?'duplicate-native-trial':'missing-native-trial',
        nativeFinished:null,reportedNativeStatus:original?.nativeStatus??null,
        observedEngineTerminal:null,competitiveGameQualified:false};
    }
    seen.add(id);
    const row=possible[0];
    const classified=nativeRowStatus(row);
    return {
      trialId:id,sourceRank:original.sourceRank,
      sourcePhysicalSeat:original.sourcePhysicalSeat,
      candidatePhysicalSeat:original.candidatePhysicalSeat,
      nativeStatus:classified.category,reason:classified.reason,
      reportedNativeStatus:original.nativeStatus??null,
      nativeFinished:typeof row.finished==='boolean'?row.finished:null,
      nativeEndReason:row.endReason??null,
      nativeWinner:(row.winner===0||row.winner===1)?row.winner:null,
      observedEngineTerminal:classified.observedEngineTerminal,
      originalReportedEngineTerminal:original.observedEngineTerminal??null,
      rootCount:Array.isArray(row.rootActionLedger)?row.rootActionLedger.length:null,
      paperPaymentVerified:false,sourcePayoffVerified:false,
      opponentContinuationVerified:false,competitiveGameQualified:false
    };
  });
  const expectedIDs=new Set(expected.map(x=>x.trialId));
  const unexpectedNativeRows=rows
    .filter(row=>!expectedIDs.has(row?.trial?.id))
    .map(row=>row?.trial?.id??null);
  const counts={};
  for(const attempt of attempts){
    counts[attempt.nativeStatus]=(counts[attempt.nativeStatus]??0)+1;
  }
  const nativeCompleted=attempts.length===expected.length &&
    unexpectedNativeRows.length===0 &&
    attempts.every(a=>a.nativeStatus==='NATIVE_TERMINAL');
  return {
    schema:'agent47-frozen-v1-native-status-derived-v1',
    sourceReleaseProfile:archive.releaseProfile??null,
    sourceProfileSha256:archive.profileSha256??null,
    sourceRepoCommit:archive.runtime?.checkoutCommit??null,
    nativeCompleted,
    statuses:counts,
    unexpectedNativeRows,
    attempts,
    reportedV1StatusCounts:archive.releaseDisposition.nativeStatusCounts??null,
    paperPaymentVerified:false,sourcePayoffVerified:false,
    opponentContinuationVerified:false,competitiveGameQualified:false,
    caveat:'Derived completion describes native engine endings only. The original v1 archive is immutable; no paid paper game, opponent competence or 25-minute-clock result is certified.'
  };
}

if(require.main===module) {
  const filename=path.resolve(process.cwd(),'agent20-frozen-rank6-canary-v1-output.json');
  const raw=fs.readFileSync(filename);
  const archive=JSON.parse(raw.toString('utf8'));
  const report=auditFrozenNativeArchive(archive);
  report.originalNativeArchiveSha256=createHash('sha256').update(raw).digest('hex');
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}

module.exports={nativeRowStatus,auditFrozenNativeArchive};
