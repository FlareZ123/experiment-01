'use strict';

/**
 * Exact raw source-first Stadium-response access against an Active Jellicent
 * ex + Silent Lab lock. The source has 4 Basic Iron Thorns ex, `s` Stadiums,
 * two Guzma & Hala, two Tag Call, six Prize cards, and two ordinary draws:
 * one on source T1 (before lock), one on source T2 (after candidate lock).
 *
 * It conditions source opening seven on a valid Basic and counts merely
 * whether a Stadium was seen by T2, Guzma & Hala was seen with a searchable
 * Stadium, or Tag Call was held by T1 and could fetch Guzma & Hala while
 * Item play was still open. It assumes source strategically preserves its
 * Stadium/Guzma & Hala for the reply and exercises a playable Tag Call T1;
 * it excludes candidate/source mulligan bonus, other card actions, discard,
 * Supporter contention, native engine execution and opponent responses.
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 0 || k > n) return 0n;
  let r = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++) {
    r = r * BigInt(n - i + 1) / BigInt(i);
  }
  return r;
}

/** @param {bigint} numerator @param {bigint} denominator */
function fraction(numerator, denominator) {
  return Number(numerator) / Number(denominator);
}

/**
 * @param {number} stadiumCopies
 * @returns {{
 *  directStadium:number, directStadiumOrGuzmaHala:number,
 *  supportedTagCallIncrement:number, combinedCounterAccess:number,
 *  allStadiumPrizedGhCorrection:number
 * }}
 */
function sourceStadiumReply(stadiumCopies) {
  const s = stadiumCopies;
  if (!Number.isInteger(s) || s < 1 || s > 4 * 4) {
    throw new RangeError('Stadium count must be 1..16');
  }
  const nBasic = 4, nGuzmaHala = 2, nTagCall = 2;
  const valid = choose(60, 7) - choose(60 - nBasic, 7);

  /** @param {number} excluded */
  const noSeenByT2 = excluded => fraction(
    (choose(60 - excluded, 7) - choose(60 - excluded - nBasic, 7)) *
      BigInt(53 - excluded) * BigInt(52 - excluded),
    valid * 53n * 52n
  );
  const noStadium = noSeenByT2(s);
  const noStadiumOrGH = noSeenByT2(s + nGuzmaHala);
  const directStadium = 1 - noStadium;
  const directStadiumOrGuzmaHala = 1 - noStadiumOrGH;

  // Given no Stadium or G&H in 9 visible draws, six Prizes reside among
  // the other 51 cards. A held GH fails if *all* Stadiums were Prized.
  const prizeDenominator = choose(51, 6);
  const allStadiumPrized = fraction(choose(51 - s, 6 - s), prizeDenominator);
  const allGuzmaHalaPrized =
    fraction(choose(51 - nGuzmaHala, 6 - nGuzmaHala), prizeDenominator);
  const bothPrized = fraction(
    choose(51 - s - nGuzmaHala, 6 - s - nGuzmaHala),
    prizeDenominator
  );
  const allStadiumPrizedGhCorrection =
    (noStadium - noStadiumOrGH) * allStadiumPrized;

  // Tag Call must have been held by source T1, *before* Item lock.
  // Exclude GH and Stadium from first 9; exclude Tag Call from first 8.
  const noSgAndNoTagByT1 = fraction(
    (choose(60 - s - nGuzmaHala - nTagCall, 7) -
      choose(60 - s - nGuzmaHala - nTagCall - nBasic, 7)) *
      BigInt(53 - s - nGuzmaHala - nTagCall) *
      BigInt(52 - s - nGuzmaHala),
    valid * 53n * 52n
  );
  const heldTagByT1WithoutNaturalCounter =
    noStadiumOrGH - noSgAndNoTagByT1;
  const searchSurvival =
    1 - allGuzmaHalaPrized - allStadiumPrized + bothPrized;
  const supportedTagCallIncrement =
    heldTagByT1WithoutNaturalCounter * searchSurvival;
  return {
    directStadium,
    directStadiumOrGuzmaHala,
    supportedTagCallIncrement,
    combinedCounterAccess:
      directStadiumOrGuzmaHala - allStadiumPrizedGhCorrection +
      supportedTagCallIncrement,
    allStadiumPrizedGhCorrection
  };
}

module.exports = { choose, sourceStadiumReply };
