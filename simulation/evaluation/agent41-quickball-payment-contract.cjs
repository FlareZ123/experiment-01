'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent41-quickball-root-payment-contract-v1';
const QUICK_BALL_PRINTINGS = new Set(['Quick Ball SSH', 'Quick Ball FST']);

/**
 * Audit one actually accepted Quick Ball root and its subsequent physical
 * discard selection. `handBefore` is the owner's own hand at the root, never
 * a peek at the opposing hand or the inaccessible deck/Prizes. This tests
 * whether a "redundant other printing" root heuristic was honored by its
 * downstream native payment; it does not determine paper legality or strategy.
 *
 * @param {{ownerSeat:0|1,paymentSeat:0|1,playedPrinting:string,
 *  paidPrinting:string,handBefore:string[],rootAccepted:boolean,
 *  paymentAccepted:boolean}} event Original native Store witness.
 * @returns {{version:string,status:string,paidPrinting:string|null,
 *  duplicateOtherAvailable:boolean|null,paidCopiesBefore:number|null,
 *  paidCopiesAfter:number|null,competitiveQualified:false}}
 */
function auditQuickBallPayment(event) {
  assert.ok(event && typeof event === 'object');
  assert.ok(event.ownerSeat === 0 || event.ownerSeat === 1);
  const result = (status, duplicateOtherAvailable = null,
    paidCopiesBefore = null, paidCopiesAfter = null) => ({
    version: VERSION, status,
    paidPrinting: typeof event.paidPrinting === 'string' ?
      event.paidPrinting : null,
    duplicateOtherAvailable, paidCopiesBefore, paidCopiesAfter,
    competitiveQualified: false
  });
  if (!QUICK_BALL_PRINTINGS.has(event.playedPrinting))
    return result('NOT_QUICK_BALL');
  if (event.paymentSeat !== event.ownerSeat)
    return result('OWNER_SEAT_MISMATCH');
  if (event.rootAccepted !== true || event.paymentAccepted !== true)
    return result('NATIVE_CHAIN_UNVERIFIED');
  if (!Array.isArray(event.handBefore) ||
      event.handBefore.some(name => typeof name !== 'string') ||
      typeof event.paidPrinting !== 'string')
    return result('OWNER_HAND_UNVERIFIED');

  const counts = new Map();
  for (const name of event.handBefore)
    counts.set(name, (counts.get(name) ?? 0) + 1);
  const rootCopies = counts.get(event.playedPrinting) ?? 0;
  if (rootCopies < 1) return result('ROOT_HAND_MISMATCH');
  counts.set(event.playedPrinting, rootCopies - 1);
  const duplicateOtherAvailable = [...counts].some(([name, amount]) =>
    !QUICK_BALL_PRINTINGS.has(name) && amount >= 2);
  const copies = counts.get(event.paidPrinting) ?? 0;
  if (copies < 1) return result('PAYMENT_HAND_MISMATCH',
    duplicateOtherAvailable, copies, copies);
  if (!duplicateOtherAvailable) return result('ROOT_HEURISTIC_UNMET',
    false, copies, copies - 1);
  if (QUICK_BALL_PRINTINGS.has(event.paidPrinting))
    return result('OTHER_QUICK_BALL_PAYMENT', true, copies, copies - 1);
  return result(copies >= 2 ? 'DUPLICATE_PRINTING_PAYMENT' :
    'SINGLETON_PAYMENT', true, copies, copies - 1);
}

module.exports = {VERSION, QUICK_BALL_PRINTINGS, auditQuickBallPayment};
