'use strict';

/**
 * Exact first-own-turn, no-mulligan-bonus opening access for Active
 * Frillish -> Jellicent ex under Silent Lab against Basic Ability lock.
 * Draw model: opening 7, one ordinary turn draw, six face-down Prizes.
 *
 * Wally evolves Active Frillish directly going second. Boost Shake does so
 * with an Item but ends the turn. Arven can find Boost Shake (not a Stadium);
 * Guzma & Hala can find Silent Lab (not an Item). At most one Supporter is
 * used. Going first, no Supporter route is available.
 *
 * This evaluates access, not a native-played line, resistance to opposing
 * Stadium/Guzma effects, effectiveness of Ability lock, or win probability.
 *
 * @typedef {{
 *  frillish?:number, boostShake?:number, jellicent?:number,
 *  silentLab?:number, arven?:number, guzmaHala?:number, wally?:number,
 *  totalBasics?:number, goingSecond?:boolean
 * }} OpeningOptions
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0n;
  let result = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    result = result * BigInt(n - i + 1) / BigInt(i);
  }
  return result;
}

/**
 * @param {number[]} sizes
 * @param {number} offset
 * @param {number} remaining
 * @param {number[]} taken
 * @param {(counts:number[])=>void} visit
 */
function enumerate(sizes, offset, remaining, taken, visit) {
  if (offset === sizes.length - 1) {
    if (remaining <= sizes[offset]) visit([...taken, remaining]);
    return;
  }
  for (let n = 0; n <= Math.min(remaining, sizes[offset]); n++) {
    taken.push(n);
    enumerate(sizes, offset + 1, remaining - n, taken, visit);
    taken.pop();
  }
}

/**
 * @param {OpeningOptions} [options]
 * @returns {{
 *  numerator:bigint, denominator:bigint, validBasicDenominator:bigint,
 *  rawProbability:number, basicValidProbability:number
 * }}
 */
function exactSilentLabOpening(options = {}) {
  const f = options.frillish ?? 4;
  const b = options.boostShake ?? 4;
  const j = options.jellicent ?? 4;
  const l = options.silentLab ?? 4;
  const a = options.arven ?? 0;
  const g = options.guzmaHala ?? 0;
  const w = options.wally ?? 0;
  const basics = options.totalBasics ?? 12;
  const second = options.goingSecond === true;
  const counts = [f, b, j, l, a, g, w];
  if (counts.some(n => !Number.isInteger(n) || n < 0 || n > 4)) {
    throw new RangeError('Each named card count must be an integer from 0 to 4');
  }
  if (!Number.isInteger(basics) || basics < f || basics > 60 - b - j - l - a - g - w) {
    throw new RangeError('totalBasics conflicts with the stated 60-card slots');
  }
  const sizes = [...counts, 60 - counts.reduce((sum, n) => sum + n, 0)];
  const prizeWays = choose(52, 6);
  const denominator = choose(60, 7) * 53n * prizeWays;
  const validBasicDenominator = (choose(60, 7) - choose(60 - basics, 7)) * 53n * prizeWays;
  let numerator = 0n;

  enumerate(sizes, 0, 7, [], hand => {
    if (hand[0] === 0) return; // Only original setup Basics can be Active.
    const handWays = hand.reduce((ways, value, i) => ways * choose(sizes[i], value), 1n);
    for (let draw = 0; draw < sizes.length; draw++) {
      const drawWays = sizes[draw] - hand[draw];
      if (drawWays === 0) continue;
      const held = hand.map((n, i) => n + Number(i === draw));
      const [, heldBoost, heldJellicent, heldLab, heldArven, heldGuzmaHala, heldWally] = held;
      const boostRemain = b - heldBoost;
      const jellicentRemain = j - heldJellicent;
      const labRemain = l - heldLab;
      if (jellicentRemain === 0) continue; // Must find Jellicent in deck.

      let qualifyingPrizes = 0n;
      for (let prizedJ = 0; prizedJ <= Math.min(6, jellicentRemain); prizedJ++) {
        if (prizedJ === jellicentRemain) continue;
        for (let prizedB = 0; prizedB <= Math.min(6 - prizedJ, boostRemain); prizedB++) {
          for (let prizedL = 0; prizedL <= Math.min(6 - prizedJ - prizedB, labRemain); prizedL++) {
            const prizedOther = 6 - prizedJ - prizedB - prizedL;
            const ways =
              choose(jellicentRemain, prizedJ) *
              choose(boostRemain, prizedB) *
              choose(labRemain, prizedL) *
              choose(52 - jellicentRemain - boostRemain - labRemain, prizedOther);
            if (ways === 0n) continue;

            const boostAccessible = heldBoost > 0 || boostRemain > prizedB;
            const labAccessible = heldLab > 0 || labRemain > prizedL;
            const directShake = heldBoost > 0 && heldLab > 0;
            const arvenShake = second && heldArven > 0 && heldLab > 0 && boostAccessible;
            const guzmaHalaShake = second && heldGuzmaHala > 0 &&
              heldBoost > 0 && labAccessible;
            const wallyEvolution = second && heldWally > 0 && heldLab > 0;
            if (directShake || arvenShake || guzmaHalaShake || wallyEvolution) {
              qualifyingPrizes += ways;
            }
          }
        }
      }
      numerator += handWays * BigInt(drawWays) * qualifyingPrizes;
    }
  });

  return {
    numerator,
    denominator,
    validBasicDenominator,
    rawProbability: Number(numerator) / Number(denominator),
    basicValidProbability: Number(numerator) / Number(validBasicDenominator)
  };
}

module.exports = { choose, exactSilentLabOpening };
