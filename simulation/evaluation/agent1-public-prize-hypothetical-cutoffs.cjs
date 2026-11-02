'use strict';

const assert=require('node:assert/strict');
const {
  adjudicateAfterTimeCall
}=require('./aichi-open-time-adjudication.cjs');

const VERSION='agent1-conditional-Aichi-Open-after-second-turn-Prize-sweep-v1';

/**
 * A conditional mathematics-only thought experiment over actual native Store
 * public Prize snapshots. Every row assumes an OTHERWISE UNOBSERVED referee
 * 25-minute time call and completed post-call second-starter turn.
 *
 * This is not a clock calibration, does not infer seconds from action/turn
 * counts, and does not exclude native post-final-turn Checkup. Never score
 * these rows as competitively qualified games.
 *
 * @param {object} nativeAudit Actual Store observer result.
 * @param {'round32'|'round16'|'quarterfinal'|'semifinal'|'final'} [bracketRound]
 * @returns {object} Conditional Prize classifications only.
 */
function hypotheticalBracketCutoffs(nativeAudit,bracketRound='round32'){
  assert.equal(nativeAudit?.version,'agent1-native-public-turn-prize-closure-v1');
  assert.equal(nativeAudit.paperClockCertified,false);
  assert.ok(Array.isArray(nativeAudit.closures));
  const snapshots=nativeAudit.closures
    .filter(row=>row.afterSecondStarterTurn===true)
    .map(row=>{
      assert.ok(Number.isSafeInteger(row.turnClosed)&&row.turnClosed>=2&&
        row.turnClosed%2===0);
      assert.ok(Array.isArray(row.afterPrizes)&&row.afterPrizes.length===2);
      assert.equal(row.paperTimeCallObserved,false);
      assert.equal(row.postFinalCheckupExcluded,false);
      const prizes=[...row.afterPrizes];
      // No simulated end-of-turn closure may claim an already-zero Prize
      // game terminal as an unresolved referee time call.
      if(prizes.some(count=>count===0))return {
        turnClosed:row.turnClosed,publicPrizes:prizes,
        conditionalStatus:'normal-win-termination-not-inferred',
        conditionalWinner:null
      };
      const imagined=adjudicateAfterTimeCall({
        stage:'bracket',bracketRound,
        verifiedRealClockCall:true,
        finalSecondPlayerTurnCompleted:true,
        finalPokemonCheckupExcluded:true,
        prizesNeededToWinBySeat:prizes
      });
      assert.equal(imagined.paperClockCertified,false);
      return {
        turnClosed:row.turnClosed,publicPrizes:prizes,
        conditionalStatus:imagined.status,
        conditionalWinner:imagined.winningSeat??null
      };
    });
  return {
    version:VERSION,bracketRound,
    qualifier:'CONDITIONAL_ONLY_IF_A_REAL_TIME_CALL_AND_REQUIRED_LAST_TURN_ENDS_HERE',
    actualPaperTimeCallObserved:false,
    nativePostCheckupCannotProveExcluded:true,
    paperClockCertified:false,
    snapshots
  };
}

module.exports={VERSION,hypotheticalBracketCutoffs};
