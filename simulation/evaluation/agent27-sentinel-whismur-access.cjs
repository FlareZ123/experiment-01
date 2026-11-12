'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && Number.isSafeInteger(k));
  if (k < 0 || k > n) return 0n;
  let out = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++)
    out = out * BigInt(n - i + 1) / BigInt(i);
  return out;
}

function gcd(a, b) {
  while (b) { const t = a % b; a = b; b = t; }
  return a;
}

function fraction(numerator, denominator) {
  const d = gcd(numerator, denominator);
  return {
    numerator: String(numerator / d),
    denominator: String(denominator / d),
    probability: Number(numerator) / Number(denominator)
  };
}

function* compositions(capacity, left, index = 0, prefix = []) {
  if (index === capacity.length - 1) {
    if (left >= 0 && left <= capacity[index]) yield [...prefix, left];
    return;
  }
  for (let n = 0; n <= Math.min(left, capacity[index]); n++)
    yield* compositions(capacity, left - n, index + 1, [...prefix, n]);
}

const DECK_PATH = path.resolve(__dirname,
  '../../results/aichi-2026/candidate-sentinel-lopunny-vileplume-v2-whismur-doublelock.psv');
// Mega Lopunny ex is Stage 1 (evolves from Buneary), not a Basic.
const BASIC_POKEMON = Object.freeze([
  'Buneary', 'Fan Rotom', 'Girafarig', 'Lillipup',
  'Oddish', 'Pidgey', 'Relicanth', 'Whismur'
]);
const EXPECTED_POKEMON_NAMES = Object.freeze([
  ...BASIC_POKEMON, 'Gloom', 'Herdier', 'Mega Lopunny ex',
  'Pidgeot ex', 'Pidgeotto', 'Stoutland', 'Vileplume'
]);

function readDeckAudit() {
  const text = fs.readFileSync(DECK_PATH, 'utf8').trim();
  const rows = text.split(/\r?\n/).map((line, index) => {
    const fields = line.split('|');
    assert.equal(fields.length, 5, \`invalid PSV row \${index + 1}\`);
    const [type, name, set, number, quantityText] = fields;
    const quantity = Number(quantityText);
    assert.ok(Number.isInteger(quantity) && quantity > 0,
      \`invalid quantity on PSV row \${index + 1}\`);
    return {type, name, set, number, quantity};
  });
  const count = (type, name, set, number) => {
    const found = rows.filter(row => row.type === type && row.name === name &&
      (set === undefined || row.set === set) &&
      (number === undefined || row.number === number));
    assert.equal(found.length, 1, \`expected one exact PSV row for \${type} \${name}\`);
    return found[0].quantity;
  };
  const totals = Object.fromEntries(['Pokémon', 'Energy', 'Trainer'].map(type => [
    type, rows.filter(row => row.type === type)
      .reduce((sum, row) => sum + row.quantity, 0)
  ]));
  const pokemonNames = rows.filter(row => row.type === 'Pokémon')
    .map(row => row.name).sort();
  assert.deepEqual(pokemonNames, [...EXPECTED_POKEMON_NAMES].sort(),
    'PSV Pokémon inventory/classification changed; re-audit Basic counts');
  const basicCount = BASIC_POKEMON.reduce((sum, name) =>
    sum + count('Pokémon', name), 0);
  const whismur = count('Pokémon', 'Whismur', 'CES', '116');
  const fanRotom = count('Pokémon', 'Fan Rotom', 'SCR', '118');
  const jetEnergy = count('Energy', 'Jet Energy', 'PAL', '190');
  const captureEnergy = count('Energy', 'Capture Energy', 'RCL', '171');
  const grassEnergy = count('Energy', 'Grass Energy', 'MEE', '9');
  const guzmaHala = count('Trainer', 'Guzma & Hala', 'CEC', '193');
  const tagCall = count('Trainer', 'Tag Call', 'CEC', '206');
  const totalCards = rows.reduce((sum, row) => sum + row.quantity, 0);
  assert.deepEqual(totals, {'Pokémon':26, Energy:6, Trainer:28});
  assert.equal(totalCards, 60);
  assert.equal(basicCount, 13);
  assert.equal(whismur, 1);
  assert.equal(fanRotom, 1);
  assert.equal(jetEnergy, 3);
  assert.equal(captureEnergy, 2);
  assert.equal(grassEnergy, 1);
  assert.equal(guzmaHala, 4);
  assert.equal(tagCall, 4);
  const otherBasic = basicCount - whismur - fanRotom;
  const rest = totalCards - whismur - fanRotom - jetEnergy -
    captureEnergy - grassEnergy - otherBasic - guzmaHala - tagCall;
  const capacity = [whismur, fanRotom, jetEnergy, captureEnergy,
    grassEnergy, otherBasic, guzmaHala, tagCall, rest];
  assert.deepEqual(capacity, [1,1,3,2,1,11,4,4,33]);
  return {
    totalCards, pokemon:totals['Pokémon'], energy:totals.Energy,
    trainers:totals.Trainer, basicCount, otherBasic, capacity
  };
}

const DECK_AUDIT = Object.freeze(readDeckAudit());
const CAPACITY = Object.freeze(DECK_AUDIT.capacity);
const VALID_OPENING_HANDS = choose(60, 7) - choose(60 - DECK_AUDIT.basicCount, 7);
const DENOMINATOR = VALID_OPENING_HANDS * choose(53, 7) * 7n;

/**
 * Exact conditional probability of a first-turn-going-second Whismur Bawl
 * access line. The first seven cards are conditioned on a Basic; the next
 * seven are the six Prize cards plus the first natural draw, with the draw
 * identity uniformly selected from those seven.
 *
 * Guzma & Hala assistance is an optimistic modeled envelope: it assumes two
 * discardable cards and an available Special Energy in deck. It does not
 * evaluate DCI/AMR, board space, opposing interference, or the next-turn
 * double-lock assembly.
 */
function exactSentinelWhismurAccess({
  fanCallEnabled = true,
  tagCallEnabled = true,
  supporterEnabled = true
} = {}) {
  assert.equal(typeof fanCallEnabled, 'boolean');
  assert.equal(typeof tagCallEnabled, 'boolean');
  assert.equal(typeof supporterEnabled, 'boolean');

  const counts = {
    directOpeningWhismurEnergy: 0n,
    directOpeningWhismurGuzmaHala: 0n,
    drawnWhismurJet: 0n,
    drawnWhismurGuzmaHala: 0n,
    fanCallJet: 0n,
    fanCallGuzmaHala: 0n
  };

  for (const opening of compositions(CAPACITY, 7)) {
    const [w, f, , , , otherBasic] = opening;
    if (w + f + otherBasic === 0) continue;
    let openingWays = 1n;
    for (let i = 0; i < CAPACITY.length; i++)
      openingWays *= choose(CAPACITY[i], opening[i]);
    const remaining = CAPACITY.map((n, i) => n - opening[i]);

    for (const seven of compositions(remaining, 7)) {
      let sevenWays = 1n;
      for (let i = 0; i < remaining.length; i++)
        sevenWays *= choose(remaining[i], seven[i]);
      const deck = remaining.map((n, i) => n - seven[i]);

      // The seven selected cards are six prizes plus one natural draw.
      // Each distinct card in category i can be the draw; multiply by seven[i].
      for (let drawCategory = 0; drawCategory < seven.length; drawCategory++) {
        const drawWays = seven[drawCategory];
        if (!drawWays) continue;
        const hand = [...opening];
        hand[drawCategory]++;
        const [, handFan, handJet, handCapture, handGrass,
          , handGuzmaHala, handTagCall] = hand;
        const energyInHand = handJet + handCapture + handGrass > 0;
        const jetInHand = handJet > 0;
        const specialEnergyInDeck = deck[2] + deck[3] > 0;
        const jetInDeck = deck[2] > 0;
        const guzmaHalaAccessible = supporterEnabled && (
          handGuzmaHala > 0 ||
          (tagCallEnabled && handTagCall > 0 && deck[6] > 0)
        );
        const ways = openingWays * sevenWays * BigInt(drawWays);

        if (w > 0) {
          if (energyInHand)
            counts.directOpeningWhismurEnergy += ways;
          else if (guzmaHalaAccessible && specialEnergyInDeck)
            counts.directOpeningWhismurGuzmaHala += ways;
        } else if (drawCategory === 0) {
          if (jetInHand)
            counts.drawnWhismurJet += ways;
          else if (guzmaHalaAccessible && jetInDeck)
            counts.drawnWhismurGuzmaHala += ways;
        } else if (fanCallEnabled && deck[0] > 0 && handFan > 0) {
          if (jetInHand)
            counts.fanCallJet += ways;
          else if (guzmaHalaAccessible && jetInDeck)
            counts.fanCallGuzmaHala += ways;
        }
      }
    }
  }

  const sum = keys => keys.reduce((n, key) => n + counts[key], 0n);
  const all = Object.keys(counts);
  return {
    schema: 'agent27-sentinel-whismur-access-v1',
    deck: DECK_AUDIT,
    assumptions: {
      deckSize: 60, initialHand: 7, initialBasicCount: DECK_AUDIT.basicCount,
      validOpeningCondition: 'at-least-one-Basic',
      prizeCards: 6, firstNaturalDraw: 1, mustGoSecond: true,
      fanCallEnabled, tagCallEnabled, supporterEnabled,
      guzmaHalaDiscardAssumption: 'two-discardable-cards-always-available',
      noOpponentStadiumOrBoardSuppression: true,
      openBenchSpaceAssumed: true,
      nextTurnDoubleLockAssemblyIncluded: false
    },
    noMulliganOpening: fraction(VALID_OPENING_HANDS, choose(60, 7)),
    mulliganOpening: fraction(choose(60 - DECK_AUDIT.basicCount, 7), choose(60, 7)),
    components: Object.fromEntries(all.map(key => [key, fraction(counts[key], DENOMINATOR)])),
    withoutGuzmaHala: fraction(sum([
      'directOpeningWhismurEnergy', 'drawnWhismurJet', 'fanCallJet'
    ]), DENOMINATOR),
    guzmaHalaAssisted: fraction(sum([
      'directOpeningWhismurGuzmaHala', 'drawnWhismurGuzmaHala',
      'fanCallGuzmaHala'
    ]), DENOMINATOR),
    directOnly: fraction(sum([
      'directOpeningWhismurEnergy', 'directOpeningWhismurGuzmaHala',
      'drawnWhismurJet', 'drawnWhismurGuzmaHala'
    ]), DENOMINATOR),
    fanCallOnly: fraction(sum(['fanCallJet', 'fanCallGuzmaHala']), DENOMINATOR),
    total: fraction(sum(all), DENOMINATOR)
  };
}

function scenarioTable() {
  const scenarios = {
    unimpeded: {fanCallEnabled:true, tagCallEnabled:true, supporterEnabled:true},
    abilityLock: {fanCallEnabled:false, tagCallEnabled:true, supporterEnabled:true},
    itemLock: {fanCallEnabled:true, tagCallEnabled:false, supporterEnabled:true},
    supporterLock: {fanCallEnabled:true, tagCallEnabled:true, supporterEnabled:false},
    abilityAndItemLock: {fanCallEnabled:false, tagCallEnabled:false, supporterEnabled:true},
    itemAndSupporterLock: {fanCallEnabled:true, tagCallEnabled:false, supporterEnabled:false},
    abilityAndSupporterLock: {fanCallEnabled:false, tagCallEnabled:true, supporterEnabled:false},
    allThreeLocks: {fanCallEnabled:false, tagCallEnabled:false, supporterEnabled:false}
  };
  return Object.fromEntries(Object.entries(scenarios).map(([name, options]) => {
    const result = exactSentinelWhismurAccess(options);
    return [name, {
      total: result.total,
      directOnly: result.directOnly,
      fanCallOnly: result.fanCallOnly,
      guzmaHalaAssisted: result.guzmaHalaAssisted
    }];
  }));
}

module.exports = {DECK_AUDIT, CAPACITY, exactSentinelWhismurAccess, scenarioTable};
