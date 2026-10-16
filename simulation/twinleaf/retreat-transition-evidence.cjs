'use strict';

/**
 * Record the effect of one accepted RetreatAction on public board position.
 * A name-only trace cannot distinguish the declared Bench target from a later
 * Switch or from another same-name Pokémon. No hidden zones are inspected.
 *
 * @param {object[]} before Public snapshots before dispatch.
 * @param {object[]} after Public snapshots after dispatch.
 * @param {number} seat Acting player physical slot (0 or 1).
 * @param {number} benchIndex Action's nominated Bench slot index.
 * @returns {object} Detached, public-only positional evidence.
 */
function retreatTransitionEvidence(before, after, seat, benchIndex) {
  if (!Array.isArray(before) || !Array.isArray(after) ||
      ![0,1].includes(seat) || !Number.isInteger(benchIndex)) {
    throw new Error('Retreat evidence requires public pre/post snapshots and an indexed seat.');
  }
  const ownBefore = before[seat];
  const ownAfter = after[seat];
  return {
    fromActive: ownBefore.active,
    destinationBenchIndex: benchIndex,
    intendedActive: ownBefore.bench[benchIndex] || null,
    actualActiveAfter: ownAfter.active,
    benchAfter: ownAfter.bench
  };
}

module.exports = {retreatTransitionEvidence};
