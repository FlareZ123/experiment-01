'use strict';

const VERSION='agent46-anytime-field-mean-envelope-v1';

/**
 * An anytime two-sided Hoeffding envelope for one stable candidate's
 * separately sampled, equal-weight opponent cells. Each candidate is
 * assigned a unique positive ordinal before its first match, not after
 * selecting favorable data. The countably infinite union budget
 *
 *   alpha / [k(k+1) * C * n(n+1)]
 *
 * spans candidate ordinal k, cell i from 1 to C and cell sample count
 * n from 1 upward. The double sums of 1/[m(m+1)] each equal one.
 * For any fixed iid Bernoulli cell sequence and any sequential checking
 * schedule, simultaneous failure probability is at most alpha.
 *
 * Censored attempts enter the denominator and can be wins or non-wins:
 * [wins/n, (wins+censored)/n] sandwiches the unobserved true empirical
 * success rate on the attempted sequence. With two-sided Hoeffding radius
 * epsilon, the entire possible true cell rate is inside
 * [wins/n-epsilon, (wins+censored)/n+epsilon] except on the coverage event.
 *
 * Assumes a frozen deck, policies, matchup field, game protocol and
 * independent prospectively generated physical deals within each cell.
 * It cannot establish paper legal behavior, competent opponent play,
 * clock adjudication, or that a censored engine game has a real winner.
 *
 * @param {{
 *   candidateOrdinal:number,
 *   cells:Array<{wins:number,nonWins:number,censored:number}>,
 *   alpha?:number,target?:number
 * }} config
 * @returns {object} Simultaneous anytime field-mean coverage envelope.
 */
function anytimeFieldMeanEnvelope(config){
  const {candidateOrdinal,cells}=config??{};
  const alpha=config?.alpha??0.05;
  const target=config?.target??0.995;
  if(!Number.isSafeInteger(candidateOrdinal)||candidateOrdinal<1||
     !Array.isArray(cells)||![32,128].includes(cells.length)||
     !Number.isFinite(alpha)||alpha<=0||alpha>=1||
     !Number.isFinite(target)||target<=0||target>=1){
    throw new TypeError('Expected candidateOrdinal>=1, 32 or 128 cells, 0<alpha,target<1');
  }
  const C=cells.length;
  let attempts=0,censored=0;
  const intervals=cells.map((row,index)=>{
    if(!row||!['wins','nonWins','censored'].every(key=>
       Number.isSafeInteger(row[key])&&row[key]>=0)){
      throw new TypeError('Invalid nonnegative safe integer result counts in cell '+index);
    }
    const {wins,nonWins,censored:pending}=row;
    const n=wins+nonWins+pending;
    if(!Number.isSafeInteger(n)||!Number.isSafeInteger(attempts+n)){
      throw new RangeError('Counts exceed safe integer precision');
    }
    attempts+=n;
    censored+=pending;
    if(n===0){
      return {cell:index+1,attempts:0,wins,nonWins,censored:pending,
        radius:null,lower:0,upper:1,untested:true};
    }
    // Separate logs prevent multiplication overflow at large safe counts.
    const logBudget=Math.log(2*C/alpha)+Math.log(candidateOrdinal)+
      Math.log(candidateOrdinal+1)+Math.log(n)+Math.log(n+1);
    const radius=Math.sqrt(logBudget/(2*n));
    return {cell:index+1,attempts:n,wins,nonWins,censored:pending,
      radius,lower:Math.max(0,wins/n-radius),
      upper:Math.min(1,(wins+pending)/n+radius),untested:false};
  });
  const lowerFieldMean=intervals.reduce((sum,row)=>sum+row.lower,0)/C;
  const upperFieldMean=intervals.reduce((sum,row)=>sum+row.upper,0)/C;
  return {
    version:VERSION,candidateOrdinal,alpha,target,cellCount:C,attempts,
    censoredAttempts:censored,untestedCells:intervals.filter(x=>x.untested).length,
    lowerFieldMean,upperFieldMean,
    decision:upperFieldMean<target?'BELOW_TARGET_UPPER_BOUND':
      lowerFieldMean>=target?'ABOVE_TARGET_LOWER_BOUND':
      'INSUFFICIENT_INFORMATION',
    intervals,
    competitiveQualified:false,
    qualification:'Mathematical count envelope only. Censored attempts stay ambiguous. Requires independently certified paper mechanics, frozen deck and both-player policy, predetermined physical deal sampler, competent opponent play and paper clock.'
  };
}

module.exports={VERSION,anytimeFieldMeanEnvelope};
