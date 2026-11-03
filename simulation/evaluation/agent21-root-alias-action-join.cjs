'use strict';

const assert=require('node:assert/strict');
const VERSION='agent21-strict-original-bot-pass-root-to-store-retreat-join-v1';

/**
 * Retrospective join of the actor's actual original Pass action object tag,
 * applied at the real headless action ordinal, to a later Store replacement
 * that settled the outgoing physical DCE. This does not change gameplay.
 *
 * `rootActionLedger.action` is intentionally the PRE-Store bot action label.
 * A valid row therefore says Pass and a separate native exact fee receipt
 * proves that an opt-in research interceptor executed Retreat instead.
 *
 * @param {object[]} rawNativeRows Complete rows in original game order.
 * @param {object|null} audit Reversible root Store intervention receipts.
 * @returns {object} Postgame typed positive joins, with failures retained.
 */
function reconcileBotPassToStoreRetreat(rawNativeRows,audit) {
  assert.ok(Array.isArray(rawNativeRows));
  const records=audit?.records??[];
  assert.ok(Array.isArray(records));
  const settlements=records.filter(record=>
    record.stage==='post-settlement');
  const joined=settlements.map(receipt=>{
    const index=receipt.game-1;
    const row=Number.isSafeInteger(index)&&index>=0?
      rawNativeRows[index]:null;
    const rootOrdinal=receipt.originalBotPassRootOrdinal;
    const ledger=Array.isArray(row?.rootActionLedger)?
      row.rootActionLedger:[];
    const roots=Number.isSafeInteger(rootOrdinal)?
      ledger.filter(r=>r.actionOrdinal===rootOrdinal):[];
    const root=roots.length===1?roots[0]:null;
    const checks={
      completeRow:Boolean(row),
      exactOneRoot:roots.length===1,
      originalPassWasActorTagged:receipt.originalBotRootTagged===true,
      preStoreRootNamePass:root?.action==='PassTurnAction',
      sameOwnerSeat:root?.playerSlot===receipt.seat,
      sameTurn:root?.turnBefore===receipt.turn,
      sameActorPolicyDecision:
        root!==null&&root.actorPolicyDecisionOrdinal===
        receipt.originalBotPolicyDecisionOrdinal,
      actualPhysicalDcePaid:
        receipt.status==='EXACT_FEE_AND_PROMOTION',
      actualNativeReplacementAccepted:
        receipt.status==='EXACT_FEE_AND_PROMOTION'
    };
    const strictJoin=Object.values(checks).every(Boolean);
    return {
      game:receipt.game,trialId:row?.trial?.id??null,
      physicalSeat:receipt.seat,turn:receipt.turn,
      botOriginalRootOrdinal:rootOrdinal??null,
      botOriginalActorPolicyDecisionOrdinal:
        receipt.originalBotPolicyDecisionOrdinal??null,
      nativeSelectedActionBeforeStore:'PassTurnAction',
      actualStoreReplacement:'RetreatAction',
      codeLevelRootNameAliasExpected:true,
      checks,
      status:strictJoin?
        'EXACT_BOT_ROOT_PASS_TO_PHYSICAL_PAID_RETREAT':
        'ROOT_OR_PHYSICAL_PAYMENT_NOT_VERIFIED',
      competitivelyQualified:false
    };
  });
  const confirmed=joined.filter(x=>
    x.status==='EXACT_BOT_ROOT_PASS_TO_PHYSICAL_PAID_RETREAT').length;
  return {
    schema:VERSION,
    exactBotPassToStoreRetreatJoins:confirmed,
    unsettledOrUnverified:joined.length-confirmed,
    originalSelectedBotRootIdentityVerified:
      confirmed>0&&confirmed===joined.length,
    receiptCount:joined.length,
    joins:joined,
    paperFullEffectVerified:false,
    qualifiedCompetitiveGames:0,
    caveat:'This joins the actor-selected pre-Store Pass by actual object ordinal to a distinct research-hook Store Retreat. The root ledger Pass is an original bot choice, not a literal claim that the native Store executed Pass.'
  };
}
module.exports={VERSION,reconcileBotPassToStoreRetreat};
