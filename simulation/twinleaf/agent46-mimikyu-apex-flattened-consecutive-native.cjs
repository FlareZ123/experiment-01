'use strict';

const assert=require('node:assert/strict');
const {runSeat}=require('./agent46-mimikyu-apex-consecutive-native.cjs');
const {withMimikyuApexFlattenedCounterline}=
  require('./agent46-mimikyu-apex-flattened-hook.cjs');

/**
 * Evaluate the exact narrowed paper-equivalent flattening with Regidrago's
 * prior Apex Dragon genuinely executed in the same real native Store. No
 * prior-attack metadata is injected. Both branches use staged equal boards.
 *
 * @returns {object} Two-seat consecutive printed native action records.
 */
function run(){
  const rows=[];
  for(const seat of [0,1]){
    const baseline=runSeat(seat);
    assert.equal(baseline.error,null);
    assert.equal(baseline.originalSourceLastAttackAfterResolvedApex?.attack,
      'Apex Dragon');
    assert.equal(baseline.mimikyuOpponentDamage,0);
    const trial=withMimikyuApexFlattenedCounterline(()=>
      runSeat(seat,{chooseMimikyuTimeless:true}));
    assert.equal(trial.audit.restored,true);
    rows.push({seat,
      realPreviousApex:baseline.originalSourceLastAttackAfterResolvedApex,
      baselineDamage:baseline.mimikyuOpponentDamage,
      baselineUsedGX:baseline.mimikyuOwnerGXUsed,
      audit:trial.audit,
      nativeDamage:trial.result.mimikyuOpponentDamage,
      nativeUsedGX:trial.result.mimikyuOwnerGXUsed,
      nativeTurnSkip:trial.result.mimikyuOwnerTurnSkip,
      nativeTurnSkipClearArmed:trial.result.mimikyuOwnerTurnSkipClearArmed,
      nativePostTurn:trial.result.globalTurnAfter,
      nativeActiveSeat:trial.result.activePlayerAfter,
      nativePending:trial.result.nativePending,
      nativeError:trial.result.error,
      nativeEvents:trial.result.history});
  }
  const out={schema:'agent46-mimikyu-real-apex-flattened-timeless-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRealAttackOnPreviousTurn:true,
    sameStagedResources:true,
    ownerPreviousAttackMetadataInjected:false,
    researchHookDefaultOff:true,
    completePaperGameQualified:false,qualifiedCompetitiveGames:0,rows};
  console.log('AGENT46_APEX_FLATTENED_CONSECUTIVE '+JSON.stringify(out));
  return out;
}
if(require.main===module)run();
module.exports={run};
