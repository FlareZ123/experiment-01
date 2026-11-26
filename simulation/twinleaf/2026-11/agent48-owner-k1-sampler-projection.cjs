'use strict';

const assert = require('node:assert/strict');

function normalizePrintingCounts(value, label) {
  assert.ok(Array.isArray(value), label + ' must be an array');
  const counts = value.map(entry => {
    assert.ok(entry && typeof entry === 'object', label + ' entry must be an object');
    assert.ok(typeof entry.printing === 'string' && entry.printing.length > 0,
      label + ' printing must be a nonempty string');
    assert.ok(Number.isSafeInteger(entry.copies) && entry.copies > 0,
      label + ' copies must be a positive safe integer');
    return { printing: entry.printing, copies: entry.copies };
  }).sort((a, b) => a.printing.localeCompare(b.printing));
  for (let i = 1; i < counts.length; i += 1) {
    assert.notEqual(counts[i - 1].printing, counts[i].printing,
      label + ' must contain one count per printing');
  }
  return Object.freeze(counts.map(entry => Object.freeze(entry)));
}

function normalizeKnownDeckBlock(value, label) {
  assert.ok(Array.isArray(value), label + ' must be an array');
  for (const printing of value) {
    assert.ok(typeof printing === 'string' && printing.length > 0,
      label + ' entries must be nonempty printing strings');
  }
  return Object.freeze(value.slice());
}

function countCopies(counts) {
  return counts.reduce((sum, entry) => sum + entry.copies, 0);
}

/**
 * Adapt captureOwnerK1() custody evidence to the sampler's exact-Prize schema.
 *
 * Important: captureOwnerK1().knownPrintings / exactMembershipKnown describe
 * remaining-deck membership. The sampler's ownerK1Snapshot.knownPrintings /
 * exactMembershipKnown describe Prize membership. Only knownPrized /
 * prizeInferenceCertified may populate the latter.
 *
 * This function validates and projects an existing trusted capture; it does
 * not authenticate arbitrary caller-supplied data or inspect Twinleaf State.
 */
function projectOwnerK1PrizeKnowledge(capture, {
  expectedSeat,
  currentTurn,
  currentPrizeCount,
  knownTopDeck = [],
  knownBottomDeck = [],
  knownBottomDeckOrder = false
} = {}) {
  assert.ok(capture && typeof capture === 'object', 'K1 capture is required');
  assert.ok(expectedSeat === 0 || expectedSeat === 1, 'Expected seat must be physical seat 0 or 1');
  assert.equal(capture.ownerSeat, expectedSeat, 'K1 capture belongs to a different physical seat');
  assert.ok(Number.isSafeInteger(capture.epoch) && capture.epoch >= 0,
    'K1 capture requires a nonnegative epoch');
  assert.ok(capture.observedAt && Number.isSafeInteger(capture.observedAt.turn) &&
    capture.observedAt.turn >= 0, 'K1 capture requires an observed turn');
  assert.ok(typeof capture.observedAt.promptId === 'string' && capture.observedAt.promptId.length > 0,
    'K1 capture requires its owner-search prompt ID');
  assert.ok(Number.isSafeInteger(currentTurn) && currentTurn >= capture.observedAt.turn,
    'K1 capture cannot be from a future turn');
  assert.ok(Number.isSafeInteger(currentPrizeCount) &&
    currentPrizeCount >= 0 && currentPrizeCount <= 6,
    'Current Prize count must be an integer from zero through six');
  assert.ok(Number.isSafeInteger(capture.observedOwnPrizeCount) &&
    capture.observedOwnPrizeCount >= 0 && capture.observedOwnPrizeCount <= 6,
    'K1 capture has an invalid observed Prize count');
  assert.equal(capture.observedOwnPrizeCount, currentPrizeCount,
    'K1 capture is stale because the owner Prize count changed');
  assert.equal(typeof capture.prizeInferenceCertified, 'boolean',
    'K1 capture must state whether Prize inference is certified');
  assert.equal(typeof capture.deckMembershipStale, 'boolean',
    'K1 capture must state whether remaining-deck membership is stale');
  assert.equal(typeof knownBottomDeckOrder, 'boolean',
    'Known bottom-deck order flag must be boolean');

  const top = normalizeKnownDeckBlock(knownTopDeck, 'Known top-deck block');
  const bottom = normalizeKnownDeckBlock(knownBottomDeck, 'Known bottom-deck block');

  let ownerK1Snapshot = null;
  let knownPrizePrintings = Object.freeze([]);
  let mode = top.length > 0 || bottom.length > 0 ? 'PARTIAL' : 'K0';

  if (capture.prizeInferenceCertified) {
    const prized = normalizePrintingCounts(capture.knownPrized, 'Known Prize printings');
    const registered = normalizePrintingCounts(capture.registeredPrintings, 'Registered printings');
    assert.equal(countCopies(registered), 60, 'Registered K1 deck must contain exactly 60 cards');
    assert.equal(countCopies(prized), currentPrizeCount,
      'Certified Prize multiset must account for every current Prize');
    const registeredByPrinting = new Map(registered.map(entry => [entry.printing, entry.copies]));
    for (const entry of prized) {
      assert.ok((registeredByPrinting.get(entry.printing) ?? 0) >= entry.copies,
        'Known Prize printing exceeds the registered deck count');
    }
    knownPrizePrintings = prized;
    ownerK1Snapshot = Object.freeze({
      epoch: capture.epoch,
      exactMembershipKnown: true,
      knownPrintings: prized,
      invalidationReason: null
    });
    mode = 'K1';
  } else {
    assert.equal(capture.knownPrized, null,
      'Uncertified Prize inference must not retain a purported exact Prize multiset');
  }

  return Object.freeze({
    verified: true,
    mode,
    knownTopDeck: top,
    knownBottomDeck: bottom,
    knownBottomDeckOrder,
    knownPrizePrintings,
    ownerK1Snapshot,
    exactPrizeSnapshot: ownerK1Snapshot,
    ownerSeat: expectedSeat,
    epoch: capture.epoch,
    observedAt: Object.freeze({
      turn: capture.observedAt.turn,
      promptId: capture.observedAt.promptId
    }),
    observedOwnPrizeCount: currentPrizeCount,
    prizeInferenceCertified: capture.prizeInferenceCertified,
    deckMembershipStale: capture.deckMembershipStale,
    prizeInvalidationReason: capture.prizeInferenceCertified ? null :
      (capture.invalidationReason ?? 'prize-inference-not-certified')
  });
}

module.exports = { projectOwnerK1PrizeKnowledge };
