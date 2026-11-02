'use strict';

const {anytimeBalancedPairedFieldDelta}=
  require('./agent46-anytime-balanced-paired-field-delta.cjs');

const VERSION='agent46-anytime-balanced-paired-sign-betting-v1';
const DIRECTIONS=new Set(['CHALLENGER_BETTER','REFERENCE_BETTER']);
const LOG2=Math.log(2);
const BET_COUNT=32;

/**
 * Anytime-valid directional field comparison through nonnegative betting
 * test martingales. This construction exploits sparse discordant matched
 * games while remaining valid when ranks have DIFFERENT effect means.
 *
 * Hypothesis for chosen direction: equal-cell field mean D <= 0, where
 * D_i = winner_indicator(challenger)-winner_indicator(reference), or its
 * negative for REFERENCE_BETTER, and D_i belongs to {-1,0,1}.
 *
 * Under the null, for one preregistered full C-cell round, with latent
 * independent pair outcomes across cells, for any eta in (0,1):
 *
 *   E product_i (1 + eta D_i)
 *   = product_i (1 + eta E D_i)
 *   <= [1 + eta * mean_i(E D_i)]^C
 *   <= 1.
 *
 * The middle step is arithmetic-geometric mean with nonnegative factors.
 * Across independently sampled rounds, the products generate a
 * nonnegative supermartingale, even if individual ranks have opposing
 * candidate preferences. Dependence between challenger and reference
 * within a single physical source pair is fully permitted.
 *
 * For a missing/unqualified arm, the observable interval for D has a
 * conservative lower endpoint dLo. Replace D by dLo; each betting factor
 * increases with D, so every partially observed wealth is <= the latent
 * true supermartingale wealth, pointwise for every round and eta. This
 * handles arbitrary outcome-dependent censoring, including mismatched
 * original source physical fingerprints. An unsupported native winner
 * cannot be treated as a qualified game.
 *
 * Mix 32 fixed eta_j = 1 - 2^{-j} with normalized weights proportional
 * to 2^{-j}. Positive mixtures preserve the supermartingale bound.
 * For candidate directional comparison ordinal k, use a prospectively
 * allocated alpha_k = alpha/[k(k+1)], allowing countably many selected
 * hypotheses. Ville's bound controls even infinite repeated looks.
 * Testing BOTH directions or two different estimators on the same data
 * requires independent preregistered ordinals or a preallocated alpha
 * split; calling both with the same k forfeits the claimed total budget.
 *
 * This is a directional test of advantage over a frozen reference.
 * It does NOT deliver a confidence interval and cannot certify a
 * 99.5%-absolute-win-rate threshold, paper rules, opposing policy
 * competence, or the actual source printed 60.
 *
 * @typedef {'QUALIFIED_WIN'|'QUALIFIED_NONWIN'|'CENSORED'} Status
 * @param {{
 *  candidateOrdinal:number,
 *  cells:Array<Array<{
 *    pairId:string,roundId:string,
 *    referenceFingerprint:string,challengerFingerprint:string,
 *    referenceStatus:Status,challengerStatus:Status
 *  }>>,
 *  alpha?:number,independentAcrossCells:true,
 *  direction:'CHALLENGER_BETTER'|'REFERENCE_BETTER'
 * }} config
 * @returns {object} Anytime directional evidence and independent audit warnings.
 */
function anytimeBalancedPairedSignBetting(config){
  if(!DIRECTIONS.has(config?.direction)||config?.independentAcrossCells!==true||
    (config?.targetDelta!==undefined&&config.targetDelta!==0)){
    throw new TypeError('Predeclare one comparison direction, independently sampled across-cell rounds, and zero null field difference');
  }
  const base=anytimeBalancedPairedFieldDelta({
    candidateOrdinal:config.candidateOrdinal,cells:config.cells,
    alpha:config.alpha,targetDelta:0
  });
  const weightsTotal=1-2**(-BET_COUNT);
  let positivePairs=0,negativePairs=0,neutralPairs=0;
  let ambiguousPairs=0;
  const direction=config.direction;
  for(const cell of config.cells){
    for(const pair of cell){
      const sameSource=pair.referenceFingerprint===pair.challengerFingerprint;
      if(!sameSource)ambiguousPairs++;
      const r=direction==='CHALLENGER_BETTER'?
        pair.referenceStatus:pair.challengerStatus;
      const c=direction==='CHALLENGER_BETTER'?
        pair.challengerStatus:pair.referenceStatus;
      const lower=sameSource?
        (c==='QUALIFIED_WIN'?1:0)-(r==='QUALIFIED_NONWIN'?0:1):-1;
      if(lower===1)positivePairs++;
      else if(lower===-1)negativePairs++;
      else neutralPairs++;
      if(sameSource&&(r==='CENSORED'||c==='CENSORED'))ambiguousPairs++;
    }
  }
  const logs=[];
  for(let j=1;j<=BET_COUNT;j++){
    const eta=1-2**(-j);
    const logWeight=-j*LOG2-Math.log(weightsTotal);
    const logWealth=positivePairs*Math.log1p(eta)+
      negativePairs*Math.log1p(-eta);
    logs.push(logWeight+logWealth);
  }
  const peak=Math.max(...logs);
  const logEValue=peak+Math.log(logs.reduce((sum,x)=>sum+Math.exp(x-peak),0));
  const logThreshold=Math.log(base.candidateOrdinal)+
    Math.log(base.candidateOrdinal+1)-Math.log(base.alpha);
  const threshold=Math.exp(logThreshold);
  return {
    version:VERSION,method:'BALANCED_FIELD_PAIRED_SIGN_E_PROCESS',
    direction,candidateOrdinal:base.candidateOrdinal,
    alpha:base.alpha,cellCount:base.cellCount,
    completedRounds:base.completedRounds,
    registeredPairs:base.registeredPairs,
    censoredPairs:base.censoredPairs,
    unmatchedPairs:base.unmatchedPairs,
    ambiguousPairs,positivePairs,negativePairs,neutralPairs,
    betCount:BET_COUNT,logEValue,
    eValue:logEValue>Math.log(Number.MAX_VALUE)?Infinity:Math.exp(logEValue),
    logThreshold,threshold,
    decision:logEValue>=logThreshold?'DIRECTIONAL_FIELD_IMPROVEMENT_EVIDENCE':
      'INSUFFICIENT_INFORMATION',
    competitiveQualified:false,
    qualification:base.qualification+
      ' Additional assumptions: each completed round has independent latent pair outcomes across field cells; direction and familywise alpha allocation are fixed before observing outcomes. This statistical test cannot verify whole-paper games.'
  };
}

module.exports={VERSION,anytimeBalancedPairedSignBetting};
