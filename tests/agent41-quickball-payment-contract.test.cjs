'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditQuickBallPayment, VERSION} = require(
  '../simulation/evaluation/agent41-quickball-payment-contract.cjs');
const {chooseQuickBallRootIntent} = require(
  '../simulation/twinleaf/agent8-actor-quick-ball-frontier.cjs');

/** @param {string[]} hand @returns {object} */
const observedOwnerRoot = hand => ({
  decisionKind: 'owner-root', ownHand: hand,
  ownPublic: {bench: [null], deckCount: 30},
  ownTurnResources: {itemPlayLocked: false, pokemonPlayLocked: false}
});

/** @param {string} paidPrinting @returns {object} */
const nativeEvent = paidPrinting => ({
  ownerSeat: 1, paymentSeat: 1, playedPrinting: 'Quick Ball FST',
  paidPrinting, rootAccepted: true, paymentAccepted: true,
  handBefore: ['Quick Ball FST', 'Double Colorless Energy SUM',
    'Double Colorless Energy SUM', 'Secret Box TWM']
});

test('native paid singleton defeats the root duplicate-affordability intent', () => {
  const event = nativeEvent('Secret Box TWM');
  assert.equal(chooseQuickBallRootIntent(observedOwnerRoot(event.handBefore))?.kind,
    'play-quick-ball');
  const result = auditQuickBallPayment(event);
  assert.equal(result.version, VERSION);
  assert.equal(result.status, 'SINGLETON_PAYMENT');
  assert.equal(result.duplicateOtherAvailable, true);
  assert.equal(result.paidCopiesBefore, 1);
  assert.equal(result.paidCopiesAfter, 0);
  assert.equal(result.competitiveQualified, false);
});

test('physically paying a repeated other printing fulfills the narrow contract', () => {
  const result = auditQuickBallPayment(nativeEvent('Double Colorless Energy SUM'));
  assert.equal(result.status, 'PROTECTED_DUPLICATE_PAYMENT');
  assert.equal(result.paidCopiesBefore, 2);
  assert.equal(result.paidCopiesAfter, 1);
});

test('paying a second Quick Ball is distinct from the claimed other-printing reserve', () => {
  const event = nativeEvent('Quick Ball FST');
  event.handBefore.push('Quick Ball FST');
  assert.equal(auditQuickBallPayment(event).status, 'OTHER_QUICK_BALL_PAYMENT');
});

test('missing root duplicate cannot be inferred from a successful payment', () => {
  const event = nativeEvent('Secret Box TWM');
  event.handBefore.splice(2, 1);
  assert.equal(chooseQuickBallRootIntent(observedOwnerRoot(event.handBefore)), null);
  assert.equal(auditQuickBallPayment(event).status, 'ROOT_HEURISTIC_UNMET');
});

test('retain owner, actual native acceptance, and physical-hand provenance gates', () => {
  const event = nativeEvent('Secret Box TWM');
  assert.equal(auditQuickBallPayment({...event,paymentSeat:0}).status,
    'OWNER_SEAT_MISMATCH');
  assert.equal(auditQuickBallPayment({...event,paymentAccepted:false}).status,
    'NATIVE_CHAIN_UNVERIFIED');
  assert.equal(auditQuickBallPayment({...event,handBefore:null}).status,
    'OWNER_HAND_UNVERIFIED');
  assert.equal(auditQuickBallPayment({...event,paidPrinting:'Arven OBF'}).status,
    'PAYMENT_HAND_MISMATCH');
  assert.equal(auditQuickBallPayment({...event,handBefore:[]}).status,
    'ROOT_HAND_MISMATCH');
});

test('unrelated root gets a separate classification', () => {
  const event = nativeEvent('Secret Box TWM');
  assert.equal(auditQuickBallPayment({...event,playedPrinting:'Ultra Ball BRS'}).status,
    'NOT_QUICK_BALL');
});
