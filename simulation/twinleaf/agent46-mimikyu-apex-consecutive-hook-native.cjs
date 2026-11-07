'use strict';

const assert=require('node:assert/strict');
const {runSeat}=require('./agent46-mimikyu-apex-consecutive-native.cjs');
const {withMimikyuApexPaperHypothesis}=
  require('./agent46-mimikyu-apex-paper-hook.cjs');

/**
 * Compare real two consecutive native attacks, baseline versus a reversible
 * exact-source non-GX Apex recognition hypothesis, with identical staged
 * beginning resources. No synthetic last-attack metadata is used in either
 * branch: Regidrago itself plays Apex and leaves the actual history.
 *
 * @returns {object} Paired native phase and GX/extra-turn effects both seats.
 */
function run(){
  const rows=[];
  for(const seat of [0,1]){
    const control=runSeat(seat);
    assert.equal(control.error,null);
    assert.equal(control.originalSourceLastAttackAfterResolvedApex?.attack,
      'Apex Dragon');
    assert.equal(control.mimikyuOpponentDamage,0);
    const trial=withMimikyuApexPaperHypothesis(()=>
      runSeat(seat,{chooseMimikyuTimeless:true}));
    assert.equal(trial.audit.restored,true);
    rows.push({seat,
      control:{lastAttack:control.originalSourceLastAttackAfterResolvedApex,
        mimikyuDamage:control.mimikyuOpponentDamage,
        ownerUsedGX:control.mimikyuOwnerGXUsed,
        timeline:control.history,
        error:control.error,pending:control.nativePending},
      hypothesis:{audit:trial.audit,
        mimikyuDamage:trial.result.mimikyuOpponentDamage,
        ownerUsedGX:trial.result.mimikyuOwnerGXUsed,
        ownerTurnSkip:trial.result.mimikyuOwnerTurnSkip,
        ownerTurnSkipClearArmed:trial.result.mimikyuOwnerTurnSkipClearArmed,
        timeline:trial.result.history,
        error:trial.result.error,pending:trial.result.nativePending,
        lastAttack:trial.result.originalSourceLastAttackAfterResolvedApex,
        afterGlobalTurn:trial.result.globalTurnAfter,
        afterActiveSeat:trial.result.activePlayerAfter}});
  }
  const out={schema:'agent46-real-consecutive-apex-mimikyu-timeless-prototype-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    directPreviousAttackInjection:false,
    researchHookReversible:true,identicalStagedPhysicalResources:true,
    selectedSourceCopiedAttack:'Overclock',
    selectedMimikyuNestedAttack:'Timeless-GX',
    wholePaperGameQualified:false,competitiveGames:0,rows};
  console.log('AGENT46_APEX_COPYCAT_REAL_CONSECUTIVE_HOOK '+JSON.stringify(out));
  return out;
}
if(require.main===module)run();
module.exports={run};
