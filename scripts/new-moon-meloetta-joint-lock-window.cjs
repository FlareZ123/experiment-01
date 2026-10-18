'use strict';

const path = require('node:path');
const { choose, mulliganProbability } = require('./aichi_opening_audit.cjs');
const { bonusExactly, bonusAtLeast } = require('./aichi_bonus_draws.cjs');
const { fixedInitialMeloettaWindow } =
  require('./aichi-meloetta-stone-pad-bridge.cjs');
const { jointOpening } = require('./new-moon-meloetta-joint-resource.cjs');

/**
 * Extend the existing Klefki/Cologne co-occurrence census to require
 * singleton Meloetta ex physically in its legal opening seven.
 *
 * At most one player receives opponent-mulligan bonuses in a setup.
 * The F(k) enumerator already integrates six hidden Prize cards, three
 * independent Order Pad flips and the Stone/Crobat rescue opportunity.
 * @param {number} defenderBasics Source New Moon Basic count.
 * @param {number} attackerBasics Source Meloetta Basic count.
 * @param {number} lockCopies Klefki Basic copies in defender's 60.
 * @returns {object}
 */
function initialMeloettaJoint(defenderBasics, attackerBasics, lockCopies) {
  if (![defenderBasics, attackerBasics, lockCopies].every(Number.isInteger) ||
      defenderBasics < 1 || defenderBasics > 53 ||
      attackerBasics < 2 || attackerBasics > 55 ||
      lockCopies < 1 || lockCopies > defenderBasics) {
    throw new RangeError('Invalid physical Basic inventory.');
  }
  const pD = mulliganProbability(defenderBasics);
  const pA = mulliganProbability(attackerBasics);
  const bothValid = (1 - pD) * (1 - pA) / (1 - pD * pA);
  const initiallySoleLock = lockCopies * choose(60 - defenderBasics, 6) /
    (choose(60, 7) - choose(60 - defenderBasics, 7));
  const f0 = fixedInitialMeloettaWindow(attackerBasics, 0).combined;

  // If the defender receives bonuses, Meloetta has none.
  const defenderBonusMass = bonusAtLeast(pA, pD, 1);
  let attackerMarginal = (bothValid + defenderBonusMass) * f0;
  let jointFactor = bothValid * f0;
  for (let k = 1; k <= 54 - defenderBasics; k += 1) {
    const noExtraBasic = choose(54 - defenderBasics, k) / choose(53, k);
    jointFactor += bonusExactly(pA, pD, k) * noExtraBasic * f0;
  }

  // If Meloetta receives bonuses, Klefki remains its only defending Basic.
  for (let k = 1; k < 46; k += 1) {
    const mass = bonusExactly(pD, pA, k);
    const f = fixedInitialMeloettaWindow(attackerBasics, k).combined;
    jointFactor += mass * f;
    attackerMarginal += mass * f;
  }
  const tail = bonusAtLeast(pD, pA, 46);
  const f46 = fixedInitialMeloettaWindow(attackerBasics, 46).combined;
  jointFactor += tail * f46;
  attackerMarginal += tail * f46;
  return {
    defenderBasics, attackerBasics, lockCopies,
    meloettaInitiallyPresentAndResource: attackerMarginal,
    jointKlefkiMeloettaInitialAndResource:
      initiallySoleLock * jointFactor,
    scope: 'Exact physical setup and idealized resource access. Meloetta opening Active may conflict with Tapu Koko Bench acceleration; no completed attack or win inference.'
  };
}

/** @param {string} root @returns {object} */
function sourceJointSetup(root) {
  const earlier = jointOpening(root);
  if (earlier.defenderBasics !== 17 || earlier.attackerBasics !== 12) {
    throw new Error('Frozen New Moon and source rank-26 Basic counts changed.');
  }
  const extra = initialMeloettaJoint(17, 12, 1);
  if (!(extra.jointKlefkiMeloettaInitialAndResource > 0 &&
      extra.jointKlefkiMeloettaInitialAndResource < earlier.combined)) {
    throw new Error('Stricter joint event lies outside the established event.');
  }
  return {
    priorResearch: 'scripts/new-moon-meloetta-joint-resource.cjs',
    challengerHash: earlier.challengerHash,
    paperLegalityVerified: false,
    existingJointKlefkiAndResource: earlier.combined,
    existingSoleKlefki: earlier.soleKlefki,
    ...extra
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(
    sourceJointSetup(path.resolve(__dirname, '..')), null, 2) + '\n');
}

module.exports = { initialMeloettaJoint, sourceJointSetup };
