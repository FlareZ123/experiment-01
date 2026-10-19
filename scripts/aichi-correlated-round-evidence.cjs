'use strict';

const {
  assessFieldEvidence,
  CELLS_PER_ROUND,
  ZERO_LOSS_WEIGHT,
  LAMBDAS
}=require('./aichi-anytime-field-evidence.cjs');

/** @param {number[]} terms Natural logarithms of nonnegative e-process components. */
function logSumExp(terms) {
  const max=Math.max(...terms);
  if(max===-Infinity) return max;
  return max+Math.log(terms.reduce((sum,term)=>sum+Math.exp(term-max),0));
}

/**
 * Correlation-robust, anytime-valid field-mean evidence over COMPLETE 64-cell
 * rounds. Requires E[roundWins/64 | all previous rounds] <= nullMean under H0.
 * No independence is required among the 64 observations within a round.
 *
 * All provenance, actual-start, outcome, frozen-policy, duplicate ID and seed
 * guards are inherited from the established full-field validator.
 * @param {Array<Array<object>>} rounds
 * @param {{nullMean?:number,alpha?:number}} [options]
 */
function assessCorrelatedFieldEvidence(rounds,options={}) {
  const validated=assessFieldEvidence(rounds,options);
  const {nullMean:q,alpha}=validated;
  const boundary=-Math.log(alpha);
  const finiteWeight=Math.log((1-ZERO_LOSS_WEIGHT)/LAMBDAS.length);
  let wins=0,firstCrossedAtRound=null,logEValue=0;

  for(let i=0;i<rounds.length;i++) {
    wins+=rounds[i].filter(game=>game.outcome==='win').length;
    const completed=i+1;
    const perfect=wins===completed*CELLS_PER_ROUND;
    // Perfect correlation within a round can make all 64 cells win together;
    // its null probability is bounded by q per round, never by q^64.
    const terms=[perfect ?
      Math.log(ZERO_LOSS_WEIGHT)-completed*Math.log(q) : -Infinity];
    for(const lambda of LAMBDAS) {
      // Convexity: exp(lambda*y) <= 1+y*(exp(lambda)-1) for 0<=y<=1.
      const logNormalizer=lambda+Math.log(q+(1-q)*Math.exp(-lambda));
      terms.push(finiteWeight+lambda*wins/CELLS_PER_ROUND-
        completed*logNormalizer);
    }
    logEValue=logSumExp(terms);
    if(firstCrossedAtRound===null&&logEValue>=boundary)
      firstCrossedAtRound=completed;
  }
  return {
    ...validated,
    model:'conditional-round-mean-arbitrary-within-round-dependence-v1',
    logEValue,
    eValue:Math.exp(logEValue),
    currentCrosses:logEValue>=boundary,
    everCrossed:firstCrossedAtRound!==null,
    firstCrossedAtRound
  };
}

module.exports={assessCorrelatedFieldEvidence};
