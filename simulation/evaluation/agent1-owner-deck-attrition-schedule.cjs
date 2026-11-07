'use strict';

const assert=require('node:assert/strict');

const VERSION='agent1-piecewise-owner-deck-attrition-schedule-v1';

/**
 * Validate a public card count used by this deterministic scenario model.
 * @param {number} value
 * @param {string} name
 */
function assertCardCount(value,name){
  assert.ok(Number.isSafeInteger(value)&&value>=0&&value<=60,
    name+' must be a feasible nonnegative card count');
}

/**
 * Count future owner turns that can start with a successful mandatory draw
 * under a finite sequence of per-turn draw/mill effects and a stationary tail.
 *
 * The owner has already completed the mandatory draw for the current turn.
 * Each schedule row describes voluntary cards drawn by the owner this turn,
 * cards milled by the opponent before the next owner turn, and the mandatory
 * draw that starts that next owner turn. If the deck is empty before that
 * mandatory draw, no next owner turn starts. After the finite schedule, the
 * tail repeats indefinitely.
 *
 * All inputs are public counts or explicit hypothetical scenario values.
 * This function does not inspect card identities, select an action, or
 * estimate a game's winner.
 *
 * @param {number} remaining Owner deck count after the current mandatory draw.
 * @param {{ownerDraw:number,opponentMill:number}[]} schedule
 *   Per-turn effects, beginning with the current owner turn.
 * @param {{ownerDraw:number,opponentMill:number}} [tail]
 *   Stationary scenario after the finite schedule; defaults to Pass/no mill.
 * @returns {object} Future-turn budget and a reproducible public-count ledger.
 */
function futureOwnerStartsUnderSchedule(remaining,schedule,tail={
  ownerDraw:0,opponentMill:0
}){
  assertCardCount(remaining,'remaining');
  assert.ok(Array.isArray(schedule),'schedule must be an array');
  assert.ok(tail&&typeof tail==='object','tail must be a scenario object');
  assertCardCount(tail.ownerDraw,'tail.ownerDraw');
  assertCardCount(tail.opponentMill,'tail.opponentMill');

  let deck=remaining;
  let scheduledStarts=0;
  const ledger=[];

  for(let i=0;i<schedule.length;i++){
    const row=schedule[i];
    assert.ok(row&&typeof row==='object',
      'schedule rows must be scenario objects');
    assertCardCount(row.ownerDraw,'schedule['+i+'].ownerDraw');
    assertCardCount(row.opponentMill,'schedule['+i+'].opponentMill');

    const ownerCardsDrawn=Math.min(deck,row.ownerDraw);
    deck-=ownerCardsDrawn;
    const opponentCardsMilled=Math.min(deck,row.opponentMill);
    deck-=opponentCardsMilled;

    if(deck===0){
      ledger.push({
        scheduledOwnerTurn:i+1,
        ownerDrawRequested:row.ownerDraw,
        ownerCardsDrawn,
        opponentMillRequested:row.opponentMill,
        opponentCardsMilled,
        mandatoryDrawForNextOwnerTurn:0,
        deckAfterMandatoryDraw:0,
        nextOwnerTurnStarts:false
      });
      return {
        version:VERSION,
        futureOwnerStarts:scheduledStarts,
        scheduledFutureOwnerStarts:scheduledStarts,
        tailFutureOwnerStarts:0,
        remainingDeckAtTail:0,
        scheduleTerminatedBeforeNextOwnerTurn:true,
        ledger
      };
    }

    deck-=1;
    scheduledStarts++;
    ledger.push({
      scheduledOwnerTurn:i+1,
      ownerDrawRequested:row.ownerDraw,
      ownerCardsDrawn,
      opponentMillRequested:row.opponentMill,
      opponentCardsMilled,
      mandatoryDrawForNextOwnerTurn:1,
      deckAfterMandatoryDraw:deck,
      nextOwnerTurnStarts:true
    });
  }

  const tailStarts=Math.floor(
    deck/(1+tail.ownerDraw+tail.opponentMill)
  );
  return {
    version:VERSION,
    futureOwnerStarts:scheduledStarts+tailStarts,
    scheduledFutureOwnerStarts:scheduledStarts,
    tailFutureOwnerStarts:tailStarts,
    remainingDeckAtTail:deck,
    scheduleTerminatedBeforeNextOwnerTurn:false,
    ledger
  };
}

module.exports={VERSION,futureOwnerStartsUnderSchedule};
