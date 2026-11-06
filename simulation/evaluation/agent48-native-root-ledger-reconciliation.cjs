'use strict';

const {createHash}=require('node:crypto');

/**
 * Resolve the accepted-root ledger from a normal result or an abort receipt.
 * An explicitly present top-level array is authoritative, including [].
 * @param {object|null|undefined} row
 * @returns {{ledger:object[]|null,source:'row'|'nativeAbortEvidence'|'unavailable',reportedSha256:string|null}}
 */
function extractRootLedger(row){
  if(Array.isArray(row?.rootActionLedger)){
    return {
      ledger:row.rootActionLedger,
      source:'row',
      reportedSha256:typeof row.rootActionLedgerSha256==='string'?
        row.rootActionLedgerSha256:null
    };
  }
  const abort=row?.nativeAbortEvidence;
  if(Array.isArray(abort?.rootActionLedger)){
    return {
      ledger:abort.rootActionLedger,
      source:'nativeAbortEvidence',
      reportedSha256:typeof abort.rootActionLedgerSha256==='string'?
        abort.rootActionLedgerSha256:null
    };
  }
  return {ledger:null,source:'unavailable',reportedSha256:null};
}

/**
 * Hash the exact JSON.stringify representation used by the native ledger.
 * @param {object[]} ledger
 * @returns {string}
 */
function digestRootLedger(ledger){
  if(!Array.isArray(ledger))throw new TypeError('Root ledger must be an array');
  return createHash('sha256').update(JSON.stringify(ledger)).digest('hex');
}

/**
 * Return the first structural difference between two available root arrays.
 * @param {object[]} left
 * @param {object[]} right
 * @returns {object|null}
 */
function firstRootDifference(left,right){
  if(!Array.isArray(left)||!Array.isArray(right))
    throw new TypeError('Both root ledgers must be arrays');
  const count=Math.min(left.length,right.length);
  for(let index=0;index<count;index++){
    if(JSON.stringify(left[index])!==JSON.stringify(right[index])){
      return {
        index,
        ordinalA:left[index]?.actionOrdinal??null,
        ordinalB:right[index]?.actionOrdinal??null,
        actionA:left[index]?.action??null,
        actionB:right[index]?.action??null,
        playerSlotA:left[index]?.playerSlot??null,
        playerSlotB:right[index]?.playerSlot??null,
        rootA:left[index],
        rootB:right[index]
      };
    }
  }
  if(left.length!==right.length){
    return {
      index:count,
      ordinalA:left[count]?.actionOrdinal??null,
      ordinalB:right[count]?.actionOrdinal??null,
      actionA:left[count]?.action??null,
      actionB:right[count]?.action??null,
      playerSlotA:left[count]?.playerSlot??null,
      playerSlotB:right[count]?.playerSlot??null,
      rootA:left[count]??null,
      rootB:right[count]??null
    };
  }
  return null;
}

/**
 * Compare root histories without conflating missing evidence with equality.
 * Reported digests are independently checked when present.
 * @param {object|null|undefined} rowA
 * @param {object|null|undefined} rowB
 * @returns {object}
 */
function compareRootLedgers(rowA,rowB){
  const a=extractRootLedger(rowA);
  const b=extractRootLedger(rowB);
  if(!a.ledger||!b.ledger){
    return {
      status:'UNAVAILABLE',
      firstDifference:null,
      left:{
        source:a.source,
        rootCount:a.ledger?.length??null,
        reportedSha256:a.reportedSha256
      },
      right:{
        source:b.source,
        rootCount:b.ledger?.length??null,
        reportedSha256:b.reportedSha256
      }
    };
  }
  const digestA=digestRootLedger(a.ledger);
  const digestB=digestRootLedger(b.ledger);
  const digestStatusA=a.reportedSha256===null?'MISSING':
    a.reportedSha256===digestA?'MATCH':'MISMATCH';
  const digestStatusB=b.reportedSha256===null?'MISSING':
    b.reportedSha256===digestB?'MATCH':'MISMATCH';
  const firstDifference=firstRootDifference(a.ledger,b.ledger);
  const digestMismatch=digestStatusA==='MISMATCH'||
    digestStatusB==='MISMATCH';
  const status=firstDifference?'DIFFERENT':
    digestMismatch?'DIGEST_MISMATCH':'EXACT';
  return {
    status,
    firstDifference,
    left:{
      source:a.source,
      rootCount:a.ledger.length,
      computedSha256:digestA,
      reportedSha256:a.reportedSha256,
      reportedDigestStatus:digestStatusA
    },
    right:{
      source:b.source,
      rootCount:b.ledger.length,
      computedSha256:digestB,
      reportedSha256:b.reportedSha256,
      reportedDigestStatus:digestStatusB
    }
  };
}

module.exports={extractRootLedger,digestRootLedger,firstRootDifference,
  compareRootLedgers};
