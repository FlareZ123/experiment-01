'use strict';
const { exactOpening } = require('./radiant-eternatus-opening.cjs');

const GROUPS = Object.freeze([1, 5, 1, 4, 10, 3, 1, 4, 31]);
const [E, S, H, VM, B, V, FSS, FOG] = [0, 1, 2, 3, 4, 5, 6, 7];

/** @returns {bigint[][]} Pascal binomial matrix. */
function choices() {
  const c = Array.from({ length: 61 }, () => Array(61).fill(0n));
  for (let n = 0; n <= 60; n++) {
    c[n][0] = c[n][n] = 1n;
    for (let k = 1; k < n; k++) c[n][k] = c[n - 1][k - 1] + c[n - 1][k];
  }
  return c;
}
const C = choices();

/** @param {number[]} available @param {number} total @param {(counts:number[],weight:bigint)=>void} emit */
function enumerate(available, total, emit) {
  const counts = new Array(available.length).fill(0);
  function walk(i, remain, weight) {
    if (i === available.length - 1) {
      if (remain <= available[i]) {
        counts[i] = remain;
        emit(counts.slice(), weight * C[available[i]][remain]);
      }
      return;
    }
    for (let n = 0; n <= Math.min(available[i], remain); n++) {
      counts[i] = n;
      walk(i + 1, remain - n, weight * C[available[i]][n]);
    }
  }
  walk(0, total, 1n);
}

/**
 * Additional Gate availability using Forest Seal Stone and optionally Fog Crystal.
 * Both players draw on turn one; the pre-draw snapshot is a separate calculation.
 * @param {boolean} includeTurnDraw
 */
function computeForestSealIncrement(includeTurnDraw) {
  const rawTotals = {direct: 0n, prized: 0n, directTwo: 0n, prizedTwo: 0n};
  const normal = includeTurnDraw ? 53n * C[52][6] : C[53][6];
  const validDenominator = (C[60][7] - C[46][7]) * normal;
  enumerate(GROUPS, 7, (opening, hWeight) => {
    if (opening[B] + opening[V] + opening[E] === 0) return;
    const afterH = GROUPS.map((v, i) => v - opening[i]);
    const process = (draw, dWeight) => {
      const early = opening.map((v, i) => v + draw[i]);
      if (!early[FSS] || early[E]) return;
      const candidates = GROUPS.map((v, i) => v - early[i]);
      const totalRemaining = includeTurnDraw ? 52 : 53;
      const otherAvailable = totalRemaining - candidates[E] - candidates[H] - candidates[V] - candidates[VM];
      const vInHand = early[V] > 0;
      const fogInHand = early[FOG] > 0;
      if (!vInHand && !fogInHand) return;
      const earlySearch = early[S] > 0;
      const earlyHeavy = early[H] > 0;
      for (let pE = 0; pE <= Math.min(1, candidates[E]); pE++) {
        for (let pH = 0; pH <= Math.min(1, candidates[H]); pH++) {
          for (let pV = 0; pV <= Math.min(3, candidates[V]); pV++) {
            for (let pVM = 0; pVM <= Math.min(4, candidates[VM]); pVM++) {
              const otherPrized = 6 - pE - pH - pV - pVM;
              if (otherPrized < 0 || otherPrized > otherAvailable) continue;
              const remainingV = candidates[V] - pV;
              if (!vInHand && !(fogInHand && remainingV > 0)) continue;
              const eInDeck = candidates[E] - pE > 0;
              const hInDeck = candidates[H] - pH > 0;
              const direct = eInDeck && !earlySearch;
              const prized = pE && !earlyHeavy && hInDeck;
              if (!direct && !prized) continue;
              const twoVmax = candidates[VM] - pVM >= 2;
              const weight = hWeight * dWeight * C[candidates[E]][pE] * C[candidates[H]][pH] * C[candidates[V]][pV] * C[candidates[VM]][pVM] * C[otherAvailable][otherPrized];
              if (direct) rawTotals.direct += weight;
              if (prized) rawTotals.prized += weight;
              if (twoVmax && direct) rawTotals.directTwo += weight;
              if (twoVmax && prized) rawTotals.prizedTwo += weight;
            }
          }
        }
      }
    };
    if (!includeTurnDraw) process(new Array(GROUPS.length).fill(0), 1n);
    else for (let j = 0; j < GROUPS.length; j++) {
      if (!afterH[j]) continue;
      const draw = new Array(GROUPS.length).fill(0);
      draw[j] = 1;
      process(draw, BigInt(afterH[j]));
    }
  });
  const decimal = (v) => Number(v) / Number(validDenominator);
  const baseline = exactOpening(includeTurnDraw);
  return {
    includeTurnDraw,
    additionalDirect: decimal(rawTotals.direct),
    additionalPrizeRescue: decimal(rawTotals.prized),
    additionalTwoTargetDirect: decimal(rawTotals.directTwo),
    additionalTwoTargetPrizeRescue: decimal(rawTotals.prizedTwo),
    extendedAccess: baseline.access + decimal(rawTotals.direct + rawTotals.prized),
    extendedTwoTarget: baseline.twoVmax + decimal(rawTotals.directTwo + rawTotals.prizedTwo),
    rawTotals: Object.fromEntries(Object.entries(rawTotals).map(([key, v]) => [key, v.toString()])),
    validDenominator: validDenominator.toString()
  };
}
if (require.main === module) console.log(JSON.stringify({ setupOnly: computeForestSealIncrement(false), afterTurnDraw: computeForestSealIncrement(true) }, null, 2));
module.exports = { computeForestSealIncrement, GROUPS };
