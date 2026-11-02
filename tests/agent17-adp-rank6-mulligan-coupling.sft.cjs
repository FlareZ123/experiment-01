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
  ['Plumeria', 4], ['Team Flare Grunt', 2], ['Enhanced Hammer', 2]
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

assert.ok(Math.abs(qCandidate - 0.39912045076768693) < 1e-14);
assert.ok(Math.abs(qSource - 0.6005003742553344) < 1e-14);
assert.ok(Math.abs(candidatePhysicalRoute(0) - 0.289936530125) < 2e-12);
assert.ok(Math.abs(candidatePhysicalRoute(1) - 0.30655579098) < 2e-10);
assert.ok(Math.abs(candidatePhysicalRoute(2) - 0.31991716256) < 2e-10);
assert.ok(Math.abs(sourceRemoverSeenBySecondTurn(0) - 0.7198924574568) < 2e-12);
assert.ok(Math.abs(sourceRemoverSeenBySecondTurn(0, 4) - 0.4572047432473605) < 2e-12);
const candidateBounds = bounds('candidate', 20);
const sourceBounds = bounds('source', 20);
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
  tailMass: { candidate: candidateBounds.tail, source: sourceBounds.tail },
  interpretation: 'Physical hand and unprized opportunity only; no native games or actual source Energy-removal payment observed'
}, null, 2));
