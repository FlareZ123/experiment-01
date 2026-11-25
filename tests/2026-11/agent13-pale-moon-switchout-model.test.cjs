'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  estimatePaleMoonEscapeAccess,
  estimateFloatStoneSearchAccess,
  estimateUTurnBoardAccess
} = require('../../scripts/agent13-pale-moon-switchout-model.cjs');

function deck(cards) {
  return { rank: 1, archetype: 'fixture', cards: Object.entries(cards).map(([name, count]) => ({ name, count })) };
}
const close = (actual, expected, tolerance = 1e-12) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, actual + ' differs from ' + expected);
const staticState = { handSize: 7, deckCount: 47, prizeCount: 6, knownPublicCount: 0 };

test('Cassius is a direct Supporter out for any target and remains live under Item lock', () => {
  const result = estimatePaleMoonEscapeAccess(deck({ Guzma: 2, Cassius: 1 }), {
    ...staticState, itemPlayLocked: true
  });
  close(result.totalAccessProbability, 1 - (57 * 56 * 55 * 54 * 53 * 52 * 51) /
    (60 * 59 * 58 * 57 * 56 * 55 * 54));
  assert.deepEqual(result.supportOutNames, ['Guzma', 'Cassius']);
  assert.equal(result.itemOutCopies, 0);
});

test('Penny is counted only when the affected Pokemon is Basic', () => {
  const list = deck({ Guzma: 1, Penny: 1, 'Scoop Up Cyclone': 1, 'VS Seeker': 3 });
  const basic = estimatePaleMoonEscapeAccess(list, { ...staticState, targetIsBasic: true });
  const evolved = estimatePaleMoonEscapeAccess(list, { ...staticState, targetIsBasic: false });
  close(basic.directOutProbability, 1 - (57 * 56 * 55 * 54 * 53 * 52 * 51) /
    (60 * 59 * 58 * 57 * 56 * 55 * 54));
  close(evolved.directOutProbability, 1 - (58 * 57 * 56 * 55 * 54 * 53 * 52) /
    (60 * 59 * 58 * 57 * 56 * 55 * 54));
  assert.ok(basic.totalAccessProbability > evolved.totalAccessProbability);
});

test('Pokemon Ranger is a universal effect reset and does not require a Bench', () => {
  const result = estimatePaleMoonEscapeAccess(deck({ 'Pokémon Ranger': 1 }), {
    ...staticState, actorBenchCount: 0, opponentBenchCount: 0, targetIsBasic: false, targetDamaged: false
  });
  close(result.directOutProbability, 7 / 60);
  assert.deepEqual(result.supportOutNames, ['Pokémon Ranger']);
});

test('VS Seeker can retrieve Pokemon Ranger from the public discard', () => {
  const result = estimatePaleMoonEscapeAccess(deck({ 'Pokémon Ranger': 1, 'VS Seeker': 3 }), {
    handSize: 7, deckCount: 30, prizeCount: 6, knownPublicCount: 17,
    knownPublicCounts: { 'Pokémon Ranger': 1 }, discardCounts: { 'Pokémon Ranger': 1 }
  });
  close(result.totalAccessProbability, 1 - (40 * 39 * 38 * 37 * 36 * 35 * 34) /
    (43 * 42 * 41 * 40 * 39 * 38 * 37));
  assert.deepEqual(result.eligibleSupportInDiscard, ['Pokémon Ranger']);
});

test('Battle Compressor plus VS Seeker can retrieve Cassius from deck', () => {
  const result = estimatePaleMoonEscapeAccess(deck({ Cassius: 1, 'VS Seeker': 2, 'Battle Compressor': 1 }), staticState);
  assert.ok(result.battleCompressorVsSeekerDeckProbability > 0);
  assert.ok(result.totalAccessProbability > result.directOutProbability);
});

test('Item lock disables Item routes but leaves Supporter return and Ranger outs live', () => {
  const result = estimatePaleMoonEscapeAccess(deck({ Cassius: 1, 'Pokémon Ranger': 1,
    'Escape Rope': 2, 'Prime Catcher': 1, 'VS Seeker': 2, 'Battle Compressor': 1 }), {
    ...staticState, itemPlayLocked: true
  });
  assert.equal(result.itemOutCopies, 0);
  assert.equal(result.vsSeekerRemaining, 0);
  assert.equal(result.battleCompressorRemaining, 0);
  assert.equal(result.supportOutCopies, 2);
});

test('Acerola is eligible only for a damaged target', () => {
  const list = deck({ Acerola: 1 });
  const undamaged = estimatePaleMoonEscapeAccess(list, { ...staticState, targetDamaged: false });
  const damaged = estimatePaleMoonEscapeAccess(list, { ...staticState, targetDamaged: true });
  assert.equal(undamaged.supportOutCopies, 0);
  assert.equal(damaged.supportOutCopies, 1);
});

test('Guzma and Prime Catcher require both Benches; Escape Rope and Switch require the actor Bench', () => {
  const list = deck({ Guzma: 1, 'Prime Catcher': 1, 'Escape Rope': 1, Switch: 1, Cassius: 1 });
  const noOtherBench = estimatePaleMoonEscapeAccess(list, { ...staticState, opponentBenchCount: 0 });
  assert.ok(!noOtherBench.supportOutNames.includes('Guzma'));
  assert.ok(!noOtherBench.itemOutNames.includes('Prime Catcher'));
  assert.ok(noOtherBench.itemOutNames.includes('Escape Rope'));
  assert.ok(noOtherBench.itemOutNames.includes('Switch'));
  assert.ok(noOtherBench.supportOutNames.includes('Cassius'));
  const noActorBench = estimatePaleMoonEscapeAccess(list, { ...staticState, actorBenchCount: 0 });
  assert.equal(noActorBench.totalAccessProbability, 0);
});

test('Prime Catcher is disabled when the ACE SPEC has already been used', () => {
  const result = estimatePaleMoonEscapeAccess(deck({ 'Prime Catcher': 1 }), {
    ...staticState, aceSpecAvailable: false
  });
  assert.equal(result.itemOutCopies, 0);
});

test('Arven can search Float Stone when the target Tool slot is open', () => {
  const result = estimateFloatStoneSearchAccess(deck({ 'Float Stone': 1, Arven: 4 }), {
    ...staticState, targetToolSlotOpen: true
  });
  close(result.pFloatStoneInHand, 7 / 60);
  close(result.pArvenSearch, 0.31737903349841584);
  close(result.totalAccessProbability, 0.4340457001650825);
});

test('Guzma and Hala needs a Stadium in deck for the modeled Float Stone search', () => {
  const list = deck({ 'Float Stone': 1, 'Guzma & Hala': 3, 'Path to the Peak': 1, 'Silent Lab': 1 });
  const withStadium = estimateFloatStoneSearchAccess(list, { ...staticState, targetToolSlotOpen: true });
  const noStadium = estimateFloatStoneSearchAccess(deck({ 'Float Stone': 1, 'Guzma & Hala': 3 }), {
    ...staticState, targetToolSlotOpen: true
  });
  close(withStadium.totalAccessProbability, 0.3573178103592758);
  close(noStadium.totalAccessProbability, 7 / 60);
});

test('Float Stone is still directly attachable under Item lock if a Tool slot is open', () => {
  const result = estimateFloatStoneSearchAccess(deck({ 'Float Stone': 1, Arven: 4 }), {
    ...staticState, itemPlayLocked: true, supporterAvailable: false, targetToolSlotOpen: true
  });
  close(result.totalAccessProbability, 7 / 60);
});

test('U-Turn Board is a conditional out only when one retreat cost remains', () => {
  const list = deck({ 'U-Turn Board': 1 });
  const oneCost = estimateUTurnBoardAccess(list, { ...staticState, targetToolSlotOpen: true, effectiveRetreatCost: 1 });
  const twoCost = estimateUTurnBoardAccess(list, { ...staticState, targetToolSlotOpen: true, effectiveRetreatCost: 2 });
  close(oneCost.accessProbability, 7 / 60);
  assert.equal(twoCost.accessProbability, 0);
});

test('known public card count must match the hidden pool', () => {
  assert.throws(() => estimatePaleMoonEscapeAccess(deck({ Guzma: 1 }), {
    handSize: 7, deckCount: 30, prizeCount: 6, knownPublicCount: 16
  }), /Public-state mismatch/);
});
