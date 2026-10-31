'use strict';

const assert=require('node:assert/strict');

const VERSION='agent5-aichi-may26-open-league-clock-adjudication-v1';
const CLOCK_MINUTES=Object.freeze({
  swiss:25,top32:25,final:35
});

/**
 * The Aichi Open League rules require the second-starting player's turn to
 * complete after a time call. If the first-starting player is on turn when
 * time is called, the second starter receives one further turn.
 * The final second-player turn does not include Pokemon Checkup afterward.
 *
 * @param {0|1} firstSeat Physical seat that started the game.
 * @param {0|1} callSeat Physical seat whose turn contains the time call.
 * @returns {object} Explicit timeline plan, without claiming a live clock.
 */
function endCallPlan(firstSeat,callSeat){
  assert.ok((firstSeat===0||firstSeat===1)&&
    (callSeat===0||callSeat===1));
  const secondSeat=1-firstSeat;
  return {
    finishCurrentTurn:true,
    extraFullTurnSeats:callSeat===firstSeat?[secondSeat]:[],
    terminalTurnSeat:secondSeat,
    includeCheckupAfterTerminalTurn:false
  };
}

/**
 * Classify after all end-call extensions are completed. This routine has no
 * timing model and requires external verified clock + final-turn witnesses.
 *
 * @param {object} snapshot
 * @param {'swiss'|'top32'|'final'} snapshot.round
 * @param {[number,number]} snapshot.prizesRemaining Public physical counts.
 * @param {boolean} snapshot.reliableClockWitness
 * @param {boolean} snapshot.terminalSecondTurnSettled
 * @param {0|1|null} [snapshot.nativeWinnerSeat]
 * @returns {object} Qualified terminal status or explicit nonterminal reason.
 */
function classifyAfterTime(snapshot){
  const {round,prizesRemaining,reliableClockWitness,
    terminalSecondTurnSettled,nativeWinnerSeat=null}=snapshot;
  assert.ok(Object.hasOwn(CLOCK_MINUTES,round),'Unknown Open League stage');
  assert.ok(Array.isArray(prizesRemaining)&&prizesRemaining.length===2);
  assert.ok(prizesRemaining.every(x=>Number.isSafeInteger(x)&&
    x>=0&&x<=6),'Prize counts must be public physical 0..6');
  assert.ok(typeof reliableClockWitness==='boolean');
  assert.ok(typeof terminalSecondTurnSettled==='boolean');
  assert.ok(nativeWinnerSeat===null||nativeWinnerSeat===0||
    nativeWinnerSeat===1,'Native winner seat must be 0/1/null');
  const core={version:VERSION,round,
    nominalMinutes:CLOCK_MINUTES[round],winnerSeat:null};
  if(!reliableClockWitness)
    return {...core,status:'unqualified-clock-not-measured'};
  if(nativeWinnerSeat!==null)
    return {...core,status:'native-natural-win',
      winnerSeat:nativeWinnerSeat};
  if(!terminalSecondTurnSettled)
    return {...core,status:'await-end-of-second-player-turn'};
  if(round==='swiss')
    return {...core,status:'both-players-lose-on-time'};

  const [a,b]=prizesRemaining;
  const someAtMostTwo=a<=2||b<=2;
  if(someAtMostTwo&&a!==b)
    return {...core,status:'elimination-prize-lead-win',
      winnerSeat:a<b?0:1};
  if(someAtMostTwo)
    return {...core,status:'elimination-continue-overtime',
      overtimeRule:'first-strict-prize-lead-or-natural-win'};
  return {...core,status:'elimination-continue-overtime',
    overtimeRule:'reach-two-or-fewer-with-strict-lead-or-natural-win'};
}

/**
 * Evaluate the prize comparison during an already legitimately started
 * elimination overtime. A native natural winner is handled by its caller.
 *
 * @param {[number,number]} prizesRemaining
 * @param {'first-strict-prize-lead-or-natural-win'|
 * 'reach-two-or-fewer-with-strict-lead-or-natural-win'} overtimeRule
 * @returns {0|1|null} Winner seat if paper stop criterion is achieved.
 */
function overtimePrizeWinner(prizesRemaining,overtimeRule){
  assert.ok(Array.isArray(prizesRemaining)&&prizesRemaining.length===2);
  assert.ok(prizesRemaining.every(x=>Number.isSafeInteger(x)&&x>=0&&x<=6));
  assert.ok(overtimeRule==='first-strict-prize-lead-or-natural-win'||
    overtimeRule==='reach-two-or-fewer-with-strict-lead-or-natural-win');
  const [a,b]=prizesRemaining;
  if(a===b)return null;
  if(overtimeRule==='reach-two-or-fewer-with-strict-lead-or-natural-win'&&
    Math.min(a,b)>2)return null;
  return a<b?0:1;
}

module.exports={VERSION,CLOCK_MINUTES,endCallPlan,
  classifyAfterTime,overtimePrizeWinner};
