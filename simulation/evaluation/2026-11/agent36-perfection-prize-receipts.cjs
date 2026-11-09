'use strict';

const assert = require('node:assert/strict');

/** Count still-facedown physical Prize cards from the real post-Store zone. */
function remainingPrizes(physicalSeat) {
  assert.ok(Array.isArray(physicalSeat?.prizes));
  return physicalSeat.prizes.reduce((n,slot) => {
    assert.ok(Array.isArray(slot));
    return n + slot.length;
  }, 0);
}

/**
 * Observe how the pinned engine actually resolves Perfection-initiated attacks.
 * In that engine, the attack is initiated by a UseAbilityAction Perfection and
 * subsequently paid/settled through prompts. Filtering only AttackAction roots
 * therefore undercounts actual copied attacks and Prize outcomes.
 *
 * Each receipt is limited to the initiating owner's same global turn, and
 * contains literal physical Prize transitions. This postgame-only observer
 * never supplies hidden card information to the actor or calls a root
 * paper-qualified. If an opponent Active disappears into the opponent discard
 * ahead of Prize settlement, its physical identity is joined conservatively.
 *
 * @param {object[]} roots Actual ordered native rootActionLedger.
 * @param {object} tape Post-Store `postAcceptedRoots` physical zone tape.
 * @param {number} ownerSeat Seat to inspect, 0 or 1.
 * @returns {object[]} Observed owner Perfection activation and Prize receipts.
 */
function perfectionPrizeReceipts(roots, tape, ownerSeat) {
  assert.ok(ownerSeat === 0 || ownerSeat === 1);
  assert.ok(Array.isArray(roots));
  const snapshots=tape?.postAcceptedRoots;
  assert.ok(Array.isArray(snapshots));
  assert.equal(snapshots.length, roots.length,
    'Full accepted root and physical snapshot join is mandatory');
  for (let i=0;i<roots.length;i++) {
    assert.equal(roots[i].actionOrdinal, i,
      'Root ordinals must be lossless and in original order');
    assert.equal(snapshots[i].rootOrdinal, i,
      'Physical Store root ordinal must match accepted root');
  }

  const opponentSeat=1-ownerSeat;
  const receipts=[];
  for(let i=1;i<roots.length;i++) {
    const root=roots[i];
    if(root.playerSlot!==ownerSeat ||
      root.action!=='UseAbilityAction' ||
      root.ability!=='Perfection') continue;
    const turn=root.turnBefore;
    const startPrizes=remainingPrizes(
      snapshots[i-1].physicalZones[ownerSeat]);
    let previousPrizes=startPrizes;
    let lastRemovedActive=null;
    const prizeEvents=[];
    let finalRoot=i;
    for(let j=i;j<roots.length;j++) {
      if(roots[j].turnBefore!==turn)break;
      if(j>i && roots[j].playerSlot===ownerSeat &&
        roots[j].action==='UseAbilityAction' &&
        roots[j].ability==='Perfection')break;
      const previous=snapshots[j-1].physicalZones;
      const current=snapshots[j].physicalZones;
      const removed=previous[opponentSeat]?.active?.cards?.[0];
      const newActive=current[opponentSeat]?.active?.cards?.[0];
      if(removed && removed.id!==newActive?.id &&
        current[opponentSeat].discard.some(card=>
          card.id===removed.id && card.printing===removed.printing)) {
        lastRemovedActive={
          physicalId:removed.id,printing:removed.printing,removalRoot:j
        };
      }
      const newPrizes=remainingPrizes(current[ownerSeat]);
      assert.ok(newPrizes<=previousPrizes,
        'Taking Prizes must never increase the still-facedown count');
      if(newPrizes<previousPrizes) {
        prizeEvents.push({
          root:j,prizesTaken:previousPrizes-newPrizes,
          newlyDiscardedOpponentActive:lastRemovedActive
        });
        lastRemovedActive=null;
      }
      previousPrizes=newPrizes;
      finalRoot=j;
    }
    receipts.push({
      initiatingRoot:i,initiatingTurn:turn,ownerSeat,opponentSeat,
      nativeAction:'UseAbilityAction Perfection',
      endOfSameTurnRoot:finalRoot,
      startRemainingPrizes:startPrizes,
      endRemainingPrizes:previousPrizes,
      actualPrizesTaken:startPrizes-previousPrizes,
      prizeEvents,
      paperQualified:false
    });
  }
  return receipts;
}

module.exports={remainingPrizes,perfectionPrizeReceipts};
