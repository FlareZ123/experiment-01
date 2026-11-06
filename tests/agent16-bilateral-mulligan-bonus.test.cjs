'use strict';

const assert = require('node:assert/strict');
const { mulliganProbability, bilateralBonus } = require('../scripts/agent16-bilateral-mulligan-bonus.cjs');

/** @param {number} actual @param {number} expected @param {number} [tol=1e-12] */
function near(actual, expected, tol = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= tol, actual + ' differs from ' + expected + ' by > ' + tol);
}

/**
 * Finite independent enumeration of both geometric failure counts. Unlike
 * bilateralBonus, this deliberately evaluates each pair of counts.
 * @param {number} pS @param {number} pC @param {number} [limit=90]
 */
function enumerateFailures(pS, pC, limit = 90) {
  let challengerOpportunity = 0;
  let sourceOpportunity = 0;
  let neitherOpportunity = 0;
  let challengerExpectation = 0;
  let sourceExpectation = 0;
  let totalMass = 0;
  for (let s = 0; s <= limit; s += 1) {
    const ps = (1 - pS) * pS ** s;
    for (let c = 0; c <= limit; c += 1) {
      const weight = ps * (1 - pC) * pC ** c;
      totalMass += weight;
      if (s > c) challengerOpportunity += weight;
      else if (c > s) sourceOpportunity += weight;
      else neitherOpportunity += weight;
      challengerExpectation += Math.max(0, s - c) * weight;
      sourceExpectation += Math.max(0, c - s) * weight;
    }
  }
  return { challengerOpportunity, sourceOpportunity, neitherOpportunity,
    challengerExpectation, sourceExpectation, totalMass };
}

/** @param {number} seed @returns {() => number} */
function seededUniform(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/**
 * Simulates a uniformly sampled seven-card physical hand without replacement.
 * @param {number} basics @param {() => number} uniform
 */
function sampleOpeningFailure(basics, uniform) {
  let remainingCards = 60;
  let remainingBasics = basics;
  let foundBasic = false;
  for (let i = 0; i < 7; i += 1) {
    const pickedBasic = Math.floor(uniform() * remainingCards) < remainingBasics;
    if (pickedBasic) {
      remainingBasics -= 1;
      foundBasic = true;
    }
    remainingCards -= 1;
  }
  return !foundBasic;
}

/** @param {number} basics @param {() => number} uniform */
function sampleMulligans(basics, uniform) {
  let failures = 0;
  while (sampleOpeningFailure(basics, uniform)) failures += 1;
  return failures;
}

/** @param {number} sourceBasics @param {number} candidateBasics @param {number} n */
function simulatePhysical(sourceBasics, candidateBasics, n) {
  const randomSource = seededUniform(0x16a501);
  const randomCandidate = seededUniform(0x16b502);
  let candidateOffered = 0;
  let sourceOffered = 0;
  let candidateCards = 0;
  let sourceCards = 0;
  for (let trial = 0; trial < n; trial += 1) {
    const s = sampleMulligans(sourceBasics, randomSource);
    const c = sampleMulligans(candidateBasics, randomCandidate);
    candidateOffered += Number(s > c);
    sourceOffered += Number(c > s);
    candidateCards += Math.max(0, s - c);
    sourceCards += Math.max(0, c - s);
  }
  return { candidateOffered: candidateOffered / n, sourceOffered: sourceOffered / n,
    candidateCards: candidateCards / n, sourceCards: sourceCards / n };
}

function run() {
  const cases = [[4, 14], [4, 17], [14, 17], [4, 4], [30, 60]];
  let checks = 0;
  for (const [s, c] of cases) {
    const b = bilateralBonus(s, c);
    const e = enumerateFailures(b.sourceMulligan, b.candidateMulligan);
    near(e.totalMass, 1);
    near(b.candidateOfferedAtLeastOne, e.challengerOpportunity);
    near(b.sourceOfferedAtLeastOne, e.sourceOpportunity);
    near(b.neitherOffered, e.neitherOpportunity);
    near(b.candidateExpectedOfferedCards, e.challengerExpectation);
    near(b.sourceExpectedOfferedCards, e.sourceExpectation);
    near(b.candidateOfferedAtLeastOne + b.sourceOfferedAtLeastOne + b.neitherOffered, 1);
    const swapped = bilateralBonus(c, s);
    near(b.candidateOfferedAtLeastOne, swapped.sourceOfferedAtLeastOne);
    near(b.candidateExpectedOfferedCards, swapped.sourceExpectedOfferedCards);
    checks += 9;
    console.log('Source ' + s + ' Basics / candidate ' + c + ':', JSON.stringify(b));
  }
  // Printed-list example: original Aichi rank-6, -24, -29 have four Iron Thorns ex;
  // the fixed champion reference has 14 eligible Basics; New Moon has 17.
  const champion = bilateralBonus(4, 14);
  const newMoon = bilateralBonus(4, 17);
  near(champion.candidateOfferedAtLeastOne, 0.5642343175423022);
  near(champion.candidateExpectedOfferedCards, 1.4123525560019534);
  near(newMoon.candidateOfferedAtLeastOne, 0.5794279437440825);
  near(newMoon.candidateExpectedOfferedCards, 1.4503841966410638);
  checks += 4;
  assert.throws(() => bilateralBonus(0, 14), RangeError);
  assert.throws(() => bilateralBonus(4, 61), RangeError);
  checks += 2;

  const n = 240000;
  for (const [s, c] of [[4, 14], [4, 17]]) {
    const exact = bilateralBonus(s, c);
    const mc = simulatePhysical(s, c, n);
    near(mc.candidateOffered, exact.candidateOfferedAtLeastOne, 0.005);
    near(mc.sourceOffered, exact.sourceOfferedAtLeastOne, 0.005);
    near(mc.candidateCards, exact.candidateExpectedOfferedCards, 0.02);
    near(mc.sourceCards, exact.sourceExpectedOfferedCards, 0.005);
    checks += 4;
    console.log('Physical-hand Monte Carlo ' + n + ' trials [' + s + ',' + c + ']:', JSON.stringify(mc));
  }
  console.log('PASS: ' + checks + ' deterministic checks, including direct finite enumeration and two independent physical-hand samples.');
}

run();
