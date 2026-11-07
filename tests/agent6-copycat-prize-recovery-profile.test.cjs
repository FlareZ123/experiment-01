'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {choose} = require('../scripts/hood-t2-joint.cjs');
const {prizeRecoveryProfile} = require('../scripts/agent6-copycat-prize-recovery-profile.cjs');

/** @param {number} a @param {number} b */
function near(a, b) { assert.ok(Math.abs(a - b) < 1e-12, 'got ' + a + '; expected ' + b); }

/** Independent residual-Prize enumeration after selecting k uniformly. */
function directCut(B, p) {
  let numerator = 0;
  const normalizer = choose(60, p) * (1 - choose(60 - B, 7) / choose(60, 7));
  for (let m = 0; m <= 1; m++) for (let d = 0; d <= 1; d++)
    for (let h = 0; h <= 1; h++) for (let b = 0; b <= B - 2; b++) {
      const o = p - m - d - h - b;
      if (o < 0 || o > 59 - B) continue;
      const legal = 1 - choose(60 - p - (B - m - d - b), 7) / choose(60 - p, 7);
      if (m + d === 2 || (m + d === 1 && h === 1))
        numerator += choose(B - 2, b) * choose(59 - B, o) * legal;
    }
  return numerator / normalizer;
}

for (const B of [14, 15]) test('exact residual Prize curve ' + B, () => {
  const r = prizeRecoveryProfile({basicCount: B});
  assert.equal(r.profile.length, 7);
  for (const s of r.profile) {
    near(s.cutSurvivalProbability, directCut(B, s.prizesRemaining));
    near(s.survivalGivenInitialCut + s.clearedGivenInitialCut, 1);
  }
  near(r.profile[0].cutSurvivalProbability, r.initialCut);
  near(r.profile[5].cutSurvivalProbability, 0);
  near(r.profile[6].cutSurvivalProbability, 0);
  for (let k = 1; k <= 6; k++)
    assert.ok(r.profile[k].cutSurvivalProbability <= r.profile[k - 1].cutSurvivalProbability);
});

test('invalid Basic counts are rejected', () => {
  assert.throws(() => prizeRecoveryProfile({basicCount: 1}));
  assert.throws(() => prizeRecoveryProfile({basicCount: 60}));
});
