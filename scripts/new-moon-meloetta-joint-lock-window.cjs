'use strict';

const path = require('node:path');
const { choose, mulliganProbability } = require('./aichi_opening_audit.cjs');
const { bonusExactly, bonusAtLeast } = require('./aichi_bonus_draws.cjs');
const { fixedWindow, fixedInitialMeloettaWindow } =
  require('./aichi-meloetta-stone-pad-bridge.cjs');
const { assess } = require('./new-moon-meloetta-solo-stress.cjs');

/**
 * Exact joint opening event across both players' physical decks.
 * The players cannot each receive opponent-mulligan bonuses in the same setup:
 * after the first unmatched seven, one player retains a valid opening.
 * Prizes are marginalized in the existing rank-26 access enumerator.
 *
 * @param {number} defenderBasics Source-checked New Moon Basic count.
 * @param {number} attackerBasics Source-checked Meloetta Basic count.
 * @param {number} lockCopies Source-checked Basic Klefki copies.
 * @returns {object}
 */
function jointSetup(defenderBasics, attackerBasics, lockCopies) {
  if (![defenderBasics, attackerBasics, lockCopies].every(Number.isInteger) ||
      defenderBasics < 1 || defenderBasics > 53 ||
      attackerBasics < 2 || attackerBasics > 55 ||
      lockCopies < 1 || lockCopies > defenderBasics) {
    throw new RangeError('Invalid physical source Basic inventory.');
  }
  const pD = mulliganProbability(defenderBasics);
  const pA = mulliganProbability(attackerBasics);
  const denominator = 1 - pD * pA;
  const bothNoBonus = (1 - pD) * (1 - pA) / denominator;

  // A valid seven with exactly one Klefki and no other Basic.
  const eligibleOpenings = choose(60, 7) - choose(60 - defenderBasics, 7);
  const initiallySoleLock = lockCopies * choose(60 - defenderBasics, 6) /
    eligibleOpenings;
  const initiallySoleAny = defenderBasics * choose(60 - defenderBasics, 6) /
    eligibleOpenings;
  const noFurtherBasic = k => k <= 54 - defenderBasics ?
    choose(54 - defenderBasics, k) / choose(53, k) : 0;

  const base = fixedWindow(attackerBasics, 0).combined;
  const baseWithMeloetta = fixedInitialMeloettaWindow(attackerBasics, 0).combined;
  const attackerGetsBonus = bonusAtLeast(pD, pA, 1);
  const defenderGetsBonus = bonusAtLeast(pA, pD, 1);
  let weightedResource = base;
  let weightedInitialMeloetta = baseWithMeloetta;
  let jointResourceFactor = (bothNoBonus + attackerGetsBonus) * base;
  let jointMeloettaFactor = (bothNoBonus + attackerGetsBonus) *
    baseWithMeloetta;
  let solePersistence = bothNoBonus + attackerGetsBonus;

  // Defender draws only when attacker mulligans. In this branch attacker
  // receives no bonuses, so only its zero-bonus resource window applies.
  for (let k = 1; k <= 54 - defenderBasics; k += 1) {
    const mass = bonusExactly(pA, pD, k) * noFurtherBasic(k);
    solePersistence += mass;
    jointResourceFactor += mass * base;
    jointMeloettaFactor += mass * baseWithMeloetta;
  }

  // Attacker draws only when defender mulligans. The defender retains its
  // original seven, including a sole Klefki. 46+ draws share the capped
  // first-turn observation window, leaving the ordinary turn draw possible.
  for (let k = 1; k < 46; k += 1) {
    const mass = bonusExactly(pD, pA, k);
    const full = fixedWindow(attackerBasics, k).combined;
    const withMeloetta =
      fixedInitialMeloettaWindow(attackerBasics, k).combined;
    weightedResource += mass * (full - base);
    weightedInitialMeloetta += mass * (withMeloetta - baseWithMeloetta);
    jointResourceFactor += mass * (full - base);
    jointMeloettaFactor += mass * (withMeloetta - baseWithMeloetta);
  }
  const tailMass = bonusAtLeast(pD, pA, 46);
  const tailFull = fixedWindow(attackerBasics, 46).combined;
  const tailWithMeloetta =
    fixedInitialMeloettaWindow(attackerBasics, 46).combined;
  weightedResource += tailMass * (tailFull - base);
  weightedInitialMeloetta += tailMass *
    (tailWithMeloetta - baseWithMeloetta);
  jointResourceFactor += tailMass * (tailFull - base);
  jointMeloettaFactor += tailMass * (tailWithMeloetta - baseWithMeloetta);

  const soleKlefki = initiallySoleLock * solePersistence;
  const jointKlefkiAndResource = initiallySoleLock * jointResourceFactor;
  const jointKlefkiMeloettaInitialAndResource =
    initiallySoleLock * jointMeloettaFactor;
  return {
    defenderBasics, attackerBasics, lockCopies,
    setupMass: {
      bothNoBonus, attackerGetsBonus, defenderGetsBonus
    },
    soleKlefki,
    soleAnyBasic: initiallySoleAny * solePersistence,
    meloettaResourceOpportunity: weightedResource,
    meloettaInitiallyPresentAndResource: weightedInitialMeloetta,
    jointKlefkiAndResource,
    jointKlefkiMeloettaInitialAndResource,
    jointSoleAnyAndResource: initiallySoleAny * jointResourceFactor,
    conditionalResourceGivenSoleKlefki:
      jointKlefkiAndResource / soleKlefki,
    independentProduct: soleKlefki * weightedResource,
    probabilitySoleKlefkiWithoutModeledRoute:
      soleKlefki - jointKlefkiAndResource,
    scope: 'Opening structural and idealized resource opportunity only. No attack, policy, paper-legality or game-win claim.'
  };
}

/** @param {string} root @returns {object} */
function sourceJointSetup(root) {
  const source = assess(root);
  if (source.challengerBasics !== 17 ||
      source.opponentBasics !== 12 ||
      source.afterAllUsableOpponentMulliganBonuses.challengerSoloKlefki <= 0) {
    throw new Error('Source opening identities changed.');
  }
  const result = jointSetup(17, 12, 1);
  if (Math.abs(result.soleKlefki -
      source.afterAllUsableOpponentMulliganBonuses.challengerSoloKlefki) > 1e-10 ||
      Math.abs(result.meloettaResourceOpportunity -
      source.meloettaCologneResourceOpportunity.combined) > 1e-10) {
    throw new Error('Joint model does not reproduce both earlier marginals.');
  }
  return {
    rankAttacker: 26,
    challenger: 'New Moon Lockbreaker v1',
    challengerHash: source.challengerHash,
    paperLegalityVerified: false,
    ...result
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(
    sourceJointSetup(path.resolve(__dirname, '..')), null, 2) + '\n');
}

module.exports = { jointSetup, sourceJointSetup };
