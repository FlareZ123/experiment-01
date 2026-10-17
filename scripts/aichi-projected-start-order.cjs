'use strict';

const {deriveSlotSeeds}=require('./aichi-decorrelated-seeds.cjs');

/**
 * Predict the first player only when the pinned headless runtime consumes
 * seededRandom()'s first sample for its opening coin/choice decision.
 * This is a screening heuristic, never a substitute for the actual
 * firstTurnSlot plus independently verified turn-one draw log.
 *
 * @param {number} seed
 * @returns {0|1} Predicted first physical player slot
 */
function projectedFirstSlot(seed) {
  if(!Number.isInteger(seed)||seed<0||seed>0xffffffff) {
    throw new RangeError('Expected an unsigned 32-bit seed');
  }
  let state=(seed>>>0)||0x9e3779b9;
  state^=(state<<13);
  state^=(state>>>17);
  state^=(state<<5);
  return (state>>>0)<0x80000000 ? 1 : 0;
}

/**
 * Select the earliest v3 seed projected to achieve a candidate's desired
 * real starting order. Subsequent full engine run MUST verify the first draw.
 *
 * @param {number} seedBase
 * @param {'pilot'|'published-field'} phase
 * @param {number} rank
 * @param {'A'|'B'} candidateSeat
 * @param {'first'|'second'} desiredActualTurn
 * @param {number} [limit=100]
 */
function selectProjectedSeed(seedBase,phase,rank,candidateSeat,desiredActualTurn,limit=100) {
  if(!['A','B'].includes(candidateSeat) ||
    !['first','second'].includes(desiredActualTurn) ||
    !Number.isInteger(limit)||limit<1||limit>100) {
    throw new RangeError('Invalid projected-start selection');
  }
  const physicalSlot=candidateSeat==='A'?0:1;
  const wanted=desiredActualTurn==='first'?physicalSlot:1-physicalSlot;
  for(let repeat=0;repeat<limit;repeat++) {
    const seed=deriveSlotSeeds(seedBase,phase,rank,repeat)[candidateSeat];
    if(projectedFirstSlot(seed)===wanted) {
      return {rank,phase,candidateSeat,desiredActualTurn,repeat,seed,
        projectedFirstSlot:wanted,requiresIndependentDrawLog:true};
    }
  }
  return null;
}

/**
 * Fail closed when a projected seed does not reproduce the first actual turn.
 * @param {{projectedFirstSlot:0|1}} prediction
 * @param {{firstTurnSlot:number,verifiedByDrawLog:boolean}} engineGame
 * @returns {true}
 */
function attestActualFirstTurn(prediction,engineGame) {
  if(engineGame?.verifiedByDrawLog!==true ||
    ![0,1].includes(engineGame.firstTurnSlot) ||
    engineGame.firstTurnSlot!==prediction.projectedFirstSlot) {
    throw new Error('Projected start rejected by actual first-draw evidence');
  }
  return true;
}

module.exports={projectedFirstSlot,selectProjectedSeed,attestActualFirstTurn};
