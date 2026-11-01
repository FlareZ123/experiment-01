'use strict';

const assert=require('node:assert/strict');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {runOne}=require('./agent33-celestial-original3-native-paired.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Retrospective full frozen cohort: exact same 24 original rank20 source-vs-
 * rank1/11 trials from Agent47's independent historical native baseline.
 * Policy and seed remain unchanged; paper-energy reducer and physical guard
 * are explicitly opt-in, preserving every error and cap as an attempted cell.
 */
function main(){
  const {initializeCards} = require('./headless.cjs');
  initializeCards();
  const {byRank,trials}=registration();
  assert.equal(trials.length,24);
  const rows=trials.map(trial=>({
    trial,result:runOne(trial,byRank)
  }));
  const successful=rows.filter(r=>
    r.result.status==='settled-physical-60-passed');
  const errors=rows.filter(r=>r.result.status==='native-error');
  const unverified=rows.filter(r=>
    r.result.status==='physical-integrity-unverified');
  const byOpponent=[1,11].map(opponentRank=>{
    const subset=rows.filter(r=>r.trial.opponentRank===opponentRank);
    return {opponentRank,attempted:subset.length,
      physicalPassed:subset.filter(r=>
        r.result.status==='settled-physical-60-passed').length,
      nativeErrors:subset.filter(r=>r.result.status==='native-error').length,
      sourceSeats:[0,1].map(seat=>({
        seat,attempted:subset.filter(r=>r.trial.sourceSeat===seat).length,
        conserved:subset.filter(r=>r.trial.sourceSeat===seat&&
          r.result.status==='settled-physical-60-passed').length
      }))};
  });
  const counts={
    registeredGames:24,attempted:rows.length,
    physicalPassed:successful.length,nativeErrors:errors.length,
    physicalUnverified:unverified.length,
    nativeHookAttackInterceptions:rows.reduce((n,r)=>
      n+(r.result.hookAudit?.replacedAttackResolutions??0),0),
    nativeEligibleSpecialEnergyCards:rows.reduce((n,r)=>
      n+(r.result.hookAudit?.candidateSpecialEnergyCards??0),0),
    nativeEligibleBasicEnergyCards:rows.reduce((n,r)=>
      n+(r.result.hookAudit?.candidateBasicEnergyCards??0),0),
    nativeHookPromptSettlements:rows.reduce((n,r)=>
      n+(r.result.hookAudit?.nativeEffectSettlements??0),0),
    nativeTerminals:rows.filter(r=>r.result.game?.finished===true).length,
    actionCaps:rows.filter(r=>r.result.game?.nativeActions===160).length,
    totalSettledRootsChecked:successful.reduce((n,r)=>
      n+r.result.game.settledRootsChecked,0)
  };
  return {
    schema:'agent33-retrospective-frozen-24-original-source-celestial-hook-v1',
    enginePin:PIN,
    sourceOriginalRank:20,opponentOriginalRanks:[1,11],
    registeredSeeds:[1847000101,1847000102,1847000103,
      1847000104,1847000105,1847000106],
    sourceSeats:[0,1],maxActions:160,
    sameSourcePopulationAsAgent47Original24:true,
    treatmentChanges:'opt-in original-print Celestial all-Energy native reducer and strict physical source-custody guard',
    counts,byOpponent,rows,
    allAttemptedRowsPreserved:rows.length===24,
    competitiveQualifiedGames:0,
    caveat:'Retrospective repair cohort selected after learning native Celestial defects; not an independent prospective frequency or competitive win test. Full source initial physical deals and engine outcomes must be checked against the archived original-24 baseline externally.'
  };
}
if(require.main===module){
  const out=main();
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
  if(out.counts.physicalPassed!==24)process.exitCode=1;
}
module.exports={main};
