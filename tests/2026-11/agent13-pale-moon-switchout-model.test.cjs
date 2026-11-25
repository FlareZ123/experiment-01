'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { estimateSwitchOutAccess } = require('../../scripts/agent13-pale-moon-switchout-model.cjs');

function deck(cards) {
  return { rank: 1, archetype: 'fixture', cards: Object.entries(cards).map(([name, count]) => ({ name, count })) };
}
const close = (actual, expected, tolerance = 1e-12) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, actual + ' differs from ' + expected);

const staticState = { handSize: 7, deckCount: 47, prizeCount: 6, knownPublicCount: 0 };

test('Cassius is a direct Supporter out for any target, including under Item lock', () => {
  const result = estimateSwitchOutAccess(deck({ Guzma: 2, Cassius: 1 }), {
    ...staticState, itemPlayLocked: true, targetIsBasic: false
  });
  close(result.totalAccessProbability, 1 - (57 * 56 * 55 * 54 * 53 * 52 * 51) /
    (60 * 59 * 58 * 57 * 56 * 55 * 54));
  assert.deepEqual(result.supportOutNames, ['Guzma', 'Cassius']);
  assert.equal(result.itemOutCopies, 0);
});

test('Penny is counted only when the affected Pokemon is Basic', () => {
  const list = deck({ Guzma: 1, Penny: 1, 'Scoop Up Cyclone': 1, 'VS Seeker': 3 });
  const basic = estimateSwitchOutAccess(list, { ...staticState, targetIsBasic: true });
  const evolved = estimateSwitchOutAccess(list, { ...staticState, targetIsBasic: false });
  close(basic.directOutProbability, 1 - (57 * 56 * 55 * 54 * 53 * 52 * 51) /
    (60 * 59 * 58 * 57 * 56 * 55 * 54));
  close(evolved.directOutProbability, 1 - (58 * 57 * 56 * 55 * 54 * 53 * 52) /
    (60 * 59 * 58 * 57 * 56 * 55 * 54));
  assert.ok(basic.totalAccessProbability > evolved.totalAccessProbability);
  assert.ok(basic.supportOutNames.includes('Penny'));
  assert.ok(!evolved.supportOutNames.includes('Penny'));
});

test('VS Seeker becomes a direct access route when an eligible Supporter is in discard', () => {
  const list = deck({ Guzma: 2, 'VS Seeker': 3, 'Battle Compressor': 1 });
  const result = estimateSwitchOutAccess(list, {
    handSize: 7, deckCount: 30, prizeCount: 6, knownPublicCount: 17,
    knownPublicCounts: { Guzma: 1 }, discardCounts: { Guzma: 1 }
  });
  close(result.totalAccessProbability, 1 - (39 * 38 * 37 * 36 * 35 * 34 * 33) /
    (43 * 42 * 41 * 40 * 39 * 38 * 37));
  assert.deepEqual(result.eligibleSupportInDiscard, ['Guzma']);
  assert.equal(result.battleCompressorVsSeekerDeckProbability, 0);
});

test('Battle Compressor plus VS Seeker can retrieve Cassius from deck', () => {
  const list = deck({ Cassius: 1, 'VS Seeker': 2, 'Battle Compressor': 1 });
  const result = estimateSwitchOutAccess(list, staticState);
  assert.ok(result.battleCompressorVsSeekerDeckProbability > 0);
  assert.ok(result.totalAccessProbability > result.directOutProbability);
});

test('Item lock disables Item routes but leaves Supporter return outs live', () => {
  const list = deck({ Cassius: 1, Guzma: 1, 'Escape Rope': 2, 'VS Seeker': 2,
    'Battle Compressor': 1, 'Scoop Up Cyclone': 1 });
  const result = estimateSwitchOutAccess(list, { ...staticState, itemPlayLocked: true });
  assert.equal(result.itemOutCopies, 0);
  assert.equal(result.vsSeekerRemaining, 0);
  assert.equal(result.battleCompressorRemaining, 0);
  assert.equal(result.supportOutCopies, 2);
});

test('Acerola is eligible only for a damaged target', () => {
  const list = deck({ Acerola: 1 });
  const undamaged = estimateSwitchOutAccess(list, { ...staticState, targetDamaged: false });
  const damaged = estimateSwitchOutAccess(list, { ...staticState, targetDamaged: true });
  assert.equal(undamaged.supportOutCopies, 0);
  assert.equal(damaged.supportOutCopies, 1);
});

test('Guzma and Escape Rope require both players to have a Bench', () => {
  const list = deck({ Guzma: 1, 'Escape Rope': 1, Switch: 1 });
  const noActorBench = estimateSwitchOutAccess(list, { ...staticState, actorBenchCount: 0 });
  assert.ok(!noActorBench.supportOutNames.includes('Guzma'));
  assert.ok(!noActorBench.itemOutNames.includes('Escape Rope'));
  assert.ok(noActorBench.itemOutNames.includes('Switch'));
  const noOpponentBench = estimateSwitchOutAccess(list, { ...staticState, opponentBenchCount: 0 });
  assert.equal(noOpponentBench.totalAccessProbability, 0);
});

test('known public card count must match the hidden pool', () => {
  assert.throws(() => estimateSwitchOutAccess(deck({ Guzma: 1 }), {
    handSize: 7, deckCount: 30, prizeCount: 6, knownPublicCount: 16
  }), /Public-state mismatch/);
});
