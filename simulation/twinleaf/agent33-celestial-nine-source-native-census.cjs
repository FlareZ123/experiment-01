'use strict';

const assert=require('node:assert/strict');
const registration=require('../../results/als/registrations/agent33-celestial-nine-source-native-20261101.json');
const {registration:sourceRegistration}=
  require('./agent47-rank20-apex-natural-audit.cjs');
const {runOne}=require('./agent33-celestial-original3-native-paired.cjs');
const {initializeCards}=require('./headless.cjs');

/**
 * All 36 arms and their seeds were fixed in the registration before any game.
 * This is a mechanical source-field portability study, not policy optimization.
 */
function trials(){
  const list=[];
  for(const sourceRank of registration.sourceRanks)
    for(const opponentRank of registration.opponentRanks){
      const seed=registration.seedForSourceAndOpponent[
        sourceRank+':'+opponentRank];
      assert.ok(Number.isSafeInteger(seed),'missing original random seed');
      for(const sourceSeat of registration.physicalSourceSeats)
        list.push({sourceRank,opponentRank,sourceSeat,seed,
          registeredMaxActions:registration.maxRootActions});
    }
  assert.equal(list.length,registration.rowsExpected);
  return list;
}
function main(){
  initializeCards();
  const {byRank}=sourceRegistration();
  const cases=trials();
  const rows=cases.map(trial=>{
    const source=byRank.get(trial.sourceRank);
    const opponent=byRank.get(trial.opponentRank);
    if(source?.playableUnderEngine!==true||
       opponent?.playableUnderEngine!==true||
       source?.cardIds?.length!==60||
       opponent?.cardIds?.length!==60)
      return {trial,result:{status:'original-print-engine-unavailable',
        sourcePlayability:source?.playableUnderEngine??null,
        opponentPlayability:opponent?.playableUnderEngine??null}};
    try{
      return {trial,result:runOne(trial,byRank)};
    }catch(error){
      return {trial,result:{status:'setup-or-uncaught-native-error',
        message:String(error?.stack??error).slice(0,900)}};
    }
  });
  const status={};
  for(const row of rows){
    const key=row.result.status;
    status[key]=(status[key]??0)+1;
  }
  const passed=rows.filter(r=>
    r.result.status==='settled-physical-60-passed');
  const bySource=registration.sourceRanks.map(sourceRank=>{
    const subset=rows.filter(r=>r.trial.sourceRank===sourceRank);
    return {sourceRank,attempted:subset.length,
      settledPhysicalPassed:subset.filter(r=>
        r.result.status==='settled-physical-60-passed').length,
      anyNativeCelestialIntercepts:subset.some(r=>
        (r.result.hookAudit?.replacedAttackResolutions??0)>0),
      candidateSpecialEnergyCards:subset.reduce((n,r)=>
        n+(r.result.hookAudit?.candidateSpecialEnergyCards??0),0),
      nativeErrors:subset.filter(r=>
        r.result.status==='native-error').length};
  });
  const counts={
    registered:cases.length,attempted:rows.length,
    outcomesByStatus:status,
    settledRootsChecked:passed.reduce((n,r)=>
      n+r.result.game.settledRootsChecked,0),
    actualHookAttackInterceptions:rows.reduce((n,r)=>
      n+(r.result.hookAudit?.replacedAttackResolutions??0),0),
    nativeEligibleSpecialEnergyCandidates:rows.reduce((n,r)=>
      n+(r.result.hookAudit?.candidateSpecialEnergyCards??0),0),
    nativeEligibleBasicEnergyCandidates:rows.reduce((n,r)=>
      n+(r.result.hookAudit?.candidateBasicEnergyCards??0),0),
    fullGameEngineTerminals:rows.filter(r=>
      r.result.game?.finished===true).length,
    nativeCaps:rows.filter(r=>
      r.result.game?.nativeActions===
        registration.maxRootActions).length
  };
  return {schema:'agent33-nine-original-regidrago-source-paper-hook-census-v1',
    registration,counts,bySource,rows,
    allRegisteredRowsRetained:rows.length===registration.rowsExpected,
    strictOriginalSixtyPhysicalGate:true,
    competitiveQualifiedGames:0,
    caveat:'One preregistered seed per original source/opponent, both source seats. Native 120-action development caps and original weak bot. Celestial full-energy hook explicit and reversible, unknown paper parity for other card interactions. No credible win-rate or 32/32 game qualification.'};
}
if(require.main===module){
  const result=main();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.counts.outcomesByStatus['settled-physical-60-passed']!==
      registration.rowsExpected)process.exitCode=1;
}
module.exports={trials,main};
