'use strict';

const {runIssue25V8WithOwnerAbilityPolicy}=
  require('./agent36-issue25-v8-owner-ability-policy.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const VERSION='agent24-v8-perfection-plus-bilateral-recipient-frontier-260native-v1';

/**
 * Test a gameplay hypothesis: an actor-visible Energy recipient decision
 * may pre-fund Mewtwo before Perfection becomes the live attacking line.
 * Compare with the already archived identical v8 rank11 Perfection-only
 * 260-root run. This opt-in changes neither cardlists nor the frozen baseline.
 *
 * @param {{runner?:Function}} [deps]
 * @returns {object}
 */
function runPerfectionWithRecipientFrontier(deps={}){
  const runner=deps.runner??runDevelopment;
  const result=runIssue25V8WithOwnerAbilityPolicy({
    v8Deps:{runner:options=>runner({
      ...options,actorOnlyComposition:true,
      bilateralPerfectionRoot:true,
      bilateralBasicEnergyRecipientFrontier:true,
      nativeRootActionLimit:260
    })}
  });
  const outcomes=new Map((result.diagnostic.actualAttemptRows??[])
    .map(x=>[x.id,x]));
  return {
    version:VERSION,
    reference:'existing same-deal 260-root Perfection-only native archive',
    policyDelta:'bilateralBasicEnergyRecipientFrontier enabled on both seats',
    originalDecksAndSeatsUnchanged:true,actualNativeRootLimit:260,
    rows:(result.rawDevelopment?.rows??[]).map(row=>{
      const id=row.trial?.id??row.id;
      const x=outcomes.get(id)??{};
      const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??{};
      return {
        trial:id,sourceSeat:x.sourceSeat??null,candidateSeat:x.candidateSeat??null,
        physicalDeal:x.fullPhysicalDealFingerprint??null,
        status:x.status??null,finished:x.finished??null,winner:x.winner??null,
        nativeRootCount:x.rootActionCount??null,
        remainingPrizes:x.finalPrizes??null,
        energyRecipientFrontierActive:
          audit.energyRecipientFrontierOptIn??false,
        perfectionIntents:audit.typedIntentCounts?.perfection??0,
        energyIntents:audit.ownerRootIntents?.filter(x=>
          x.intent?.kind==='attach-basic-energy'||
          x.intent?.kind==='attach-special-energy')??[],
        actualNativeRootActions:row.rootActionLedger??null,
        actorRootIntents:audit.ownerRootIntents??[]
      };
    }),
    releaseQualified:false,competitiveGamesQualified:0
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(runPerfectionWithRecipientFrontier(),null,2)+'\n');
}

module.exports={VERSION,runPerfectionWithRecipientFrontier};
