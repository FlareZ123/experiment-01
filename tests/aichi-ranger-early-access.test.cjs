'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {rangerEarlyAccess, sourceComposition, report} =
  require('../scripts/aichi-ranger-early-access.cjs');

/** Independent exhaustive physical-card enumeration. */
function* combinations(items, count, start = 0, chosen = []) {
  if (chosen.length === count) {
    yield chosen.slice();
    return;
  }
  for (let i = start; i <= items.length - (count - chosen.length); i += 1) {
    chosen.push(items[i]);
    yield* combinations(items, count, i + 1, chosen);
    chosen.pop();
  }
}

function brute(input) {
  const {size, basics, lele, ranger, opening, draws, prizes} = input;
  const cards = [
    ...Array(lele).fill('L'), ...Array(ranger).fill('R'),
    ...Array(basics - lele).fill('B'),
    ...Array(size - basics - ranger).fill('X')
  ].map((type, index) => ({type, index}));
  let valid = 0;
  let direct = 0;
  let wonder = 0;
  for (const start of combinations(cards, opening)) {
    if (!start.some(card => card.type === 'L' || card.type === 'B')) continue;
    const used = new Set(start.map(card => card.index));
    const unseen = cards.filter(card => !used.has(card.index));
    for (const ordinaryDraws of combinations(unseen, draws)) {
      const drawn = new Set(ordinaryDraws.map(card => card.index));
      const afterDraw = unseen.filter(card => !drawn.has(card.index));
      const seen = [...start, ...ordinaryDraws];
      const heldRanger = seen.some(card => card.type === 'R');
      const startingLele = start.filter(card => card.type === 'L').length;
      const laterLele = ordinaryDraws.some(card => card.type === 'L');
      const otherBasic = start.some(card => card.type === 'B');
      const benchLele = seen.some(card => card.type === 'L') &&
        (otherBasic || startingLele >= 2 || laterLele);
      for (const prize of combinations(afterDraw, prizes)) {
        valid += 1;
        if (heldRanger) direct += 1;
        else if (benchLele && afterDraw.some(card =>
          card.type === 'R' && !prize.includes(card))) wonder += 1;
      }
    }
  }
  return {direct: direct / valid, wonderTag: wonder / valid,
    either: (direct + wonder) / valid};
}

test('independent exhaustive tiny decks confirm Prize and starting-Active constraints', () => {
  for (const scenario of [
    {size:12,basics:4,lele:1,ranger:1,opening:3,draws:2,prizes:2},
    {size:12,basics:5,lele:2,ranger:1,opening:3,draws:2,prizes:2},
    {size:10,basics:2,lele:1,ranger:1,opening:3,draws:0,prizes:3}
  ]) {
    const exact = rangerEarlyAccess(scenario);
    const enumeration = brute(scenario);
    for (const key of ['direct', 'wonderTag', 'either']) {
      assert.ok(Math.abs(exact[key] - enumeration[key]) < 1e-12,
        'Mismatch on ' + key + ' for ' + JSON.stringify(scenario));
    }
  }
});

test('source-locked challenger compositions retain independently verified anchors', () => {
  const rows = report();
  assert.deepEqual(rows.map(r => [r.id, r.composition.basics,
    r.composition.lele, r.composition.ranger]), [
    ['champion-reference',14,2,0],
    ['hood-shield-v1',14,1,1],
    ['temple-v1',15,1,1]
  ]);
  const hood = rows[1].windows[2];
  const temple = rows[2].windows[2];
  assert.ok(Math.abs(hood.direct - 0.14450287310027118) < 1e-12);
  assert.ok(Math.abs(hood.wonderTag - 0.10757158270408310) < 1e-12);
  assert.ok(Math.abs(temple.either - 0.25340013770820874) < 1e-12);
  const hypothetical = rangerEarlyAccess({size:60,basics:14,lele:2,ranger:1});
  assert.ok(Math.abs(hypothetical.either - 0.3430133133927734) < 1e-12);
  assert.equal(rows[0].windows[2].either, 0);
});

test('source drift and impossible finite-deck configurations are rejected', () => {
  assert.throws(() => rangerEarlyAccess({size:12,basics:14,lele:1,ranger:1}),
    /Invalid finite deck/);
  assert.throws(() => sourceComposition({cards: [
    {name:'Unknown Stage 1',category:'Pokémon',count:60}
  ]}), /Source card inventory drift/);
});
