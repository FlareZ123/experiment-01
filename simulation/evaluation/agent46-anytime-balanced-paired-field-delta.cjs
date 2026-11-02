'use strict';

const {anytimePairedFieldDelta} = require('./agent46-anytime-paired-field-delta.cjs');

const VERSION = 'agent46-anytime-balanced-paired-field-delta-v1';

/**
 * A separate preregistered confidence sequence for independent, complete
 * equal-cell rounds. Every round contains one original-source trial PAIR in
 * each of C cells (32 ranks, 64 rank/seat, 128 rank/seat/start). The candidate
 * and reference arms may both be censored or come from different physical
 * source deals, but cannot be removed from the registered denominator.
 *
 * The existing paired-cell validator supplies pathwise interval means,
 * including full [-1,1] ambiguity for mismatched source fingerprints.
 * Pooling is valid only with independent latent pair outcomes ACROSS cells
 * AND rounds under one frozen paper game protocol and a source sampling
 * design. Dependencies between reference and challenger arms in the SAME
 * pair are allowed; these form one bounded difference D in [-1,1].
 *
 * Define rounds r=1..n with C independent pair differences per round.
 * Hoeffding on C*n bounded independent differences whose expected values
 * may vary by cell gives
 *   radius = sqrt(2 log(2*k*(k+1)*n*(n+1)/alpha)/(C*n)).
 * A union budget delta(k,n)=alpha/[k(k+1)n(n+1)] protects all candidate
 * comparison ordinals and all balanced-round sample sizes. Adaptive
 * selection of the more favorable balanced and unbalanced estimator is
 * NOT protected; choose the estimator before observing any outcomes or
 * preregister a separate alpha split.
 *
 * Missing cells, unequal rounds or ambiguous round labels fail closed.
 * A pair that exists but is native-error/censored is still an included
 * pair with an unknown outcome. The roundId on each pair must be the
 * same across all field cells for the same ordinal index and must be
 * unique across rounds. Only a frozen external registration proves those
 * ids correspond to prospectively allocated independent draws.
 *
 * @typedef {import('./agent46-anytime-paired-field-delta.cjs')} BaseModule
 * @param {{
 *  candidateOrdinal:number,
 *  cells:Array<Array<{
 *    pairId:string, roundId:string, referenceFingerprint:string,
 *    challengerFingerprint:string, referenceStatus:string,
 *    challengerStatus:string
 *  }>>,
 *  alpha?:number,targetDelta?:number
 * }} config
 * @returns {object} Mathematical contrast envelope; never game certification.
 */
function anytimeBalancedPairedFieldDelta(config) {
  const base = anytimePairedFieldDelta(config);
  const cells = config.cells;
  const n = cells[0].length;
  if (!cells.every(pairs => pairs.length === n)) {
    throw new TypeError('Balanced confidence requires one registered pair per cell per identical round');
  }
  const usedRounds = new Set();
  for (let round = 0; round < n; round++) {
    const id = cells[0][round].roundId;
    if (typeof id !== 'string' || !id || usedRounds.has(id) ||
        !cells.every(pairs => pairs[round].roundId === id)) {
      throw new TypeError('Every balanced round must have one unique common registered roundId');
    }
    usedRounds.add(id);
  }
  if (n === 0) {
    return {
      ...base, version:VERSION, method:'BALANCED_INDEPENDENT_CELLS',
      completedRounds:0, radius:null, lowerFieldDelta:-1,
      upperFieldDelta:1, decision:'INSUFFICIENT_INFORMATION',
      qualification:base.qualification+
        ' Extra requirement: independent latent pair outcomes across all field cells and complete registered rounds.'
    };
  }
  const C=base.cellCount;
  const empiricalLower=base.intervals.reduce((sum, row)=>sum+row.observedLower,0)/C;
  const empiricalUpper=base.intervals.reduce((sum, row)=>sum+row.observedUpper,0)/C;
  const k=config.candidateOrdinal;
  const alpha=base.alpha;
  const logBudget=Math.log(2/alpha)+Math.log(k)+Math.log(k+1)+
    Math.log(n)+Math.log(n+1);
  const radius=Math.sqrt(2*logBudget/(C*n));
  const lowerFieldDelta=Math.max(-1,empiricalLower-radius);
  const upperFieldDelta=Math.min(1,empiricalUpper+radius);
  return {
    ...base, version:VERSION, method:'BALANCED_INDEPENDENT_CELLS',
    completedRounds:n, empiricalLower, empiricalUpper, radius,
    lowerFieldDelta,upperFieldDelta,
    decision:lowerFieldDelta>base.targetDelta?'IMPROVEMENT_ABOVE_TARGET':
      upperFieldDelta<base.targetDelta?'UNDERPERFORMANCE_BELOW_TARGET':
      'INSUFFICIENT_INFORMATION',
    qualification:base.qualification+
      ' Extra requirement: independent latent pair outcomes across all field cells and complete registered rounds. This method must be preregistered instead of selected adaptively against the per-cell method.'
  };
}

module.exports = {VERSION,anytimeBalancedPairedFieldDelta};
