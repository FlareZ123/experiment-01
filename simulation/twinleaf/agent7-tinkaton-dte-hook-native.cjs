'use strict';

const assert=require('node:assert/strict');
const {runArm}=require('./agent7-tinkaton-press-dte-native.cjs');
const {VERSION}=require('./agent7-tinkaton-dte-hook.cjs');

function run(){
  const arms=[];
  for(const seat of [0,1]){
    const baseline=runArm(seat,true,false);
    const corrected=runArm(seat,true,true);
    const postRestore=runArm(seat,true,false);
    const unaffected=runArm(seat,false,true);
    assert.deepEqual(
      [baseline.damage,corrected.damage,postRestore.damage,unaffected.damage],
      [140,120,140,140]
    );
    assert.equal(corrected.nativePaperParity,true);
    assert.equal(unaffected.nativePaperParity,true);
    assert.equal(baseline.nativePaperParity,false);
    assert.equal(postRestore.nativePaperParity,false);
    arms.push({seat,baseline,corrected,postRestore,unaffected});
  }
  return {version:VERSION,enginePin:
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourcePrinting:'Tinkaton ex SVP',
    paperDamageWithDte:120,
    originalNativeDamageWithDte:140,
    correctedNativeDamageWithDte:120,
    originalNativeDamageAfterHookRestore:140,
    bothPhysicalSeats:true,experimentalScopedHook:true,
    artificialMidgame:true,qualifiedCompetitiveGames:0,arms,
    limit:'Only Double Turbo reduction on this one printed attack is patched. No claim of general card fidelity, real source deals or field win rate.'};
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
