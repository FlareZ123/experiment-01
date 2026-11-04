'use strict';

const VERSION='agent10-heterogeneous-balanced-one-loss-cert-v1';

/**
 * Exact binomial lower tail P(L <= 1) for N games with a common failure
 * probability. Under Hoeffding's Poisson-binomial comparison, this is also
 * a valid upper bound for independent heterogeneous failures at average
 * failure probability >= r, provided N*r >= 2.
 *
 * @param {number} n Positive number of independent trials.
 * @param {number} q Maximum null mean per-game win probability.
 * @returns {number}
 */
function atMostOneLossUpperTail(n,q){
  if(!Number.isSafeInteger(n)||n<1||!Number.isFinite(q)||
    q<=0||q>=1||n*(1-q)<2)
    throw new RangeError('One-loss heterogeneous comparison needs N*(1-q)>=2');
  return Math.pow(q,n-1)*(q+n*(1-q));
}

/**
 * Sufficient one-sided familywise all-but-one-wins certificate across
 * prospectively fixed deck/policy candidates and exactly balanced cells.
 * A paper qualified loss must be counted; draws/invalid runs are not wins.
 *
 * @param {{cellCount:number,candidateCount?:number,
 *   alpha?:number,target?:number}} input
 * @returns {object}
 */
function oneLossBalancedCertificate(input){
  const {cellCount,candidateCount=1,alpha=0.05,target=0.995}=input;
  if(!Number.isSafeInteger(cellCount)||cellCount<1||
    !Number.isSafeInteger(candidateCount)||candidateCount<1||
    !Number.isFinite(alpha)||alpha<=0||alpha>=1||
    !Number.isFinite(target)||target<=0||target>=1)
    throw new RangeError('Invalid balanced confidence design');
  let perCell=Math.ceil(2/(cellCount*(1-target)));
  while(candidateCount*
    atMostOneLossUpperTail(cellCount*perCell,target)>alpha)
    perCell++;
  const totalPerCandidate=cellCount*perCell;
  const bound=candidateCount*
    atMostOneLossUpperTail(totalPerCandidate,target);
  const previous=perCell>1&&cellCount*(perCell-1)*(1-target)>=2?
    candidateCount*atMostOneLossUpperTail(
      cellCount*(perCell-1),target):null;
  return {schema:VERSION,candidateCount,cellCount,alpha,target,
    perCell,totalPerCandidate,
    largestAllowedNumberOfLosses:1,
    familywiseNullUpperBound:bound,
    precedingBalancedPanelNullBound:previous,
    method:'Hoeffding 1956 Poisson-binomial lower-tail comparison plus Bonferroni',
    theoremPreconditionSatisfied:totalPerCandidate*(1-target)>=2,
    independentlyQualifiedActualPaperGames:0,
    certifiedCompetitiveDeck:false};
}
module.exports={VERSION,atMostOneLossUpperTail,oneLossBalancedCertificate};
