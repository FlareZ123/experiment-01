'use strict';

const assert=require('node:assert/strict');
const {probe}=require('./agent46-mimikyu-apex-copycat-native.cjs');
const {hookedTrial}=require('./agent46-mimikyu-apex-timeless-native.cjs');
const {withMimikyuApexFlattenedCounterline}=
  require('./agent46-mimikyu-apex-flattened-hook.cjs');

/**
 * Two-seat native physical equivalent of a flattened
 * Mimikyu Copycat -> Regidrago Apex Dragon -> Dialga-GX Timeless-GX.
 *
 * @returns {object} Trial answer: actual damage, GX, extra turn, no fabrication.
 */
function run(){
  const rows=[];
  for(const seat of [0,1]){
    const baseline=probe(seat,'apex');
    assert.equal(baseline.error,null);
    assert.equal(baseline.opponentDamageAfter,0);
    const trial=withMimikyuApexFlattenedCounterline(()=>hookedTrial(seat));
    assert.equal(trial.audit.intercepted,1);
    assert.equal(trial.audit.restored,true);
    rows.push({seat,
      baselineNoDamage:baseline.opponentDamageAfter===0,
      audit:trial.audit,
      newNestedTargetOffered:trial.result.choseTimeless,
      actualDamage:trial.result.opponentDamage,
      ownerGXUsed:trial.result.ownerGXUsed,
      ownerTurnSkip:trial.result.ownerTurnSkip,
      ownerTurnSkipClearArmed:trial.result.ownerTurnSkipClearArmed,
      nativeUnresolved:trial.result.pendingPrompts,
      error:trial.result.error,
      nativeTrace:trial.result.timeline});
  }
  const out={schema:'agent46-apex-flattened-timeless-native-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    source:'Mimikyu GRI Copycat',
    prior:'Regidrago VSTAR SIT Apex Dragon non-GX',
    selectedNativePayload:'Dialga-GX UPR Timeless-GX',
    realNativeStore:true,syntheticLastAttackRecord:true,
    optInExactPrintedLineOnly:true,
    wholeGamePaperQualified:false,competitiveQualifiedGames:0,rows};
  console.log('AGENT46_APEX_FLATTENED_NATIVE '+JSON.stringify(out));
  return out;
}
if(require.main===module)run();
module.exports={run};
