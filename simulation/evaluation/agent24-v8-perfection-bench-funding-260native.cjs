'use strict';

const {runIssue25V8WithOwnerAbilityPolicy}=
  require('./agent36-issue25-v8-owner-ability-policy.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const VERSION='agent24-v8-perfection-plus-public-bench-funding-260native-v1';

/**
 * Historical original eight-arm v8 developmental experiment: permit both
 * players to invest a held Psychic Basic in an already visible Benched Mewtwo
 * toward a visible, known donor's payable copied attack. This distinguishes
 * a setup-changing plan from the previously observed late Perfection reward.
 *
 * @param {{runner?:Function}} [deps]
 * @returns {object}
 */
function runPerfectionWithBenchFunding(deps={}){
  const runner=deps.runner??runDevelopment;
  const result=runIssue25V8WithOwnerAbilityPolicy({
    v8Deps:{runner:options=>runner({
      ...options,actorOnlyComposition:true,bilateralPerfectionRoot:true,
      bilateralPerfectionBenchFunding:true,nativeRootActionLimit:260
    })}
  });
  const outcomes=new Map((result.diagnostic.actualAttemptRows??[])
    .map(x=>[x.id,x]));
  return {
    version:VERSION,
    originalDecksAndPhysicalSeatRegistrationUnchanged:true,
    effectiveNativeRootLimit:260,
    policyDelta:'both-seat actor-public Benched Mewtwo known-donor funding',
    rows:(result.rawDevelopment?.rows??[]).map(row=>{
      const id=row.trial?.id??row.id;
      const o=outcomes.get(id)??{};
      const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??{};
      return {
        trial:id,sourceSeat:o.sourceSeat??null,candidateSeat:o.candidateSeat??null,
        physicalDeal:o.fullPhysicalDealFingerprint??null,
        status:o.status??null,finished:o.finished??null,winner:o.winner??null,
        nativeRootCount:o.rootActionCount??null,
        remainingPrizes:o.finalPrizes??null,
        perfectionActions:root.typedIntentCounts?.perfection??0,
        benchPreFundingSelected:root.ownerRootIntents?.filter(x=>
          x.intent?.kind==='attach-basic-energy'&&
          x.intent?.donorAttack!=null)??[],
        actorOwnerRootIntents:root.ownerRootIntents??[],
        nativeStoreRootLedger:row.rootActionLedger??null
      };
    }),
    releaseQualified:false,competitiveGamesQualified:0
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runPerfectionWithBenchFunding(),null,2)+'\n');

module.exports={VERSION,runPerfectionWithBenchFunding};
