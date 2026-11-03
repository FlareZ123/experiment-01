'use strict';

const assert=require('node:assert/strict');
const {ownerTrainerDiscardContention,VERSION:FRONTIER_VERSION}=
  require('./agent27-owner-trainer-discard-contention.cjs');

const {summarizeOwnerBulkHandTransitions}=
  require('./agent49-owner-bulk-hand-transitions.cjs');

const VERSION='agent27-native-owner-hand-payment-summary-v2-bulk-options';

/**
 * Compact diagnostic for an actual actor-root observation. Counts are
 * correlated decisions/copies, never qualified paper plays or game outcomes.
 * A catalogued supported Trainer can be mechanically affordable while still
 * lacking paper targets, prompt payment, or strategic suitability.
 *
 * @param {object} view Genuine detached actor observation.
 * @param {object[]} trainerRows Existing Agent5 generic owner-hand rows.
 * @param {Set<number>} [protectedIndices] Optional owner-specific protections.
 */
function summarizeOwnerHandPayment(view,trainerRows,
  protectedIndices=new Set()){
  const full=ownerTrainerDiscardContention(view,trainerRows,protectedIndices);
  const covered=full.rows.filter(row=>row.costKnown);
  const bulk=summarizeOwnerBulkHandTransitions(
    view,trainerRows,protectedIndices);
  const variants=covered.flatMap(row=>row.variants.map(v=>({
    handIndex:row.handIndex,printing:row.printing,
    type:row.type,publicBlocker:row.publicBlocker,
    mode:v.mode,discards:v.discards,
    physicallyAffordable:v.physicallyAffordable,
    affordablePreservingProtected:v.affordablePreservingProtected,
    forcedProtectedSacrifices:v.forcedProtectedSacrifices,
    physicalPaymentWays:v.physicalPaymentWays,
    unprotectedPaymentWays:v.unprotectedPaymentWays
  })));
  const paid=variants.filter(v=>v.discards>0&&v.publicBlocker===null);
  const paidAffordable=paid.filter(v=>v.physicallyAffordable);
  const paidUnaffordable=paid.filter(v=>!v.physicallyAffordable);
  const contested=full.pairs.filter(pair=>
    pair.genericBlocker===null&&pair.variants.some(option=>
      option.requiredDiscards>0&&
      !option.physicallyAffordable &&
      full.rows.find(row=>row.handIndex===pair.firstHandIndex)?.variants
        .some(v=>v.discards>0&&v.physicallyAffordable)&&
      full.rows.find(row=>row.handIndex===pair.secondHandIndex)?.variants
        .some(v=>v.discards>0&&v.physicallyAffordable)));
  return {
    version:VERSION,frontierVersion:FRONTIER_VERSION,
    actorSeat:view.actorSeat,globalTurn:view.globalTurn,
    ownerHandSize:view.ownHand.length,
    heldTrainerCopies:full.rows.length,
    supportedTrainerCopies:covered.length,
    unsupportedTrainerCopies:full.rows.length-covered.length,
    paidVariantsUnblocked:paid.length,
    physicallyAffordablePaidVariants:paidAffordable.length,
    physicallyUnaffordablePaidVariants:paidUnaffordable.length,
    supportedPairs:full.pairs.length,
    printVerifiedBulkHandTrainerCopies:bulk.knownBulkHandTrainerCopies,
    bulkDiscardHandAlternatives:bulk.discardEntireHandCandidates,
    bulkShuffleHandAlternatives:bulk.shuffleEntireHandCandidates,
    bulkHandTransitions:bulk.rows,
    blockedPairs:full.pairs.filter(p=>p.genericBlocker!==null).length,
    sameHandContestedPaidPairs:contested.length,
    coveredCopyCosts:variants,
    contestedPaidPairExamples:contested.slice(0,12).map(p=>({
      firstHandIndex:p.firstHandIndex,secondHandIndex:p.secondHandIndex,
      firstPrinting:p.firstPrinting,secondPrinting:p.secondPrinting,
      unaffordableVariants:p.variants.filter(v=>
        v.requiredDiscards>0&&!v.physicallyAffordable)
        .map(v=>({
          firstMode:v.firstMode,secondMode:v.secondMode,
          requiredDiscards:v.requiredDiscards,
          allAvailableCopies:v.allAvailableCopies
        }))
    })),
    protectionsExplicitlySupplied:protectedIndices.size,
    paperTargetVerified:false,paperPromptPaymentVerified:false,
    gamePerformanceQualified:false,policyReadOnly:true
  };
}

/** Summarize a bounded set of authentic Store owner-root audit records. */
function summarizeNativePaymentRoots(roots){
  assert.ok(Array.isArray(roots));
  const bySeat={0:{roots:0,supported:0,paid:0,affordable:0,
    unaffordable:0,contested:0,bulk:0},1:{roots:0,supported:0,paid:0,
    affordable:0,unaffordable:0,contested:0,bulk:0}};
  for(const root of roots){
    const r=root.ownerPaymentSummary;
    if(!r)continue;
    assert.ok(root.seat===0||root.seat===1);
    const c=bySeat[root.seat];
    c.roots++;
    c.supported+=r.supportedTrainerCopies;
    c.paid+=r.paidVariantsUnblocked;
    c.affordable+=r.physicallyAffordablePaidVariants;
    c.unaffordable+=r.physicallyUnaffordablePaidVariants;
    c.contested+=r.sameHandContestedPaidPairs;
    c.bulk+=r.printVerifiedBulkHandTrainerCopies??0;
  }
  return {version:VERSION,bySeat,
    auditedRoots:bySeat[0].roots+bySeat[1].roots,
    qualifiedPaperPlays:0,qualifiedCompetitiveGames:0,
    nativeRootCountsAreCorrelated:true};
}
module.exports={VERSION,summarizeOwnerHandPayment,summarizeNativePaymentRoots};
