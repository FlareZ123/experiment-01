'use strict';

const assert=require('node:assert/strict');

const VERSION='aichi-may-2026-open-stage-clock-adjudication-v1';

/**
 * Official CL Aichi 2026 May, Japanese Open League.
 * Source: https://www.pokemon-card.com/info/005445.html
 * Open League rules, "大会形式：ジュニア／シニア／オープンリーグ".
 *
 * Pure rules for a caller-proven real time-over announcement.
 * No game-duration estimator is included; actions per second cannot
 * be deduced from the published official tournament procedure.
 *
 * @param {'swiss'|'bracket'} stage
 * @param {'round32'|'round16'|'quarterfinal'|'semifinal'|'final'|null} [bracketRound]
 * @returns {25|35}
 */
function timeLimitMinutes(stage,bracketRound=null){
  assert.ok(stage==='swiss'||stage==='bracket');
  if(stage==='swiss'){
    assert.equal(bracketRound,null);
    return 25;
  }
  assert.ok(['round32','round16','quarterfinal',
    'semifinal','final'].includes(bracketRound));
  return bracketRound==='final'?35:25;
}

/**
 * At the time-over call, the Open League final-turn rule ensures that
 * the player who started second gets the final turn. If the call occurs
 * during that player's turn, simply finish that turn. If it occurs
 * during the first-start player's turn, finish it and then give second
 * one more turn. Pokémon Checkup after the final turn is excluded.
 *
 * @param {0|1} firstStartedSeat
 * @param {0|1} callOnSeat
 * @returns {object} Required turn-completion certificate.
 */
function afterCallTurnWindow(firstStartedSeat,callOnSeat){
  assert.ok(firstStartedSeat===0||firstStartedSeat===1);
  assert.ok(callOnSeat===0||callOnSeat===1);
  const secondStartedSeat=1-firstStartedSeat;
  return {
    firstStartedSeat,secondStartedSeat,callOnSeat,
    finishCurrentTurn:true,
    additionalSecondPlayerTurn:callOnSeat===firstStartedSeat,
    finalTurnOwnerSeat:secondStartedSeat,
    finalPokemonCheckupPermitted:false
  };
}

/**
 * Assess a completed real-life event call window, without treating an
 * engine action count as elapsed time. Requires independently confirmed:
 * (a) 25- or 35-minute time-over call; (b) the second-start player's last
 * full turn finished; (c) final post-turn Pokémon Checkup was excluded.
 *
 * A no-time-call or uncompleted window is an unresolved witness.
 * Bracket extension/tiebreak requires further play and cannot be
 * certified from the current Prize totals.
 *
 * @param {object} row
 * @param {'swiss'|'bracket'} row.stage
 * @param {'round32'|'round16'|'quarterfinal'|'semifinal'|'final'|null} [row.bracketRound]
 * @param {boolean} row.verifiedRealClockCall
 * @param {boolean} row.finalSecondPlayerTurnCompleted
 * @param {boolean} row.finalPokemonCheckupExcluded
 * @param {[number,number]} row.prizesNeededToWinBySeat
 * @param {0|1|null} [row.normalGameWinningSeat]
 * @param {boolean} [row.observedNativeDraw] Authenticated ordinary game tie after call.
 * @returns {object} Stage-specific post-clock adjudication status.
 */
function adjudicateAfterTimeCall(row){
  const {stage,bracketRound=null,verifiedRealClockCall,
    finalSecondPlayerTurnCompleted,finalPokemonCheckupExcluded,
    prizesNeededToWinBySeat,normalGameWinningSeat=null,
    observedNativeDraw=false}=row;
  const limit=timeLimitMinutes(stage,bracketRound);
  assert.ok(Array.isArray(prizesNeededToWinBySeat)&&
    prizesNeededToWinBySeat.length===2);
  assert.ok(prizesNeededToWinBySeat.every(value=>
    Number.isSafeInteger(value)&&value>=0&&value<=6));
  assert.ok(normalGameWinningSeat===null||
    normalGameWinningSeat===0||normalGameWinningSeat===1);
  const base={version:VERSION,stage,bracketRound,
    timeLimitMinutes:limit,
    paperClockCertified:false};
  if(verifiedRealClockCall!==true)
    return {...base,status:'no-real-time-call-witness'};
  if(finalSecondPlayerTurnCompleted!==true||
     finalPokemonCheckupExcluded!==true)
    return {...base,status:'after-call-final-turn-unverified'};
  if(normalGameWinningSeat!==null)
    return {...base,status:'normal-game-win-after-time-call',
      winningSeat:normalGameWinningSeat};
  if(observedNativeDraw===true)
    return {...base,status:stage==='bracket'?
      'bracket-fresh-six-prize-tiebreak-required':
      'swiss-native-draw-rule-unverified',winningSeat:null};
  assert.ok(prizesNeededToWinBySeat.every(n=>n>0),
    'No natural winner reported despite no remaining Prize cards');
  if(stage==='swiss')
    return {...base,status:'swiss-both-players-loss',winningSeat:null};
  const [a,b]=prizesNeededToWinBySeat;
  if(Math.min(a,b)<=2&&a!==b)
    return {...base,status:'bracket-timeout-prize-lead-win',
      winningSeat:a<b?0:1,prizesNeededToWinBySeat:[a,b]};
  return {...base,status:'bracket-extension-required',winningSeat:null,
    extensionRule:Math.min(a,b)<=2?
      'equal-prizes-needed-at-or-below-two':
      'both-need-at-least-three',
    prizesNeededToWinBySeat:[a,b]};
}

module.exports={VERSION,timeLimitMinutes,afterCallTurnWindow,
  adjudicateAfterTimeCall};
