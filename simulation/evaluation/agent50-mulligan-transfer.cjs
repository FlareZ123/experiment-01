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

module.exports={VERSION, choose, miss, transfer};
