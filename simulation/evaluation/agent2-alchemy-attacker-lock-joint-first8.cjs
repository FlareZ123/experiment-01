'use strict';

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let value = 1n;
  const r = Math.min(k, n - k);
  for (let i = 1; i <= r; i += 1) {
    value = value * BigInt(n - r + i) / BigInt(i);
  }
  return value;
}

/**
 * Identifies complete, geometry-specific first-eight resource opportunities.
 * Separately tests whether a Regidrago V can be played or searched without
 * consuming the same Quick Ball / Treasure already needed by a lock line.
 * At most one hypothetical lock line is exercised in any single branch.
 * Search Item payment, actual play ordering, Bench crowding, mobility, and
 * action/card restrictions are outside this exact incidence calculation.
 *
 * @param {{shake:number,quick:number}} options
 * @returns {{basicValidInitialSeven:number,conditional:Record<string,number>,exactCounts:Record<string,string>,denominator:string}}
 */
function attackerLockFirstEight({shake, quick}) {
  if (!((shake === 3 && quick === 3) || (shake === 4 && quick === 2))) {
    throw new RangeError('Only registered Apex Alchemy v0 / v1 are supported');
  }
  // Grimer, Muk, Shake, Treasure, Quick, Budew, Regidrago V,
  // other five Basic Pokemon, remaining thirty-six cards.
  const population = [2, 2, shake, 4, quick, 1, 4, 5, 36];
  const denominator = 8n * choose(60, 8) * choose(52, 6);
  const categories = [
    'valid', 'muk', 'budew', 'eitherLock', 'regidrago', 'mukWithRegidrago',
    'budewWithRegidrago', 'budewInitiallyActive', 'budewInitiallyActiveWithRegidrago',
    'eitherLockWithRegidrago', 'eitherLockAndRegidrago',
    'bothAlternativesWithRegidrago',
    'mukRegidragoConnectorCollision', 'budewRegidragoConnectorCollision',
    'eitherLockRegidragoConnectorCollision',
    'positionedEitherLockWithRegidrago',
    'positionedBothAlternativesWithRegidrago',
    'unpositionedBudewOnlyAccessWithRegidrago'
  ];
  /** @type {Record<string,bigint>} */
  const count = Object.fromEntries(categories.map(k => [k, 0n]));
  const firstEight = Array(9).fill(0);

  /** @param {bigint} seenWeight */
  function inspect(seenWeight) {
    const [g, m, s, t, q, b, v, otherBasic] = firstEight;
    const unseenG = 2 - g;
    const unseenM = 2 - m;
    const unseenB = 1 - b;
    const unseenV = 4 - v;
    const unseenOther = 52 - unseenG - unseenM - unseenB - unseenV;
    for (let eighth = 0; eighth < 9; eighth += 1) {
      if (firstEight[eighth] === 0) continue;
      const initialBasics = g + b + v + otherBasic
        - ([0, 5, 6, 7].includes(eighth) ? 1 : 0);
      if (initialBasics === 0) continue;
      const nonGrimerStarter = b + v + otherBasic
        - ([5, 6, 7].includes(eighth) ? 1 : 0) > 0;
      const orderedWeight = seenWeight * BigInt(firstEight[eighth]);
      for (let pg = 0; pg <= unseenG; pg += 1) {
        for (let pm = 0; pm <= unseenM; pm += 1) {
          for (let pb = 0; pb <= unseenB; pb += 1) {
            for (let pv = 0; pv <= unseenV; pv += 1) {
              const otherPrize = 6 - pg - pm - pb - pv;
              if (otherPrize < 0 || otherPrize > unseenOther) continue;
              const weight = orderedWeight
                * choose(unseenG, pg) * choose(unseenM, pm)
                * choose(unseenB, pb) * choose(unseenV, pv)
                * choose(unseenOther, otherPrize);
              const grimerInDeck = unseenG > pg;
              const mukInDeck = unseenM > pm;
              const budewInDeck = unseenB > pb;
              const regidragoInDeck = unseenV > pv;
              const connectors = t + q;
              const muk = nonGrimerStarter && s > 0 && mukInDeck
                && (g > 0 || (connectors > 0 && grimerInDeck));
              const budew = b > 0 || (q > 0 && budewInDeck);
              const regidrago = v > 0 || (connectors > 0 && regidragoInDeck);
              const mukWithRegidrago = muk && regidrago
                && (g > 0 || v > 0 || connectors >= 2);
              const budewWithRegidrago = budew && regidrago
                && (b > 0 || v > 0 || (q > 0 && connectors >= 2));
              const eitherLockWithRegidrago = mukWithRegidrago || budewWithRegidrago;
              count.valid += weight;
              if (muk) count.muk += weight;
              if (budew) count.budew += weight;
              if (muk || budew) count.eitherLock += weight;
              if (regidrago) count.regidrago += weight;
              if (mukWithRegidrago) count.mukWithRegidrago += weight;
              if (budewWithRegidrago) count.budewWithRegidrago += weight;
              // An opening-seven Budew can be declared Active at setup.
              // Budew fetched by Quick Ball or drawn as card eight cannot.
              const budewInitiallyActive = b > 0 && eighth !== 5;
              if (budewInitiallyActive) count.budewInitiallyActive += weight;
              if (budewInitiallyActive && regidrago) {
                count.budewInitiallyActiveWithRegidrago += weight;
              }
              if (eitherLockWithRegidrago) count.eitherLockWithRegidrago += weight;
              // No free switch is assumed. A physically held or searched Budew
              // cannot use Itchy Pollen from the Bench on turn one. This branch
              // admits only Budew genuinely in the opening seven, selected as
              // Active at setup, or a Muk line whose setup can occupy Bench.
              const positionedBudew = budewInitiallyActive && regidrago;
              const positionedEither = mukWithRegidrago || positionedBudew;
              if (positionedEither) count.positionedEitherLockWithRegidrago += weight;
              if (mukWithRegidrago && positionedBudew) {
                count.positionedBothAlternativesWithRegidrago += weight;
              }
              if (eitherLockWithRegidrago && !positionedEither) {
                count.unpositionedBudewOnlyAccessWithRegidrago += weight;
              }
              if ((muk || budew) && regidrago) count.eitherLockAndRegidrago += weight;
              if (mukWithRegidrago && budewWithRegidrago) {
                count.bothAlternativesWithRegidrago += weight;
              }
              if (muk && regidrago && !mukWithRegidrago) {
                count.mukRegidragoConnectorCollision += weight;
              }
              if (budew && regidrago && !budewWithRegidrago) {
                count.budewRegidragoConnectorCollision += weight;
              }
              if ((muk || budew) && regidrago && !eitherLockWithRegidrago) {
                count.eitherLockRegidragoConnectorCollision += weight;
              }
            }
          }
        }
      }
    }
  }

  /** @param {number} i @param {number} remaining @param {bigint} weight */
  function enumerate(i, remaining, weight) {
    if (i === 8) {
      if (remaining <= population[i]) {
        firstEight[i] = remaining;
        inspect(weight * choose(population[i], remaining));
      }
      return;
    }
    for (let k = 0; k <= Math.min(population[i], remaining); k += 1) {
      firstEight[i] = k;
      enumerate(i + 1, remaining - k, weight * choose(population[i], k));
    }
  }
  enumerate(0, 8, 1n);
  return {
    basicValidInitialSeven: Number(count.valid) / Number(denominator),
    conditional: Object.fromEntries(categories.filter(k => k !== 'valid')
      .map(k => [k, Number(count[k]) / Number(count.valid)])),
    exactCounts: Object.fromEntries(categories.map(k => [k, count[k].toString()])),
    denominator: denominator.toString()
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify({
    v0: attackerLockFirstEight({shake: 3, quick: 3}),
    v1: attackerLockFirstEight({shake: 4, quick: 2})
  }, null, 2) + '\n');
}
module.exports = {choose, attackerLockFirstEight};
