'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent3-marginal-coupled-field-delta-v1';
const WIN = 'QUALIFIED_WIN';
const NONWIN = 'QUALIFIED_NONWIN';
const CENSORED = 'CENSORED';
const STATUSES = new Set([WIN, NONWIN, CENSORED]);

/**
 * Intent-to-register, equal-cell field comparison for two frozen decklists.
 * The two simulations in a pair may share a random seed while producing
 * DIFFERENT physical original-source openings (e.g. candidate-induced
 * mulligans). Such a pair still estimates E[Y_challenger]-E[Y_reference]
 * if BOTH marginal game samplers are correct and the registered seed blocks
 * are independently drawn. It does not estimate an exact-source-deal
 * counterfactual. These are substantive assumptions, not testable flags.
 *
 * Missing/unqualified outcomes remain as sharp binary [0,1] bounds. For
 * each registered pair, the latent difference D lies in [-1,1]. For C
 * prespecified equally weighted cells and n independently sampled complete
 * rounds, Hoeffding and alpha-spending over every ordinal k and round n give
 * radius=sqrt(2*log(2*k*(k+1)*n*(n+1)/alpha)/(C*n)). The observed lower and
 * upper outcome differences contain the latent sample average pointwise,
 * regardless of why an arm was censored.
 *
 * Caller assertions cannot independently certify paper rules, policies,
 * source-card identity, correct RNG marginals, or a complete match clock.
 * This module will never classify a game as competitively qualified.
 *
 * @typedef {'QUALIFIED_WIN'|'QUALIFIED_NONWIN'|'CENSORED'} Status
 * @typedef {{pairId:string,roundId:string,
 *   referenceFingerprint:string,challengerFingerprint:string,
 *   referenceStatus:Status,challengerStatus:Status}} Pair
 * @param {{candidateOrdinal:number,cells:Pair[][],alpha?:number,
 *   targetDelta?:number,independentAcrossCells:true,
 *   marginalSourceSamplingValidated:true,
 *   prospectivelyRegisteredRounds:true}} config
 * @returns {object}
 */
function marginalCoupledFieldDelta(config) {
  const {candidateOrdinal,cells} = config ?? {};
  const alpha=config?.alpha ?? 0.05;
  const targetDelta=config?.targetDelta ?? 0;
  if(!Number.isSafeInteger(candidateOrdinal) || candidateOrdinal<1 ||
     !Array.isArray(cells) || ![32,64,128].includes(cells.length) ||
     !(alpha>0 && alpha<1) || !Number.isFinite(alpha) ||
     !Number.isFinite(targetDelta) || targetDelta< -1 || targetDelta>1 ||
     config.independentAcrossCells!==true ||
     config.marginalSourceSamplingValidated!==true ||
     config.prospectivelyRegisteredRounds!==true) {
    throw new TypeError('Frozen 32/64/128-cell independent prospective marginal field design is required');
  }
  const n=cells[0]?.length;
  if(!Number.isSafeInteger(n) || n<1 ||
     !cells.every(cell=>Array.isArray(cell)&&cell.length===n)) {
    throw new TypeError('Every prespecified cell must contain the same nonzero number of registered rounds');
  }
  const seenPairs=new Set();
  const seenRounds=new Set();
  let sumLower=0;
  let sumUpper=0;
  let censoredPairs=0;
  let differingSourceOpenings=0;
  let matchingSourceOpenings=0;
  let fullyObservedMismatches=0;
  for(let round=0;round<n;round++) {
    const roundId=cells[0][round]?.roundId;
    if(typeof roundId!=='string'||!roundId||seenRounds.has(roundId)) {
      throw new TypeError('Rounds must have distinct nonempty registered identities');
    }
    seenRounds.add(roundId);
    for(let cell=0;cell<cells.length;cell++) {
      const p=cells[cell][round];
      if(!p || p.roundId!==roundId ||
         typeof p.pairId!=='string'||!p.pairId||seenPairs.has(p.pairId) ||
         typeof p.referenceFingerprint!=='string'||!p.referenceFingerprint ||
         typeof p.challengerFingerprint!=='string'||!p.challengerFingerprint ||
         !STATUSES.has(p.referenceStatus)||!STATUSES.has(p.challengerStatus)) {
        throw new TypeError('Invalid, duplicated or unaligned registered pair in cell '+(cell+1));
      }
      seenPairs.add(p.pairId);
      const refLo=p.referenceStatus===WIN?1:0;
      const refHi=p.referenceStatus===NONWIN?0:1;
      const chalLo=p.challengerStatus===WIN?1:0;
      const chalHi=p.challengerStatus===NONWIN?0:1;
      sumLower+=chalLo-refHi;
      sumUpper+=chalHi-refLo;
      const censored=p.referenceStatus===CENSORED||p.challengerStatus===CENSORED;
      if(censored)censoredPairs++;
      if(p.referenceFingerprint===p.challengerFingerprint)matchingSourceOpenings++;
      else {
        differingSourceOpenings++;
        if(!censored)fullyObservedMismatches++;
      }
    }
  }
  const N=cells.length*n;
  assert.equal(seenPairs.size,N);
  const logBudget=Math.log(2/alpha)+Math.log(candidateOrdinal)+
    Math.log(candidateOrdinal+1)+Math.log(n)+Math.log(n+1);
  const radius=Math.sqrt(2*logBudget/N);
  const observedLower=sumLower/N;
  const observedUpper=sumUpper/N;
  const lowerFieldDelta=Math.max(-1,observedLower-radius);
  const upperFieldDelta=Math.min(1,observedUpper+radius);
  return {
    version:VERSION,method:'UNCONDITIONAL_COUPLED_FIELD_MARGINAL_MEAN',
    candidateOrdinal,alpha,targetDelta,cellCount:cells.length,completedRounds:n,
    registeredPairs:N,censoredPairs,differingSourceOpenings,
    matchingSourceOpenings,fullyObservedMismatches,
    observedLower,observedUpper,radius,lowerFieldDelta,upperFieldDelta,
    decision:lowerFieldDelta>targetDelta?'IMPROVEMENT_ABOVE_TARGET':
      upperFieldDelta<targetDelta?'UNDERPERFORMANCE_BELOW_TARGET':
        'INSUFFICIENT_INFORMATION',
    competitiveQualified:false,
    qualification:'Requires independently certified paper games, correct randomized marginal original-source samplers under each frozen 60, independent prospectively registered rounds/cells, one unchanged common policy, full 32-original source admission and match clock. Different physical source deals are retained for unconditional means, NEVER labeled exact-source matches. Caller attestation flags are unverified.'
  };
}

module.exports={VERSION,marginalCoupledFieldDelta};
