'use strict';

const {runIssue25V8WithOwnerAbilityPolicy}=
  require('./agent36-issue25-v8-owner-ability-policy.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const VERSION='agent24-frozen-v8-bilateral-perfection-root-development-v1';

/**
 * Keep the registered v8 source and incumbent native policies, enabling the
 * already implemented owner-visible, paid Perfection proposer on BOTH seats.
 * An actual Store ChooseAttackPrompt remains mandatory; this is not an
 * implied attack, a hand-information oracle or a competitive result.
 *
 * @param {object} options Existing exact-deal v8 native runner options.
 * @param {Function} [run] Native developmental runner or a test seam.
 * @returns {object}
 */
function runWithBilateralPerfection(options,run=runDevelopment) {
  return run({...options,actorOnlyComposition:true,bilateralPerfectionRoot:true});
}

/**
 * Reuse the frozen eight original source arms and the actual Telepath and
 * owner-Ability prompt layers from the already published v8 continuation.
 *
 * @param {{runV8?:Function}} [deps]
 * @returns {object}
 */
function runV8BilateralPerfectionRoot(deps={}) {
  const result=runIssue25V8WithOwnerAbilityPolicy({
    ...(deps.runV8?{runV8:deps.runV8}:{}),
    v8Deps:{runner:options=>runWithBilateralPerfection(options)}
  });
  const rows=result.rawDevelopment?.rows??[];
  return {
    version:VERSION,
    mode:'retrospective-eight-frozen-original-source-arms',
    policies:{sameBothSeats:true,existingTelepathAndConfirm:true,
      actorRootOptIn:'bilateralPerfectionRoot',
      firstPlayerAttackRestrictionPreserved:true,
      noOpponentHiddenReadForProposal:true,
      promptResolutionOwnerScoped:true},
    registration:result.manifest?.originalSourceRegistration??null,
    vendorPin:result.manifest?.observedGitVendorPinExpected??null,
    trialSummaries:rows.map(row=>({
      id:row.trial?.id??row.id??null,
      rootActionCount:row.rootActionCount??null,
      finished:row.finished===true,
      actorRoot:row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root??null,
      actorChooseAttack:row.actorOnlyDecisionCoverage?.detailedComponentAudits?.chooseAttack??null,
      rootActionLedger:row.rootActionLedger??null,
      attackDeclarationTrace:row.attackDeclarationTrace??null
    })),
    manifest:result.manifest,
    diagnostic:result.diagnostic,
    releaseQualified:false,competitiveGamesQualified:0
  };
}

if(require.main===module) {
  const report=runV8BilateralPerfectionRoot();
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}

module.exports={VERSION,runWithBilateralPerfection,
  runV8BilateralPerfectionRoot};
