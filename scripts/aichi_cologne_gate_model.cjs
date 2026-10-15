'use strict';

/**
 * One hypothetical Canceling Cologne replacing an unrelated non-Basic card
 * in Aichi champion Shadow Rider, against active Iron Thorns Initialization.
 * Exact opening/prize/direct-item/Forest Seal Stone resource reachability only.
 */
const GROUPS = Object.freeze([1, 5, 1, 4, 10, 3, 1, 4, 1, 30]);
const [E, S, H, VM, B, V, FSS, FOG, COL] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

/** @returns {bigint[][]} Binomial coefficients. */
function combinations() {
  const c = Array.from({length: 61}, () => Array(61).fill(0n));
  for (let n = 0; n < 61; n++) {
    c[n][0] = c[n][n] = 1n;
    for (let k = 1; k < n; k++) c[n][k] = c[n - 1][k - 1] + c[n - 1][k];
  }
  return c;
}
const C = combinations();

/** @param {number[]} available @param {number} total @param {(picked:number[],weight:bigint)=>void} emit */
function distribute(available, total, emit) {
  const picked = Array(available.length).fill(0);
  function scan(i, missing, weight) {
    if (i === available.length - 1) {
      if (missing <= available[i]) {
        picked[i] = missing;
        emit(picked.slice(), weight * C[available[i]][missing]);
      }
      return;
    }
    for (let k = 0; k <= Math.min(available[i], missing); k++) {
      picked[i] = k;
      scan(i + 1, missing - k, weight * C[available[i]][k]);
    }
  }
  scan(0, total, 1n);
}

/**
 * Feasibility of first-turn Cologne + Gate in the restricted resource model.
 * @param {number[]} opening Seven-card initial setup category counts
 * @param {number[]} early Opening plus mandatory first-turn draw
 * @param {number[]} prizes Face-down Prize category counts
 */
function classify(opening, early, prizes) {
  const notRadiantStart = opening[B] + opening[V] > 0;
  if (!notRadiantStart) {
    return {access: false, twoVmax: false, useFssForCologne: false, useFssForRadiant: false};
  }
  const deck = GROUPS.map((n, i) => n - early[i] - prizes[i]);
  const radiantEarly = early[E] > 0;
  const radiantInDeck = deck[E] > 0;
  const radiantInPrize = prizes[E] > 0;
  const cologneEarly = early[COL] > 0;
  const cologneInDeck = deck[COL] > 0;
  const directE = radiantEarly || (radiantInDeck && early[S] > 0)
    || (radiantInPrize && early[H] > 0);
  const vReady = early[V] > 0 || (early[FOG] > 0 && deck[V] > 0);
  const fssReady = early[FSS] > 0 && vReady;
  const fssE = fssReady && (radiantInDeck || (radiantInPrize && deck[H] > 0));
  const useFssForRadiant = cologneEarly && fssE && !directE;
  const useFssForCologne = !cologneEarly && cologneInDeck && fssReady && directE;
  const access = (cologneEarly && directE) || useFssForRadiant || useFssForCologne;
  return {access, twoVmax: access && deck[VM] >= 2, useFssForRadiant, useFssForCologne};
}

/** @returns {object} Exact setup access conditioned on successful seven-card opener. */
function exactCologneGate() {
  let valid = 0n, access = 0n, two = 0n;
  let cologneHand = 0n, cologneFss = 0n, radiantFss = 0n;
  const denominator = (C[60][7] - C[46][7]) * 53n * C[52][6];
  distribute(GROUPS, 7, (opening, handWeight) => {
    if (!opening[E] && !opening[B] && !opening[V]) return;
    const remaining = GROUPS.map((n, i) => n - opening[i]);
    for (let d = 0; d < GROUPS.length; d++) {
      if (!remaining[d]) continue;
      const early = opening.slice();
      early[d]++;
      const left = GROUPS.map((n, i) => n - early[i]);
      const other = 52 - left[E] - left[H] - left[V] - left[VM] - left[COL];
      const drawWeight = handWeight * BigInt(remaining[d]);
      for (let e = 0; e <= Math.min(1, left[E]); e++) {
        for (let h = 0; h <= Math.min(1, left[H]); h++) {
          for (let v = 0; v <= Math.min(3, left[V]); v++) {
            for (let vm = 0; vm <= Math.min(4, left[VM]); vm++) {
              for (let col = 0; col <= Math.min(1, left[COL]); col++) {
                const rest = 6 - e - h - v - vm - col;
                if (rest < 0 || rest > other) continue;
                const prizes = Array(GROUPS.length).fill(0);
                prizes[E] = e; prizes[H] = h; prizes[V] = v;
                prizes[VM] = vm; prizes[COL] = col;
                const weight = drawWeight * C[left[E]][e] * C[left[H]][h]
                  * C[left[V]][v] * C[left[VM]][vm] * C[left[COL]][col] * C[other][rest];
                const result = classify(opening, early, prizes);
                valid += weight;
                if (!result.access) continue;
                access += weight;
                if (result.twoVmax) two += weight;
                if (result.useFssForRadiant) radiantFss += weight;
                else if (result.useFssForCologne) cologneFss += weight;
                else cologneHand += weight;
              }
            }
          }
        }
      }
    }
  });
  if (valid !== denominator) throw Error('Expected total weight ' + denominator + ', observed ' + valid);
  const frac = value => Number(value) / Number(valid);
  return {
    conditionalValidOpening: true,
    access: frac(access),
    twoVmax: frac(two),
    routes: {
      cologneInHandAndDirectRadiant: frac(cologneHand),
      cologneInHandFssForRadiant: frac(radiantFss),
      fssForCologneDirectRadiant: frac(cologneFss)
    },
    raw: {valid: valid.toString(), access: access.toString(), twoVmax: two.toString()},
    scope: 'Hypothetical 1 Canceling Cologne replacing unrelated non-Basic; optimistic Item/FSS resource routes, no gameplay simulations.'
  };
}

if (require.main === module) console.log(JSON.stringify(exactCologneGate(), null, 2));
module.exports = {GROUPS, classify, exactCologneGate};
