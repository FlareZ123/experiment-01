'use strict';

const { strict: assert } = require('node:assert');
const VERSION = 'agent50-opening-mulligan-transfer-exact-v1';

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0 && Number.isSafeInteger(k) && k >= 0);
  if (k > n) return 0;
  let value = 1;
  for (let i = 1; i <= Math.min(k, n - k); i += 1) value = value * (n-i+1) / i;
  return Math.round(value);
}

/** @param {number} basics @returns {number} */
function miss(basics) {
  assert.ok(Number.isSafeInteger(basics) && basics >= 1 && basics <= 60);
  return choose(60-basics, 7) / choose(60, 7);
}

/** @param {number} candidateBasics @param {number} sourceBasics */
function transfer(candidateBasics, sourceBasics) {
  const p=miss(candidateBasics), q=miss(sourceBasics);
  const sourceOne=p*(1-q)/(1-p*q);
  const candidateOne=q*(1-p)/(1-p*q);
  return {
    sourceOne, sourceTwo:sourceOne*p,
    sourceExpected:sourceOne*(1-p**47)/(1-p),
    candidateOne, candidateTwo:candidateOne*q,
    candidateExpected:candidateOne*(1-q**47)/(1-q),
    candidateMulligan:p, sourceMulligan:q
  };
}


/**
 * Probability an initially Basic-valid candidate has only its Active Pokemon
 * after accepting every optional bonus draw from the original source's
 * mulligans and Benching every bonus Basic. No turns have been played.
 * Source/prize order is marginalized over the actual disjoint random deal.
 *
 * @param {number} candidateBasics
 * @param {number} sourceBasics
 * @returns {{soloSeven:number, soloAfterAllSourceBonuses:number}}
 */
function soloAfterSourceBonus(candidateBasics, sourceBasics) {
  const p=miss(candidateBasics), q=miss(sourceBasics);
  const numerator=candidateBasics*choose(60-candidateBasics,6);
  const denominator=choose(60,7)-choose(60-candidateBasics,7);
  const soloSeven=numerator/denominator;
  if(soloSeven===0)return {soloSeven,soloAfterAllSourceBonuses:0};
  const d=1-p*q;
  let noneStillSolo=1-q*(1-p)/d;
  for(let k=1;k<=47;k++){
    const probability=k<47?(1-p)*(1-q)*q**k/d:(1-p)*q**47/d;
    const avoid=choose(54-candidateBasics,k)/choose(53,k);
    noneStillSolo+=probability*avoid;
  }
  return {soloSeven,soloAfterAllSourceBonuses:soloSeven*noneStillSolo};
}


/**
 * Probability the opponent publicly sees at least one selected non-Basic
 * printing among every fully revealed failed seven before a valid opener.
 * Both-invalid seven-card rounds are revealed as specified in rulebook I.G.
 * The opponent's Basic count does not enter this marginal distribution.
 * This is public card-name exposure, not opponent recognition or an action.
 *
 * @param {number} basicCount
 * @param {number} selectedNonbasicCopies
 * @returns {number}
 */
function mulliganReveal(basicCount, selectedNonbasicCopies) {
  const nonbasic=60-basicCount;
  assert.ok(Number.isSafeInteger(selectedNonbasicCopies));
  assert.ok(selectedNonbasicCopies>=0&&selectedNonbasicCopies<=nonbasic);
  const p=miss(basicCount);
  if(p===0)return 0;
  const selected=1-choose(nonbasic-selectedNonbasicCopies,7)/choose(nonbasic,7);
  return p*selected/(1-p+p*selected);
}

module.exports={VERSION, choose, miss, transfer, soloAfterSourceBonus, mulliganReveal};
