'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { jointSetup, sourceJointSetup } =
  require('../scripts/new-moon-meloetta-joint-lock-window.cjs');

/** @param {number} seed @returns {()=>number} */
function rng(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

/** @param {string[]} deck @param {()=>number} random */
function shuffle(deck, random) {
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

/**
 * Independent physical-deal counterfactual, including both directions of
 * simultaneous mulligans, six Prizes, accepted bonuses and Pad coin flips.
 * This does not use the exact calculation's hypergeometric weight algorithm.
 *
 * @param {number} games
 * @param {number} seed
 * @returns {object}
 */
function physicalDeals(games, seed) {
  const random = rng(seed);
  const defender = ['K', ...Array(16).fill('B'), ...Array(43).fill('-')];
  const attacker = [
    'C', 'S', 'V', 'M', ...Array(3).fill('P'),
    ...Array(10).fill('B'), ...Array(43).fill('-')
  ];
  assert.equal(defender.length, 60);
  assert.equal(attacker.length, 60);

  let soloK = 0, resource = 0, joint = 0, jointM = 0;
  for (let game = 0; game < games; game += 1) {
    let validD = false, validA = false, bonusesD = 0, bonusesA = 0;
    while (!validD || !validA) {
      if (!validD) {
        shuffle(defender, random);
        validD = defender.slice(0, 7).some(x => x === 'K' || x === 'B');
      }
      if (!validA) {
        shuffle(attacker, random);
        validA = attacker.slice(0, 7).some(
          x => x === 'V' || x === 'M' || x === 'B');
      }
      if (validD && !validA) bonusesD += 1;
      else if (validA && !validD) bonusesA += 1;
    }
    assert.ok(bonusesD === 0 || bonusesA === 0);
    const ownSeen = defender.slice(0, 7)
      .concat(defender.slice(13, 13 + Math.min(47, bonusesD)));
    const isSoloK = ownSeen.filter(x => x === 'K' || x === 'B').length === 1 &&
      ownSeen.includes('K');
    if (isSoloK) soloK += 1;

    const aHand = attacker.slice(0, 7);
    const aSeen = aHand.concat(
      attacker.slice(13, 14 + Math.min(bonusesA, 46)));
    let available = aSeen.includes('C');
    if (!available && !attacker.slice(7, 13).includes('C')) {
      const pads = aSeen.filter(x => x === 'P').length;
      let padSucceeded = false;
      for (let p = 0; p < pads; p += 1) {
        if (random() < 0.5) padSucceeded = true;
      }
      available = padSucceeded ||
        (aSeen.includes('S') && aSeen.includes('V'));
    }
    if (available) resource += 1;
    if (isSoloK && available) {
      joint += 1;
      if (aHand.includes('M')) jointM += 1;
    }
  }
  return {
    soleKlefki: soloK / games,
    meloettaResourceOpportunity: resource / games,
    jointKlefkiAndResource: joint / games,
    jointKlefkiMeloettaInitialAndResource: jointM / games
  };
}

test('source-locked joint exact setup and independent marginal conservation', () => {
  const result = sourceJointSetup(path.resolve(__dirname, '..'));
  assert.equal(result.defenderBasics, 17);
  assert.equal(result.attackerBasics, 12);
  assert.equal(result.lockCopies, 1);
  assert.equal(result.paperLegalityVerified, false);
  assert.ok(Math.abs(result.soleKlefki - 0.016154581995936116) < 1e-10);
  assert.ok(Math.abs(result.meloettaResourceOpportunity -
    0.28288700592169225) < 1e-10);
  assert.ok(Math.abs(result.jointKlefkiAndResource -
    0.004572560824435498) < 1e-10);
  assert.ok(Math.abs(result.jointKlefkiMeloettaInitialAndResource -
    0.0006142557039753475) < 1e-10);
  const { bothNoBonus, attackerGetsBonus, defenderGetsBonus } = result.setupMass;
  assert.ok(Math.abs(bothNoBonus + attackerGetsBonus + defenderGetsBonus -
    1) < 1e-12);
  assert.ok(result.jointKlefkiAndResource <= result.soleKlefki);
  assert.ok(result.jointKlefkiMeloettaInitialAndResource <=
    result.jointKlefkiAndResource);
});

test('parameter checks and symmetric sole-Basic identity exchangeability', () => {
  assert.throws(() => jointSetup(17, 12, 18), RangeError);
  assert.throws(() => jointSetup(0, 12, 1), RangeError);
  assert.throws(() => jointSetup(17, 12, 0), RangeError);
  const one = jointSetup(17, 12, 1);
  const two = jointSetup(17, 12, 2);
  assert.ok(Math.abs(two.jointKlefkiAndResource -
    2 * one.jointKlefkiAndResource) < 1e-12);
  assert.ok(Math.abs(one.jointSoleAnyAndResource -
    17 * one.jointKlefkiAndResource) < 1e-12);
});

test('220k physical shuffled setups verify both joint event rates', () => {
  const observed = physicalDeals(220000, 261817);
  const expected = jointSetup(17, 12, 1);
  for (const key of [
    'soleKlefki', 'meloettaResourceOpportunity',
    'jointKlefkiAndResource', 'jointKlefkiMeloettaInitialAndResource'
  ]) {
    const tolerance = key === 'meloettaResourceOpportunity' ? 0.0045 :
      key === 'soleKlefki' ? 0.0012 : 0.00065;
    assert.ok(Math.abs(observed[key] - expected[key]) < tolerance,
      key + ': ' + observed[key] + ' versus ' + expected[key]);
  }
  console.log(JSON.stringify({ observed, expected }));
});
