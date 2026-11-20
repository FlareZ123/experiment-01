'use strict';

function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0) throw new TypeError('invalid n/k');
  if (k < 0 || k > n) return 0n;
  k = Math.min(k, n - k);
  let x = 1n;
  for (let i = 1; i <= k; i += 1) x = x * BigInt(n - k + i) / BigInt(i);
  return x;
}

const ratio = (a, b) => Number(a) / Number(b);
function gcd(a, b) { return b === 0n ? a : gcd(b, a % b); }
function fraction(a, b) { const g = gcd(a, b); return String(a / g) + '/' + String(b / g); }

function openingStats(basicCount, deckSize = 60, handSize = 7) {
  if (!Number.isInteger(basicCount) || basicCount < 1 || basicCount > deckSize ||
      !Number.isInteger(handSize) || handSize < 1 || handSize > deckSize) {
    throw new RangeError('invalid deck, hand, or Basic count');
  }
  const total = choose(deckSize, handSize);
  const noBasic = choose(deckSize - basicCount, handSize);
  const valid = total - noBasic;
  let atLeastTwo = 0n;
  let basicTotal = 0n;
  const distribution = [];
  for (let n = 1; n <= Math.min(basicCount, handSize); n += 1) {
    const hands = choose(basicCount, n) * choose(deckSize - basicCount, handSize - n);
    distribution.push({ basics: n, hands: hands.toString(), probabilityGivenValid: ratio(hands, valid) });
    basicTotal += BigInt(n) * hands;
    if (n >= 2) atLeastTwo += hands;
  }
  const p = ratio(valid, total);
  const q = ratio(noBasic, total);
  return {
    basicCount, totalHands: total.toString(), validHands: valid.toString(), noBasicHands: noBasic.toString(),
    validProbability: p, noBasicProbability: q, validProbabilityFraction: fraction(valid, total),
    expectedSoloMulligans: q / p, probabilityAtLeastTwoBasicsGivenValid: ratio(atLeastTwo, valid),
    expectedBasicsGivenValid: ratio(basicTotal, valid), conditionalDistribution: distribution
  };
}

function namedBasicOnlyGivenValid(totalBasics, otherBasics, targetCount = 0, deckSize = 60, handSize = 7) {
  if (!Number.isInteger(totalBasics) || !Number.isInteger(otherBasics) ||
      !Number.isInteger(targetCount) || totalBasics < 1 || otherBasics < 0 ||
      otherBasics >= totalBasics || targetCount < 0 || totalBasics + targetCount > deckSize) {
    throw new RangeError('invalid Basic/target group counts');
  }
  const total = choose(deckSize, handSize);
  const valid = total - choose(deckSize - totalBasics, handSize);
  const noOther = choose(deckSize - otherBasics, handSize);
  const noOtherNoNamed = choose(deckSize - totalBasics, handSize);
  if (targetCount === 0) return ratio(noOther - noOtherNoNamed, valid);
  const noOtherNoTarget = choose(deckSize - otherBasics - targetCount, handSize);
  const noOtherNoNamedNoTarget = choose(deckSize - totalBasics - targetCount, handSize);
  return ratio(noOther - noOtherNoNamed - noOtherNoTarget + noOtherNoNamedNoTarget, valid);
}

// Rulebook I.G.5–7: simultaneous no-Basic hands restart jointly and do not
// execute 5.d; only a one-sided failure creates an optional bonus-draw ceiling.
function pairedBonusStats(candidateBasics, opponentBasics, deckSize = 60, handSize = 7) {
  const pA = openingStats(candidateBasics, deckSize, handSize).validProbability;
  const pB = openingStats(opponentBasics, deckSize, handSize).validProbability;
  const qA = 1 - pA, qB = 1 - pB, bothFail = qA * qB, z = 1 - bothFail;
  const pBOpportunity = qA * pB / z;
  const pAOpportunity = pA * qB / z;
  const pNeither = pA * pB / z;
  const toB = pBOpportunity / pA;
  const toA = pAOpportunity / pB;
  return {
    candidateBasics, opponentBasics, bothFailAndRestartPerJointDeal: bothFail,
    probabilityOpponentHasAnyBonusDrawOpportunity: pBOpportunity,
    probabilityCandidateHasAnyBonusDrawOpportunity: pAOpportunity,
    probabilityNeitherHasBonusDrawOpportunity: pNeither,
    expectedMaximumOptionalBonusDrawsAvailableToOpponent: toB,
    expectedMaximumOptionalBonusDrawsAvailableToCandidate: toA,
    expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent: toB - toA
  };
}

function rngFromSeed(seed) {
  let x = seed >>> 0 || 0x9e3779b9;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 0x100000000; };
}
function sampleHasBasic(basicCount, deckSize, handSize, rng) {
  let left = deckSize, basics = basicCount, found = false;
  for (let i = 0; i < handSize; i += 1) {
    if (rng() * left < basics) { found = true; basics -= 1; }
    left -= 1;
  }
  return found;
}
function simulatePairedBonuses(candidateBasics, opponentBasics, trials = 250000, seed = 0x30a1c0de) {
  const rng = rngFromSeed(seed);
  let oppTotal = 0, candTotal = 0, oppGames = 0, candGames = 0, noBonus = 0;
  for (let t = 0; t < trials; t += 1) {
    let a, b;
    while (true) {
      a = sampleHasBasic(candidateBasics, 60, 7, rng);
      b = sampleHasBasic(opponentBasics, 60, 7, rng);
      if (a && b) { noBonus += 1; break; }
      if (!a && !b) continue; // joint restart: no step 5.d
      if (!a) {
        let m = 0;
        do { m += 1; a = sampleHasBasic(candidateBasics, 60, 7, rng); } while (!a);
        oppTotal += m; oppGames += 1; break;
      }
      let m = 0;
      do { m += 1; b = sampleHasBasic(opponentBasics, 60, 7, rng); } while (!b);
      candTotal += m; candGames += 1; break;
    }
  }
  return {
    trials, seed: seed >>> 0,
    meanMaximumOptionalBonusDrawsAvailableToOpponent: oppTotal / trials,
    meanMaximumOptionalBonusDrawsAvailableToCandidate: candTotal / trials,
    probabilityOpponentHasAnyBonusDrawOpportunity: oppGames / trials,
    probabilityCandidateHasAnyBonusDrawOpportunity: candGames / trials,
    probabilityNeitherHasBonusDrawOpportunity: noBonus / trials
  };
}

const ironThornsV3 = {
  label: 'Iron Thorns ex / Mimikyu Psychic Reserve v3',
  source: 'results/aichi-2026/candidate-iron-thorns-psychic-reserve-v3.json',
  basicCount: 5,
  basicComposition: [
    { name: 'Iron Thorns ex', printing: 'TWM 77', count: 4 },
    { name: 'Mimikyu', printing: 'PAL 97', count: 1 }
  ]
};
const rank1Source = {
  label: 'Aichi rank-1 Shadow Rider champion source 60',
  source: 'results/aichi-2026/full-decklists.json (rank 1)',
  basicCount: 14,
  basicComposition: [
    { name: 'Shadow Rider Calyrex V', printing: 'CRE 74', count: 3 },
    { name: "Lillie's Clefairy ex", printing: 'JTG 56', count: 2 },
    { name: 'Tapu Lele-GX', printing: 'GRI 60', count: 2 },
    { name: 'Trevenant & Dusknoir-GX', printing: 'SMP SM217', count: 1 },
    { name: 'Latias ex', printing: 'SSP 76', count: 1 },
    { name: 'Dialga-GX', printing: 'UPR 100', count: 1 },
    { name: 'Mimikyu', printing: 'GRI 58', count: 1 },
    { name: 'Girafarig', printing: 'LOT 94', count: 1 },
    { name: 'Marshadow', printing: 'UNB 81', count: 1 },
    { name: 'Radiant Eternatus', printing: 'CRZ 105', count: 1 }
  ]
};
const hoodShieldV1 = {
  label: 'Hood Shield Shadow Rider v1',
  source: 'results/aichi-2026/candidate-hood-shadow-rider.json',
  basicCount: 14
};

// Precomputed by joining all 29 published decklist Pokémon printings to set IDs and Basic subtypes in resources/sets/en.json and resources/cards/en/*.json. Ranks 23, 25, and 28 have no published 60; Ditto Prism Star is resolved by set/number despite its glyph variant.
const AICHI_FIELD = [
  { rank: 1, archetype: 'Shadow Rider Calyrex', basicCount: 14 },
  { rank: 2, archetype: 'Vileplume Control', basicCount: 14 },
  { rank: 3, archetype: 'Snorlax Stall', basicCount: 11 },
  { rank: 4, archetype: 'Raichu Electrode Combo', basicCount: 13 },
  { rank: 5, archetype: 'Mew Genesect', basicCount: 11 },
  { rank: 6, archetype: 'Iron Thorns', basicCount: 4 },
  { rank: 7, archetype: 'Snorlax Stall', basicCount: 12 },
  { rank: 8, archetype: 'Absol Garbodor', basicCount: 10 },
  { rank: 9, archetype: 'Absol Electrode', basicCount: 11 },
  { rank: 10, archetype: 'Regidrago', basicCount: 15 },
  { rank: 11, archetype: 'Absol Garbodor', basicCount: 11 },
  { rank: 12, archetype: 'Regidrago', basicCount: 15 },
  { rank: 13, archetype: 'Regidrago', basicCount: 11 },
  { rank: 14, archetype: 'Regidrago', basicCount: 14 },
  { rank: 15, archetype: 'Lopunny Vileplume', basicCount: 14 },
  { rank: 16, archetype: 'Absol Garbodor', basicCount: 11 },
  { rank: 17, archetype: 'Raichu Electrode Combo', basicCount: 13 },
  { rank: 18, archetype: 'Regidrago', basicCount: 16 },
  { rank: 19, archetype: 'Raging Bolt', basicCount: 16 },
  { rank: 20, archetype: 'Regidrago', basicCount: 14 },
  { rank: 21, archetype: 'Regidrago', basicCount: 14 },
  { rank: 22, archetype: 'Absol Garbodor', basicCount: 12 },
  { rank: 24, archetype: 'Iron Thorns', basicCount: 4 },
  { rank: 26, archetype: 'Meloetta Donk', basicCount: 12 },
  { rank: 27, archetype: 'Regidrago', basicCount: 15 },
  { rank: 29, archetype: 'Iron Thorns', basicCount: 4 },
  { rank: 30, archetype: "Lillie's Clefairy", basicCount: 16 },
  { rank: 31, archetype: 'Dusknoir Chimecho', basicCount: 15 },
  { rank: 32, archetype: 'Regidrago', basicCount: 13 }
];

function buildReport() {
  const a = openingStats(ironThornsV3.basicCount);
  const b = openingStats(rank1Source.basicCount);
  const mimikyuOnly = namedBasicOnlyGivenValid(5, 4);
  const mimikyuOnlyWithCapture = namedBasicOnlyGivenValid(5, 4, 2);
  const fieldVector = AICHI_FIELD.map(row => ({
    ...row,
    ...pairedBonusStats(ironThornsV3.basicCount, row.basicCount)
  }));
  const average = key => fieldVector.reduce((sum, row) => sum + row[key], 0) / fieldVector.length;
  const fieldSummary = {
    publishedDecks: fieldVector.length,
    missingRanks: [23, 25, 28],
    totalBasicCards: fieldVector.reduce((sum, row) => sum + row.basicCount, 0),
    minOpponentBasicCount: Math.min(...fieldVector.map(row => row.basicCount)),
    maxOpponentBasicCount: Math.max(...fieldVector.map(row => row.basicCount)),
    meanOpponentBasicCount: average('basicCount'),
    meanProbabilityOpponentHasBonusDrawOpportunity: average('probabilityOpponentHasAnyBonusDrawOpportunity'),
    meanProbabilityCandidateHasBonusDrawOpportunity: average('probabilityCandidateHasAnyBonusDrawOpportunity'),
    meanMaximumOptionalBonusDrawsAvailableToOpponent: average('expectedMaximumOptionalBonusDrawsAvailableToOpponent'),
    meanMaximumOptionalBonusDrawsAvailableToCandidate: average('expectedMaximumOptionalBonusDrawsAvailableToCandidate'),
    meanMaximumOptionalBonusDrawOpportunityDifferenceForOpponent: average('expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent'),
    opponentsWithPositiveDifference: fieldVector.filter(row => row.expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent > 0).length,
    opponentsWithNegativeDifference: fieldVector.filter(row => row.expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent < 0).length
  };
  const fieldVectorHood = AICHI_FIELD.map(row => ({
    ...row,
    ...pairedBonusStats(hoodShieldV1.basicCount, row.basicCount)
  }));
  const averageHood = key => fieldVectorHood.reduce((sum, row) => sum + row[key], 0) / fieldVectorHood.length;
  const fieldSummaryHood = {
    publishedDecks: fieldVectorHood.length,
    missingRanks: [23, 25, 28],
    meanOpponentBasicCount: averageHood('basicCount'),
    meanProbabilityOpponentHasBonusDrawOpportunity: averageHood('probabilityOpponentHasAnyBonusDrawOpportunity'),
    meanProbabilityCandidateHasBonusDrawOpportunity: averageHood('probabilityCandidateHasAnyBonusDrawOpportunity'),
    meanMaximumOptionalBonusDrawsAvailableToOpponent: averageHood('expectedMaximumOptionalBonusDrawsAvailableToOpponent'),
    meanMaximumOptionalBonusDrawsAvailableToCandidate: averageHood('expectedMaximumOptionalBonusDrawsAvailableToCandidate'),
    meanMaximumOptionalBonusDrawOpportunityDifferenceForOpponent: averageHood('expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent'),
    opponentsWithPositiveDifference: fieldVectorHood.filter(row => row.expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent > 0).length,
    opponentsWithNegativeDifference: fieldVectorHood.filter(row => row.expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent < 0).length,
    opponentsWithEqualDifference: fieldVectorHood.filter(row => row.expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent === 0).length
  };
  const candidateBasicSensitivity = Array.from({ length: 15 }, (_, i) => i + 4).map(basics => {
    const vector = AICHI_FIELD.map(row => pairedBonusStats(basics, row.basicCount));
    const mean = key => vector.reduce((sum, row) => sum + row[key], 0) / vector.length;
    return {
      candidateBasics: basics,
      meanMaximumOptionalBonusDrawsAvailableToOpponent: mean('expectedMaximumOptionalBonusDrawsAvailableToOpponent'),
      meanMaximumOptionalBonusDrawsAvailableToCandidate: mean('expectedMaximumOptionalBonusDrawsAvailableToCandidate'),
      meanMaximumOptionalBonusDrawOpportunityDifferenceForOpponent: mean('expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent'),
      opponentsWithPositiveDifference: vector.filter(row => row.expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent > 0).length,
      opponentsWithNegativeDifference: vector.filter(row => row.expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent < 0).length,
      opponentsWithEqualDifference: vector.filter(row => row.expectedMaximumOptionalBonusDrawOpportunityDifferenceForOpponent === 0).length
    };
  });
  return {
    schema: 'agent30-opening-mulligan-opportunity-v3',
    assumptions: {
      deckSize: 60, openingHandSize: 7,
      candidateAndRank1BasicCountsClassifiedFromCardPoolSubtypes: true,\n      fieldBasicCountsPrecomputedFrom29SourceDecksAndCardPoolSubtypes: true,
      mutualNoBasicResetDoesNotExecuteRulebookStep5d: true,
      opponentMayDrawAnyNumberUpToMulliganCount: true,
      bonusDrawExpectationsAssumeReceiverTakesMaximum: true,
      laterDrawsAndSearchNotModeled: true
    },
    candidate: ironThornsV3, opponent: rank1Source, sameBasicCountAlternative: hoodShieldV1,
    candidateOpening: a, opponentOpening: b,
    paired: pairedBonusStats(ironThornsV3.basicCount, rank1Source.basicCount),
    probabilityMimikyuOnlyStartGivenValid: mimikyuOnly,
    probabilityMimikyuOnlyWithCaptureEnergyGivenValid: mimikyuOnlyWithCapture,
    probabilityMimikyuOnlyWithoutCaptureEnergyGivenValid: mimikyuOnly - mimikyuOnlyWithCapture,
    probabilityThornsPresentGivenValid: 1 - mimikyuOnly,
    sensitivity: [5, 8, 10, 12, 14, 16, 18].map(n => pairedBonusStats(5, n)),\n    fieldVector, fieldSummary, fieldVectorHood, fieldSummaryHood, candidateBasicSensitivity
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(buildReport(), null, 2) + '\n');
module.exports = { choose, openingStats, namedBasicOnlyGivenValid, pairedBonusStats, simulatePairedBonuses, AICHI_FIELD, buildReport };
