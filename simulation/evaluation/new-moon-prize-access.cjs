'use strict';

const assert = require('node:assert/strict');
const source = require('../../results/als/new-moon-perfection-source-60.json');

/**
 * Exact number of k-subsets of n distinguishable physical cards.
 * @param {number} n
 * @param {number} k
 * @returns {bigint}
 */
function choose(n, k) {
  if (k > n || k < 0) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) {
    result = result * BigInt(n - i + 1) / BigInt(i);
  }
  return result;
}

/**
 * Initial-six-Prize inventory feasibility only. A prize-retrieval item is
 * physically unprized if and only if its copy is outside those six. This
 * does not assume that the player can actually draw or tutor any such Item.
 *
 * @returns {object}
 */
function assess() {
  const copies = name => source.entries
    .filter(card => card.name_en === name)
    .reduce((sum, card) => sum + card.count, 0);
  const total = source.entries.reduce((sum, card) => sum + card.count, 0);
  assert.equal(total, 60);
  const singletonLunatone = copies('Lunatone');
  const singletonSolrock = copies('Solrock');
  const heavyBalls = copies('Hisuian Heavy Ball');
  assert.deepEqual([singletonLunatone,singletonSolrock,heavyBalls],[1,1,2]);
  const remaining = total - singletonLunatone - singletonSolrock - heavyBalls;
  const possiblePrizeSets = choose(total,6);
  let anyProtectedPrized = 0n;
  let bothProtectedPrized = 0n;
  let physicallyInadequate = 0n;
  let oneKeyBothBallsPrized = 0n;
  let twoKeysAtLeastOneBallPrized = 0n;
  const scenarios = [];
  for (let luna = 0; luna <= 1; luna += 1) {
    for (let solrock = 0; solrock <= 1; solrock += 1) {
      for (let ballPrized = 0; ballPrized <= 2; ballPrized += 1) {
        const rest = 6 - luna - solrock - ballPrized;
        const ways = choose(1,luna) * choose(1,solrock) *
          choose(2,ballPrized) * choose(remaining,rest);
        const keyPrized = luna + solrock;
        const recoveriesOutsidePrizes = heavyBalls - ballPrized;
        if (keyPrized > 0) anyProtectedPrized += ways;
        if (keyPrized === 2) bothProtectedPrized += ways;
        const shortage = keyPrized > recoveriesOutsidePrizes;
        if (shortage) physicallyInadequate += ways;
        if (keyPrized === 1 && ballPrized === 2) oneKeyBothBallsPrized += ways;
        if (keyPrized === 2 && ballPrized >= 1) twoKeysAtLeastOneBallPrized += ways;
        scenarios.push({
          lunaPrized:luna,solrockPrized:solrock,heavyBallsPrized:ballPrized,
          prizeConfigurations:Number(ways),
          enoughPhysicallyUnprizedHeavyBalls:!shortage
        });
      }
    }
  }
  assert.equal(scenarios.reduce((sum,row) => sum + row.prizeConfigurations,0),
    Number(possiblePrizeSets));

  /** @param {bigint} ways */
  const record = ways => ({
    configurations:Number(ways),
    fractionOfInitialPrizeSets:Number(ways)/Number(possiblePrizeSets)
  });
  return {
    kind:'initial-six-prize-hisuian-heavy-ball-inventory-exact-enumeration',
    source:source.official_japanese_deck_code,
    totalPhysicalCards:total,prizeCards:6,
    composition:{lunatone:1,solrock:1,hisuianHeavyBall:2,other:remaining},
    sampleSpace:Number(possiblePrizeSets),
    atLeastOneKeyPrized:record(anyProtectedPrized),
    bothKeyPrized:record(bothProtectedPrized),
    physicallyInsufficientUnprizedHeavyBalls:record(physicallyInadequate),
    decomposition:{
      exactlyOneKeyWithBothBallsPrized:record(oneKeyBothBallsPrized),
      bothKeysWithAtLeastOneBallPrized:record(twoKeysAtLeastOneBallPrized)
    },
    scenarios,
    limitation:'Physical inventory only: a Heavy Ball may be undiscovered, Item-locked, or its use may be contested. Taking Prizes or winning without the pair can recover a shortage. No game-loss conclusion.'
  };
}

/**
 * Joint draw of an initial seven and six face-down Prizes. Source has 17
 * Basic Pokemon: every Pokemon entry except the two Stage-1 Dusclops.
 * Condition on the first seven containing at least one Basic Pokemon.
 * The conditional Prize distribution is not the unconditional C(60,6) law.
 *
 * @returns {object}
 */
function assessLegalOpening() {
  const basics = source.entries
    .filter(entry => entry.type === 'Pokémon' && entry.name_en !== 'Dusclops')
    .reduce((total, entry) => total + entry.count, 0);
  assert.equal(basics, 17, 'Source Basic inventory changed');
  const otherBasics = basics - 2;
  const otherNonBasics = 60 - basics - 2;
  assert.deepEqual([otherBasics, otherNonBasics], [15, 41]);
  const handsPerPrizeSet = choose(54, 7);
  const possibleJointDeals = choose(60, 6) * handsPerPrizeSet;
  let eligibleJointDeals = 0n;
  let shortageDeals = 0n;
  let oneKeyDeals = 0n;
  let bothKeyDeals = 0n;

  for (let luna = 0; luna <= 1; luna += 1) {
    for (let solrock = 0; solrock <= 1; solrock += 1) {
      for (let balls = 0; balls <= 2; balls += 1) {
        for (let otherBasicPrized = 0; otherBasicPrized <= 6; otherBasicPrized += 1) {
          const otherNonBasicPrized = 6-luna-solrock-balls-otherBasicPrized;
          const prizeWays = choose(1,luna) * choose(1,solrock) *
            choose(2,balls) * choose(otherBasics,otherBasicPrized) *
            choose(otherNonBasics,otherNonBasicPrized);
          const nonBasicsRemaining = 43 - balls - otherNonBasicPrized;
          const eligibleHands = handsPerPrizeSet - choose(nonBasicsRemaining,7);
          const weight = prizeWays * eligibleHands;
          eligibleJointDeals += weight;
          const singletonKeysPrized = luna + solrock;
          if (singletonKeysPrized > 0) oneKeyDeals += weight;
          if (singletonKeysPrized === 2) bothKeyDeals += weight;
          if (singletonKeysPrized > 2 - balls) shortageDeals += weight;
        }
      }
    }
  }
  const expectedOpeningWays = possibleJointDeals *
    (choose(60,7) - choose(43,7)) / choose(60,7);
  assert.equal(eligibleJointDeals, expectedOpeningWays);
  return {
    kind:'legal-opening-conditional-six-prize-heavy-ball-capacity-exact',
    sourceDeckCode:source.official_japanese_deck_code,
    totalPhysicalCards:60,
    basics:17,
    sevenCardHand:7,
    prizeCards:6,
    eligibleJointDeals:eligibleJointDeals.toString(),
    allJointDeals:possibleJointDeals.toString(),
    eligibleOpeningProbability:Number(eligibleJointDeals)/Number(possibleJointDeals),
    atLeastOneKeyPrizedProbability:Number(oneKeyDeals)/Number(eligibleJointDeals),
    bothKeysPrizedProbability:Number(bothKeyDeals)/Number(eligibleJointDeals),
    insufficientHeavyBallsProbability:Number(shortageDeals)/Number(eligibleJointDeals),
    insufficientHeavyBallsConfigurations:shortageDeals.toString(),
    limitations:'Condition on valid first seven only. No mulligan bonus, actual draw/search access, tactical relevance or future Prize taking. Not a game loss estimate.'
  };
}

if (require.main === module) console.log(JSON.stringify({unconditional:assess(),legalOpening:assessLegalOpening()},null,2));
module.exports = {choose,assess,assessLegalOpening};

