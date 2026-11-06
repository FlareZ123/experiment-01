'use strict';

const assert=require('node:assert/strict');
const {withOwnerVoltTransfer}=
  require('../twinleaf/agent4-allturn-owner-volt-attach-energy.cjs');
const {withOriginalRank6PostVoltGuzma,
  chooseOriginalRank6PostVoltGuzma}=
  require('../twinleaf/agent9-v7-guzma-owner-canary.cjs');
const {withGuzmaOwnerPromptContinuation}=
  require('../twinleaf/agent43-guzma-prompt-continuation.cjs');
const {runStewardCommonVoltV7}=
  require('./agent36-issue25-common-v7.cjs');
const {runV7ReadOnlyOwnerAudit}=
  require('./agent9-v7-real-owner-native-audit.cjs');
const {buildReceipt}=
  require('./agent1-issue25-v4-public-receipt.cjs');

const VERSION='agent9-v7-same-eight-paid-guzma-counterfactual-v1';
const TARGET='6:201:B:champion-reference';
const EXPECTED_PASS_ORDINAL=32;

/**
 * Inject one genuinely paid printed Guzma root after the original policy
 * proposed Pass at an actor-visible registered source state. Agent43's
 * existing native continuation owns the resulting two Guzma switch prompts.
 * The mandatory physical Volt prompt handler is unchanged and both-seat.
 *
 * @param {{root?:Function,guzma?:Function,volt?:Function}} [deps]
 * @returns {Function} Callable v7 per-match nested research layer.
 */
function makeOriginalPostVoltGuzmaLayer(deps={}) {
  const root=deps.root??withOriginalRank6PostVoltGuzma;
  const guzma=deps.guzma??withGuzmaOwnerPromptContinuation;
  const volt=deps.volt??withOwnerVoltTransfer;
  return next=>{
    try {
      const observed=root(()=>guzma(()=>volt(next),{
        choosePlan:chooseOriginalRank6PostVoltGuzma
      }));
      const withPrompt=observed.result;
      const withVolt=withPrompt.result;
      assert.ok(withVolt&&typeof withVolt==='object');
      return {result:withVolt.result,audit:{
        ...withVolt.audit,
        agent9PostVoltGuzmaCanaryAudit:observed.audit,
        agent43GuzmaPromptContinuationAudit:withPrompt.audit
      }};
    } catch(error) {
      if(error&&typeof error==='object'){
        error.nativeOwnerVoltAttemptAudit={
          ...(error.nativeOwnerVoltAttemptAudit??{}),
          agent9PostVoltGuzmaCanaryAudit:
            error.agent9GuzmaCanaryAudit??null
        };
      }
      throw error;
    }
  };
}

/**
 * Compare a readonly exact original v7 control to an eight-arm v7 treatment.
 * Never silently discard non-target rows, errors, or truncated roots.
 * Distinct control/Treatment roots after genuine Guzma are an expected result.
 * @param {object} control Original `runV7ReadOnlyOwnerAudit` result.
 * @param {object} treatment Selected v7 result.
 * @param {object} nativeTreatmentReceipt Complete treatment buildReceipt.
 * @returns {object} Observational paired-cell report.
 */
function compareExactOriginalGuzma(control,treatment,nativeTreatmentReceipt){
  const baseline=control.nativeReceipt.attempts;
  const altered=nativeTreatmentReceipt.attempts;
  assert.equal(baseline.length,8);
  assert.equal(altered.length,8);
  const byId=new Map(altered.map(r=>[r.id,r]));
  assert.equal(byId.size,8);
  const byLabel=new Map(treatment.diagnostic.ownerVoltMatchAudit.attempts
    .map(r=>[r.label,r]));
  const rows=[];
  for(const a of baseline) {
    const b=byId.get(a.id);
    assert.ok(b,'treatment must preserve registered original arm');
    const label='agent41-bilateral-v2-common-policy-development-'+a.id;
    const applied=byLabel.get(label);
    assert.ok(applied,'treatment observer audit must bind original ID');
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint,
      'same source opening is required');
    assert.equal(a.fullPhysicalDealFingerprint,b.fullPhysicalDealFingerprint,
      'same complete two-player physical opening is required');
    assert.equal(a.publicRootActionsTruncated,false);
    assert.equal(b.publicRootActionsTruncated,false);
    const prior=a.publicRootActions,after=b.publicRootActions;
    const common=Math.min(prior.length,after.length);
    let matching=0;
    while(matching<common &&
      JSON.stringify(prior[matching])===JSON.stringify(after[matching]))
      matching++;
    const firstControl=prior[matching]??null;
    const firstTreatment=after[matching]??null;
    const row={id:a.id,sourceDealFingerprint:a.sourceDealFingerprint,
      baselineStatus:a.status,treatmentStatus:b.status,
      baselineRoots:prior.length,treatmentRoots:after.length,
      initialEntireDealUnchanged:true,
      unchangedPublicRootsBeforeFirstDifference:matching,
      firstControlDifference:firstControl,
      firstTreatmentDifference:firstTreatment,
      completePublicRootsEqual:matching===prior.length&&
        matching===after.length,
      guzmaCanary:applied.volt?.agent9PostVoltGuzmaCanaryAudit??null,
      guzmaPromptContinuation:
        applied.volt?.agent43GuzmaPromptContinuationAudit??null,
      attackOrGameOutcomeQualified:false};
    rows.push(row);
  }
  return {version:VERSION,targetId:TARGET,
    targetExpectedOriginalPassOrdinal:EXPECTED_PASS_ORDINAL,
    arms:rows.length,
    sameOriginalPhysicalOpenings:rows.every(x=>
      x.initialEntireDealUnchanged),
    nonTargetExactPublicReplays:rows.filter(x=>
      x.id!==TARGET&&x.completePublicRootsEqual).length,
    target:rows.find(x=>x.id===TARGET),
    rows,competitiveGamesQualified:0,estimatedWinRate:null};
}

/**
 * @param {{runControl?:Function,runTreatment?:Function,receipt?:Function,
 *  voltLayer?:Function}} [deps]
 * @returns {object} Control, treatment and equality receipts.
 */
function runOriginalV7GuzmaCanary(deps={}) {
  const control=(deps.runControl??runV7ReadOnlyOwnerAudit)();
  const selected=(deps.runTreatment??runStewardCommonVoltV7)({
    voltLayer:deps.voltLayer??makeOriginalPostVoltGuzmaLayer()
  });
  assert.equal(selected.manifest.releaseQualified,false);
  const treatmentReceipt=(deps.receipt??buildReceipt)(selected,{
    policyEntryPoint:selected.manifest.policyEntryPoint
  });
  const comparison=compareExactOriginalGuzma(
    control,selected,treatmentReceipt);
  return {schema:VERSION,
    checkout:selected.manifest.observedRepositoryGitCommit,
    vendorPin:selected.manifest.observedTwinleafGitCommit,
    originalPolicyEntry:selected.manifest.policyEntryPoint,
    sourceAndOpponentPrintedSixtiesUnchanged:true,
    nativeRootLimit:selected.manifest.nativeRootActionLimit,
    controlReceipt:control.nativeReceipt,
    treatmentReceipt,
    comparison,
    competitorPolicyQualified:false,
    paperPaidGuzmaCertified:false,
    competitiveGamesQualified:0,winRate:null};
}

module.exports={VERSION,TARGET,EXPECTED_PASS_ORDINAL,
  makeOriginalPostVoltGuzmaLayer,compareExactOriginalGuzma,
  runOriginalV7GuzmaCanary};
