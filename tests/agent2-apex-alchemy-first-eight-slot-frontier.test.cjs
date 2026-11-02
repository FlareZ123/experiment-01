'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const manifest = require('../results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json');
const { openingEightAccess } =
  require('../simulation/evaluation/agent43-muk-search-eight-bound.cjs');

/**
 * Evaluate exact first-eight + six Prize opportunities; all variations
 * keep a fixed 60 and use one additional copy from the residual category.
 * This is a card-access census, not gameplay or an actual proposed 60.
 * @param {object} copies
 * @returns {ReturnType<typeof openingEightAccess>}
 */
function scenario(copies = {}) {
  return openingEightAccess(copies);
}

/** @param {number} actual @param {number} expected */
function closePercent(actual, expected) {
  assert.ok(Math.abs(actual * 100 - expected) < 0.00000003,
    'Percent mismatch: ' + actual * 100 + ' vs ' + expected);
}

test('source identity and baseline access are fixed', () => {
  assert.equal(manifest.deck_identity_sha256,
    '21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948d8468a769');
  const count = (name) => manifest.cards.find(c => c.name === name)?.count;
  assert.equal(count('Alolan Grimer'), 2);
  assert.equal(count('Alolan Muk'), 2);
  assert.equal(count('Boost Shake'), 3);
  assert.equal(count('Mysterious Treasure'), 4);
  assert.equal(count('Quick Ball'), 3);
  const base = scenario();
  closePercent(base.directUnconditional, 7.75916289);
  closePercent(base.searchAssistedUnconditional, 24.00755909);
  closePercent(base.directAmongBasicValid, 9.26277443);
  closePercent(base.searchAssistedAmongBasicValid, 23.08980144);
});

test('exact marginal one-slot opportunities and two-slot interaction', () => {
  const cases = [
    ['fourth Boost Shake', { shake: 4 }, 11.71727191, 29.21711126],
    ['third Alolan Grimer', { grimer: 3 }, 12.76459363, 24.86087175],
    ['third Alolan Muk', { muk: 3 }, 9.58357194, 23.88494448],
    ['fourth Quick Ball', { quick: 4 }, 9.26277443, 24.31142786],
    ['fourth Shake and third Grimer',
      { shake: 4, grimer: 3 }, 16.13994292, 31.43271044]
  ];
  for (const [name, copies, direct, assisted] of cases) {
    const result = scenario(copies);
    closePercent(result.directAmongBasicValid, direct);
    closePercent(result.searchAssistedAmongBasicValid, assisted);
    assert.equal(result.basicValidInitialSeven > 0, true, name);
  }
  assert.ok(scenario({ shake: 4 }).searchAssistedAmongBasicValid >
    scenario({ grimer: 3 }).searchAssistedAmongBasicValid);
  assert.ok(scenario({ grimer: 3 }).directAmongBasicValid >
    scenario({ shake: 4 }).directAmongBasicValid);
});

test('mulligan and Prize conditioning remain explicit', () => {
  const base = scenario();
  closePercent(base.basicValidInitialSeven, 80.93533073);
  assert.ok(base.directUnconditional > base.directAmongBasicValid *
    base.basicValidInitialSeven);
  assert.ok(base.searchAssistedUnconditional >
    base.searchAssistedAmongBasicValid * base.basicValidInitialSeven);
});

const base = scenario();
const variants = [
  ['baseline', {}], ['fourth-shake', { shake: 4 }],
  ['third-grimer', { grimer: 3 }], ['third-muk', { muk: 3 }],
  ['fourth-quick', { quick: 4 }],
  ['shake-plus-grimer', { shake: 4, grimer: 3 }]
];
console.log('APEX_ALCHEMY_OPENING_SLOT_FRONTIER ' + JSON.stringify({
  fixedManifest: manifest.deck_identity_sha256,
  model: 'first seven, one ordinary turn draw, six Prizes, no extra draw',
  scenarios: variants.map(([name, copies]) => ({
    name, copies,
    directPercentBasicValid: 100 * scenario(copies).directAmongBasicValid,
    searchPercentBasicValid: 100 * scenario(copies).searchAssistedAmongBasicValid
  })),
  evidence: 'exact opening opportunity only; substitutions unregistered; zero games'
}));
