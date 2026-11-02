'use strict';
const assert=require('node:assert/strict');

/**
 * Conservative actual-Store source payoff witness: each settled native attack
 * must decrease the ATTACKING source seat's remaining Prize count.
 * Other tactical value (damage, disruption, setup) is intentionally outside
 * this narrow sufficient condition. Native Prize progress alone does not
 * certify real paper rules, timing, decisions or a game win.
 *
 * @param {{attacks?:Array<object>}|null} settlement Native public source packet.
 * @param {0|1} sourceSeat Physical actor position.
 */
function sourcePrizeProgress(settlement,sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  const attacks=settlement?.attacks??[];
  assert.ok(Array.isArray(attacks));
  const eligible=attacks.filter(attack=>
    attack.settledPromptChain===true &&
    Array.isArray(attack.prizesBefore) && attack.prizesBefore.length===2 &&
    Array.isArray(attack.prizesAfter) && attack.prizesAfter.length===2 &&
    [attack.prizesBefore[sourceSeat],attack.prizesAfter[sourceSeat]]
      .every(n=>Number.isSafeInteger(n)&&n>=0&&n<=6));
  const positive=eligible.map(attack=>({
    ordinal:attack.actionOrdinal,attackName:attack.attackName,
    prizesTaken:attack.prizesBefore[sourceSeat]-attack.prizesAfter[sourceSeat],
    sameEpochOpponentReturn:attack.nextSourceSameEpochProven===true
  })).filter(row=>row.prizesTaken>0);
  return {
    schema:'agent18-native-source-prize-progress-only-v1',
    sourceSeat,settledSourceAttacks:attacks.filter(
      attack=>attack.settledPromptChain===true).length,
    evaluableSourceAttacks:eligible.length,
    sourceAttacksWithNativePrizeProgress:positive.length,
    sourcePrizesTakenAcrossObservedAttacks:positive.reduce(
      (sum,row)=>sum+row.prizesTaken,0),
    actualSameEpochOpponentReturnsAfterPrizeProgress:positive.filter(
      row=>row.sameEpochOpponentReturn).length,
    attacks:positive,
    fullPaperRuleAuditPassed:false,
    tournamentClockAuditPassed:false,
    competitiveQualified:false
  };
}
module.exports={sourcePrizeProgress};
