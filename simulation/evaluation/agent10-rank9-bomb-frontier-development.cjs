'use strict';
const assert=require('node:assert/strict');
const {scheduledArms}=require('./agent10-original-rank9-absol-electrode-development.cjs');
const {VERSION:CONTROL_VERSION,run:runKnownDead}=
  require('./agent10-rank9-known-dead-attack-counterfactual.cjs');
const {withRank9BombOwnerFrontier,VERSION:OBSERVER_VERSION}=
  require('../twinleaf/agent10-rank9-extra-energy-bomb-owner-frontier.cjs');
const VERSION='agent10-rank9-native-bomb-owner-frontier-replay-v1';

/** Reuse original four authenticated source deals, both source seats, unchanged policy. */
function run(){
  const trials=scheduledArms();
  assert.equal(trials.length,4);
  const actual=withRank9BombOwnerFrontier(runKnownDead,{
    trialSourceSeats:trials.map(x=>x.candidateSlot==='A'?1:0)
  });
  assert.equal(actual.result.version,CONTROL_VERSION);
  const rows=actual.result.rows??[];
  const audit=actual.audit;
  const perTrial=trials.map((trial,i)=>{
    const nativeRow=rows[i]??null;
    const observed=audit.trials[i]??null;
    const verified=!!nativeRow&&observed?.sourceSeat===nativeRow.sourceSeat&&
      nativeRow.trial?.id===trial.id&&audit.oneStorePerRegisteredTrial;
    const firstRoots=observed?.firstOwnerRoots??[];
    const passes=observed?.acceptedSourcePasses??[];
    const knownElectrodePasses=passes.filter(x=>x.sourceHasElectrode);
    const physicalTransferPasses=knownElectrodePasses.filter(x=>
      x.possibleEnergyTransferGeometry);
    return {
      id:trial.id,sourceSeat:nativeRow?.sourceSeat??null,
      attributionVerified:verified,
      nativeActionLedgerSha256:nativeRow?.rootActionLedgerSha256??null,
      nativeActionCount:nativeRow?.actionCount??null,
      nativeFinished:nativeRow?.finished??null,
      nativeWinner:nativeRow?.winner??null,
      acceptedPasses:passes.length,
      sourceFirstRoots:firstRoots.length,
      passesWithElectrode:knownElectrodePasses.length,
      passesWithElectrodeAndEnergyDiscarded:
        knownElectrodePasses.filter(x=>x.anyEnergyInDiscard).length,
      passesWithPhysicalRecipientAndEnergy:physicalTransferPasses.length,
      passesWithFiveDiscardEnergy:
        knownElectrodePasses.filter(x=>x.atLeastFiveEnergyCardsInDiscard).length,
      passesWithEligibleMegaAbsol:
        knownElectrodePasses.filter(x=>x.eligibleMegaAbsolEx).length,
      passesWithApparentImmediatePrizeLossRisk:
        knownElectrodePasses.filter(x=>x.apparentTwoPrizeSelfKoRisk).length,
      originalSourceAbilityRoots:observed?.sourceAbilityRoots??[],
      allNativeOwnerPassSnapshots:passes,
      nativeOwnerFirstRootSnapshots:firstRoots,
      limitation:'Retrospective selected original 4 deals, observer-only physical resource geometry. No demonstration of ability legality, preference, settlement, paper effect or qualified win.'
    };
  });
  return {
    version:VERSION,controlVersion:CONTROL_VERSION,
    observerVersion:OBSERVER_VERSION,
    researchHeadCommit:process.env.GITHUB_SHA??null,
    sourceRevision:actual.result.sourceClosureSha256,
    enginePin:actual.result.enginePin,
    originalPrint:actual.result.originalSourceInspection,
    attempted:actual.result.attempted,
    expectedAttempts:4,
    complete:actual.result.complete&&rows.length===4,
    originalNativeResults:actual.result,
    observerAudit:audit,
    attributionVerified:perTrial.every(x=>x.attributionVerified),
    perTrial,
    competitiveQualifiedGames:0,
    caveat:'Same previously inspected source seed groups as Agent5 Claw replay; original known-dead policy unchanged. This is a retrospective native Store opportunity census with owner-only and public zones; all games unqualified.'
  };
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.complete||!result.attributionVerified)process.exitCode=1;
}
module.exports={VERSION,run};
