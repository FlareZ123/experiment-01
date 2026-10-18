'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {choose, rank19Counts, calculate} =
  require('../scripts/rank19-adp-direct-gx-opening.cjs');

test('source rank19 printed Pokémon are all Basic, with 1 ADP and 4 DDE', () => {
  assert.deepEqual(rank19Counts(), {
    basicCount: 16, adpCount: 1, doubleDragonCount: 4
  });
});

test('BigInt binomial rejects malformed arguments and has known exact values', () => {
  assert.equal(choose(60, 7), 386206920n);
  assert.equal(choose(59, 7), 341149446n);
  assert.equal(choose(59, 0), 1n);
  assert.throws(() => choose(2, 3), RangeError);
  assert.throws(() => choose(2, 1.5), RangeError);
});

test('source-60 combinatorial event ratios match independent Python fractions', () => {
  const out = calculate();
  const exact = (name, numerator, denominator) => {
    assert.equal(out[name].numerator, numerator);
    assert.equal(out[name].denominator, denominator);
    assert.equal(out[name].probability, Number(numerator) / Number(denominator));
  };
  exact('validOpening', '208066', '230985');
  exact('directInitialSeven', '162301', '3901080');
  exact('directAfterFirstDraw', '61467', '1300360');
  exact('drawOnlyAdded', '1105', '195054');
  exact('directConditionalValid', '1659609', '31626032');
  exact('singletonAdpPrizedConditionalValid', '2173413', '22054996');
  assert.equal(out.sourceRank, 19);
  assert.match(out.sourceScope, /opening-resources-only/);
  assert.ok(out.directAfterFirstDraw.probability >
    out.directInitialSeven.probability);
  assert.ok(out.directConditionalValid.probability < 0.06);
});

test('seeded 160000 physical deals corroborate direct window and prized risk', () => {
  // Physical cards: 1 ADP Basic, 15 other Basics, 4 DDE, 40 other cards.
  const original = [1, ...Array(15).fill(2),
    ...Array(4).fill(3), ...Array(40).fill(0)];
  let state = 20261018;
  /** @returns {number} Non-cryptographic fixed seed for independent test replay. */
  function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  const attempts = 160000;
  let valid = 0;
  let direct = 0;
  let prizeAdp = 0;
  for (let sample = 0; sample < attempts; sample++) {
    const cards = [...original];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    const hand = cards.slice(0, 7);
    const basicValid = hand.some(card => card === 1 || card === 2);
    if (!basicValid) continue;
    valid++;
    if (hand.includes(1) && (hand.includes(3) || cards[13] === 3)) direct++;
    if (cards.slice(7, 13).includes(1)) prizeAdp++;
  }
  const exact = calculate();
  assert.ok(Math.abs(valid / attempts - exact.validOpening.probability) < 0.006);
  assert.ok(Math.abs(direct / valid -
    exact.directConditionalValid.probability) < 0.006);
  assert.ok(Math.abs(prizeAdp / valid -
    exact.singletonAdpPrizedConditionalValid.probability) < 0.006);
});
