'use strict';

const assert = require('node:assert/strict');

/** @param {string[]} prizes Six full printing names; forensic observer only. */
function inspectRank15PrizePrerequisites(prizes) {
  assert.equal(prizes.length, 6);
  const count = name => prizes.filter(x => x === name).length;
  const oddish = count('Oddish UNB');
  const gloom = count('Gloom UNB');
  const aor = count('Vileplume AOR');
  const bus = count('Vileplume BUS');
  return {
    oddishPrized: oddish,
    gloomPrized: gloom,
    aorPrized: aor,
    busPrized: bus,
    beforeTakingPrizesEligible: oddish === 0 && gloom === 0 && aor < 2 && bus === 0
  };
}
module.exports = {inspectRank15PrizePrerequisites};
