'use strict';

/**
 * Fail-closed offline lineage audit for archived rank26 v2 native results.
 * Reads the frozen action trace and provisional receipt observer together.
 * Repeated physical ID sequences are diagnostic flags, not proof of a card effect.
 * A consistent count does not certify paper legality, prompt origin, or native outcome.
 * @param {object} cohort Parsed immutable agent3 v2 JSON artifact
 * @returns {object} Reconciliation ledger including every original source-first deal
 */
function auditRank26CompressorProvenance(cohort) {
  if (cohort?.schema !== 'agent3-rank26-physical-compressor-prospective-v2' || !Array.isArray(cohort.cases)) throw new TypeError('Expected original rank26 physical-compressor v2 cohort');
  const sourceFirst = cohort.cases.filter(c => c.baseline?.sourceFirst === true);
  const byArm = {};
  for (const arm of ['baseline','treatment']) {
    const rows = sourceFirst.map(c => {
      const attempt = c[arm];
      const recordedPlays = attempt.sourceFirstActions.filter(a => a.action === 'PlayCardAction' && a.card === 'Battle Compressor').length;
      if (recordedPlays !== attempt.sourceFirstCompressorPlays) throw new Error(`Inconsistent source action trace: ${c.repeat}/${c.slot}/${arm}`);
      const positive = attempt.settlementAudit.receipts.filter(r => r.globalTurn === 1 && r.nativeDispatchReturned === true && r.paperMinimumMet === true);
      const signatures = positive.map(r => (r.physicallyMoved??[]).map(card => card.id).join(','));
      const repeats = signatures.length - new Set(signatures).size;
      return {repeat:c.repeat,slot:c.slot,sourceSeat:c.sourceSeat,firstTurnCompressorPlays:recordedPlays,positiveFirstTurnReceipts:positive.length,orphanReceipts:recordedPlays===0?positive.length:0,excessReceiptCount:Math.max(0,positive.length-recordedPlays),repeatedPhysicalTriples:repeats,countsConsistent:positive.length<=recordedPlays && repeats===0};
    });
    const sum = key => rows.reduce((n,r)=>n+r[key],0);
    byArm[arm]={deals:rows.length,playedActions:sum('firstTurnCompressorPlays'),claimedPositiveReceipts:sum('positiveFirstTurnReceipts'),orphanReceiptDeals:rows.filter(r=>r.orphanReceipts>0).length,orphanReceiptCount:sum('orphanReceipts'),excessReceiptDeals:rows.filter(r=>r.excessReceiptCount>0).length,excessReceiptCount:sum('excessReceiptCount'),sameTurnReusedPhysicalIdsDeals:rows.filter(r=>r.repeatedPhysicalTriples>0).length,sameTurnReusedPhysicalIdReceipts:sum('repeatedPhysicalTriples'),countsConsistentDeals:rows.filter(r=>r.countsConsistent).length,cases:rows};
  }
  return {schema:'agent3-rank26-v2-offline-receipt-lineage-v1',sourceArtifactSchema:cohort.schema,sourceFirstPhysicalDeals:sourceFirst.length,byArm,scope:'offline contradictions only; matching counts do not certify Store payment or prompt origin',competitiveQualifiedGames:0};
}

module.exports={auditRank26CompressorProvenance};
