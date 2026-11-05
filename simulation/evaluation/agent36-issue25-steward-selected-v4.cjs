'use strict';

const assert=require('node:assert/strict');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runMirroredIssue25V6}=
  require('./agent1-issue25-mirrored-r6-r11-v6.cjs');
const {hashRegisteredFile}=
  require('./agent36-issue25-selected-v0.cjs');
const {withThreePrintedOwnerAttackFrontiers}=
  require('./agent1-issue25-joined-three-attacks-v5.cjs');
const {withOwnerCaptureEnergySearch}=
  require('../twinleaf/agent41-owner-capture-energy-search.cjs');

const VERSION='agent36-issue25-steward-selected-v4-special-capture-48';
const EXTRA_HASH_PATHS=Object.freeze([
  'simulation/evaluation/agent36-issue25-steward-selected-v4.cjs',
  'simulation/twinleaf/agent41-owner-capture-energy-search.cjs',
  'simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs',
  'tests/agent36-issue25-steward-selected-v4.test.cjs',
  'tests/agent36-issue25-steward-selected-v4.native.test.cjs'
]);

/**
 * The one selected owner-prompt continuation. The original three stamped
 * attack handlers remain installed, and Capture Energy adds exactly its
 * own owner-deck search follow-up after a native physical Energy attachment.
 * Both wrappers install on both real physical seats.
 *
 * @template T
 * @param {()=>T} next
 * @param {{attacks?:Function,capture?:Function}} [deps] Pure test seam.
 * @returns {{result:T,audit:object}}
 */
function withStewardOwnerPromptFrontier(next,deps={}){
  assert.equal(typeof next,'function');
  const attacks=deps.attacks??withThreePrintedOwnerAttackFrontiers;
  const capture=deps.capture??withOwnerCaptureEnergySearch;
  assert.equal(typeof attacks,'function');
  assert.equal(typeof capture,'function');
  let captureAudit=null;
  const joined=attacks(()=>{
    const nested=capture(next);
    captureAudit=nested.audit;
    return nested.result;
  });
  return {result:joined.result,audit:{
    ...joined.audit,
    sourceIndependentCaptureEnergySearch:captureAudit,
    fullOwnerInformationNoninterferenceCertified:false,
    paperEffectCoverageComplete:false,
    competitiveGamesQualified:0
  }};
}

/**
 * Accountable, executing Issue #25 developmental closure. All eight
 * original rank 6/11 source registrations and both source seats are fixed.
 * The same Energy root and owner-prompt policy are selected for both seats.
 * No prospective competitive win sample is inferred from these bounded runs.
 *
 * @param {{runner?:(options:object)=>object,layers?:object,
 *   attackLayer?:Function}} [deps] Pure test injection.
 * @returns {{manifest:object,diagnostic:object,rawDevelopment:object|null}}
 */
function runStewardSelectedIssue25V4(deps={}){
  const run=deps.runner??runDevelopment;
  assert.equal(typeof run,'function');
  const selected=runMirroredIssue25V6({
    runner:options=>run({...options,
      bilateralSpecialEnergyRoot:true,
      nativeAcceptedTargets:true}),
    layers:deps.layers,
    attackLayer:deps.attackLayer??withStewardOwnerPromptFrontier
  });
  const promptAudit=selected.diagnostic.audit?.
    firstBlockedPromptEnvelope??null;
  const rows=selected.rawDevelopment?.rows??[];
  const receipt=rows.map(row=>({
    id:row.trial?.id??row.id??null,
    status:row.status??(row.finished===true?
      'native-terminal-unqualified':'nonterminal-unqualified'),
    sourceSeat:row.sourceSeat??
      row.nativeAbortProvenance?.sourceSeat??null,
    candidateSeat:row.candidateSeat??
      row.nativeAbortProvenance?.candidateSeat??null,
    sourcePhysicalDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    rootCount:row.rootActionLedger?.length??null,
    sourceAttackCount:row.sourceAttackSettlement?.attacks?.length??null
  }));
  const registrationExact=
    selected.diagnostic.registeredAttemptReconciliation?.exactUniqueMatch===
      true &&
    selected.diagnostic.rawRowIdentityReconciliation?.exactlyReconciled===
      true;
  const energyModes=rows.map(row=>
    row.bilateralSpecialEnergyProfile?.mode??null);
  const energyNativeWitnessRows=energyModes.filter(mode=>mode==='both').length;
  const manifest={
    ...selected.manifest,
    version:VERSION,
    profile:'original-r6-r11-eight-arm-both-seat-48root-development-v4',
    policyEntryPoint:EXTRA_HASH_PATHS[0],
    selectedOwnerPromptFrontier:'withStewardOwnerPromptFrontier',
    selectedEnergyPolicy:'bilateralSpecialEnergyRoot',
    selectedEnergyRecipientWitness:'nativeAcceptedTargets',
    selectedSourceStampedAttackHandlers:[
      'Future Sight','Night Watch','Get Lost'
    ],
    selectedOwnerDeckPromptHandler:'Capture Energy',
    sourceIndependentCommonPolicy:true,
    actualCommonRunnerOptIn:
      selected.manifest.actualRunnerConfirmedOption===true,
    actualSelectedEnergyModes:energyModes,
    originalRegisteredTrialCount:8,
    nativeRootActionLimit:48,
    completeCompetitivePolicyCertified:false,
    completeOwnerInformationNoninterferenceCertified:false,
    nativePromptSettlementRequiresIndependentEffectEvidence:true,
    resolvedSourceAndPolicyHashes:[
      ...selected.manifest.resolvedSourceAndPolicyHashes,
      ...EXTRA_HASH_PATHS.map(hashRegisteredFile)
    ],
    releaseQualified:false,
    competitiveGamesQualified:0
  };
  const diagnostic={
    ...selected.diagnostic,
    schema:VERSION,
    completeRegisteredAttemptReconciliation:registrationExact,
    selectedNativeAttempts:receipt,
    sourceIndependentCaptureEnergySearch:
      promptAudit?.sourceIndependentCaptureEnergySearch??null,
    actualPromptFrontierObserved:promptAudit!==null,
    actualBilateralEnergyOptIn:
      energyNativeWitnessRows>0?true:null,
    actualBilateralEnergyNativeWitnessRows:energyNativeWitnessRows,
    bilateralEnergyModeUnverifiedRows:rows.length-energyNativeWitnessRows,
    actualNativeTargetWitnessOptIn:
      selected.rawDevelopment?.nativeAcceptedTargetsOptIn??null,
    developmentalQualificationVerdict:
      registrationExact?'FAIL-unqualified-bounded-policy':
        'FAIL-missing-or-duplicate-registration',
    verdict:'FAIL-unqualified-bounded-policy-and-paper-clock',
    competitiveGamesQualified:0
  };
  return {manifest,diagnostic,rawDevelopment:selected.rawDevelopment};
}

module.exports={VERSION,EXTRA_HASH_PATHS,
  withStewardOwnerPromptFrontier,runStewardSelectedIssue25V4};
