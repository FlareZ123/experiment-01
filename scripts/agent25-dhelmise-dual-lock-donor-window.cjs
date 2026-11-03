'use strict';

const assert = require('node:assert/strict');
const original = require('../results/als/agent25-dhelmise-mixed-lock-answers-v2.json');
const {exactLockedOpening} =
  require('./agent25-dhelmise-lock-conditioned-opening.cjs');
const {prizeSurvival} =
  require('./agent25-dhelmise-hns-discard-lock.cjs');

const VERSION = 'agent25-dhelmise-dual-lock-donor-window-v2';

/** @returns {{banette:number,shuppet:number,sinistcha:number}} */
function printedMix() {
  assert.equal(original.cards.reduce((n, c) => n + c.count, 0), 60);
  const count = id => {
    const rows = original.cards.filter(c => c.id === id);
    assert.equal(rows.length, 1, 'missing printed donor ' + id);
    return rows[0].count;
  };
  return {banette: count('me5-34'), shuppet: count('me5-33'),
    sinistcha: count('me5-6')};
}

/**
 * Exhaustive mix optimizer over the four ME5 HNS printings, with
 * a four-copy limit each. The criterion is surviving the worse of an active Wobbuffet
 * and an active Silent Lab individually. This is a donor-count objective.
 * @param {number} total
 */
function maximinMixes(total) {
  assert.ok(Number.isSafeInteger(total) && total >= 4 && total <= 12);
  let optimum = -1;
  const mixes = [];
  for (let banette = 0; banette <= 4; banette++) {
    for (let shuppet = 0; shuppet <= 4; shuppet++) {
      for (let sinistcha = 0; sinistcha <= 4; sinistcha++) {
        const poltchageist = total - banette - shuppet - sinistcha;
        if (poltchageist < 0 || poltchageist > 4) continue;
        const worst = Math.min(banette + shuppet, banette + sinistcha);
        if (worst > optimum) {
          optimum = worst;
          mixes.length = 0;
        }
        if (worst === optimum) mixes.push({
          banette, shuppet, sinistcha, poltchageist
        });
      }
    }
  }
  return {total, optimum, mixes};
}

/**
 * Counterfactual simultaneous active Wobbuffet PHF and Silent Lab PRC.
 * Only Psychic Stage 1 Banette retains HNS; Psychic Basic Shuppet loses
 * its Ability under Silent Lab and Grass Stage 1 Sinistcha loses its
 * Ability under Wobbuffet. An active Tool-powered Garbotoxin would make
 * the eligible count zero.
 *
 * Uses the previously validated exact 9-category location enumerator
 * rather than a new physical random-deal implementation. Additional
 * donor slots (10/12) replace unspecified non-Basic Trainers. No fully
 * revised deck or proof that an original Top32 source establishes both
 * locks is implied.
 *
 * @param {2|3|4} extraCopies The copy count for each Shuppet/Sinistcha.
 */
function jointLockWindow(extraCopies) {
  assert.ok([2,3,4].includes(extraCopies));
  const totalDonors = 4 + 2 * extraCopies;
  const event = exactLockedOpening({
    totalDonors, eligibleDonors: 4, basicCount: 12 + extraCopies
  });
  const necessary = prizeSurvival(4);
  return {
    version: VERSION, composition: {banette:4,
      shuppet:extraCopies, sinistcha:extraCopies},
    totalDonors, jointLockEffectiveDonors: 4,
    ordinaryDrawStrictUnconditional: event.unconditional,
    ordinaryDrawStrictGivenBasicOpening: event.conditionalBasicValid,
    favorableWorlds: event.favorableWorlds,
    totalWorlds: event.totalWorlds,
    prizeOnlyAllFourUnprized:
      necessary.unprizedAtLeastNeedProbability,
    hypotheticalOtherNonBasicCardCuts: totalDonors - 8,
    bothLocksActuallyEstablishedByAnOriginalSourceUnverified: true,
    physicalCardLocationOnly: true,
    competitivelyQualifiedGames: 0
  };
}

function study() {
  return {
    version: VERSION, originalMix: printedMix(),
    individualLockMaximinEight: maximinMixes(8),
    individualLockMaximinTen: maximinMixes(10),
    jointLockCounterfactuals: [2,3,4].map(jointLockWindow),
    originalFixedSixtyUnchanged: true,
    competitivelyQualifiedGames: 0
  };
}

module.exports = {VERSION, printedMix, maximinMixes, jointLockWindow, study};
if (require.main === module)
  process.stdout.write(JSON.stringify(study(),null,2) + '\n');
