'use strict';

const VERSION = 'agent46-anytime-paired-field-delta-v1';
const FINISHED = new Map([['QUALIFIED_WIN', [1, 1]], ['QUALIFIED_NONWIN', [0, 0]]]);
const UNKNOWN = [0, 1];

/**
 * Simultaneous anytime Hoeffding bounds for the balanced field-average
 * difference in two frozen decks' game-win probabilities. A physical source
 * deal produces exactly two registered arms, one for each unchanged deck.
 * The reference and challenger share an authenticated original-source setup;
 * the candidate decks may of course have different own hands/boards.
 *
 * The n-th bounded, latent paired score is
 *   D_n = 1{challenger won game n} - 1{reference won game n}, in [-1,1].
 * An unqualified or unfinished arm has unknown success in [0,1]; it stays in
 * the denominator even if only one arm completed. The observed pair interval
 * pathwise contains D_n under any missingness mechanism.
 *
 * For candidate comparison ordinal k, C prespecified equal-weight cells,
 * and n registered matched pairs in cell i, spend
 *   delta(k,i,n) = alpha / (k(k+1) C n(n+1)).
 * The sum over every k,i,n is alpha. Hoeffding for range two gives
 *   epsilon = sqrt(2 log(2/delta)/n).
 * This covers every sequential look and every registered candidate ordinal,
 * assuming independent, identically distributed *latent game pairs* within
 * each cell under fixed paper rules, policies, match clock and deal sampler.
 * Optional stopping and missingness do not invalidate the enclosure because
 * every censored pair remains bounded and counted. Data-dependent choice of
 * C, retrospective seed selection or modification of the reference void the
 * advertised familywise guarantee; alpha must be split with other analyses.
 *
 * IMPORTANT: Qualified outcome labels are external attestations. This tool
 * cannot independently inspect native game rules or certify paper games.
 * The equality of fingerprints is a necessary matching condition, not proof
 * that every other aspect of the arm was equal or legal.
 *
 * @typedef {'QUALIFIED_WIN'|'QUALIFIED_NONWIN'|'CENSORED'} Status
 * @typedef {{
 *   pairId:string, referenceFingerprint:string, challengerFingerprint:string,
 *   referenceStatus:Status, challengerStatus:Status
 * }} Pair
 * @param {{candidateOrdinal:number,cells:Pair[][],alpha?:number,targetDelta?:number}} config
 * @returns {object} Statistical envelope, not qualification of real matches.
 */
function anytimePairedFieldDelta(config) {
  const {candidateOrdinal, cells} = config ?? {};
  const alpha = config?.alpha ?? 0.05;
  const targetDelta = config?.targetDelta ?? 0;
  if (!Number.isSafeInteger(candidateOrdinal) || candidateOrdinal < 1 ||
      !Array.isArray(cells) || ![32, 64, 128].includes(cells.length) ||
      !Number.isFinite(alpha) || alpha <= 0 || alpha >= 1 ||
      !Number.isFinite(targetDelta) || targetDelta < -1 || targetDelta > 1) {
    throw new TypeError('Expected ordinal>=1, 32/64/128 cells, alpha in (0,1), targetDelta in [-1,1]');
  }
  const seen = new Set();
  const C = cells.length;
  let totalPairs = 0;
  let censoredPairs = 0;
  const intervals = cells.map((pairs, cellIndex) => {
    if (!Array.isArray(pairs)) throw new TypeError('Cell must be an array of registered physical-deal pairs');
    const n = pairs.length;
    if (!Number.isSafeInteger(totalPairs + n)) throw new RangeError('Pair count exceeds safe integer precision');
    totalPairs += n;
    let observedLower = 0;
    let observedUpper = 0;
    let pending = 0;
    for (const pair of pairs) {
      if (!pair || typeof pair.pairId !== 'string' || !pair.pairId ||
          seen.has(pair.pairId) || typeof pair.referenceFingerprint !== 'string' ||
          !pair.referenceFingerprint || typeof pair.challengerFingerprint !== 'string' ||
          pair.referenceFingerprint !== pair.challengerFingerprint) {
        throw new TypeError('Duplicate pair, missing ID, or unmatched source physical-deal fingerprint');
      }
      seen.add(pair.pairId);
      if (!FINISHED.has(pair.referenceStatus) && pair.referenceStatus !== 'CENSORED' ||
          !FINISHED.has(pair.challengerStatus) && pair.challengerStatus !== 'CENSORED') {
        throw new TypeError('Arms must be independently QUALIFIED_WIN, QUALIFIED_NONWIN or CENSORED');
      }
      const [rlo, rhi] = FINISHED.get(pair.referenceStatus) ?? UNKNOWN;
      const [clo, chi] = FINISHED.get(pair.challengerStatus) ?? UNKNOWN;
      observedLower += clo - rhi;
      observedUpper += chi - rlo;
      if (pair.referenceStatus === 'CENSORED' || pair.challengerStatus === 'CENSORED') pending++;
    }
    censoredPairs += pending;
    if (!n) return {cell:cellIndex + 1, pairs:0, censoredPairs:0,
      observedLower:null, observedUpper:null, radius:null,
      lower:-1, upper:1, untested:true};
    // Split the logarithm into sums to avoid unsafe intermediate products.
    const logBudget = Math.log(2 * C / alpha) +
      Math.log(candidateOrdinal) + Math.log(candidateOrdinal + 1) +
      Math.log(n) + Math.log(n + 1);
    const radius = Math.sqrt(2 * logBudget / n);
    return {cell:cellIndex + 1, pairs:n, censoredPairs:pending,
      observedLower:observedLower / n, observedUpper:observedUpper / n,
      radius, lower:Math.max(-1, observedLower / n - radius),
      upper:Math.min(1, observedUpper / n + radius), untested:false};
  });
  const lowerFieldDelta = intervals.reduce((sum, row) => sum + row.lower, 0) / C;
  const upperFieldDelta = intervals.reduce((sum, row) => sum + row.upper, 0) / C;
  return {
    version:VERSION, candidateOrdinal, alpha, targetDelta, cellCount:C,
    registeredPairs:totalPairs, censoredPairs,
    untestedCells:intervals.filter(row => row.untested).length,
    lowerFieldDelta, upperFieldDelta,
    decision:lowerFieldDelta > targetDelta ? 'IMPROVEMENT_ABOVE_TARGET' :
      upperFieldDelta < targetDelta ? 'UNDERPERFORMANCE_BELOW_TARGET' :
      'INSUFFICIENT_INFORMATION',
    intervals,
    competitiveQualified:false,
    qualification:'Statistical paired-deal envelope only; requires independently certified full paper games, identical frozen policies, original source fingerprints, both seats, clock, opponent competence and complete prospective attempt registration.'
  };
}

module.exports = {VERSION, anytimePairedFieldDelta};
