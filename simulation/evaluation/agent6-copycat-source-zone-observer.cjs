'use strict';

const assert = require('node:assert/strict');

const PRINTS = Object.freeze({
  mimikyu: 'Mimikyu GRI',
  dialga: 'Dialga-GX UPR',
  ball: 'Hisuian Heavy Ball ASR',
  seal: 'Forest Seal Stone SIT',
  shadowRiderV: 'Shadow Rider Calyrex V CRE'
});

/** @param {object} zone */
function slotCards(zone) {
  return zone?.cards ?? [];
}

/**
 * Offline-only extraction from the first stable pre-action PLAYER_TURN root.
 * At this point opening Basics have left the initial seven and occupy Active
 * or Bench. Mulligan compensation and the starting player's first turn
 * draw can add further hand cards before this root.
 * The returned private zone names must never be supplied to a deciding bot.
 *
 * @param {object} state Real pinned Store state.
 * @param {0|1} sourceSeat Physical source seat.
 * @param {number} expectedVCopies Exact printed source-60 Shadow Rider V copies.
 * @returns {object}
 */
function summarizeCopycatInitialPhysicalZones(state, sourceSeat, expectedVCopies) {
  assert.ok(sourceSeat === 0 || sourceSeat === 1);
  assert.ok(expectedVCopies === 3 || expectedVCopies === 4);
  assert.equal(state.phase, 2, 'Must capture stable first PLAYER_TURN root');
  assert.equal(state.turn, 1, 'Must capture before first player-turn action');
  assert.ok((state.prompts ?? []).every(p => p.result !== undefined),
    'Setup prompts must be fully settled');
  assert.equal(state.players?.length, 2);
  const source = state.players[sourceSeat];
  const opening = [...slotCards(source.hand), ...slotCards(source.active),
    ...(source.bench ?? []).flatMap(slotCards)];
  const inPlay = [...slotCards(source.active), ...(source.bench ?? []).flatMap(slotCards)];
  const prizes = source.prizes.flatMap(slotCards);
  const deck = slotCards(source.deck);
  const unused = [source.discard, source.lostzone, source.stadium,
    source.supporter].flatMap(slotCards);
  const zones = {opening, prizes, deck, unused};
  const physicalLocations = {};
  for (const role of ['mimikyu', 'dialga', 'ball', 'seal']) {
    const printing = PRINTS[role];
    const found = Object.entries(zones).filter(([, cards]) =>
      cards.some(c => c.fullName === printing));
    const copies = Object.values(zones).reduce((sum, cards) =>
      sum + cards.filter(c => c.fullName === printing).length, 0);
    assert.equal(copies, 1, 'Expected exactly one physical ' + printing);
    assert.equal(found.length, 1);
    physicalLocations[role] = found[0][0];
  }
  const countV = cards => cards.filter(c => c.fullName === PRINTS.shadowRiderV).length;
  const vCounts = Object.fromEntries(Object.entries(zones)
    .map(([zone, cards]) => [zone, countV(cards)]));
  const totalV = Object.values(vCounts).reduce((a, b) => a + b, 0);
  assert.equal(totalV, expectedVCopies, 'Printed Pokémon V count mismatches source');
  const oneCorePrized = Number(physicalLocations.mimikyu === 'prizes') +
    Number(physicalLocations.dialga === 'prizes') === 1;
  return Object.freeze({
    schema: 'copycat-source-postsetup-physical-zone-v1',
    sourceSeat,
    physicalLocations: Object.freeze(physicalLocations),
    shadowRiderV: Object.freeze({...vCounts, inPlay: countV(inPlay)}),
    oneCorePrizedBallInDeck: oneCorePrized && physicalLocations.ball === 'deck',
    heldSealWithInPlayV: oneCorePrized && physicalLocations.ball === 'deck' &&
      physicalLocations.seal === 'opening' && countV(inPlay) > 0,
    initialSevenComparable: false,
    note: 'Postsetup includes staged Basics, possible mulligan bonus cards and the starting player draw. Offline telemetry only.'
  });
}

/** @param {0|1} sourceSeat @param {number} expectedVCopies */
function createCopycatInitialPhysicalObserver(sourceSeat, expectedVCopies) {
  let captured = null;
  return Object.freeze({
    /** @param {object} state */
    observe(state) {
      if (captured || state.phase !== 2 ||
        (state.prompts ?? []).some(p => p.result === undefined)) return;
      captured = summarizeCopycatInitialPhysicalZones(state, sourceSeat, expectedVCopies);
    },
    result() { return captured; }
  });
}

module.exports = {PRINTS, summarizeCopycatInitialPhysicalZones,
  createCopycatInitialPhysicalObserver};
