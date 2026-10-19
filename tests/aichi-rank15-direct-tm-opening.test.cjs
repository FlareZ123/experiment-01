'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {choose} = require('../scripts/aichi-rank15-dual-lock-prize-ceiling.cjs');
const {calculateDirectTmOpportunity, calculatePoffinAssistedTmOpportunity, fromSourceManifest} = require(
  '../scripts/aichi-rank15-direct-tm-opening.cjs');

test('exact legal-seven conditional probability and strict evidence boundaries', () => {
  const result = calculateDirectTmOpportunity();
  assert.deepEqual([
    result.conditionalOnBasicValidInitialSeven.numerator,
    result.conditionalOnBasicValidInitialSeven.denominator
  ], ['53594899', '413287114240']);
  assert.ok(Math.abs(result.conditionalOnBasicValidInitialSeven.probability -
    0.00012967957904653398) < 1e-15);
  assert.equal(result.qualifiesCompetitiveResults, false);
  assert.equal(result.enablesGuaranteedAttack, false);
});

test('published rank15 physical printing counts match all modeled cards', () => {
  const source = fromSourceManifest();
  assert.equal(source.sourcePrintedCounts.bunnelby, 2);
  assert.equal(source.sourcePrintedCounts.oddish, 2);
  assert.equal(source.sourcePrintedCounts.gloom, 2);
  assert.equal(source.sourcePrintedCounts.tm, 2);
  assert.equal(source.sourcePrintedCounts.energy, 7);
});

test('independent initial-seven then next-draw enumeration agrees exactly', () => {
  const c = {b: 2, o: 2, t: 2, e: 7, a: 2, x: 42};
  let favorable = 0n;
  for (let b = 1; b <= 2; b++) {
    for (let o = 1; o <= 2; o++) {
      for (let t = 0; t <= 2; t++) {
        for (let e = 0; e <= 7; e++) {
          for (let a = 0; a <= 2; a++) {
            const x = 7 - b - o - t - e - a;
            if (x < 0 || x > 42) continue;
            const hand = {b, o, t, e, a, x};
            const ways = Object.entries(hand).reduce((acc, [k, n]) =>
              acc * choose(c[k], n), 1n);
            for (const next of Object.keys(c)) {
              if (hand[next] === c[next]) continue;
              const eight = {...hand, [next]: hand[next] + 1};
              if (eight.o !== 2 || eight.t < 1 || eight.e < 1 ||
                  eight.a > 1) continue;
              const prizes = eight.a === 0 ?
                choose(49, 6) - choose(47, 4) : choose(48, 6);
              favorable += ways * BigInt(c[next] - hand[next]) * prizes;
            }
          }
        }
      }
    }
  }
  const numerator = favorable * choose(60, 7);
  const denominator = choose(60, 7) * 53n * choose(52, 6) *
    (choose(60, 7) - choose(46, 7));
  const expected = calculateDirectTmOpportunity()
    .conditionalOnBasicValidInitialSeven;
  assert.equal(numerator * BigInt(expected.denominator),
    denominator * BigInt(expected.numerator));
});

test('one Poffin search expands direct opening physical accessibility', () => {
  const result = calculatePoffinAssistedTmOpportunity();
  assert.deepEqual([
    result.conditionalOnBasicValidInitialSeven.numerator,
    result.conditionalOnBasicValidInitialSeven.denominator
  ], ['1379875346061', '388489887385600']);
  assert.ok(result.relativeToNoSearch > 27 && result.relativeToNoSearch < 28);
  assert.equal(result.qualifiesCompetitiveResults, false);
});

test('independent seven-then-draw enumeration checks the Poffin union', () => {
  const c = {b: 2, o: 2, t: 2, e: 7, p: 3, a: 2, x: 39};
  let favorable = 0n;
  for (let b = 1; b <= 2; b++) {
    for (let o = 0; o <= 2; o++) {
      for (let t = 0; t <= 2; t++) {
        for (let e = 0; e <= 7; e++) {
          for (let p = 0; p <= 3; p++) {
            for (let a = 0; a <= 2; a++) {
              const x = 7 - b - o - t - e - p - a;
              if (x < 0 || x > 39) continue;
              const hand = {b, o, t, e, p, a, x};
              const ways = Object.entries(hand).reduce((acc, [k, n]) =>
                acc * choose(c[k], n), 1n);
              for (const next of Object.keys(c)) {
                if (hand[next] === c[next]) continue;
                const eight = {...hand, [next]: hand[next] + 1};
                if (eight.t < 1 || eight.e < 1 || eight.a > 1 ||
                    (eight.o < 2 && eight.p === 0)) continue;
                const prizes = eight.a === 0 ?
                  choose(47 + eight.o, 6) - choose(45 + eight.o, 4) :
                  choose(46 + eight.o, 6);
                favorable += ways * BigInt(c[next] - hand[next]) * prizes;
              }
            }
          }
        }
      }
    }
  }
  const numerator = favorable * choose(60, 7);
  const denominator = choose(60, 7) * 53n * choose(52, 6) *
    (choose(60, 7) - choose(46, 7));
  const expected = calculatePoffinAssistedTmOpportunity()
    .conditionalOnBasicValidInitialSeven;
  assert.equal(numerator * BigInt(expected.denominator),
    denominator * BigInt(expected.numerator));
});
