'use strict';
const assert=require('node:assert/strict');
const {runOne}=require('./agent47-celestial-roar-double-dragon-pinned-native.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const CASES=Object.freeze([
  ...[0,1].flatMap(seat=>['special-only','special-and-basic',
    'basic-and-two-trainers'].map(scenario=>({seat,scenario})))
]);

/**
 * Actual pinned Store, original rank20 printed sixty, staged top-three.
 * Source fidelity preconditions are inside Agent47's existing fixture.
 * Keep every attempted cell, including native errors.
 */
function main(){
  const rows=CASES.map(({seat,scenario})=>{
    try{
      const x=runOne(seat,scenario,true);
      const corrected=x.paperCorrected===true&&
        x.physicalSourceCardsInZones===60&&
        x.physicalCardLeak===false&&
        x.hookAudit?.nativeEffectSettlements===1&&
        x.hookAudit?.replacedAttackResolutions===1&&
        (scenario==='basic-and-two-trainers'?
          x.hookAudit?.nativeSelectedTransfers===1:
          x.hookAudit?.nativeSelectedTransfers>=1)&&
        (scenario==='basic-and-two-trainers'||
          x.settledAttached?.filter(p=>
            p==='Double Dragon Energy ROS').length===2);
      return {seat,scenario,status:corrected?
        'pinned-native-staged-hook-settled':'FAIL_EXPECTED_EFFECT',
        nativeOutcome:x};
    }catch(error){
      return {seat,scenario,status:'native-error',message:
        String(error?.stack??error).slice(0,1200)};
    }
  });
  const successful=rows.filter(r=>
    r.status==='pinned-native-staged-hook-settled').length;
  return {schema:'agent33-original-source60-celestial-paper-hook-staged-v1',
    pinnedTwinleaf:PIN,registeredStagedCases:CASES.length,
    attempted:rows.length,successful,allPassed:successful===CASES.length,
    scenarios:rows,competitiveQualifiedGames:0,
    sourceCardHook:
      'simulation/twinleaf/agent47-celestial-roar-paper-energy-hook.cjs',
    caveat:'Staged original rank20 60 with constructed top three, only exact physical-energy behavior; no naturally dealt source match, no tested opponent replies or game-strength claim'};
}
if(require.main===module){
  const result=main();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.allPassed)process.exitCode=1;
}
module.exports={CASES,main};
