'use strict';

const assert=require('node:assert/strict');

/**
 * Exact first seeded draw for the current headless research wrapper.
 * This is a reproduction of its xorshift32 function, with the same zero seed.
 * It is only a starter predictor while this draw is consumed by the first
 * CoinFlipPrompt and the pinned bots choose GO_FIRST=false.
 * @param {number} seed Unsigned 32-bit research game seed
 * @returns {number}
 */
function firstCoinSample(seed){
  assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff,
    'Expected an unsigned 32-bit seed');
  let state=seed>>>0;
  if(state===0)state=0x9e3779b9;
  state^=state<<13;
  state^=state>>>17;
  state^=state<<5;
  return (state>>>0)/0x100000000;
}

/**
 * Pinned normal-Expanded first-player prediction.
 * Source and candidate both run the pinned ConfirmPromptResolver, which
 * resolves any ConfirmPrompt with false. Therefore the coin winner elects
 * second; actual first player is the other seat.
 * 
 * This does not assume that A is the candidate. It must be checked against
 * native observed first turns whenever vendor, prompts, or setup changes.
 * @param {number} seed
 * @param {'A'|'B'} candidateSlot
 * @returns {{seed:number,coinSample:number,coinWinner:'A'|'B',predictedFirst:'A'|'B',sourceFirst:boolean}}
 */
function predictedPinnedStart(seed,candidateSlot){
  assert.ok(candidateSlot==='A'||candidateSlot==='B');
  const coinSample=firstCoinSample(seed);
  const coinWinner=coinSample<0.5?'A':'B';
  const predictedFirst=coinWinner==='A'?'B':'A';
  return {seed,coinSample,coinWinner,predictedFirst,
    sourceFirst:predictedFirst!==candidateSlot};
}

/**
 * Enumerate a preregistered plan's independently drawn seed groups exactly
 * once, without treating two different candidate lists as independent
 * first-player assignments.
 * @param {{ranks:number[],candidateSlots:string[],seeds:Record<string,Record<string,number[]>>}} plan
 * @returns {Array<{rank:number,candidateSlot:string,seed:number,sourceFirst:boolean,predictedFirst:string,coinWinner:string,coinSample:number}>}
 */
function classifySeedGroups(plan){
  const seen=new Set();
  const rows=[];
  for(const rank of plan.ranks)for(const candidateSlot of plan.candidateSlots){
    const seeds=plan.seeds[String(rank)][candidateSlot];
    for(const seed of seeds){
      assert.ok(!seen.has(seed),'Seed reused between independent groups');
      seen.add(seed);
      rows.push({rank,candidateSlot,...predictedPinnedStart(seed,candidateSlot)});
    }
  }
  return rows;
}

module.exports={firstCoinSample,predictedPinnedStart,classifySeedGroups};
