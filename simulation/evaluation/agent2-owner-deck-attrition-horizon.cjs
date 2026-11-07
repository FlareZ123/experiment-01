'use strict';

const assert=require('node:assert/strict');

const VERSION='agent2-deterministic-owner-deck-attrition-horizon-v1';

/**
 * Count how many future acting-owner turns can *begin* with a legal mandatory
 * draw under a fixed repetitive public scenario. The current turn's mandatory
 * draw has already occurred. Each current/future turn voluntarily draws f
 * cards (or all remaining cards if fewer), then the opponent mills m cards
 * before the next owner's compulsory one-card draw.
 *
 * This is an exact mathematical result under that stationary transition;
 * it is NOT a winning-policy estimate or a claim the opponent will mill.
 * Recovery, other card draws, Prizes, special card rules and early terminals
 * are deliberately excluded.
 *
 * @param {number} remaining Own publicly known deck count at current root.
 * @param {number} voluntaryDraw Number attempted each own turn.
 * @param {number} opposingMill Number removed each opponent turn.
 * @returns {number} Maximum subsequent own turn starts under the scenario.
 */
function futureOwnerStarts(remaining,voluntaryDraw,opposingMill){
  for(const [name,n] of Object.entries({
    remaining,voluntaryDraw,opposingMill
  }))assert.ok(Number.isSafeInteger(n)&&n>=0&&n<=60,
    name+' must be a feasible nonnegative card count');
  return Math.floor(remaining/(1+voluntaryDraw+opposingMill));
}

/**
 * Owner-only, public-deck-count Filch versus Pass attrition comparison.
 * "Always" repeats the hypothetical action on all future owner turns;
 * "once" draws 2 only on this turn and subsequently always passes.
 *
 * @param {number} deckCount After current mandatory draw.
 * @param {number} opposingMillPerTurn Explicit scenario, not an inference.
 * @returns {object} Deterministic turn-budget comparison.
 */
function compareFilchPass(deckCount,opposingMillPerTurn){
  const f=2,m=opposingMillPerTurn;
  const passive=futureOwnerStarts(deckCount,0,m);
  const repeated=futureOwnerStarts(deckCount,f,m);
  const drawnNow=Math.min(deckCount,f);
  const once=futureOwnerStarts(deckCount-drawnNow,0,m);
  return {
    ownDeckCount:deckCount,opponentHypotheticalMillEachTurn:m,
    repeatPassFutureOwnTurns:passive,
    filchNowThenPassFutureOwnTurns:once,
    repeatFilchFutureOwnTurns:repeated,
    singleFilchTurnBudgetLost:passive-once,
    repeatedFilchTurnBudgetLost:passive-repeated,
    passCanBeginNextOwnTurn:deckCount>m,
    filchCanBeginNextOwnTurn:deckCount-drawnNow>m,
    nextTurnSurvivalStrictlyImprovedByPassing:
      deckCount>m&&deckCount-drawnNow<=m,
    paperGameQualified:false
  };
}

/**
 * Independent literal transition simulator for testing the closed form.
 * Only the constant stationary schedule is simulated.
 * @param {number} remaining
 * @param {number} voluntaryDraw
 * @param {number} opposingMill
 * @returns {number}
 */
function literalOwnStarts(remaining,voluntaryDraw,opposingMill){
  let deck=remaining,turns=0;
  for(;;){
    deck=Math.max(0,deck-voluntaryDraw);
    deck=Math.max(0,deck-opposingMill);
    if(deck===0)return turns;
    deck-=1;
    turns++;
  }
}

module.exports={VERSION,futureOwnerStarts,compareFilchPass,literalOwnStarts};
