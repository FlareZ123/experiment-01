'use strict';

const assert=require('node:assert/strict');

const TARGET=0.995;
const CONFIDENCE=0.95;
const FIELD_SIZE=32;

/** @param {number} target Strictly interior win probability. */
function validateProbability(target){
  assert.ok(Number.isFinite(target)&&target>0&&target<1,
    'Probability must be strictly between zero and one');
}

/**
 * Exact one-sided lower confidence bound after n independent wins and no
 * losses for one fixed Bernoulli parameter. Alpha is 1 - confidence.
 * @param {number} n Positive independent game count.
 * @param {number} [confidence] One-sided confidence level.
 * @returns {number}
 */
function allWinsLowerBound(n,confidence=CONFIDENCE){
  assert.ok(Number.isSafeInteger(n)&&n>0);
  validateProbability(confidence);
  return Math.pow(1-confidence,1/n);
}

/**
 * Fewest independent flawless games needed for allWinsLowerBound >= target.
 * @param {number} [target]
 * @param {number} [confidence]
 * @returns {number}
 */
function minAllWins(target=TARGET,confidence=CONFIDENCE){
  validateProbability(target);
  validateProbability(confidence);
  const minimum=Math.ceil(Math.log(1-confidence)/Math.log(target));
  assert.ok(Number.isSafeInteger(minimum)&&minimum>0);
  return minimum;
}

/**
 * If exactly m independent games are played against each of K fixed
 * opponents, the probability of a flawless panel is at most (mean p)^Km.
 * Proof is the arithmetic-geometric mean inequality over the K p_i values.
 * Inverting the all-wins event yields a one-sided lower bound on the uniform
 * mean of K matchup win probabilities even when those p_i differ.
 *
 * Games and decision policies must be independent and frozen. This function
 * does not establish that simulator matches satisfy those conditions.
 *
 * @param {{opponents?:number,target?:number,confidence?:number,
 *   equalSeatCounts?:boolean}} [options]
 * @returns {{opponents:number,matchesPerOpponent:number,totalGames:number,
 *   zeroLossLowerBound:number,equalSeatCounts:boolean}}
 */
function balancedFieldFloor(options={}){
  const opponents=options.opponents??FIELD_SIZE;
  const target=options.target??TARGET;
  const confidence=options.confidence??CONFIDENCE;
  const equalSeatCounts=options.equalSeatCounts===true;
  assert.ok(Number.isSafeInteger(opponents)&&opponents>0);
  let matchesPerOpponent=Math.ceil(minAllWins(target,confidence)/opponents);
  if(equalSeatCounts&&matchesPerOpponent%2!==0)matchesPerOpponent++;
  const totalGames=opponents*matchesPerOpponent;
  assert.ok(Number.isSafeInteger(totalGames));
  return {opponents,matchesPerOpponent,totalGames,
    zeroLossLowerBound:allWinsLowerBound(totalGames,confidence),
    equalSeatCounts};
}

/**
 * If every individual matchup must exceed target simultaneously with joint
 * confidence, use the Bonferroni-adjusted one-sided all-wins bound.
 * Each matchup receives its own independent fixed-policy sample.
 *
 * @param {{opponents?:number,target?:number,confidence?:number}} [options]
 * @returns {{opponents:number,matchesPerOpponent:number,totalGames:number,
 *   familywiseLowerBoundPerOpponent:number}}
 */
function allMatchupsFloor(options={}){
  const opponents=options.opponents??FIELD_SIZE;
  const target=options.target??TARGET;
  const confidence=options.confidence??CONFIDENCE;
  assert.ok(Number.isSafeInteger(opponents)&&opponents>0);
  validateProbability(target);
  validateProbability(confidence);
  const alphaEach=(1-confidence)/opponents;
  const matchesPerOpponent=Math.ceil(Math.log(alphaEach)/Math.log(target));
  const totalGames=opponents*matchesPerOpponent;
  assert.ok(Number.isSafeInteger(totalGames));
  return {opponents,matchesPerOpponent,totalGames,
    familywiseLowerBoundPerOpponent:
      Math.pow(alphaEach,1/matchesPerOpponent)};
}

module.exports={TARGET,CONFIDENCE,FIELD_SIZE,validateProbability,
  allWinsLowerBound,minAllWins,balancedFieldFloor,allMatchupsFloor};
