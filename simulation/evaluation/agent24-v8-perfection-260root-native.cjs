'use strict';

const {createHash}=require('node:crypto');
const {runIssue25V8WithOwnerAbilityPolicy}=
  require('./agent36-issue25-v8-owner-ability-policy.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const VERSION='agent24-original-v8-bilateral-perfection-260root-development-v1';
const ACTION_CAP=260;

/**
 * Historical-exposure-only extension of unchanged v8 initial registrations.
 * The v8 parent’s 128-root limit is deliberately replaced at the leaf native
 * runner; outer manifests remain frozen and MUST NOT be misread as the
 * effective native execution cap. Native rows carry actual root counts.
 *
 * @param {{runner?:Function}} [deps]
 * @returns {object}
 */
function runV8Perfection260(deps={}){
  const runner=deps.runner??runDevelopment;
  const result=runIssue25V8WithOwnerAbilityPolicy({
    v8Deps:{runner:options=>runner({
      ...options,actorOnlyComposition:true,bilateralPerfectionRoot:true,
      nativeRootActionLimit:ACTION_CAP
    })}
  });
  const rows=result.rawDevelopment?.rows??[];
  const outcomes=new Map(
    (result.diagnostic.actualAttemptRows??[]).map(x=>[x.id,x]));
  return {
    version:VERSION,
    experiment:'historical first-128 native Perfection continuation to 260 roots',
    originalRegistration:result.manifest?.originalSourceRegistration??null,
    vendorPin:result.manifest?.observedGitVendorPinExpected??null,
    effectiveNativeRootLimit:ACTION_CAP,
    parentV8RegisteredRootLimit:128,
    parentV8ManifestLimitDoesNotDescribeTreatment:true,
    first128PrefixRequiresIndependentMatch:true,
    fullOriginalDecklistsUnchanged:true,
    policySymmetricBothSeats:true,
    treatments:rows.map(row=>{
      const id=row.trial?.id??row.id;
      const outcome=outcomes.get(id)??{};
      const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??{};
      const choice=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.chooseAttack??{};
      return {
        trial:id,status:outcome.status??null,
        rootActionCount:outcome.rootActionCount??null,
        finished:outcome.finished??null,
        winner:outcome.winner??null,
        sourceSeat:outcome.sourceSeat??null,
        candidateSeat:outcome.candidateSeat??null,
        finalPrizes:outcome.finalPrizes??null,
        sourceDealFingerprint:outcome.sourceDealFingerprint??null,
        fullPhysicalDealFingerprint:outcome.fullPhysicalDealFingerprint??null,
        nativePerfectionRootDecisions:root.typedIntentCounts?.perfection??0,
        chosenCopiedAttacks:choice.selections??[],
        selectedNativePromptCount:choice.accepted??0,
        rejectedNativePromptCount:choice.rejected??0,
        nativeAcceptedRootLedger:row.rootActionLedger??null,
        nativeLedgerSha256:Array.isArray(row.rootActionLedger)?
          createHash('sha256').update(JSON.stringify(row.rootActionLedger))
            .digest('hex'):null
      };
    }),
    resultManifest:result.manifest,
    resultDiagnostic:result.diagnostic,
    releaseQualified:false,competitiveGamesQualified:0
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(runV8Perfection260(),null,2)+'\n');
}

module.exports={VERSION,ACTION_CAP,runV8Perfection260};
