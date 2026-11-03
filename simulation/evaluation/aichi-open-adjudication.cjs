'use strict';

/**
 * Aichi Open League 2026 official end-of-time result classification at the
 * adjudication checkpoint. This helper does not count actions, measure elapsed
 * paper minutes, model overtime turns, or certify game-state legality.
 *
 * Official event: https://www.pokemon-card.com/info/005445.html
 *
 * The caller must first establish that the clock expired and the second
 * starting player's last permitted turn has concluded, excluding Pokémon
 * Checkup after that turn. `normal` encodes an ordinary paper game result
 * already obtained at that legal checkpoint.
 *
 * @typedef {'swiss'|'top32'|'final'} OpenStage
 * @typedef {'in-progress'|'player-0-win'|'player-1-win'|'tie'} OrdinaryResult
 * @typedef {'player-0-win'|'player-1-win'|'double-loss'|'overtime'|'tiebreaker'} Adjudication
 */

/**
 * Classify only the official result immediately after the legally permitted
 * last turn. Returns `overtime` when continuation play must still occur.
 * @param {{stage:OpenStage,normal:OrdinaryResult,prizesNeeded?:[number,number]}} checkpoint
 * @returns {{status:Adjudication,reason:string}}
 */
function adjudicateAichiOpenAfterLastTurn(checkpoint) {
  const {stage,normal,prizesNeeded} = checkpoint;
  if(stage!=='swiss'&&stage!=='top32'&&stage!=='final'){
    throw new TypeError('Unknown Aichi Open League stage');
  }
  if(normal==='player-0-win'||normal==='player-1-win'){
    return {status:normal,reason:'Ordinary paper game result at the closing checkpoint'};
  }
  if(normal!=='in-progress'&&normal!=='tie'){
    throw new TypeError('Unknown ordinary paper game result');
  }
  if(stage==='swiss'){
    return {status:'double-loss',
      reason:'Unresolved Swiss paper match after last permitted second-player turn'};
  }
  if(normal==='tie'){
    return {status:'tiebreaker',reason:'Drawn knockout game needs fresh six-Prize tiebreaker'};
  }
  if(!Array.isArray(prizesNeeded)||prizesNeeded.length!==2||
     !prizesNeeded.every(v=>Number.isSafeInteger(v)&&v>=1&&v<=6)){
    throw new TypeError('Unresolved knockout game needs two positive Prize counts');
  }
  const [a,b]=prizesNeeded;
  if(a<=2||b<=2){
    if(a<b)return {status:'player-0-win',reason:'Knockout lower Prize-needed threshold'};
    if(b<a)return {status:'player-1-win',reason:'Knockout lower Prize-needed threshold'};
  }
  return {status:'overtime',
    reason:'Same Prize-needed score or both players need at least three Prizes'};
}

/** @param {OpenStage} stage */
function aichiOpenClockMinutes(stage){
  if(stage==='swiss'||stage==='top32')return 25;
  if(stage==='final')return 35;
  throw new TypeError('Unknown Aichi Open League stage');
}

module.exports={adjudicateAichiOpenAfterLastTurn,aichiOpenClockMinutes};
