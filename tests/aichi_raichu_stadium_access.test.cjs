'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { directStadiumAccess, report } =
  require('../scripts/aichi_raichu_stadium_access.cjs');

/** Independent seeded random-deal check of first seven and compulsory draw. */
function sampleDirectAccess(basicCount, stadiumCount, trials = 120000) {
  let seed = 0x9e3779b9;
  /** @returns {number} Uniform-ish 32-bit xorshift sample. */
  function random() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  }
  let valid = 0, stadium7 = 0, stadium8 = 0;
  for (let iteration = 0; iteration < trials; iteration += 1) {
    const cards = Array.from({length: 60}, (_, i) => i);
    let basic = false, anyStadium7 = false, anyStadium8 = false;
    for (let i = 0; i < 8; i += 1) {
      const selected = i + Math.floor(random() * (60 - i));
      [cards[i], cards[selected]] = [cards[selected], cards[i]];
      if (i < 7 && cards[i] < basicCount) basic = true;
      if (cards[i] >= basicCount && cards[i] < basicCount + stadiumCount) {
        if (i < 7) anyStadium7 = true;
        anyStadium8 = true;
      }
    }
    if (!basic) continue;
    valid += 1;
    stadium7 += Number(anyStadium7);
    stadium8 += Number(anyStadium8);
  }
  return {valid: valid / trials, seven: stadium7 / valid, eight: stadium8 / valid};
}

test('source-backed exact rank-4 and rank-17 natural Stadium response', () => {
  const data = report();
  assert.equal(data.missingRank25, true);
  assert.deepEqual(data.findings.map(row => row.rank), [4, 17]);
  assert.deepEqual(data.findings.map(row => row.basicCount), [13, 13]);
  assert.deepEqual(data.findings.map(row => row.stadiumCount), [3, 1]);
  const [four, seventeen] = data.findings;
  assert.ok(Math.abs(four.validOpening - 0.8371559499762459) < 1e-12);
  assert.ok(Math.abs(four.directInValidSeven - 0.3007903325464949) < 1e-12);
  assert.ok(Math.abs(four.directAfterMandatoryDraw - 0.3403682382514102) < 1e-12);
  assert.ok(Math.abs(seventeen.directInValidSeven - 0.11038958454134484) < 1e-12);
  assert.ok(Math.abs(seventeen.directAfterMandatoryDraw - 0.12717468671981005) < 1e-12);
});

test('independent seeded shuffled openings agree with exact source-count model', () => {
  for (const stadiumCount of [3, 1]) {
    const exact = directStadiumAccess(13, stadiumCount);
    const monteCarlo = sampleDirectAccess(13, stadiumCount);
    assert.ok(Math.abs(monteCarlo.valid - exact.validOpening) < 0.008);
    assert.ok(Math.abs(monteCarlo.seven - exact.directInValidSeven) < 0.008);
    assert.ok(Math.abs(monteCarlo.eight - exact.directAfterMandatoryDraw) < 0.008);
  }
});

test('disjoint groups and positive counts required', () => {
  for (const args of [[0, 1], [13, 0], [59, 2], [13.1, 3]]) {
    assert.throws(() => directStadiumAccess(...args), RangeError);
  }
});
