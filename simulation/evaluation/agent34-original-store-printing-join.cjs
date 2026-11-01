'use strict';
const assert=require('node:assert/strict');
const VERSION='agent34-sequential-original-store-printing-join-v1';

/** Join physical pre-dispatch PlayCard receipts to unchanged native root ledger.
 * This is an ORDER/PAPER-NAME consistency check; it does not establish exact
 * typed action-object identity, card-text validity, or physical effect proof.
 * @param {object[]} rootLedger Genuine headless Store-accepted action ledger.
 * @param {object} receiptAudit Original-Store pre-dispatch receipt observer.
 * @returns {object} Failure-inclusive join with no gameplay modifications.
 */
function joinOriginalStorePrintings(rootLedger,receiptAudit){
  assert.ok(Array.isArray(rootLedger));
  assert.equal(receiptAudit?.version,
    'agent34-original-store-playcard-instance-v1');
  const native=rootLedger.filter(x=>x.action==='PlayCardAction');
  const physical=receiptAudit.accepted??[];
  assert.ok(Array.isArray(physical));
  const seenRootOrdinals=new Set();
  const rows=[];
  for(let index=0;index<native.length;index++){
    const root=native[index],actual=physical[index]??null;
    const ordered=Number.isSafeInteger(root.actionOrdinal)&&
      root.actionOrdinal>=0&&!seenRootOrdinals.has(root.actionOrdinal);
    if(ordered)seenRootOrdinals.add(root.actionOrdinal);
    const match=ordered&&actual?.seat===root.playerSlot&&
      actual?.cardName===root.card&&actual?.accepted===true&&
      typeof actual.printing==='string'&&actual.printing.length>0&&
      typeof actual.executableConstructor==='string'&&
      actual.executableConstructor.length>0&&
      Number.isSafeInteger(actual.executablePrototypeToken)&&
      Number.isSafeInteger(actual.ordinal);
    rows.push({headlessActionOrdinal:root.actionOrdinal,
      storeDispatchOrdinal:actual?.ordinal??null,
      nativeSeat:root.playerSlot,receiptSeat:actual?.seat??null,
      nativeCardName:root.card??null,receiptName:actual?.cardName??null,
      physicalPrinting:match?actual.printing:null,
      executableClass:match?actual.executableConstructor:null,
      executablePrototypeToken:match?actual.executablePrototypeToken:null,
      sequentialMatch:match===true,
      unmatchedReason:match?'none':'ledger-or-original-store-receipt-mismatch',
      paperRuleVerified:false,paymentAndEffectVerified:false});
  }
  const orderedDistinct=rows.every((row,index)=>
    index===0||(
      row.headlessActionOrdinal>rows[index-1].headlessActionOrdinal&&
      row.storeDispatchOrdinal>rows[index-1].storeDispatchOrdinal));
  const complete=receiptAudit.originalStoreCaptured===true&&
    receiptAudit.rejectedPlayCardRoots===0&&
    receiptAudit.acceptedPlayCardRoots===physical.length&&
    physical.length===native.length&&
    rows.length>0&&rows.every(x=>x.sequentialMatch)&&orderedDistinct;
  return {schema:'original-store-playcard-printing-join-v1',version:VERSION,
    nativePlayRoots:native.length,
    originalStorePlayReceipts:physical.length,
    originalStoreRejections:receiptAudit.rejectedPlayCardRoots,
    originalStoreCaptured:receiptAudit.originalStoreCaptured,
    sequentialNameSeatPrintingJoin:complete,
    exactActionObjectIdentityVerified:false,
    paperRootValidity:'unverified',paperPaymentValidity:'unverified',
    paperEffectValidity:'unverified',competitiveGameQualified:false,
    rows,extraStoreReceipts:physical.slice(native.length).map(x=>({
      storeDispatchOrdinal:x.ordinal,seat:x.seat,
      printing:x.printing??null,reason:'no-matching-headless-root'
    }))};
}
module.exports={VERSION,joinOriginalStorePrintings};
