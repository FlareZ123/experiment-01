'use strict';

const assert = require('node:assert/strict');
const candidate = require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const originals = require('../results/aichi-2026/full-decklists.json');
const copies = new Map(candidate.cards.map((row) => [row.id, row.count]));

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let value = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) {
    value = value * BigInt(n - i + 1) / BigInt(i);
  }
  return value;
}

/**
 * Enumerate unordered selections of a fixed size from independent card categories.
 * @param {number[]} counts
 * @param {number} total
 * @param {(selection:number[], ways:bigint)=>void} visit
 */
function allocations(counts, total, visit) {
  const selection = Array(counts.length).fill(0);
  /** @param {number} index @param {number} remaining @param {bigint} weight */
  function recur(index, remaining, weight) {
    if (index === counts.length - 1) {
      if (remaining <= counts[index]) {
        selection[index] = remaining;
        visit(selection, weight * choose(counts[index], remaining));
      }
      return;
    }
    for (let number = 0; number <= Math.min(remaining, counts[index]); number += 1) {
      selection[index] = number;
      recur(index + 1, remaining - number, weight * choose(counts[index], number));
    }
  }
  recur(0, total, 1n);
}

/** @param {string} id @returns {number} */
function count(id) {
  return copies.get(id) || 0;
}

const adp = count('sm12-156');
const dde = count('xy6-97');
const tag = count('sm12-206');
const hala = count('sm12-193');
const otherBasic = count('swsh12-135') + count('sm2-60') + count('swsh3-104');
const categories = [adp, dde, tag, hala, otherBasic,
  60 - (adp + dde + tag + hala + otherBasic)];
assert.deepEqual(categories, [2, 4, 4, 3, 5, 42]);
assert.equal(candidate.cards.reduce((total, card) => total + card.count, 0), 60);
const candidateValidSeven = choose(60, 7) - choose(53, 7);
const sourceValidSeven = choose(60, 7) - choose(56, 7);
const candidateRouteCache = new Map();
const qCandidate = Number(choose(53, 7)) / Number(choose(60, 7));
const qSource = Number(choose(56, 7)) / Number(choose(60, 7));

/**
 * Probability of an Active opening ADP and a DDE reachable by personal T1:
 * first 7 Basic-valid, optional opponent-mulligan cards d, one ordinary turn draw,
 * all 6 Prizes excluded from the deck. No other draw/search/Switch is modeled.
 * @param {number} bonus
 * @returns {number}
 */
function candidatePhysicalRoute(bonus) {
  if (candidateRouteCache.has(bonus)) return candidateRouteCache.get(bonus);
  const draws = bonus + 1;
  const afterDraw = 53 - draws;
  const prizeTotal = choose(afterDraw, 6);
  const denominator = candidateValidSeven * choose(53, draws) * prizeTotal;
  let favorable = 0n;
  allocations(categories, 7, (seven, sevenWays) => {
    if (!seven[0]) return; // ADP must be in initial seven to start Active.
    const remaining = categories.map((number, index) => number - seven[index]);
    allocations(remaining, draws, (drawn, drawWays) => {
      const seen = seven.map((number, index) => number + drawn[index]);
      const deck = remaining.map((number, index) => number - drawn[index]);
      let routes = 0n;
      if (seen[1]) {
        routes = prizeTotal;
      } else if (seen[3]) {
        routes = prizeTotal - choose(afterDraw - deck[1], 6 - deck[1]);
      } else if (seen[2]) {
        // Tag Call requires both a surviving G&H and a surviving Double Dragon.
        routes = prizeTotal
          - choose(afterDraw - deck[1], 6 - deck[1])
          - choose(afterDraw - deck[3], 6 - deck[3])
          + choose(afterDraw - deck[1] - deck[3], 6 - deck[1] - deck[3]);
      }
      favorable += sevenWays * drawWays * routes;
    });
  });
  const probability = Number(favorable) / Number(denominator);
  candidateRouteCache.set(bonus, probability);
  return probability;
}

const sourceRank6 = originals.decks.find((deck) => deck.rank === 6);
assert.ok(sourceRank6);
assert.deepEqual(sourceRank6.cards.filter((card) => card.category === 'Pokémon')
  .map(({ name, count }) => ({ name, count })),
  [{ name: 'Iron Thorns ex', count: 4 }]);
for (const [name, countExpected] of [
  ['Plumeria', 4], ['Team Flare Grunt', 2], ['Enhanced Hammer', 2],
  ['Megaton Blower', 1], ['Faba', 1], ['Crushing Hammer', 4]
]) {
  assert.equal(sourceRank6.cards.find((card) => card.name === name).count, countExpected);
}

/**
 * Rank-6 source going first, by its second turn has seven initial and two
 * ordinary draws, plus optional extras due to candidate mulligans.
 * @param {number} bonus
 * @returns {number}
 */
function sourceRemoverSeenBySecondTurn(bonus, removerCount = 8) {
  const n = 2 + bonus;
  const noRemoverInValidSeven = Number(
    choose(60 - removerCount, 7) - choose(56 - removerCount, 7)
  ) / Number(sourceValidSeven);
  const noRemoverInDraws = Number(choose(53 - removerCount, n)) / Number(choose(53, n));
  return 1 - noRemoverInValidSeven * noRemoverInDraws;
}

/**
 * Joint setup: two independent geometric counts of invalid seven-card draws.
 * Both mulligan: both reset; the earlier valid player's bonus is the difference.
 * Assumes both players take the maximum permitted optional setup draws.
 * @param {number} d
 * @param {'candidate'|'source'} receiver
 * @returns {number}
 */
function bonusMass(d, receiver) {
  const noSimultaneousInvalid = 1 - qCandidate * qSource;
  if (receiver === 'candidate') {
    return d === 0
      ? (1 - qSource) / noSimultaneousInvalid
      : (1 - qCandidate) * (1 - qSource) *
        qSource ** d / noSimultaneousInvalid;
  }
  return d === 0
    ? (1 - qCandidate) / noSimultaneousInvalid
    : (1 - qSource) * (1 - qCandidate) *
      qCandidate ** d / noSimultaneousInvalid;
}

/** @param {number} maxBonus @param {'candidate'|'source'} receiver @returns {number} */
function omittedTail(maxBonus, receiver) {
  const q = receiver === 'candidate' ? qSource : qCandidate;
  const pOtherValid = receiver === 'candidate' ? 1 - qCandidate : 1 - qSource;
  return pOtherValid * q ** (maxBonus + 1) / (1 - qCandidate * qSource);
}

/**
 * Full mixture up to maxBonus, with the uncomputed tail bound between 0 and 1.
 * @param {'candidate'|'source'} receiver
 * @param {number} maxBonus
 * @returns {{lower:number,upper:number,tail:number}}
 */
function bounds(receiver, maxBonus) {
  let lower = 0;
  for (let d = 0; d <= maxBonus; d += 1) {
    lower += bonusMass(d, receiver) * (receiver === 'candidate'
      ? candidatePhysicalRoute(d) : sourceRemoverSeenBySecondTurn(d));
  }
  const tail = omittedTail(maxBonus, receiver);
  return { lower, upper: lower + tail, tail };
}

/**
 * Bilateral physical opportunity with actual asymmetric setup bonus distribution.
 * Both original source and candidate get independent conditional valid hands,
 * but the two nonzero mulligan-bonus categories are mutually exclusive.
 * @param {number} removerCopies
 * @param {number} maxBonus
 * @returns {{lower:number,upper:number,tail:number}}
 */
function jointPhysicalOpportunity(removerCopies, maxBonus) {
  const sameValid = (1 - qCandidate) * (1 - qSource) /
    (1 - qCandidate * qSource);
  const candidateNoBonus = candidatePhysicalRoute(0);
  const sourceNoBonus = sourceRemoverSeenBySecondTurn(0, removerCopies);
  let lower = sameValid * candidateNoBonus * sourceNoBonus;
  for (let d = 1; d <= maxBonus; d += 1) {
    lower += sameValid * qSource ** d * candidatePhysicalRoute(d) * sourceNoBonus;
    lower += sameValid * qCandidate ** d * candidateNoBonus *
      sourceRemoverSeenBySecondTurn(d, removerCopies);
  }
  const tail = omittedTail(maxBonus, 'candidate') * sourceNoBonus +
    omittedTail(maxBonus, 'source') * candidateNoBonus;
  return { lower, upper: lower + tail, tail };
}

// Non-ADP Basic starts can use Tag Call to obtain ADP and Guzma & Hala,
// then Switch ADP Active after Guzma & Hala searches Double Dragon Energy.
const bridgeGroups = [
  adp, otherBasic, tag, count('sv1-194'), hala, dde,
  60 - (adp + otherBasic + tag + count('sv1-194') + hala + dde)
];
assert.deepEqual(bridgeGroups, [2, 5, 4, 2, 3, 4, 40]);
const bridgeStates = new Map();
allocations(bridgeGroups, 7, (initial, openingWays) => {
  if (initial[0] || !initial[1]) return;
  const remaining = bridgeGroups.map((number, i) => number - initial[i]);
  allocations(remaining, 6, (prizes, prizeWays) => {
    if ([0, 4, 5].some((i) => bridgeGroups[i] - prizes[i] === 0)) return;
    const heldTag = Boolean(initial[2]);
    const heldSwitch = Boolean(initial[3]);
    const tagInDeck = remaining[2] - prizes[2];
    const switchInDeck = remaining[3] - prizes[3];
    const key = [heldTag ? 1 : 0, heldSwitch ? 1 : 0, tagInDeck, switchInDeck].join(':');
    bridgeStates.set(key, (bridgeStates.get(key) || 0n) + openingWays * prizeWays);
  });
});
assert.equal(bridgeStates.size, 45);
const bridgeTotal = candidateValidSeven * choose(53, 6);

/** @param {number} bonus @returns {number} */
function bridgePhysicalRoute(bonus) {
  const n = bonus + 1;
  const denominator = Number(choose(47, n));
  /** @param {number} countRemaining @returns {number} */
  function notDrawn(countRemaining) {
    return Number(choose(47 - countRemaining, n)) / denominator;
  }
  let weightedProbability = 0;
  for (const [key, ways] of bridgeStates) {
    const [heldTag, heldSwitch, tagInDeck, switchInDeck] = key.split(':').map(Number);
    let chance;
    if (heldTag && heldSwitch) chance = 1;
    else if (heldTag) chance = 1 - notDrawn(switchInDeck);
    else if (heldSwitch) chance = 1 - notDrawn(tagInDeck);
    else {
      chance = 1 - notDrawn(tagInDeck) - notDrawn(switchInDeck) +
        notDrawn(tagInDeck + switchInDeck);
    }
    weightedProbability += Number(ways) * chance;
  }
  return weightedProbability / Number(bridgeTotal);
}

/** @param {number} maxBonus @returns {{lower:number,upper:number,tail:number}} */
function combinedCandidateAccess(maxBonus) {
  let lower = 0;
  for (let d = 0; d <= maxBonus; d += 1) {
    lower += bonusMass(d, 'candidate') *
      (candidatePhysicalRoute(d) + bridgePhysicalRoute(d));
  }
  const tail = omittedTail(maxBonus, 'candidate');
  return { lower, upper: lower + tail, tail };
}

/** @param {number} n @param {number} maxBonus */
function jointTwoRouteSeen(n, maxBonus) {
  const common=(1-qCandidate)*(1-qSource)/(1-qCandidate*qSource);
  const c0=candidatePhysicalRoute(0)+bridgePhysicalRoute(0);
  const s0=sourceRemoverSeenBySecondTurn(0,n);
  let lower=common*c0*s0;
  for(let d=1;d<=maxBonus;d+=1) {
    lower+=common*qSource**d*(candidatePhysicalRoute(d)+bridgePhysicalRoute(d))*s0;
    lower+=common*qCandidate**d*c0*sourceRemoverSeenBySecondTurn(d,n);
  }
  const tail=omittedTail(maxBonus,'candidate')*s0+omittedTail(maxBonus,'source')*c0;
  return {lower,upper:lower+tail};
}

assert.ok(Math.abs(qCandidate - 0.39912045076768693) < 1e-14);
assert.ok(Math.abs(qSource - 0.6005003742553344) < 1e-14);
assert.ok(Math.abs(candidatePhysicalRoute(0) - 0.289936530125) < 2e-12);
assert.ok(Math.abs(candidatePhysicalRoute(1) - 0.30655579098) < 2e-10);
assert.ok(Math.abs(candidatePhysicalRoute(2) - 0.31991716256) < 2e-10);
assert.ok(Math.abs(bridgePhysicalRoute(0) - 0.05673530423352952) < 2e-12);
assert.ok(Math.abs(bridgePhysicalRoute(1) - 0.07176536843977568) < 2e-10);
assert.ok(Math.abs(bridgePhysicalRoute(2) - 0.08783971026506839) < 2e-10);
assert.ok(Math.abs(sourceRemoverSeenBySecondTurn(0) - 0.7198924574568) < 2e-12);
assert.ok(Math.abs(sourceRemoverSeenBySecondTurn(0, 4) - 0.4572047432473605) < 2e-12);
const candidateBounds = bounds('candidate', 20);
const sourceBounds = bounds('source', 20);
const combinedAccessBounds = combinedCandidateAccess(30);
const jointHammer=jointTwoRouteSeen(2,30);
const jointCostless=jointTwoRouteSeen(4,30);
const jointAll=jointTwoRouteSeen(8,30);
const jointItems=jointTwoRouteSeen(3,30);
const jointFiveNoDiscard=jointTwoRouteSeen(5,30);
const jointTenDeterministic=jointTwoRouteSeen(10,30);
assert.ok(jointItems.lower>0.143451&&jointItems.upper<0.143452);
assert.ok(jointFiveNoDiscard.lower>0.210116&&jointFiveNoDiscard.upper<0.210117);
assert.ok(jointTenDeterministic.lower>0.310269&&jointTenDeterministic.upper<0.310270);
assert.ok(jointHammer.lower>0.1021664&&jointHammer.upper<0.1021665);
assert.ok(jointCostless.lower>0.1792144&&jointCostless.upper<0.1792145);
assert.ok(jointAll.lower>0.2792460&&jointAll.upper<0.2792462);
assert.ok(combinedAccessBounds.lower > 0.381149 && combinedAccessBounds.upper < 0.381151);
const jointNoCost = jointPhysicalOpportunity(4, 20);
const jointAllRemoval = jointPhysicalOpportunity(8, 20);
let costlessBoundLower = 0;
for (let d = 0; d <= 20; d += 1) {
  costlessBoundLower += bonusMass(d, 'source') * sourceRemoverSeenBySecondTurn(d, 4);
}
const costlessBounds = {
  lower: costlessBoundLower,
  upper: costlessBoundLower + omittedTail(20, 'source')
};
assert.ok(costlessBounds.lower > 0.47148 && costlessBounds.upper < 0.47149);
assert.ok(candidateBounds.lower > 0.305 && candidateBounds.upper < 0.306);
assert.ok(jointNoCost.lower > 0.14364 && jointNoCost.upper < 0.14365);
assert.ok(jointAllRemoval.lower > 0.22371 && jointAllRemoval.upper < 0.22373);
assert.ok(sourceBounds.lower > 0.73390 && sourceBounds.upper < 0.73392);
assert.ok(candidateBounds.lower > candidatePhysicalRoute(0));
assert.ok(sourceBounds.lower > sourceRemoverSeenBySecondTurn(0));
assert.ok(candidateBounds.upper - candidateBounds.lower < 0.00003);
assert.ok(sourceBounds.upper - sourceBounds.lower < 0.00000001);

// The two players cannot both get a positive bonus in the same game.
const pCandidateBonus = bonusMass(1, 'candidate') / (1 - qSource);
const pSourceBonus = bonusMass(1, 'source') / (1 - qCandidate);
const pNeitherBonus = (1 - qCandidate) * (1 - qSource) /
  (1 - qCandidate * qSource);
assert.ok(Math.abs(pCandidateBonus - 0.47456937628624857) < 1e-12);
assert.ok(Math.abs(pSourceBonus - 0.20971010738377938) < 1e-12);
assert.ok(Math.abs(pCandidateBonus + pSourceBonus + pNeitherBonus - 1) < 1e-12);
assert.ok(Math.abs(bonusMass(0, 'candidate') + pCandidateBonus - 1) < 1e-12);
assert.ok(Math.abs(bonusMass(0, 'source') + pSourceBonus - 1) < 1e-12);

console.log(JSON.stringify({
  status: 'PASS',
  candidateIdentity: candidate.canonicalCardsSha256,
  baselineCandidateT1RoutePercent: 100 * candidatePhysicalRoute(0),
  baselineTagCallSwitchBridgePercent: 100 * bridgePhysicalRoute(0),
  basicValidTwoRouteNoBonusUnionPercent:
    100 * (candidatePhysicalRoute(0) + bridgePhysicalRoute(0)),
  basicValidTwoRouteWithAllMulliganBonusPercentBounds: [
    100 * combinedAccessBounds.lower, 100 * combinedAccessBounds.upper
  ],
  candidateBonusChancePercent: 100 * pCandidateBonus,
  candidateWithAllOptionalMulliganBonusPercentBounds: [
    100 * candidateBounds.lower, 100 * candidateBounds.upper
  ],
  rank6BaselineRemoverSeenBySecondTurnPercent: 100 * sourceRemoverSeenBySecondTurn(0),
  rank6BaselineNoDiscardCostRemoverSeenPercent: 100 * sourceRemoverSeenBySecondTurn(0, 4),
  rank6NoDiscardCostRemoverWithBonusPercentBounds: [
    100 * costlessBounds.lower, 100 * costlessBounds.upper
  ],
  sourceBonusChancePercent: 100 * pSourceBonus,
  sourceWithAllOptionalMulliganBonusPercentBounds: [
    100 * sourceBounds.lower, 100 * sourceBounds.upper
  ],
  bilateralCandidateGXAndSourceNoCostRemoverSeenPercentBounds: [
    100 * jointNoCost.lower, 100 * jointNoCost.upper
  ],
  bilateralCandidateGXAndSourceAnyRemoverSeenPercentBounds: [
    100 * jointAllRemoval.lower, 100 * jointAllRemoval.upper
  ],
  rank6BilateralTwoRouteWithEnhancedHammerSeenPercentBounds:
    [100*jointHammer.lower,100*jointHammer.upper],
  rank6BilateralTwoRouteWithFourNoCostRemoversSeenPercentBounds:
    [100*jointCostless.lower,100*jointCostless.upper],
  rank6BilateralTwoRouteWithAllEightRemoversSeenPercentBounds:
    [100*jointAll.lower,100*jointAll.upper],
  rank6OriginalDeterministicRemovalPrintings: 10,
  rank6OriginalAdditionalCrushingHammerCoinFlipPrintings: 4,
  rank6TwoRouteWithItemOnlyGuaranteedSpecialEnergyAnswerPercentBounds:
    [100*jointItems.lower,100*jointItems.upper],
  rank6TwoRouteWithFiveNoDiscardCostDeterministicAnswersPercentBounds:
    [100*jointFiveNoDiscard.lower,100*jointFiveNoDiscard.upper],
  rank6TwoRouteWithTenDeterministicAnswersSeenPercentBounds:
    [100*jointTenDeterministic.lower,100*jointTenDeterministic.upper],
  tailMass: { candidate: candidateBounds.tail, source: sourceBounds.tail },
  interpretation: 'Physical hand and unprized opportunity only; no native games or actual source Energy-removal payment observed'
}, null, 2));
