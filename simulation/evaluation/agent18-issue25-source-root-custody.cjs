'use strict';

const {createHash}=require('node:crypto');
const {extractNativeAbortProvenance}=require('./agent18-aborted-native-provenance.cjs');

/**
 * Read-only postgame audit. The output describes actual accepted native Store
 * actions, not owner-eligible choices, paper legality, strategic desirability,
 * or full competitive matches.
 *
 * @param {object} row Unmodified bilateral development row.
 * @returns {object} Source-attributed accepted-action custody or a veto.
 */
function summarizeSourceRoots(row) {
  const id=row?.trial?.id??row?.id??null;
  const isAbort=row?.status==='engine-error';
  const provenance=row?.nativeAbortProvenance??null;
  // Recompute native receipt trust independently of the row's labels.
  const slot=row?.trial?.candidateSlot;
  const expectedSeat=slot==='A'?1:slot==='B'?0:null;
  const native=isAbort&&expectedSeat!==null?
    extractNativeAbortProvenance(row.trial,row.nativeAbortEvidence):null;
  const sourceSeat=isAbort?
    (native?.nativeAbortProvenance.sourceDealStatus==='VERIFIED'&&
      provenance?.sourceDealStatus==='VERIFIED'&&
      provenance?.sourceSeat===native.nativeAbortProvenance.sourceSeat?
      native.nativeAbortProvenance.sourceSeat:null):
    (expectedSeat!==null&&row?.sourceSeat===expectedSeat&&
      /^[0-9a-f]{64}$/.test(row?.sourceDealFingerprint)?
      expectedSeat:null);
  const ledger=isAbort?
    row?.nativeAbortEvidence?.rootActionLedger:row?.rootActionLedger;
  const claimedCount=isAbort?
    row?.nativeAbortEvidence?.rootActionCount:row?.rootActionCount;
  const claimedDigest=isAbort?
    row?.nativeAbortEvidence?.rootActionLedgerSha256:
    row?.rootActionLedgerSha256;
  const actualDigest=Array.isArray(ledger)?
    createHash('sha256').update(JSON.stringify(ledger)).digest('hex'):null;
  const ledgerVerified=Array.isArray(ledger)&&
    Number.isSafeInteger(claimedCount)&&claimedCount===ledger.length&&
    typeof claimedDigest==='string'&&claimedDigest===actualDigest&&
    (!isAbort||(native?.nativeAbortProvenance.acceptedRootLedgerStatus===
      'VERIFIED'&&provenance?.acceptedRootLedgerStatus==='VERIFIED'));
  if((sourceSeat!==0&&sourceSeat!==1)||!ledgerVerified) {
    return {id,disposition:row?.status??'returned',
      status:'NO_VERIFIED_SOURCE_ROOT_LEDGER',sourceSeat:null,
      acceptedRootCount:null,sourceAcceptedRootCount:null,
      sourceActionCounts:null};
  }
  const source=ledger.filter(e=>e?.playerSlot===sourceSeat);
  const counts={};
  for(const e of source) {
    const action=String(e.action??'UNNAMED');
    counts[action]=(counts[action]??0)+1;
  }
  const selected=source.filter(e=>
    !['ResolvePromptAction','WaitForPlayerAction','WaitForAction',
      'PassTurnAction'].includes(e.action));
  return {
    id,disposition:row?.status??'returned',
    status:'VERIFIED_NATIVE_ACTIONS_NOT_PAPER_GAME',
    sourceSeat,acceptedRootCount:ledger.length,
    sourceAcceptedRootCount:source.length,sourceActionCounts:counts,
    sourceSelectedNonPassNonPromptRoots:selected.length,
    observedSourceAttacks:counts.AttackAction??0,
    observedSourcePasses:counts.PassTurnAction??0,
    selectedSourceExamples:selected.slice(0,12).map(e=>({
      ordinal:e.actionOrdinal,turn:e.turnBefore,
      action:e.action,card:e.card??null,attack:e.attack??null
    }))
  };
}

/** @param {object[]} rows */
function summarizeSourcePanel(rows) {
  const attempts=rows.map(summarizeSourceRoots);
  return {schema:'agent18-source-accepted-native-root-custody-v1',
    attempts,registeredAttempts:rows.length,
    observedAttempts:attempts.filter(r=>r.status.startsWith('VERIFIED')).length,
    paperGameQualified:false,competitiveGamesQualified:0};
}

module.exports={summarizeSourceRoots,summarizeSourcePanel};
