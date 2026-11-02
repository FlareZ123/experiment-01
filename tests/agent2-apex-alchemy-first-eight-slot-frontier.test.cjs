'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { createHash } = require('node:crypto');
const manifest = require('../results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json');
const shake4Quick2 = require('../results/aichi-2026/agent2-apex-alchemy-shake4-quick2-v1.json');
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
    '21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948f354d8468a769');
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
  closePercent(base.directWithOtherBasicStarterAmongBasicValid, 6.29698142);
  closePercent(base.searchAssistedWithOtherBasicStarterAmongBasicValid, 20.12400842);
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
  const otherStarterCases = [
    [{}, 6.29698142, 20.12400842],
    [{ shake: 4 }, 8.00247627, 25.50231562],
    [{ grimer: 3 }, 8.69784572, 20.79412385],
    [{ muk: 3 }, 6.49831656, 20.79968909],
    [{ quick: 4 }, 6.29698142, 21.34563485],
    [{ shake: 4, grimer: 3 }, 11.04887125, 26.34163877]
  ];
  for (const [copies, direct, assisted] of otherStarterCases) {
    const observed = scenario(copies);
    closePercent(observed.directWithOtherBasicStarterAmongBasicValid, direct);
    closePercent(observed.searchAssistedWithOtherBasicStarterAmongBasicValid, assisted);
    assert.ok(observed.searchAssistedWithOtherBasicStarterAmongBasicValid >=
      observed.directWithOtherBasicStarterAmongBasicValid);
  }
});

test('a registered full-60 fourth-Shake-for-Quick swap retains printing and gains access', () => {
  const lines = shake4Quick2.cards.map(c => c.cardId + ':' + c.count + '\n').sort().join('');
  const hash = createHash('sha256').update(lines, 'utf8').digest('hex');
  assert.equal(hash, '5cd6b0fc7781e1a5a3b29f5a23654750295af89bdc63621f235fbd0c56701fd0');
  assert.equal(hash, shake4Quick2.deck_identity_sha256);
  assert.equal(shake4Quick2.base_deck_identity_sha256, manifest.deck_identity_sha256);
  assert.deepEqual(shake4Quick2.category_counts, manifest.category_counts);
  assert.equal(shake4Quick2.total_cards, 60);
  assert.equal(shake4Quick2.cards.reduce((n, c) => n + c.count, 0), 60);
  assert.equal(shake4Quick2.cards.length, manifest.cards.length);
  const original = new Map(manifest.cards.map(c => [c.cardId, c]));
  const changed = [];
  for (const c of shake4Quick2.cards) {
    const previous = original.get(c.cardId);
    assert.ok(previous, 'Missing base printing ' + c.cardId);
    assert.equal(c.name, previous.name);
    assert.equal(c.category, previous.category);
    assert.deepEqual(c.printing, previous.printing);
    if (previous.count !== c.count) changed.push([c.cardId, previous.count, c.count]);
  }
  assert.deepEqual(changed.sort(), [
    ['swsh7-142', 3, 4],
    ['swsh8-237', 3, 2]
  ]);
  const actual = scenario({ shake: 4, quick: 2 });
  const base = scenario();
  closePercent(actual.basicValidInitialSeven, 80.93533073);
  closePercent(actual.directAmongBasicValid, 11.71727191);
  closePercent(actual.searchAssistedAmongBasicValid, 27.48178669);
  closePercent(actual.directWithOtherBasicStarterAmongBasicValid, 8.00247627);
  closePercent(actual.searchAssistedWithOtherBasicStarterAmongBasicValid, 23.76699105);
  assert.ok(actual.searchAssistedWithOtherBasicStarterAmongBasicValid >
    base.searchAssistedWithOtherBasicStarterAmongBasicValid);
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
    searchPercentBasicValid: 100 * scenario(copies).searchAssistedAmongBasicValid,
    searchWithOtherBasicStarterPercentBasicValid:
      100 * scenario(copies).searchAssistedWithOtherBasicStarterAmongBasicValid
  })),
  evidence: 'exact opening opportunity only; substitutions unregistered; zero games'
}));
