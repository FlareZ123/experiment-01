'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { auditArchivedBridge, SCHEMA, EXPECTED } =
  require('../simulation/evaluation/agent1-archived-compressor-receipt-gate.cjs');

/** @param {number} ordinal @param {number} seat @returns {object} */
function root(ordinal, seat) {
  return {
    actionOrdinal: ordinal, turnBefore: 1, turnAfter: 1,
    playerSlot: seat, action: 'PlayCardAction', pendingPrompt: null,
    initiatingRootActionOrdinal: ordinal, card: 'Battle Compressor'
  };
}
/** @param {number} ordinal @param {number} seat @returns {object} */
function pass(ordinal, seat) {
  return {
    actionOrdinal: ordinal, turnBefore: 1, turnAfter: 2,
    playerSlot: seat, action: 'PassTurnAction', pendingPrompt: null,
    initiatingRootActionOrdinal: ordinal
  };
}
/** @param {number} ordinal @param {number} n @param {string} name
 * @param {number} seat @returns {object} */
function prompt(ordinal, n, name, seat) {
  return {
    actionOrdinal: n, turnBefore: 1, turnAfter: 1,
    playerSlot: seat, action: 'ResolvePromptAction', pendingPrompt: name,
    initiatingRootActionOrdinal: ordinal
  };
}

/** Build a complete 19-pair native fixture with separate retrospective and
 * fresh cohorts. Every actual archive field read by the gate is present.
 * @returns {object} */
function sample() {
  const pairs = EXPECTED.map((key, i) => {
    const [cohort, seedText, seatText] = key.split(':');
    const seed = Number(seedText);
    const sourceSeat = Number(seatText);
    const count = cohort === 'known-positive' ? (i === 1 ? 2 : 1)
      : seed === 2208314832 && sourceSeat === 1 ||
        seed === 4010383176 && sourceSeat === 1 ? 1 : 0;
    const controlActions = [pass(1, sourceSeat)];
    const treatmentActions = [];
    const compressorRoots = [];
    for (let j = 0; j < count; j++) {
      const n = 1 + j * 4;
      const r = root(n, sourceSeat);
      compressorRoots.push(r);
      treatmentActions.push(r,
        prompt(n, n+1, 'ChooseCardsPrompt', sourceSeat),
        prompt(n, n+2, 'ShuffleDeckPrompt', sourceSeat),
        prompt(n, n+3, 'WaitPrompt', sourceSeat));
    }
    if (!count) treatmentActions.push(...structuredClone(controlActions));
    const shared = {
      seed, seat: sourceSeat, error: null,
      fullPhysicalDealHash: `physical-${i}`,
      deckAHash: 'decka', deckBHash: 'deckb',
      actualStarterSeat: 0, nativeStatus: 'engine-game-end',
      nativeWinner: 0
    };
    return {
      seed, sourceSeat, cohort, complete: true, matched: true,
      identicalNativeRootTrace: count === 0,
      control: {
        ...shared, enabled: false, sourceCompressorRoots: [],
        allNativeRootActions: controlActions
      },
      treatment: {
        ...shared, enabled: true, sourceCompressorRoots: compressorRoots,
        allNativeRootActions: treatmentActions,
        bridge: { sourceSeat, accepted: count, rejected: 0 }
      }
    };
  });
  return { schema: SCHEMA, attemptedNativeArms: 38, pairs };
}

test('complete frozen cohort: six native prompt chains, paper custody unverified', () => {
  const result = auditArchivedBridge(sample());
  assert.equal(result.pairs, 19);
  assert.equal(result.matched, 19);
  assert.equal(result.tally.fresh.nativeCompressor, 2);
  assert.equal(result.tally['known-positive'].nativeCompressor, 4);
  assert.equal(result.receipts.length, 6);
  assert.ok(result.receipts.every(r =>
    r.nativeRoot === 'ACCEPTED_WITH_PROMPT_CHAIN' &&
    r.paperSelectedCardsAndPayment === 'UNVERIFIED'));
});

test('reject missing physical pair', () => {
  const archive = sample();
  archive.pairs.pop();
  assert.throws(() => auditArchivedBridge(archive), /18 !== 19/);
});
test('reject duplicate source cohort even with a complete total', () => {
  const archive = sample();
  archive.pairs[18] = structuredClone(archive.pairs[0]);
  assert.throws(() => auditArchivedBridge(archive), /Duplicated source pair/);
});
test('reject source prompt attributed to the opponent', () => {
  const archive = sample();
  archive.pairs[0].treatment.allNativeRootActions[1].playerSlot = 1;
  assert.throws(() => auditArchivedBridge(archive));
});
test('reject a missing native shuffle', () => {
  const archive = sample();
  archive.pairs[0].treatment.allNativeRootActions[2].pendingPrompt = 'WaitPrompt';
  assert.throws(() => auditArchivedBridge(archive));
});
test('reject an altered winner label after intervention', () => {
  const archive = sample();
  archive.pairs[0].treatment.nativeWinner = 1;
  assert.throws(() => auditArchivedBridge(archive));
});
test('reject unexplained original-source action divergence', () => {
  const archive = sample();
  archive.pairs[10].treatment.allNativeRootActions[0].action = 'PlayCardAction';
  assert.throws(() => auditArchivedBridge(archive));
});
