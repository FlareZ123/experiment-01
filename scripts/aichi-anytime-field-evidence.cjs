'use strict';

const FIELD_SIZE=32;
const CELLS_PER_ROUND=64;
const ZERO_LOSS_WEIGHT=0.95;
const LAMBDAS=Object.freeze([0.05,0.1,0.25,0.5,1,2,4,8,16,32]);

/** @param {number[]} values Logarithmic component e-values. */
function logSumExp(values) {
  const maximum = Math.max(...values);
  if (maximum === -Infinity) return maximum;
  return maximum + Math.log(values.reduce((sum,x)=>sum+Math.exp(x-maximum),0));
}

/**
 * Confirm the entire rank-by-actual-starting-seat matrix is present.
 * Upstream matches must already be policy-qualified and independent.
 * @param {Array<{rank:number,startingSeat:string,outcome:string}>} round
 */
function countQualifiedWins(round) {
  if (!Array.isArray(round) || round.length !== CELLS_PER_ROUND) {
    throw new Error('Each round requires exactly 64 ranked seat games.');
  }
  const seen = new Set();
  let wins = 0;
  for (const game of round) {
    if (!game || !Number.isInteger(game.rank) || game.rank < 1 || game.rank > FIELD_SIZE ||
        !['first','second'].includes(game.startingSeat) ||
        !['win','loss','draw'].includes(game.outcome)) {
      throw new Error('Invalid rank, actual starting seat, or complete outcome.');
    }
    const key = game.rank + ':' + game.startingSeat;
    if (seen.has(key)) throw new Error('Repeated rank/seat cell: ' + key);
    seen.add(key);
    if (game.outcome === 'win') wins += 1;
  }
  return wins;
}


function assessFieldEvidence(rounds, options={}) {
  const nullMean=options.nullMean===undefined ? 0.995 : options.nullMean;
  const alpha=options.alpha===undefined ? 0.05 : options.alpha;
  if (!Array.isArray(rounds) || !(nullMean>0 && nullMean<1) ||
      !(alpha>0 && alpha<1)) throw new Error('Invalid evidence inputs.');
  const thresholdLog=-Math.log(alpha);
  const finiteWeightLog=Math.log((1-ZERO_LOSS_WEIGHT)/LAMBDAS.length);
  let wins=0, firstCrossedAtRound=null, logEValue=0;
  for (let index=0; index<rounds.length; index++) {
    wins += countQualifiedWins(rounds[index]);
    const games=(index+1)*CELLS_PER_ROUND;

    const zeroLog=wins===games ? Math.log(ZERO_LOSS_WEIGHT)-games*Math.log(nullMean) : -Infinity;
    const terms=[zeroLog];
    for (const lambda of LAMBDAS) {
