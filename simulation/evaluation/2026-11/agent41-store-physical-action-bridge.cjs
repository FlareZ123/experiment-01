'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent41-store-physical-action-bridge-v1';

/**
 * An original Store position is a physical zone plus a mutable array index.
 * The index is intentionally excluded from payment and location transitions.
 * @param {string|null|undefined} position
 * @returns {string|null}
 */
function physicalZone(position) {
  if (position == null) return null;
  assert.equal(typeof position, 'string');
  const colon = position.lastIndexOf(':');
  assert.ok(colon > 1 && /^\d+$/.test(position.slice(colon + 1)),
    'Malformed physical position');
  const zone = position.slice(0, colon);
  assert.match(zone, /^s[01]\.[A-Za-z0-9.]+$/);
  return zone;
}

/**
 * Produce an independently inspectable, postgame action-to-physical-card
 * certificate from Agent36's genuine Store receipt. This is a physical
 * observation, never an assertion of printed-card payment legality.
 *
 * @param {object} root One accepted Store root receipt.
 * @param {Array<{id:string,originalSeat:number,printing:string}>} originals
 */
function certifyStoreRoot(root, originals) {
  assert.ok(root && Array.isArray(originals));
  assert.ok(typeof root.trialId === 'string' && root.trialId.length > 0);
  assert.ok(Number.isSafeInteger(root.actionOrdinal));
  assert.ok(root.seat === 0 || root.seat === 1);
  assert.ok(Number.isSafeInteger(root.turnBefore));
  assert.ok(root.beforePositions && root.afterPositions);
  const printed = new Map(originals.map(c => [c.id, c]));
  assert.equal(printed.size, originals.length, 'Duplicate registered physical ID');

  const changes = [];
  const unlocated = [];
  const ownerViolations = [];
  const missingIds = [];
  let indexOnlyReorders = 0;
  for (const card of originals) {
    const before = root.beforePositions[card.id];
    const after = root.afterPositions[card.id];
    const from = physicalZone(before);
    const to = physicalZone(after);
    if (from && !from.startsWith('s' + card.originalSeat + '.'))
      ownerViolations.push({id:card.id,zone:from,which:'before'});
    if (to && !to.startsWith('s' + card.originalSeat + '.'))
      ownerViolations.push({id:card.id,zone:to,which:'after'});
    if (!from || !to) {
      if (!from && !to) missingIds.push(card.id);
      if (from !== to) unlocated.push({
        id:card.id,printing:card.printing,from,to,
        reason:'NATIVE_PROMPT_CUSTODY_OR_UNLOCATED'
      });
    } else if (from !== to) {
      changes.push({id:card.id,printing:card.printing,
        originalSeat:card.originalSeat,from,to});
    } else if (before !== after) {
      indexOnlyReorders++;
    }
  }
  const unknownIds = [...new Set([
    ...Object.keys(root.beforePositions),
    ...Object.keys(root.afterPositions)
  ])].filter(id => !printed.has(id));
  const actorHand = 's' + root.seat + '.hand';
  const handExits = changes.filter(m => m.from === actorHand &&
    m.to !== actorHand);
  // A multi-card effect may move a card and a cost from hand in one Store
  // dispatch. In that case, do not guess which one is the played card.
  const onePlayed = root.action === 'PlayCardAction' &&
    handExits.length === 1 && unlocated.length === 0 &&
    unknownIds.length === 0 && ownerViolations.length === 0 &&
    missingIds.length === 0 ? handExits[0] : null;
  const declared = root.declaredCard ?? null;
  const declaredAgrees = !declared || !onePlayed ||
    declared === onePlayed.printing;
  const playedCardStatus = root.action !== 'PlayCardAction' ?
    'NOT_A_CARD_PLAY' :
    onePlayed === null ? 'AMBIGUOUS_OR_INCOMPLETE_PHYSICAL_PLAY' :
    !declaredAgrees ? 'DECLARED_PRINTING_CONFLICT' :
    'UNIQUE_ACTOR_HAND_EXIT';
  return {
    trialId:root.trialId,actionOrdinal:root.actionOrdinal,
    seat:root.seat,turnBefore:root.turnBefore,action:root.action,
    physicalZoneTransitions:changes,
    actorHandExits:handExits,
    indexOnlyReorders,
    transientOffzone:unlocated,
    missingOriginalPhysicalIds:missingIds,
    unknownPhysicalIds:unknownIds,
    ownerZoneViolations:ownerViolations,
    playedCardStatus,
    playedCard:playedCardStatus === 'UNIQUE_ACTOR_HAND_EXIT' ?
      {physicalId:onePlayed.id,printing:onePlayed.printing,
        from:onePlayed.from,to:onePlayed.to} : null,
    printedPaymentReviewed:false,
    ownerInformationReviewed:false,
    competitiveGameQualified:false
  };
}

/**
 * Reduce an entire native root capture with its physical identities. Abort
 * and censored attempts remain included. No missing trial is manufactured.
 * @param {object} archive Native Agent36 capture JSON.
 */
function summarizeNativeCapture(archive) {
  assert.ok(Array.isArray(archive?.captured));
  const rows = archive.captured.map(trial => {
    const store = trial.storeRaw;
    if (!store || !Array.isArray(store.receipts) ||
        !Array.isArray(store.originalPhysicalCards))
      return {trialId:trial.trialId,status:'NO_STORE_ROOT_CAPTURE'};
    const roots = store.receipts.map(root =>
      certifyStoreRoot(root,store.originalPhysicalCards));
    const statuses = {};
    for (const root of roots)
      statuses[root.playedCardStatus] =
        (statuses[root.playedCardStatus] ?? 0) + 1;
    return {
      trialId:trial.trialId,status:'PHYSICAL_ROOTS_REDUCED',
      roots:roots.length,
      cardPlayRoots:roots.filter(r=>r.action==='PlayCardAction').length,
      identifiedCardPlays:roots.filter(r=>
        r.playedCardStatus==='UNIQUE_ACTOR_HAND_EXIT').length,
      incompleteCardPlays:roots.filter(r=>r.action==='PlayCardAction' &&
        r.playedCardStatus!=='UNIQUE_ACTOR_HAND_EXIT').length,
      withinZoneReorders:roots.reduce((n,r)=>n+r.indexOnlyReorders,0),
      genuineZoneTransfers:roots.reduce((n,r)=>
        n+r.physicalZoneTransitions.length,0),
      transientOffzone:roots.reduce((n,r)=>n+r.transientOffzone.length,0),
      foreignOwnerViolations:roots.reduce((n,r)=>
        n+r.ownerZoneViolations.length,0),
      printedPaymentReviewed:false,
      competitiveGameQualified:false
    };
  });
  return {schema:VERSION,observedVendorGitCommit:
    archive.observedVendorGitCommit ?? null,
    attemptedTrials:rows.length,
    summary:rows.reduce((tot,row)=>{
      for(const field of ['roots','cardPlayRoots','identifiedCardPlays',
        'incompleteCardPlays','withinZoneReorders',
        'genuineZoneTransfers','transientOffzone','foreignOwnerViolations'])
        tot[field]=(tot[field]??0)+(row[field]??0);
      return tot;
    },{}),rows,
    printedPaymentReviewed:false,competitiveGameQualified:false};
}

module.exports = {
  VERSION,physicalZone,certifyStoreRoot,summarizeNativeCapture
};
