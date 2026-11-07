'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.env.RESEARCH_ROOT || path.resolve(__dirname, '../..');
const OPENING_SIZE = 7;
const PRIZE_SIZE = 6;

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let value = 1n;
  const r = Math.min(k, n - k);
  for (let i = 1; i <= r; i += 1) {
    value = value * BigInt(n - r + i) / BigInt(i);
  }
  return value;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/** @param {bigint} n @param {bigint} d @returns {string} */
function fraction(n, d) {
  const g = gcd(n, d);
  return (n / g).toString() + '/' + (d / g).toString();
}

/** @param {bigint} n @param {bigint} d @returns {string} */
function percent(n, d) {
  const scale = 1000000000000n;
  const rounded = (n * 100n * scale + d / 2n) / d;
  return (rounded / scale).toString() + '.' +
    (rounded % scale).toString().padStart(12, '0');
}

/** @param {object} deck @param {string} name @param {string} set @param {string} number @returns {number} */
function deckCount(deck, name, set, number) {
  return deck.cards.filter(card => card.name === name &&
    card.printing?.set === set && card.printing?.number === number)
    .reduce((sum, card) => sum + card.count, 0);
}

/** @param {string} file @param {string} id @returns {object} */
function cardById(file, id) {
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT,
    'resources', 'cards', 'en', file), 'utf8'));
  const card = cards.find(candidate => candidate.id === id);
  assert.ok(card, 'missing card ' + id + ' in ' + file);
  assert.equal(card.legalities?.expanded, 'Legal',
    card.name + ' must be Expanded legal');
  return card;
}

/** @returns {object} */
function validateCardText() {
  const articuno = cardById('sm7.json', 'sm7-31');
  const quick = cardById('swsh8.json', 'swsh8-237');
  const heavy = cardById('swsh10.json', 'swsh10-146');
  const nest = cardById('sv1.json', 'sv1-181');
  const arven = cardById('sv3.json', 'sv3-186');
  const capture = cardById('swsh2.json', 'swsh2-171');
  const ascent = articuno.abilities.find(x => x.name === 'Legendary Ascent');
  const coldCrush = articuno.attacks.find(x => x.name === 'Cold Crush-GX');

  assert.match(ascent?.text ?? '', /from your hand onto your Bench/);
  assert.deepEqual(coldCrush?.cost, ['Water']);
  assert.match(coldCrush?.text ?? '',
    /Discard all Energy from both Active Pokémon/);
  assert.ok(quick.rules.some(x => /put it into your hand/.test(x)));
  assert.ok(heavy.rules.some(x => /put it into your hand/.test(x)));
  assert.ok(nest.rules.some(x => /put it onto your Bench/.test(x)));
  assert.ok(!nest.rules.some(x => /put it into your hand/.test(x)));
  assert.ok(arven.rules.some(x =>
    /an Item card and a Pokémon Tool card/.test(x)));
  assert.ok(capture.rules.some(x => /provides Colorless Energy/.test(x)));
  assert.ok(capture.rules.some(x => /put it onto your Bench/.test(x)));

  return {
    articunoAbility: ascent.text,
    coldCrushCost: coldCrush.cost,
    quickBallPutsIntoHand: true,
    heavyBallPutsIntoHand: true,
    nestBallPutsDirectlyOntoBench: true,
    arvenSearchesItemAndTool: true,
    captureEnergyProvidesColorless: true,
    captureEnergySearchesDirectlyToBench: true
  };
}

/** @returns {object} */
function loadSourceCounts() {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'results',
    'aichi-2026', 'full-decklists.json'), 'utf8'));
  const deck = data.decks.find(x => x.rank === 3);
  assert.ok(deck, 'missing Aichi rank-3 list');

  const basics = [
    ['Snorlax', 'PGO', '55', 3, 'pgo.json', 'pgo-55'],
    ['Galarian Stunfisk', 'SSH', '132', 2, 'swsh1.json', 'swsh1-132'],
    ['Regirock', 'XYP', '49', 1, 'xyp.json', 'xyp-XY49'],
    ['Mimikyu', 'PAL', '97', 1, 'sv2.json', 'sv2-97'],
    ['Girafarig', 'LOT', '94', 1, 'sm8.json', 'sm8-94'],
    ['Bunnelby', 'PRC', '121', 1, 'xy5.json', 'xy5-121'],
    ['Rotom V', 'LOR', '58', 1, 'swsh11.json', 'swsh11-58']
  ];
  let otherBasic = 0;
  for (const [name, set, number, count, file, id] of basics) {
    assert.equal(deckCount(deck, name, set, number), count,
      'rank-3 count mismatch: ' + name);
    const card = cardById(file, id);
    assert.ok(card.subtypes?.includes('Basic'), name + ' must be Basic');
    otherBasic += count;
  }

  const source = {
    total: deck.cards.reduce((n, x) => n + x.count, 0),
    articuno: deckCount(deck, 'Articuno-GX', 'CES', '31'),
    water: deckCount(deck, 'Water Energy', 'MEE', '11'),
    captureEnergy: deckCount(deck, 'Capture Energy', 'RCL', '171'),
    otherBasic,
    quickBall: deckCount(deck, 'Quick Ball', 'FST', '237'),
    heavyBall: deckCount(deck, 'Hisuian Heavy Ball', 'ASR', '146'),
    nestBall: deckCount(deck, 'Nest Ball', 'SVI', '181'),
    arven: deckCount(deck, 'Arven', 'OBF', '186'),
    tools: [
      ['Float Stone', 'BKT', '137'],
      ['Stealthy Hood', 'UNB', '186'],
      ['Tool Jammer', 'BST', '136'],
      ['Forest Seal Stone', 'SIT', '156']
    ].reduce((n, [name, set, number]) =>
      n + deckCount(deck, name, set, number), 0)
  };
  const categoryCounts = {};
  for (const card of deck.cards) {
    categoryCounts[card.category] =
      (categoryCounts[card.category] || 0) + card.count;
  }
  assert.deepEqual(categoryCounts, {'Pokémon': 11, Trainer: 44, Energy: 5});
  assert.equal(source.total, 60);
  assert.equal(source.articuno, 1);
  assert.equal(source.water, 2);
  assert.equal(source.captureEnergy, 3);
  assert.equal(source.otherBasic, 10);
  assert.equal(source.quickBall, 1);
  assert.equal(source.heavyBall, 1);
  assert.equal(source.nestBall, 3);
  assert.equal(source.arven, 4);
  assert.equal(source.tools, 4);
  source.other = source.total - source.articuno - source.water -
    source.captureEnergy - source.otherBasic - source.quickBall -
    source.heavyBall - source.nestBall - source.arven - source.tools;
  assert.equal(source.other, 31);
  source.irrelevant = source.other + source.nestBall +
    source.captureEnergy;
  assert.equal(source.irrelevant, 37);
  return source;
}

/**
 * Count qualifying Prize arrangements for a hand without Articuno.
 * Quick Ball works only if Articuno remains in the deck. Heavy Ball works
 * only if Articuno is prized. Arven can fetch the matching Item plus a Tool.
 * @param {{quickBall:number,heavyBall:number,arven:number,tools:number}} hand
 * @returns {{total:bigint,quickBall:bigint,heavyBall:bigint,arven:bigint}}
 */
function countPrizeAccess(hand) {
  const q = 1 - hand.quickBall;
  const h = 1 - hand.heavyBall;
  const t = 4 - hand.tools;
  const other = 53 - 1 - q - h - t;
  const prizeTotal = choose(53, PRIZE_SIZE);
  let total = 0n;
  let quickBall = 0n;
  let heavyBall = 0n;
  let arven = 0n;

  for (let aPrize = 0; aPrize <= 1; aPrize += 1) {
    for (let qPrize = 0; qPrize <= q; qPrize += 1) {
      for (let hPrize = 0; hPrize <= h; hPrize += 1) {
        for (let tPrize = 0; tPrize <= Math.min(6, t); tPrize += 1) {
          const otherPrize = 6 - aPrize - qPrize - hPrize - tPrize;
          if (otherPrize < 0 || otherPrize > other) continue;
          const ways = choose(1, aPrize) * choose(q, qPrize) *
            choose(h, hPrize) * choose(t, tPrize) *
            choose(other, otherPrize);
          if (ways === 0n) continue;

          const directQuick = aPrize === 0 && hand.quickBall === 1;
          const directHeavy = aPrize === 1 && hand.heavyBall === 1;
          const canArven = hand.arven >= 1 && t - tPrize >= 1 &&
            ((aPrize === 0 && q - qPrize >= 1) ||
             (aPrize === 1 && h - hPrize >= 1));

          if (directQuick) {
            quickBall += ways;
            total += ways;
          } else if (directHeavy) {
            heavyBall += ways;
            total += ways;
          } else if (canArven) {
            arven += ways;
            total += ways;
          }
        }
      }
    }
  }
  assert.ok(total <= prizeTotal);
  return {total, quickBall, heavyBall, arven};
}

/** @returns {object} */
function analyze() {
  const source = loadSourceCounts();
  const cardText = validateCardText();
  const valid = choose(60, 7) - choose(49, 7);
  const prizeTotal = choose(53, 6);
  const denominator = valid * prizeTotal;
  let favorable = 0n;
  let articunoHand = 0n;
  let quickHand = 0n;
  let heavyHand = 0n;
  let arvenRoute = 0n;
  let waterAndOtherBasic = 0n;

  for (let a = 0; a <= 1; a += 1) {
    for (let q = 0; q <= 1; q += 1) {
      for (let h = 0; h <= 1; h += 1) {
        for (let r = 0; r <= 4; r += 1) {
          for (let t = 0; t <= 4; t += 1) {
            for (let w = 1; w <= 2; w += 1) {
              for (let o = 1; o <= 10; o += 1) {
                const x = 7 - a - q - h - r - t - w - o;
                if (x < 0 || x > source.irrelevant) continue;
                const hands = choose(1, a) * choose(1, q) *
                  choose(1, h) * choose(4, r) * choose(4, t) *
                  choose(2, w) * choose(10, o) *
                  choose(source.irrelevant, x);
                if (hands === 0n) continue;
                waterAndOtherBasic += hands;

                if (a === 1) {
                  const ways = hands * prizeTotal;
                  articunoHand += ways;
                  favorable += ways;
                  continue;
                }
                const access = countPrizeAccess({
                  quickBall: q, heavyBall: h, arven: r, tools: t
                });
                quickHand += hands * access.quickBall;
                heavyHand += hands * access.heavyBall;
                arvenRoute += hands * access.arven;
                favorable += hands * access.total;
              }
            }
          }
        }
      }
    }
  }

  const itemOnly = articunoHand + quickHand + heavyHand;
  assert.equal(articunoHand + quickHand + heavyHand + arvenRoute,
    favorable);
  const components = {
    articunoInHand: articunoHand.toString(),
    quickBallInHand: quickHand.toString(),
    heavyBallInHand: heavyHand.toString(),
    arvenRoute: arvenRoute.toString()
  };
  return {
    version: 'agent2-rank3-articuno-opening-access-v1',
    source: {
      rank: 3, deckSize: source.total,
      articunoCopies: source.articuno,
      basicWaterCopies: source.water,
      captureEnergyCopies: source.captureEnergy,
      otherBasicCopies: source.otherBasic,
      quickBallCopies: source.quickBall,
      hisuianHeavyBallCopies: source.heavyBall,
      arvenCopies: source.arven,
      pokemonToolCopies: source.tools,
      nestBallCopiesExcluded: source.nestBall
    },
    assumptions: {
      validOpeningHands: valid.toString(),
      prizeCards: 6,
      cardsRemainingBeforePrizes: 53,
      requiresWaterAndAnotherBasicInOpening: true,
      quickBallDiscardAvailable: true,
      arvenRequiresMatchingItemAndToolRemaining: true,
      noItemLockOrOtherDisruption: true,
      excludesTrainersMailAndLaterDraws: true,
      noOpponentEnergyOrGameValueClaim: true
    },
    counts: {
      waterAndOtherBasicOpenings: waterAndOtherBasic.toString(),
      favorablePrizeWeightedHands: favorable.toString(),
      denominator: denominator.toString(),
      components
    },
    percentagesAmongValidOpenings: {
      articunoInHand: percent(articunoHand, denominator),
      quickBallInHand: percent(quickHand, denominator),
      heavyBallInHand: percent(heavyHand, denominator),
      arvenRoute: percent(arvenRoute, denominator),
      itemOnly: percent(itemOnly, denominator),
      allIncludedRoutes: percent(favorable, denominator)
    },
    exactProbability: fraction(favorable, denominator),
    cardText
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(analyze(), null, 2) + '\n');
}

module.exports = {analyze, choose, countPrizeAccess};
