'use strict';

const VERSION='agent10-fixed-candidate-familywise-zero-loss-v1';

/**
 * Sufficient family-wise 95% all-win certificate for K prospectively
 * registered fixed deck/policy pairs, before selecting the best outcome.
 * Bonferroni holds regardless of dependence between candidate tests.
 * Independent Bernoulli games within each fixed cell are still required.
 *
 * @param {{candidateCount:number,cellCount:number,alpha?:number,target?:number}} input
 * @returns {object}
 */
function fixedCandidateFamilywiseThreshold(input){
  const {candidateCount,cellCount,alpha=0.05,target=0.995}=input;
  if(!Number.isSafeInteger(candidateCount)||candidateCount<1||
     !Number.isSafeInteger(cellCount)||cellCount<1||
     !Number.isFinite(alpha)||alpha<=0||alpha>=1||
     !Number.isFinite(target)||target<=0||target>=1)
    throw new RangeError('Require positive integer candidate/cell counts and probabilities in (0,1)');
  const logAlpha=Math.log(alpha/candidateCount);
  const logTarget=Math.log(target);
  let perCell=Math.max(1,Math.ceil(logAlpha/(cellCount*logTarget)));
  // Floating-point ceiling at a power boundary must never silently pass.
  while(candidateCount*Math.pow(target,cellCount*perCell)>alpha)perCell++;
  while(perCell>1&&
    candidateCount*Math.pow(target,cellCount*(perCell-1))<=alpha)
    perCell--;
  const totalPerCandidate=cellCount*perCell;
  const totalAcrossFamily=candidateCount*totalPerCandidate;
  const familywiseNullBound=candidateCount*
    Math.pow(target,totalPerCandidate);
  const lowerBoundForSelectedAllWin=
    Math.pow(alpha/candidateCount,1/totalPerCandidate);
  return {schema:VERSION,candidateCount,cellCount,
    alpha,target,perCell,totalPerCandidate,totalAcrossFamily,
    familywiseNullBound,lowerBoundForSelectedAllWin,
    requirement:'All successes in every preregistered fixed candidate panel used for possible selection; if only selected candidate is tested after design freeze, K=1 applies to its independent confirmatory panel',
    notCertifiedByCalculation:true,competitiveGamesQualified:0};
}
module.exports={VERSION,fixedCandidateFamilywiseThreshold};
