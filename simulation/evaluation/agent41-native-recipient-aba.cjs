'use strict';

const assert=require('node:assert/strict');
const {comparePairedAcceptedTargets,VERSION:TARGET_AUDIT_VERSION}=
  require('./agent41-native-paired-target-audit.cjs');

const VERSION='agent41-same-60-native-energy-recipient-aba-v1';
const COMMON_OPTIONS=Object.freeze({
  sourceFirstRetrospective:true,
  actorOnlyComposition:true,
  actorOnlySingleSearch:true,
  actorGenericFallbackAttribution:true,
  actorHandDiscard:true,
  actorChoosePokemon:true,
  paperSupporterQuota:true,
  mandatoryOptionFallback:true,
  paperSameTargetAttachEnergy:true,
  nativeAcceptedTargets:true
});
const FIXED_ROOT_ENV=Object.freeze({
  AGENT10_BASIC_ENERGY_FRONTIER_DEV:'true',
  AGENT8_ACTOR_QUICK_BALL_DEV:'true',
  AGENT3_SPECIAL_ENERGY_ROOT_DEV:'true',
  AGENT30_PERFECTION_ROOT_DEV:'true',
  AGENT1_NATURAL_EVOLUTION_ROOT_DEV:'false',
  AGENT6_PAID_RETREAT_ROOT_DEV:'false',
  AGENT1_THORNS_DIRECT_ROOT_DEV:'false',
  AGENT41_ACTOR_POWERGLASS_ROOT_DEV:'false',
  AGENT2_MOBILITY_ENERGY_RECIPIENT_DEV:'false',
  AGENT2_HELD_GUZMA_MOBILITY_DEV:'false',
  AGENT49_POTENTIAL_KO_ROOT_DEV:'false',
  AGENT7_KNOWN_DEAD_ATTACK_ROOT_DEV:'false',
  AGENT50_STRANDED_MARNIE_DEV:'false'
});

/**
 * Pure, fail-closed readout of three complete four-arm reports. An error is
 * preserved as an outcome and never screened out from the original attempt.
 * Any matching seed and original cards must pass physical-deal validation in
 * comparePairedAcceptedTargets before a selective physical difference can be
 * asserted.
 *
 * @param {object} baseline Full historical 4-arm native output A.
 * @param {object} treatment Full historical 4-arm native output B.
 * @param {object} repeat Full historical 4-arm native output A-repeat.
 * @returns {object} A/B and A/repeat root and prompt target diagnostics.
 */
function summarizeRecipientABA(baseline,treatment,repeat){
  const reports=[baseline,treatment,repeat];
  for(const report of reports){
    assert.equal(report?.attempted,4);
    assert.equal(report?.rows?.length,4);
    assert.equal(report?.sourceFirstRetrospective,true);
    assert.equal(report?.nativeAcceptedTargetsOptIn,true);
    assert.equal(report?.competitiveQualifiedGames,0);
    assert.equal(report?.actorOnlyCompositionOptIn,true);
  }
  const index=report=>new Map(report.rows.map(row=>{
    assert.equal(typeof row?.trial?.id,'string');
    return [row.trial.id,row];
  }));
  const [a,b,aRepeat]=reports.map(index);
  assert.equal(a.size,4);
  assert.equal(b.size,4);
  assert.equal(aRepeat.size,4);
  assert.deepEqual([...a.keys()].sort(),[...b.keys()].sort());
  assert.deepEqual([...a.keys()].sort(),[...aRepeat.keys()].sort());
  const pairs=[...a.keys()].map(id=>{
    const original=a.get(id),newRecipient=b.get(id),replay=aRepeat.get(id);
    const ab=comparePairedAcceptedTargets(original,newRecipient);
    const aa=comparePairedAcceptedTargets(original,replay);
    return {
      trialId:id,rank:original.trial.rank,
      candidateId:original.trial.candidateId,
      original:{status:original.status??'completed-execution',
        finished:original.finished??false,winner:original.winner??null,
        actions:original.actionCount??null},
      recipient:{status:newRecipient.status??'completed-execution',
        finished:newRecipient.finished??false,winner:newRecipient.winner??null,
        actions:newRecipient.actionCount??null},
      repeat:{status:replay.status??'completed-execution',
        finished:replay.finished??false,winner:replay.winner??null,
        actions:replay.actionCount??null},
      physicalAB:ab,physicalARepeat:aa,
      nominalPolicyExposureEvidence:newRecipient.actorOnlyDecisionCoverage?.
        detailedComponentAudits?.root?.energyRecipientFrontierOptIn===true,
      sameLegacyLedgerAB:Boolean(original.rootActionLedgerSha256&&
        original.rootActionLedgerSha256===newRecipient.rootActionLedgerSha256),
      sameLegacyLedgerARepeat:Boolean(original.rootActionLedgerSha256&&
        original.rootActionLedgerSha256===replay.rootActionLedgerSha256),
      competitiveQualified:false
    };
  });
  return {
    schema:VERSION,attempts:12,uniqueOriginalTrials:a.size,
    rootTargetAuditVersion:TARGET_AUDIT_VERSION,
    pairs,
    summary:{
      comparablePolicyPairs:pairs.filter(p=>
        p.physicalAB.status==='selective-physical-evidence').length,
      comparableDeterminismPairs:pairs.filter(p=>
        p.physicalARepeat.status==='selective-physical-evidence').length,
      observedRootTargetDifferences:pairs.filter(p=>
        p.physicalAB.root?.status==='different').length,
      observedPromptTargetDifferences:pairs.filter(p=>
        p.physicalAB.energyPrompt?.status==='different').length,
      failuresAndCaps:reports.flatMap(r=>r.rows).filter(row=>
        row.status||row.finished!==true).length,
      competitiveQualifiedGames:0
    },
    fullPhysicalParityCertified:false,
    policyInformationSetCertified:false,
    officialPaperClockCertified:false,
    scope:'Retrospective A/B/A exact printed 60; genuine Store selective targets, no competitive win-rate inference'
  };
}

/**
 * Runs deterministic, same-checkout development A/B/A. Temporarily controls
 * the documented root env flags and restores them even when any game throws.
 * All three runs retain 4 attempted original Store matches each.
 *
 * @param {(options:object)=>object} [execute] Inject synthetic runner for tests.
 * @returns {object} Complete source and treatment raw evidence.
 */
function executeRecipientABA(execute){
  const runDevelopment=execute??
    require('./agent41-bilateral-v2-development.cjs').runDevelopment;
  assert.equal(typeof runDevelopment,'function');
  const old=new Map();
  const vars={...FIXED_ROOT_ENV,AGENT44_ACTOR_ENERGY_RECIPIENT_DEV:'false'};
  for(const key of Object.keys(vars))old.set(key,process.env[key]);
  try{
    Object.assign(process.env,vars);
    const baseline=runDevelopment(COMMON_OPTIONS);
    process.env.AGENT44_ACTOR_ENERGY_RECIPIENT_DEV='true';
    const treatment=runDevelopment(COMMON_OPTIONS);
    process.env.AGENT44_ACTOR_ENERGY_RECIPIENT_DEV='false';
    const repeat=runDevelopment(COMMON_OPTIONS);
    const audit=summarizeRecipientABA(baseline,treatment,repeat);
    return {
      ...audit,registration:{
        retrospective:true,controlProfile:'AGENT44_ACTOR_ENERGY_RECIPIENT_DEV=false',
        treatmentProfile:'AGENT44_ACTOR_ENERGY_RECIPIENT_DEV=true',
        fixedRootEnv:FIXED_ROOT_ENV,commonOptions:COMMON_OPTIONS,
        checkedOutSourceRevision:process.env.GITHUB_SHA??null,
        originalSourceSeedByRank:{6:407516727,11:482443328},
        candidatePhysicalSeat:'B',enginePin:baseline.enginePin,
        sourcePolicyVersionBaseline:baseline.candidatePolicy??null,
        sourcePolicyVersionTreatment:treatment.candidatePolicy??null,
        commonActorPolicyVersion:baseline.actorOnlyCompositionVersion??null,
        compiledNativeGameEnvironment:true
      },
      rawDevelopment:{baseline,treatment,repeat}
    };
  }finally{
    for(const [key,value] of old){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}

if(require.main===module){
  process.stdout.write(JSON.stringify(executeRecipientABA(),null,2)+'\n');
}

module.exports={VERSION,COMMON_OPTIONS,FIXED_ROOT_ENV,
  summarizeRecipientABA,executeRecipientABA};
