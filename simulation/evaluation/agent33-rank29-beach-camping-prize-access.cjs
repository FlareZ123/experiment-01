'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent33-rank29-camping-beach-singleton-v1';

/** Exact binomial coefficient for the small fixed-card population. */
function choose(n, k) {
  assert.ok(Number.isInteger(n) && n >= 0);
  assert.ok(Number.isInteger(k));
  if (k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    result = result * BigInt(n - Math.min(k, n - k) + i) / BigInt(i);
  }
  return result;
}

/** Inclusion-exclusion: first k cards contain >=1 from each disjoint group. */
function completeGroups(n, k, groups) {
  assert.ok(Array.isArray(groups) && groups.length <= 12);
  assert.ok(groups.every(x => Number.isInteger(x) && x >= 0));
  assert.ok(groups.reduce((a, b) => a + b, 0) <= n);
  let count = 0n;
  for (let mask = 0; mask < (1 << groups.length); mask++) {
    let removed = 0, bits = 0;
    for (let i = 0; i < groups.length; i++) {
      if (mask & (1 << i)) { removed += groups[i]; bits++; }
    }
    count += (bits % 2 ? -1n : 1n) * choose(n - removed, k);
  }
  return count;
}

/**
 * Exact source-locked first-seven resource comparison. K0 Prize identities
 * are unknown, and a search is assumed allowed to find any deck-resident DCE.
 * Both turn-ending actions end the owner's turn; no earlier draws or searches.
 */
function evaluate(source) {
  const deck = source.decks.find(x => x.rank === 29);
  assert.ok(deck, 'Missing rank-29 original source 60');
  const count = name => deck.cards.find(c => c.name === name)?.count ?? 0;
  const basics = deck.cards.filter(c => c.category === 'Pokémon')
    .reduce((sum, c) => sum + c.count, 0);
  const total = deck.cards.reduce((sum, c) => sum + c.count, 0);
  const camping = count('Camping Gear');
  const beach = count('Tropical Beach');
  const dce = count('Double Colorless Energy');
  const thunder = count('Thunder Mountain ♢');
  assert.deepEqual([total, basics, camping, beach, dce, thunder], [60, 4, 2, 2, 1, 1],
    'Exact rank-29 original-card source identity changed');

  // Seven opening cards, one Basic Active, then mandatory T1 draw.
  // Placing one held Beach leaves six cards; Beach draws one more.
  const opener = 7, prizes = 6, firstTurnDraw = 1, beachEffectDraws = 1;
  const beachDraws = firstTurnDraw + beachEffectDraws;
  const afterHand = total - opener;
  const deckAfterPrizes = afterHand - prizes;
  const legal = completeGroups(total, opener, [basics]);
  const joint = completeGroups(total, opener, [basics, camping, beach]);
  const noDce = completeGroups(total - dce, opener,
    [basics, camping, beach]);
  const noThunder = completeGroups(total - thunder, opener,
    [basics, camping, beach]);
  const noEither = completeGroups(total - dce - thunder, opener,
    [basics, camping, beach]);
  const initiallyBoth = joint - noDce - noThunder + noEither;
  const initiallyOne = noDce + noThunder - 2n * noEither;
  const initiallyNeither = noEither;
  assert.equal(initiallyBoth + initiallyOne + initiallyNeither, joint);
  const heldDce = joint - noDce;
  const asNumber = (num, den) => Number(num) / Number(den);
  // Given DCE absent from the opening seven, the remaining single DCE is
  // uniform across 53 cards, six Prizes and 47 actual deck cards.
  const gearPossession = heldDce * BigInt(afterHand) +
    noDce * BigInt(deckAfterPrizes);
  // Beach's first two shuffled deck draws include DCE with probability 2/53.
  const beachPossession = heldDce * BigInt(afterHand) +
    noDce * BigInt(beachDraws);
  const denominator = joint * BigInt(afterHand);
  // Mandatory T1 draw precedes either terminal action. With exactly one
  // missing singleton, Gear then finds it if not Prized: 47/53. With two
  // missing, Gear searches the other when T1 drew a piece, or searches one
  // and T2 draws the other: 3*46/(53*52). The Beach line sees the T1 draw,
  // one Beach-effect draw, and T2 draw: 3/53 for one missing or 6/(53*52)
  // for two missing.
  const pairDen = joint * 53n * 52n;
  const gearPair = initiallyBoth * 53n * 52n +
    initiallyOne * 47n * 52n + initiallyNeither * (3n * 46n);
  const beachPair = initiallyBoth * 53n * 52n +
    initiallyOne * 3n * 52n + initiallyNeither * 6n;
  return {
    version: VERSION, rank: 29, sourceOriginal60: true,
    basicCopies: basics, campingCopies: camping,
    beachCopies: beach, dceCopies: dce, thunderCopies: thunder,
    opener, prizes, firstTurnDraw, beachEffectDraws,
    beachDraws, deckAfterPrizes,
    legalOpeningProbability: asNumber(legal, choose(total, opener)),
    bothHeldGivenLegalOpening: asNumber(joint, legal),
    dceInitiallyHeldGivenBoth: asNumber(heldDce, joint),
    campingDceByTurnEndGivenBoth: asNumber(gearPossession, denominator),
    beachDceByTurnEndGivenBoth: asNumber(beachPossession, denominator),
    campingMinusBeachAccessGap: asNumber(gearPossession - beachPossession, denominator),
    initiallyBothAttackPiecesGivenBothTerminal: asNumber(initiallyBoth, joint),
    initiallyOneAttackPieceGivenBothTerminal: asNumber(initiallyOne, joint),
    initiallyNeitherAttackPieceGivenBothTerminal: asNumber(initiallyNeither, joint),
    bothAttackPiecesByT2Gear: asNumber(gearPair, pairDen),
    bothAttackPiecesByT2Beach: asNumber(beachPair, pairDen),
    gearMinusBeachAttackPairGap: asNumber(gearPair - beachPair, pairDen),
    dceInDeckGivenAbsentFromSeven: deckAfterPrizes / afterHand,
    dceInBeachDrawGivenAbsentFromSeven: beachDraws / afterHand,
    scope: 'Mandatory first turn draw and second turn draw; no other plays, native actions permitted, DCE and DCE+Thunder access only; no opponent interaction, future Stadium value, search/draw abilities, turn-clock or win rates',
    competitiveQualifiedGames: 0
  };
}

function run() {
  const filename = path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  return evaluate(JSON.parse(fs.readFileSync(filename, 'utf8')));
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {VERSION, choose, completeGroups, evaluate, run};
