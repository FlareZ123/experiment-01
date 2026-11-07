'use strict';

const assert=require('node:assert/strict');
const {runSeat}=require('./agent46-mimikyu-apex-consecutive-native.cjs');
const {withPreselectedNativeMimikyuApexTimeless}=
  require('./agent46-mimikyu-apex-synchronous-hook.cjs');

/**
 * Actual consecutive native Apex then Mimikyu attacks, same staged physical
 * setup, comparing original and reversible preselected synchronous Dialga GX.
 * The latter is an effect-settlement diagnostic, not a player-choice policy.
 *
 * @returns {object} Owner physical damage/GX/extra-turn state under both seats.
 */
function run(){
  const rows=[];
  for(const seat of [0,1]){
    const baseline=runSeat(seat);
    assert.equal(baseline.error,null);
    assert.equal(baseline.mimikyuOpponentDamage,0);
    const trial=withPreselectedNativeMimikyuApexTimeless(()=>
      runSeat(seat));
    assert.equal(trial.audit.restoreVerified,true);
    rows.push({seat,
      originalPreviousAttack:baseline.originalSourceLastAttackAfterResolvedApex,
      originalDamage:baseline.mimikyuOpponentDamage,
      originalGXUsed:baseline.mimikyuOwnerGXUsed,
      sourceActualPreviousAttack:
        trial.result.originalSourceLastAttackAfterResolvedApex,
      hookAudit:trial.audit,
      nativeDamage:trial.result.mimikyuOpponentDamage,
      nativeGXUsed:trial.result.mimikyuOwnerGXUsed,
      nativeTurnSkip:trial.result.mimikyuOwnerTurnSkip,
      nativeTurnSkipClearArmed:trial.result.mimikyuOwnerTurnSkipClearArmed,
      afterTurn:trial.result.globalTurnAfter,
      afterActiveSeat:trial.result.activePlayerAfter,
      error:trial.result.error,pending:trial.result.nativePending,
      timeline:trial.result.history});
  }
  const out={schema:'agent46-mimikyu-apex-preselected-synchronous-effect-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    priorAttackFromNativeActualTurn:true,
    chosenDragonPayload:'Dialga-GX UPR Timeless-GX',
    sourceOriginalHandler:true,discretionaryChoiceSimulated:false,
    researchHookDefaultOff:true,noVendorEdits:true,
    qualifiedCompetitiveGames:0,rows};
  console.log('AGENT46_APEX_SYNCHRONOUS_PAYLOAD '+JSON.stringify(out));
  return out;
}
if(require.main===module)run();
module.exports={run};
