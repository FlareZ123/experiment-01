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

if (require.main === module) console.log(JSON.stringify(assess(),null,2));
module.exports = {choose,assess};
