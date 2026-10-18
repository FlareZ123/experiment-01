'use strict';

const assert = require('node:assert/strict');

const CATEGORIES = Object.freeze([
  {name:'Oranguru',count:2,basic:true},
  {name:'VIP',count:4,basic:false},
  {name:'Float',count:3,basic:false},
  {name:'Seal',count:2,basic:false},
  {name:'Shake',count:2,basic:false},
  {name:'Trubbish',count:2,basic:true},
  {name:'Garbodor',count:2,basic:false},
  {name:'Crobat',count:1,basic:true},
  {name:'Muscle',count:1,basic:false},
  {name:'OtherBasic',count:6,basic:true},
  {name:'Other',count:35,basic:false}
]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  k = Math.min(k, n - k);
  let ncr = 1n;
  for (let i = 1; i <= k; i++) {
    ncr = ncr * BigInt(n - k + i) / BigInt(i);
  }
  return ncr;
}

/**
 * Exact 7+6+1 physical deal, conditioned on the opening seven containing a
 * Basic. The eighth hand card is distinguished as the normal turn draw.
 * No mulligan bonus, search, ability or other voluntary action is credited.
 * @returns {object}
 */
function census() {
  assert.equal(CATEGORIES.reduce((s, c) => s + c.count, 0), 60);
  const allPrizeWays = choose(52, 6);
  let validWorlds = 0n;
  let heldResourceWorlds = 0n;
  let searchReadyWorlds = 0n;
  let visited = 0;
  const counts = Array(CATEGORIES.length).fill(0);

  /** @param {number} i @param {number} remaining @param {bigint} ways @param {number} basics */
  function enumerate(i, remaining, ways, basics) {
    if (i === CATEGORIES.length) {
      if (remaining !== 0) return;
      visited += 1;
      const validDraws = basics === 0 ? 0 : basics === 1 ? 7 : 8;
      if (!validDraws) return;
      const handWays = ways * BigInt(validDraws);
      validWorlds += handWays * allPrizeWays;
      const hasResources = counts[1] > 0 && counts[4] > 0 &&
        counts[2] + counts[3] + counts[8] > 0;
      if (!hasResources) return;
      heldResourceWorlds += handWays * allPrizeWays;
      const remainingTrubbish = 2 - counts[5];
      const remainingGarbodor = 2 - counts[6];
      if (remainingTrubbish < 1 || remainingGarbodor < 1) return;
      const prizesWithAllTrubbish =
        choose(52 - remainingTrubbish, 6 - remainingTrubbish);
      const prizesWithAllGarbodor =
        choose(52 - remainingGarbodor, 6 - remainingGarbodor);
      const prizesWithBoth =
        choose(52 - remainingTrubbish - remainingGarbodor,
          6 - remainingTrubbish - remainingGarbodor);
      const acceptablePrizeWays = allPrizeWays -
        prizesWithAllTrubbish - prizesWithAllGarbodor + prizesWithBoth;
      searchReadyWorlds += handWays * acceptablePrizeWays;
      return;
    }
    const group = CATEGORIES[i];
    for (let take = 0; take <= Math.min(group.count, remaining); take++) {
      counts[i] = take;
      enumerate(i + 1, remaining - take,
        ways * choose(group.count, take),
        basics + (group.basic ? take : 0));
    }
  }
  enumerate(0, 8, 1n, 0);
  return {
    validWorlds, heldResourceWorlds, searchReadyWorlds, visited,
    resourcePercent: Number(heldResourceWorlds) /
      Number(validWorlds) * 100,
    searchReadyPercent: Number(searchReadyWorlds) /
      Number(validWorlds) * 100
  };
}

if (require.main === module) {
  const result = census();
  process.stdout.write(JSON.stringify({
    ...result,
    validWorlds: result.validWorlds.toString(),
    heldResourceWorlds: result.heldResourceWorlds.toString(),
    searchReadyWorlds: result.searchReadyWorlds.toString(),
    status: 'Source resource upper bound, not actual Store policy success'
  }, null, 2) + '\n');
}

module.exports = {CATEGORIES, choose, census};
