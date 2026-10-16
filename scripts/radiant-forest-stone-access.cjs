'use strict';

/**
 * Exact opening access to Radiant Eternatus with the published rank-1
 * Forest Seal Stone / Shadow Rider Calyrex V route added. Resource opportunity
 * only: opponent effects, strategic costs and optional draws are excluded.
 *
 * Categories: Radiant, Forest Seal Stone, Shadow Rider V, VMAX,
 * Mysterious Treasure/Quick Ball, Hisuian Heavy Ball, other Basics, remaining.
 */
const GROUPS = Object.freeze([1, 1, 3, 4, 5, 1, 10, 35]);
const [RADIANT, STONE, CALYREX_V, VMAX, SEARCH, HEAVY_BALL, OTHER_BASIC] = [0, 1, 2, 3, 4, 5, 6];

/** @param {number} n */
function chooseTable(n) {
  const rows = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0n));
  for (let i = 0; i <= n; i++) {
    rows[i][0] = 1n;
    rows[i][i] = 1n;
    for (let j = 1; j < i; j++) rows[i][j] = rows[i - 1][j - 1] + rows[i - 1][j];
  }
  return (a, b) => b < 0 || b > a ? 0n : rows[a][b];
}

/**
 * @param {readonly number[]} available
 * @param {number} n
 * @param {(counts:number[],multiplicity:bigint)=>void} callback
 * @param {(a:number,b:number)=>bigint} choose
 */
function enumerate(available, n, callback, choose) {
  const v = Array(available.length).fill(0);
  function visit(i, remaining, weight) {
    if (i === v.length) {
      if (remaining === 0) callback(v.slice(), weight);
      return;
    }
    for (let k = 0; k <= Math.min(available[i], remaining); k++) {
      v[i] = k;
      visit(i + 1, remaining - k, weight * choose(available[i], k));
    }
  }
  visit(0, n, 1n);
}

/**
 * @param {readonly number[]} groups Eight source-card category counts.
 * @param {number} handSize Initial hand size.
 * @param {number} prizeSize Face-down Prize count.
 * @returns {{baseline:number,baselineTwo:number,stoneUnion:number,stoneUnionTwo:number,stoneOnly:number,stoneOnlyTwo:number,validProbability:number,counts:Record<string,string>}}
 */
function exactAccess(groups = GROUPS, handSize = 7, prizeSize = 6) {
  const total = groups.reduce((a, b) => a + b, 0);
  if (groups.length !== 8 || groups.some(n => !Number.isInteger(n) || n < 0) || groups[RADIANT] !== 1 || total <= handSize + prizeSize) {
    throw new Error('Invalid category inventory or dealt-zone sizes');
  }
  const choose = chooseTable(total);
  const tally = {valid:0n, baseline:0n, baselineTwo:0n, stoneUnion:0n, stoneUnionTwo:0n, stoneOnly:0n, stoneOnlyTwo:0n};
  enumerate(groups, handSize, (hand, handMultiplicity) => {
    const remaining = groups.map((n, i) => n - hand[i]);
    const starter = hand[RADIANT] + hand[CALYREX_V] + hand[OTHER_BASIC] > 0;
    const alternateStarter = hand[CALYREX_V] + hand[OTHER_BASIC] > 0;
    for (let drawType = 0; drawType < groups.length; drawType++) {
      if (!remaining[drawType]) continue;
      const seen = hand.slice();
      seen[drawType]++;
      const afterDraw = groups.map((n, i) => n - seen[i]);
      const otherUnseen = total - handSize - 1 - afterDraw[RADIANT] - afterDraw[VMAX];
      for (let prizedRadiant = 0; prizedRadiant <= afterDraw[RADIANT]; prizedRadiant++) {
        for (let prizedVmax = 0; prizedVmax <= Math.min(afterDraw[VMAX], prizeSize - prizedRadiant); prizedVmax++) {
          const prizeMultiplicity = choose(afterDraw[RADIANT], prizedRadiant) * choose(afterDraw[VMAX], prizedVmax) * choose(otherUnseen, prizeSize - prizedRadiant - prizedVmax);
          const weight = handMultiplicity * BigInt(remaining[drawType]) * prizeMultiplicity;
          if (!starter) continue;
          tally.valid += weight;
          if (!alternateStarter) continue;
          const radiantInDeck = afterDraw[RADIANT] - prizedRadiant > 0;
          const baseline = seen[RADIANT] > 0 || (seen[SEARCH] > 0 && radiantInDeck) || (seen[HEAVY_BALL] > 0 && prizedRadiant > 0);
          const stone = seen[STONE] > 0 && seen[CALYREX_V] > 0 && radiantInDeck;
          const twoVmax = afterDraw[VMAX] - prizedVmax >= 2;
          if (baseline) {
            tally.baseline += weight;
            if (twoVmax) tally.baselineTwo += weight;
          }
          if (baseline || stone) {
            tally.stoneUnion += weight;
            if (twoVmax) tally.stoneUnionTwo += weight;
          }
          if (stone && !baseline) {
            tally.stoneOnly += weight;
            if (twoVmax) tally.stoneOnlyTwo += weight;
          }
        }
      }
    }
  }, choose);
  const denominator = choose(total, handSize) * choose(total - handSize, prizeSize) * BigInt(total - handSize - prizeSize);
  const probability = key => Number(tally[key]) / Number(tally.valid);
  return {
    baseline: probability('baseline'),
    baselineTwo: probability('baselineTwo'),
    stoneUnion: probability('stoneUnion'),
    stoneUnionTwo: probability('stoneUnionTwo'),
    stoneOnly: probability('stoneOnly'),
    stoneOnlyTwo: probability('stoneOnlyTwo'),
    validProbability: Number(tally.valid) / Number(denominator),
    counts: Object.fromEntries(Object.entries(tally).map(([k,v]) => [k,v.toString()]))
  };
}

if (require.main === module) console.log(JSON.stringify(exactAccess(), null, 2));
module.exports = {GROUPS, exactAccess};
