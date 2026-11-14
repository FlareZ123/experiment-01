'use strict';

const assert = require('node:assert/strict');
const {
  BUNDLE_SCHEMA, MANIFEST, evidenceBundleSha256, bundleFailures
} = require('../agent45-independent-competitive-admission.cjs');
const {
  SCHEMA, UNTIMED, EVENT, inspectPolicyCompetenceAttestations,
  inspectPolicyPanelConsistency, inspectAdmissionV3,
  evaluateCompetitiveAdmissionV3
} = require('./agent43-independent-outcome-competence-v3.cjs');
const {validateOpponentPolicyFieldBundle} =
  require('../../../scripts/agent12-balanced-field-ledger-validator.cjs');
const authorized = require('../agent45-authorized-reviewers.json');

const POLICY_PLAN_SCHEMA = 'aichi-policy-plan-core-v1';
const POLICY_ATTESTATION_BUNDLE_SCHEMA = 'aichi-policy-attestation-bundle-v1';
const POLICY_REGISTRATION_SCHEMA = 'aichi-policy-registration-v1';
const POLICY_RECEIPT_SCHEMA = 'aichi-policy-application-receipt-v1';
const POLICY_RECEIPT_SCHEMA_V2 = 'aichi-policy-application-receipt-v2';
const FIXTURE_PREDEAL_PERSISTENCE_RECEIPT_SCHEMA = 'aichi-fixture-predeal-artifact-persistence-receipt-v1';
const FIXTURE_DEAL_GENERATION_RECEIPT_SCHEMA = 'aichi-fixture-physical-deal-generation-receipt-v1';
const FIXTURE_CLOCK_SOURCE = 'local-fixture-clock';
const PREDEAL_PERSISTENCE_RECEIPT_SCHEMA = 'aichi-predeal-artifact-persistence-receipt-v1';
const DEAL_GENERATION_RECEIPT_SCHEMA = 'aichi-physical-deal-generation-receipt-v1';
const PERSISTENCE_TIME_SOURCE = 'github-actions-run-started-at';
const DEAL_GENERATION_STEP_NAME = 'Generate physical deal';
const RUN_ID = /^[1-9]\d*$/;
const SHA256 = /^[0-9a-f]{64}$/;
const GIT_SHA = /^[0-9a-f]{40}$/;
const OFFSET_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function repoRelativeArtifactRef(value) {
  return nonempty(value) && !value.startsWith('/') && !value.includes('\\') &&
    !value.includes(':') && !value.includes('?') && !value.includes('#') &&
    value.split('/').every(segment=>segment.length>0&&segment!=='.'&&segment!=='..');
}
function stableId(value) {
  return nonempty(value) && value === value.trim() && value.length <= 256 &&
    !/[\u0000-\u001f\u007f]/.test(value);
}
function plainObject(value) {
  return Boolean(value) && typeof value === 'object' &&
    !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}
function dateTime(value) {
  return typeof value === 'string' && OFFSET_ISO.test(value) &&
    Number.isFinite(Date.parse(value));
}
function validDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value+'T00:00:00.000Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}
function digestWithout(object, field) {
  const copy = {...object};
  delete copy[field];
  return evidenceBundleSha256(copy);
}
function sameJson(a,b) {
  try {
    const canonical = require('../agent45-independent-competitive-admission.cjs').canonicalJson;
    return canonical(a) === canonical(b);
  } catch { return false; }
}
function fail(message) {
  throw new Error('V3_BUNDLE_BUILDER: ' + message);
}

/**
 * Validate the game-level preregistration before the physical deal exists.
 * This mirrors the V3 timing boundary; the evaluator remains authoritative
 * for postgame admission.
 */
function validateGameRegistration(gameRegistration, trialId, fixtureOnly=false) {
  if (!plainObject(gameRegistration) ||
      gameRegistration.schema !== 'aichi-game-level-preregistration-v1' ||
      gameRegistration.trialId !== trialId ||
      !nonempty(gameRegistration.registrationRef) ||
      gameRegistration.registeredBeforeDealGeneration !== true ||
      !dateTime(gameRegistration.registeredAt) ||
      !dateTime(gameRegistration.dealGeneratedAt) ||
      Date.parse(gameRegistration.registeredAt) >=
        Date.parse(gameRegistration.dealGeneratedAt)) {
    return ['game-level-preregistration-invalid-or-not-before-deal'];
  }
  const timing = gameRegistration.timingProtocol;
  if (!plainObject(timing) ||
      timing.schema !== 'aichi-game-timing-protocol-preregistration-v1' ||
      timing.declaredBeforeDealGeneration !== true ||
      ![UNTIMED,EVENT].includes(timing.mode) ||
      gameRegistration.mode !== timing.mode ||
      gameRegistration.timingProtocolSha256 !== evidenceBundleSha256(timing)) {
    return ['game-timing-protocol-invalid-or-unhashed'];
  }
  if (timing.mode === UNTIMED &&
      (timing.tournamentTimerApplies !== false ||
       timing.officialEndCallApplies !== false ||
       timing.eventStageAdjudicationApplies !== false ||
       timing.eventStage !== null)) {
    return ['untimed-mode-does-not-explicitly-exclude-event-clock'];
  }
  if (timing.mode === EVENT &&
      (timing.tournamentTimerApplies !== true ||
       timing.officialEndCallApplies !== true ||
       timing.eventStageAdjudicationApplies !== true ||
       !['open-swiss','open-top32','open-final'].includes(timing.eventStage))) {
    return ['event-mode-clock-and-stage-preregistration-incomplete'];
  }
  const expectedRuleset=timing.mode===UNTIMED?'Expanded':'Japanese Extra';
  const reviewStatus=gameRegistration.formatReviewStatus;
  if (gameRegistration.candidateFormat!==expectedRuleset ||
      gameRegistration.gameRuleset!==expectedRuleset ||
      gameRegistration.opponentSourceEventFormat!=='Japanese Extra' ||
      !['independently-reviewed','unverified-fixture-only'].includes(reviewStatus) ||
      (reviewStatus==='unverified-fixture-only' && !fixtureOnly))
    return ['game-ruleset-format-review-status-not-frozen-before-deal'];
  if (expectedRuleset==='Expanded' &&
      ((reviewStatus==='independently-reviewed' ?
        !validDateOnly(gameRegistration.expandedLegalityAsOf) :
        gameRegistration.expandedLegalityAsOf!==null) ||
       gameRegistration.eventDate!==null))
    return ['expanded-legality-date-not-frozen-before-deal'];
  if (expectedRuleset==='Japanese Extra' &&
      ((reviewStatus==='independently-reviewed' ?
        !validDateOnly(gameRegistration.eventDate) :
        gameRegistration.eventDate!==null) ||
       gameRegistration.expandedLegalityAsOf!==null))
    return ['event-date-legality-not-frozen-before-deal'];
  return [];
}

/**
 * Prepare the V3 policy registration before any physical deal is generated.
 * Signed attestations are consumed, never created here. Production always
 * reads the separately controlled Agent45 trust registry.
 */
function preDealArtifactCore(value) {
  const fields=[
    'ready','status','fixtureOnly','producerId','trialId','gameRegistration',
    'policyPlanCore','policyPlanSha256','policyAttestationBundle',
    'policyAttestationBundleSha256','policyRegistration',
    'policyRegistrationSha256','preDealArtifactRef'
  ];
  return Object.fromEntries(fields.map(key=>[key,
    value?.[key]===undefined?null:value[key]]));
}

function prepareWithRegistry(input, reviewerRegistry, fixtureOnly, requireFutureDeal=false) {
  const failures = [];
  const producerId = input?.producerId;
  const trialId = input?.trialId;
  const gameRegistration = input?.gameRegistration;
  const policyPlanCore = input?.policyPlanCore;
  const policyAttestationBundle = input?.policyAttestationBundle;
  const preDealArtifactRef =
    (typeof input?.preDealArtifactRef==='string'&&input.preDealArtifactRef.trim())?
      input.preDealArtifactRef.trim():
      (typeof gameRegistration?.registrationRef==='string'&&gameRegistration.registrationRef.trim()?
        gameRegistration.registrationRef.trim()+'.policy-predeal.json':null);
  if (!repoRelativeArtifactRef(preDealArtifactRef)) failures.push('predeal-artifact-reference-invalid');

  if (!stableId(producerId)) failures.push('bundle-producer-id-invalid');
  if (!stableId(trialId)) failures.push('trial-id-invalid');
  failures.push(...validateGameRegistration(gameRegistration,trialId,fixtureOnly));
  if (requireFutureDeal && dateTime(gameRegistration?.registeredAt) &&
      dateTime(gameRegistration?.dealGeneratedAt)) {
    const now=Date.now();
    if (Date.parse(gameRegistration.registeredAt)>now ||
        Date.parse(gameRegistration.dealGeneratedAt)<=now)
      failures.push('predeal-registration-is-not-currently-before-physical-deal');
  }
  if (!plainObject(policyPlanCore) ||
      policyPlanCore.schema !== POLICY_PLAN_SCHEMA ||
      policyPlanCore.comparisonMode !== 'candidate-vs-field') {
    failures.push('candidate-vs-field-policy-plan-core-invalid');
  }
  if (plainObject(policyPlanCore)) {
    const hasFixtureMarker=Object.prototype.hasOwnProperty.call(
      policyPlanCore,'fixtureOnly');
    if (hasFixtureMarker &&
        (typeof policyPlanCore.fixtureOnly!=='boolean' ||
         policyPlanCore.fixtureOnly!==fixtureOnly))
      failures.push('policy-plan-core-fixture-marker-mismatch');
    if (fixtureOnly && !hasFixtureMarker)
      failures.push('fixture-policy-plan-core-marker-missing');
  }
  const expectedRuleset=gameRegistration?.mode===UNTIMED?'Expanded':'Japanese Extra';
  const formatReviewStatus=policyPlanCore?.formatReviewStatus;
  const formatConstraints=policyPlanCore?.constraints;
  if (policyPlanCore?.candidateFormat!==expectedRuleset ||
      policyPlanCore?.gameRuleset!==expectedRuleset ||
      policyPlanCore?.opponentSourceEventFormat!=='Japanese Extra' ||
      !['independently-reviewed','unverified-fixture-only'].includes(formatReviewStatus) ||
      (formatReviewStatus==='unverified-fixture-only' && !fixtureOnly) ||
      formatReviewStatus!==gameRegistration?.formatReviewStatus ||
      formatConstraints?.candidateFormat!==expectedRuleset ||
      formatConstraints?.gameRuleset!==expectedRuleset ||
      formatConstraints?.opponentSourceEventFormat!=='Japanese Extra' ||
      formatConstraints?.formatReviewStatus!==formatReviewStatus ||
      (expectedRuleset==='Expanded' &&
        (formatConstraints?.expandedLegalityAsOf!==gameRegistration?.expandedLegalityAsOf ||
         formatConstraints?.eventDate!==null)) ||
      (expectedRuleset==='Japanese Extra' &&
        (formatConstraints?.eventDate!==gameRegistration?.eventDate ||
         formatConstraints?.expandedLegalityAsOf!==null)))
    failures.push('policy-plan-game-ruleset-format-review-status-mismatch');
  const runtimePinEvidence=policyPlanCore?.runtimePinEvidence;
  if (!plainObject(runtimePinEvidence) ||
      runtimePinEvidence.schema!=='aichi-runtime-pin-evidence-v2' ||
      !SHA256.test(runtimePinEvidence.unionSha256??'') ||
      !SHA256.test(runtimePinEvidence.loadedProcessClosureSha256??'') ||
      !SHA256.test(runtimePinEvidence.cardPoolInitializationSha256??'') ||
      typeof runtimePinEvidence.fullProcessClosureCovered!=='boolean')
    failures.push('policy-runtime-pin-evidence-missing-or-invalid');
  else if (!fixtureOnly && runtimePinEvidence.fullProcessClosureCovered!==true)
    failures.push('production-runtime-process-closure-incomplete');
  if (!plainObject(policyAttestationBundle) ||
      policyAttestationBundle.schema !== POLICY_ATTESTATION_BUNDLE_SCHEMA) {
    failures.push('policy-attestation-bundle-schema-invalid');
  }

  let policyPlanSha256 = null;
  let policyAttestationBundleSha256 = null;
  let field = null;
  let policyRegistration = null;
  let policyRegistrationSha256 = null;
  let policyCompetence = null;

  try { policyPlanSha256 = evidenceBundleSha256(policyPlanCore); }
  catch { failures.push('policy-plan-core-not-canonical-json'); }
  try { policyAttestationBundleSha256 = evidenceBundleSha256(policyAttestationBundle); }
  catch { failures.push('policy-attestation-bundle-not-canonical-json'); }

  if (policyPlanSha256 && policyAttestationBundleSha256) {
    if (policyAttestationBundle?.policyPlanSha256 !== policyPlanSha256)
      failures.push('policy-attestation-bundle-plan-digest-mismatch');
    try {
      field = validateOpponentPolicyFieldBundle({
        policyPlanCore,expectedPolicyPlanSha256:policyPlanSha256,gameReceipts:[],
        fixtureOnly
      });
      if (field.status === 'INVALID')
        failures.push(...field.rejectionReasons.map(x=>'policy-field:'+x));
      if (!fixtureOnly &&
          (!Array.isArray(field.availableRanks) || field.availableRanks.length===0))
        failures.push('opponent-policy-field-has-no-authenticated-ranks');

    } catch {
      failures.push('existing-opponent-policy-field-validator-rejected-plan');
    }
  }

  if (failures.length === 0) {
    const candidateAttestation = policyAttestationBundle.candidatePolicy;
    const opponentAttestation = policyAttestationBundle.opponentPolicy;
    policyRegistration = {
      schema:POLICY_REGISTRATION_SCHEMA,
      trialId,
      policyPlanSha256,
      policyAttestationBundleSha256,
      candidatePolicyAttestationRef:candidateAttestation?.evidenceRef,
      opponentPolicyAttestationBundleRef:opponentAttestation?.evidenceRef,
      candidateFormat:policyPlanCore.candidateFormat,
      gameRuleset:policyPlanCore.gameRuleset,
      opponentSourceEventFormat:policyPlanCore.opponentSourceEventFormat,
      expandedLegalityAsOf:formatConstraints.expandedLegalityAsOf ?? null,
      eventDate:formatConstraints.eventDate ?? null,
      formatReviewStatus:policyPlanCore.formatReviewStatus,
      registeredAt:gameRegistration.registeredAt,
      dealGeneratedAt:gameRegistration.dealGeneratedAt,
      registeredBeforeDealGeneration:true
    };
    policyRegistrationSha256 = evidenceBundleSha256(policyRegistration);
    const panel = {
      valid:true,
      policyPlanSha256,
      opponentPolicyBundleSha256:field.opponentPolicyBundleSha256,
      policyConstraintsSha256:field.policyConstraintsSha256
    };
    if (fixtureOnly) {
      policyCompetence={
        valid:false,fixtureOnly:true,
        candidatePolicyAttestationValid:false,
        opponentPolicyAttestationValid:false,
        failures:['fixture-only-policy-competence-not-admitted']
      };
    } else {
      policyCompetence = inspectPolicyCompetenceAttestations({
        producerId,policyPlanCore,policyAttestationBundle,policyRegistration
      },reviewerRegistry,panel);
      if (!policyCompetence.valid)
        failures.push(...policyCompetence.failures);
    }
  }

  const ready = failures.length === 0;
  const prepared = {
    ready,
    status:ready?'ready-before-deal':'blocked-before-deal',
    fixtureOnly,
    producerId,trialId,gameRegistration,policyPlanCore,policyPlanSha256,
    policyAttestationBundle,policyAttestationBundleSha256,
    policyRegistration:ready?policyRegistration:null,
    proposedPolicyRegistration:policyRegistration,
    policyRegistrationSha256:ready?policyRegistrationSha256:null,
    preDealArtifactRef,
    fieldStatus:field?.status??'INVALID',
    availableRanks:field?.availableRanks??[],
    unavailableRanks:field?.unavailableRanks??[],
    policyCompetence,
    failures:[...new Set(failures)]
  };
  prepared.preDealArtifactSha256=evidenceBundleSha256(preDealArtifactCore(prepared));
  return prepared;
}

function preparePreDealPolicyRegistration(input) {
  return prepareWithRegistry(input,authorized,false,true);
}

/**
 * Revalidate an already persisted pre-deal registration after its physical
 * deal exists. All structural, signature, field and chronology checks remain;
 * only the pre-deal wall-clock future-deal requirement is disabled.
 */
function revalidatePreDealPolicyRegistration(input) {
  return prepareWithRegistry(input,authorized,false,false);
}

/**
 * Fixture-only key injection for tests. The result is permanently marked
 * fixtureOnly and cannot be passed to the production postgame builder.
 */
function preparePreDealPolicyRegistrationFixture(input,fixtureRegistry) {
  assert.ok(plainObject(fixtureRegistry),'Fixture reviewer registry is required');
  const result=prepareWithRegistry(input,fixtureRegistry,true);
  return {...result,fixtureOnly:true};
}

function checkedEvidence(kind,entry) {
  if (!plainObject(entry) || !nonempty(entry.ref))
    fail('missing evidence reference for '+kind);
  let sha256 = entry.sha256;
  if (entry.value !== undefined) sha256 = evidenceBundleSha256(entry.value);
  if (!SHA256.test(sha256??'')) fail('missing or invalid evidence digest for '+kind);
  return {kind,ref:entry.ref,sha256};
}

function checkedReceipt(receipt,allowMissingDigest=false,fixtureOnly=false) {
  if (!plainObject(receipt) || ![POLICY_RECEIPT_SCHEMA,POLICY_RECEIPT_SCHEMA_V2].includes(receipt.schema))
    fail('policy application receipt schema invalid');
  if (Object.prototype.hasOwnProperty.call(receipt,'fixtureOnly')) {
    if (typeof receipt.fixtureOnly !== 'boolean')
      fail('policy application receipt fixture marker must be boolean');
    if (receipt.fixtureOnly !== fixtureOnly)
      fail('policy application receipt fixture marker does not match bundle mode');
  }
  if (receipt.schema===POLICY_RECEIPT_SCHEMA_V2 &&
      (!SHA256.test(receipt.runtimePinUnionSha256??'') ||
       !SHA256.test(receipt.loadedProcessClosureSha256??'') ||
       !SHA256.test(receipt.cardPoolInitializationSha256??'') ||
       !Array.isArray(receipt.runtimePatchReceipts) ||
       !SHA256.test(receipt.runtimePatchReceiptsSha256??'') ||
       receipt.runtimePatchReceiptsSha256!==evidenceBundleSha256(receipt.runtimePatchReceipts)))
    fail('V2 policy application receipt runtime evidence is incomplete or unhashed');
  const expected = digestWithout(receipt,'receiptSha256');
  if (receipt.receiptSha256 === undefined && allowMissingDigest)
    return {...receipt,receiptSha256:expected};
  if (receipt.receiptSha256 !== expected)
    fail('policy application receipt digest mismatch');
  return receipt;
}

function validateReceiptAgainstPlan(receipt,preDeal,trial,fixtureOnly) {
  const core = preDeal.policyPlanCore;
  const candidate = core.candidate;
  const opponent = core.opponentPolicyBundle.ranks.find(x=>
    x.rank===receipt.opponentRank);
  if (!opponent || opponent.sourceStatus!=='authenticated')
    fail('game opponent rank is not authenticated in the frozen policy plan');
  const constraintsSha = evidenceBundleSha256(core.constraints);
  const opponentBundleSha = evidenceBundleSha256(core.opponentPolicyBundle);
  const checks = [
    [receipt.trialId,preDeal.trialId,'trial id'],
    [receipt.policyPlanSha256,preDeal.policyPlanSha256,'policy plan digest'],
    [receipt.policyRegistrationSha256,preDeal.policyRegistrationSha256,'policy registration digest'],
    [receipt.policyAttestationBundleSha256,preDeal.policyAttestationBundleSha256,'attestation bundle digest'],
    [receipt.opponentPolicyBundleSha256,opponentBundleSha,'opponent policy bundle digest'],
    [receipt.policyConstraintsSha256,constraintsSha,'policy constraints digest'],
    [receipt.candidateFormat,core.candidateFormat,'candidate format'],
    [receipt.gameRuleset,core.gameRuleset,'game ruleset'],
    [receipt.opponentSourceEventFormat,core.opponentSourceEventFormat,'opponent source event format'],
    [receipt.expandedLegalityAsOf,core.constraints?.expandedLegalityAsOf ?? null,'Expanded legality-as-of date'],
    [receipt.eventDate,core.constraints?.eventDate ?? null,'Japanese Extra event date'],
    [receipt.formatReviewStatus,preDeal.policyRegistration.formatReviewStatus,'format review status'],
    [receipt.candidateDeckSha256,candidate.deckSha256,'candidate deck identity'],
    [receipt.candidatePolicySha256,candidate.policySha256,'candidate policy identity'],
    [receipt.candidatePolicyProducerId,candidate.policyProducerId,'candidate policy producer'],
    [receipt.candidateEntryManifestSha256,candidate.entryManifestSha256,'candidate entry manifest'],
    [receipt.candidateChallengeSuiteSha256,candidate.challengeSuiteSha256,'candidate challenge suite'],
    [receipt.opponentDeckSha256,opponent.deckSha256,'opponent deck identity'],
    [receipt.opponentPolicySha256,opponent.policySha256,'opponent policy identity'],
    [receipt.opponentPolicyProducerId,opponent.policyProducerId,'opponent policy producer'],
    [receipt.opponentEntryManifestSha256,opponent.entryManifestSha256,'opponent entry manifest'],
    [receipt.opponentChallengeSuiteSha256,opponent.challengeSuiteSha256,'opponent challenge suite'],
    [receipt.candidateFormat,trial.candidateFormat,'trial candidate format'],
    [receipt.gameRuleset,trial.gameRuleset,'trial game ruleset'],
    [receipt.opponentSourceEventFormat,trial.opponentSourceEventFormat,'trial opponent source event format'],
    [receipt.expandedLegalityAsOf,trial.expandedLegalityAsOf ?? null,'trial Expanded legality-as-of date'],
    [receipt.eventDate,trial.eventDate ?? null,'trial event date'],
    [receipt.formatReviewStatus,trial.formatReviewStatus,'trial format review status'],
    [receipt.candidateSeat,trial.candidateSeat,'candidate seat'],
    [receipt.opponentSeat,trial.originalSourceSeat,'opponent seat'],
    [receipt.firstPlayerSeat,trial.actualFirstPlayerSeat,'first-player seat'],
    [receipt.candidateDeckSha256,trial.candidatePrinted60Sha256,'candidate printed 60'],
    [receipt.opponentDeckSha256,trial.originalPrinted60Sha256,'opponent printed 60'],
    [receipt.enginePin,trial.vendorCommitSha,'engine pin'],
    [receipt.runnerRevision,trial.researchRevisionSha,'runner revision'],
    [receipt.decisionTraceSha256,trial.decisionTraceSha256,'decision trace']
  ];
  for (const [actual,expected,label] of checks)
    if (actual!==expected) fail('application receipt '+label+' mismatch');
  if (![0,1].includes(receipt.candidateSeat) ||
      ![0,1].includes(receipt.opponentSeat) ||
      receipt.candidateSeat===receipt.opponentSeat ||
      ![0,1].includes(receipt.firstPlayerSeat))
    fail('application receipt seat assignment invalid');
  if (!Array.isArray(receipt.policySha256BySeat) ||
      receipt.policySha256BySeat.length!==2 ||
      receipt.policySha256BySeat[receipt.candidateSeat]!==candidate.policySha256 ||
      receipt.policySha256BySeat[receipt.opponentSeat]!==opponent.policySha256)
    fail('actual role-to-seat policy mapping does not match frozen role identities');
  if (receipt.enginePin!==trial.vendorCommitSha ||
      receipt.runnerRevision!==trial.researchRevisionSha ||
      !GIT_SHA.test(receipt.enginePin??'') ||
      !GIT_SHA.test(receipt.runnerRevision??'') ||
      !SHA256.test(receipt.decisionTraceSha256??'') ||
      !['none','within-budget','not-exceeded'].includes(receipt.timeoutStatus))
    fail('application receipt engine, runner, trace or timeout status invalid');
  if (receipt.schema!==POLICY_RECEIPT_SCHEMA_V2)
    fail('V3 game builder requires a V2 policy application receipt');
  if (receipt.schema===POLICY_RECEIPT_SCHEMA_V2) {
    const runtime=core.runtimePinEvidence;
    if (!plainObject(runtime) ||
        runtime.schema!=='aichi-runtime-pin-evidence-v2' ||
        !SHA256.test(runtime.unionSha256??'') ||
        !SHA256.test(runtime.loadedProcessClosureSha256??'') ||
        !SHA256.test(runtime.cardPoolInitializationSha256??'') ||
        typeof runtime.fullProcessClosureCovered!=='boolean' ||
        (!fixtureOnly && runtime.fullProcessClosureCovered!==true) ||
        receipt.runtimePinUnionSha256!==runtime.unionSha256 ||
        receipt.loadedProcessClosureSha256!==runtime.loadedProcessClosureSha256 ||
        receipt.cardPoolInitializationSha256!==runtime.cardPoolInitializationSha256)
      fail('V2 application receipt does not match frozen runtime-pin evidence');
    const cardPool=trial.cardPoolInitializationReceipt;
    if (!plainObject(cardPool) ||
        cardPool.schema!=='agent36-twinleaf-card-pool-initialization-v1' ||
        cardPool.enginePin!==trial.vendorCommitSha ||
        cardPool.startupPath!=='vendor/twinleaf/ptcg-server/start.js' ||
        !SHA256.test(cardPool.startupSha256??'') ||
        !Array.isArray(cardPool.setNames) || cardPool.setNames.length===0 ||
        cardPool.setNames.some(name=>!nonempty(name)) ||
        new Set(cardPool.setNames).size!==cardPool.setNames.length ||
        cardPool.definedSetCount!==cardPool.setNames.length ||
        !Number.isInteger(cardPool.cardCount) || cardPool.cardCount<=0 ||
        evidenceBundleSha256(cardPool)!==receipt.cardPoolInitializationSha256)
      fail('V2 application receipt card-pool initialization receipt is invalid');
    const expectedPatches=core.constraints?.sharedEngineCompatibilityPatches;
    if (!Array.isArray(expectedPatches) || expectedPatches.length!==receipt.runtimePatchReceipts.length)
      fail('V2 application receipt does not cover the frozen shared runtime-patch list');
    for (let i=0;i<expectedPatches.length;i++) {
      const expectedPatch=expectedPatches[i];
      const actualPatch=receipt.runtimePatchReceipts[i];
      if (!plainObject(expectedPatch) || !plainObject(actualPatch) ||
          actualPatch.patchId!==expectedPatch.patchId ||
          actualPatch.modulePath!==expectedPatch.modulePath ||
          actualPatch.moduleSha256!==expectedPatch.moduleSha256 ||
          actualPatch.target!==expectedPatch.target ||
          actualPatch.installCount!==1 || actualPatch.restoreCount!==1 ||
          actualPatch.restoredOriginal!==true || actualPatch.nestedInstallCount!==0 ||
          actualPatch.wrapperInstallCount!==0)
        fail('V2 application receipt runtime-patch receipt differs from the frozen patch at index '+i);
    }
  }
}

function validateDealChronology(preDeal,trial,persistenceReceipt,dealReceipt,fixtureOnly) {
  if (fixtureOnly) {
    if (!plainObject(persistenceReceipt) ||
        persistenceReceipt.schema!==FIXTURE_PREDEAL_PERSISTENCE_RECEIPT_SCHEMA ||
        persistenceReceipt.fixtureOnly!==true ||
        persistenceReceipt.fixtureClockSource!==FIXTURE_CLOCK_SOURCE ||
        persistenceReceipt.trialId!==preDeal.trialId ||
        persistenceReceipt.artifactRef!==preDeal.preDealArtifactRef ||
        persistenceReceipt.artifactSha256!==preDeal.preDealArtifactSha256 ||
        !SHA256.test(persistenceReceipt.artifactSha256??'') ||
        !dateTime(persistenceReceipt.persistedAt))
      fail('fixture pre-deal persistence receipt is missing or not bound to the fixture artifact');
    const registeredAt=Date.parse(preDeal.gameRegistration.registeredAt);
    const plannedDealAt=Date.parse(preDeal.gameRegistration.dealGeneratedAt);
    const persistedAt=Date.parse(persistenceReceipt.persistedAt);
    if (persistedAt<registeredAt || persistedAt>=plannedDealAt)
      fail('fixture pre-deal artifact was not persisted between registration and deal generation');
    if (!plainObject(dealReceipt) ||
        dealReceipt.schema!==FIXTURE_DEAL_GENERATION_RECEIPT_SCHEMA ||
        dealReceipt.fixtureOnly!==true ||
        dealReceipt.fixtureClockSource!==FIXTURE_CLOCK_SOURCE ||
        dealReceipt.trialId!==trial.trialId ||
        dealReceipt.artifactRef!==persistenceReceipt.artifactRef ||
        dealReceipt.artifactSha256!==persistenceReceipt.artifactSha256 ||
        !dateTime(dealReceipt.stepStartedAt) ||
        dealReceipt.runnerRevision!==trial.researchRevisionSha ||
        !GIT_SHA.test(dealReceipt.runnerRevision??'') ||
        !SHA256.test(dealReceipt.sourceDealFingerprint??'') ||
        dealReceipt.sourcePhysicalDealSha256!==trial.sourcePhysicalDealSha256 ||
        dealReceipt.fullPhysicalDealSha256!==trial.fullPhysicalDealSha256 ||
        !SHA256.test(dealReceipt.sourcePhysicalDealSha256??'') ||
        !SHA256.test(dealReceipt.fullPhysicalDealSha256??''))
      fail('fixture deal-generation receipt is missing or not bound to the native physical deal');
    const stepStartedAt=Date.parse(dealReceipt.stepStartedAt);
    if (stepStartedAt<plannedDealAt || stepStartedAt<=persistedAt ||
        !dateTime(trial.dealGeneratedAt) || Date.parse(trial.dealGeneratedAt)<stepStartedAt)
      fail('fixture deal-generation step did not follow fixture registration and persistence');
    if (trial.dealGenerationStepStartedAt!==dealReceipt.stepStartedAt ||
        trial.initialSourceDealFingerprint!==dealReceipt.sourceDealFingerprint)
      fail('fixture trial generation time or source-deal fingerprint disagrees with receipt');
    return {persistenceReceipt,dealReceipt};
  }
  // These fields are consistency checks over GitHub Actions server metadata.
  // The independent reviewer must fetch the run/job records and verify them;
  // producer-supplied timestamps and Git commit committer dates are not clocks.
  if (!plainObject(persistenceReceipt) ||
      persistenceReceipt.schema!==PREDEAL_PERSISTENCE_RECEIPT_SCHEMA ||
      persistenceReceipt.trialId!==preDeal.trialId ||
      persistenceReceipt.serverTimestampSource!==PERSISTENCE_TIME_SOURCE ||
      !nonempty(persistenceReceipt.repositoryFullName) ||
      !persistenceReceipt.repositoryFullName.includes('/') ||
      persistenceReceipt.repositoryFullName.startsWith('/') ||
      persistenceReceipt.repositoryFullName.endsWith('/') ||
      persistenceReceipt.artifactRef!==preDeal.preDealArtifactRef ||
      persistenceReceipt.artifactSha256!==preDeal.preDealArtifactSha256 ||
      !GIT_SHA.test(persistenceReceipt.commitSha??'') ||
      !GIT_SHA.test(persistenceReceipt.blobSha??'') ||
      !RUN_ID.test(String(persistenceReceipt.workflowRunId??'')) ||
      persistenceReceipt.workflowHeadSha!==persistenceReceipt.commitSha ||
      !dateTime(persistenceReceipt.workflowRunStartedAt))
    fail('pre-deal persistence receipt is missing or not bound to a server-timestamped workflow run');
  const registeredAt=Date.parse(preDeal.gameRegistration.registeredAt);
  const plannedDealAt=Date.parse(preDeal.gameRegistration.dealGeneratedAt);
  const runStartedAt=Date.parse(persistenceReceipt.workflowRunStartedAt);
  if (runStartedAt<registeredAt || runStartedAt>=plannedDealAt)
    fail('pre-deal artifact workflow did not start after registration and before planned deal generation');

  if (!plainObject(dealReceipt) ||
      dealReceipt.schema!==DEAL_GENERATION_RECEIPT_SCHEMA ||
      dealReceipt.trialId!==trial.trialId ||
      dealReceipt.artifactRef!==persistenceReceipt.artifactRef ||
      dealReceipt.artifactSha256!==persistenceReceipt.artifactSha256 ||
      dealReceipt.commitSha!==persistenceReceipt.commitSha ||
      dealReceipt.blobSha!==persistenceReceipt.blobSha ||
      dealReceipt.workflowRunId!==persistenceReceipt.workflowRunId ||
      dealReceipt.workflowHeadSha!==persistenceReceipt.workflowHeadSha ||
      !RUN_ID.test(String(dealReceipt.jobId??'')) ||
      dealReceipt.stepName!==DEAL_GENERATION_STEP_NAME ||
      !dateTime(dealReceipt.stepStartedAt) ||
      dealReceipt.runnerRevision!==trial.researchRevisionSha ||
      !GIT_SHA.test(dealReceipt.runnerRevision??'') ||
      !SHA256.test(dealReceipt.sourceDealFingerprint??''))
    fail('physical deal-generation receipt is missing or not bound to the same server-timestamped workflow');
  const stepStartedAt=Date.parse(dealReceipt.stepStartedAt);
  if (stepStartedAt<plannedDealAt || stepStartedAt<=runStartedAt)
    fail('physical deal-generation step did not start after preregistered time and workflow persistence');
  // The producer's local dealGeneratedAt is informational only. The
  // Actions step start is a server-timestamped lower bound; physical deal
  // generation must occur inside that step after it starts.
  if (trial.dealGenerationStepStartedAt!==dealReceipt.stepStartedAt ||
      trial.initialSourceDealFingerprint!==dealReceipt.sourceDealFingerprint)
    fail('trial server-reported generation step time or source-deal fingerprint disagrees with receipt');
  return {persistenceReceipt,dealReceipt};
}

function assembleBundle({preDeal,trial,evidence,policyApplicationReceipt,
  preDealPersistenceReceipt,dealGenerationReceipt,
  policyPanelReceipts=[],reviews=[]},reviewerRegistry,fixtureOnly) {
  if (!preDeal?.ready || preDeal.fixtureOnly!==fixtureOnly)
    fail('pre-deal registration is not ready for this builder mode');
  if (!plainObject(trial) || trial.trialId!==preDeal.trialId)
    fail('postgame trial identity does not match frozen pre-deal registration');
  if (fixtureOnly ? trial.fixtureOnly!==true : trial.fixtureOnly===true)
    fail(fixtureOnly ?
      'fixture builder requires trial.fixtureOnly:true' :
      'production builder rejects fixture-only trials');
  const chronology=validateDealChronology(preDeal,trial,preDealPersistenceReceipt,dealGenerationReceipt,fixtureOnly);
  const gameRegistration=preDeal.gameRegistration;
  const preregistrationSha256=evidenceBundleSha256(gameRegistration);
  const boundRegistrationFields={
    preregistration:gameRegistration,
    registrationRef:gameRegistration.registrationRef,
    preregistrationEvidenceRef:gameRegistration.registrationRef,
    preregistrationSha256,
    timingMode:gameRegistration.mode,
    candidateFormat:preDeal.policyPlanCore.candidateFormat,
    gameRuleset:preDeal.policyPlanCore.gameRuleset,
    opponentSourceEventFormat:preDeal.policyPlanCore.opponentSourceEventFormat,
    expandedLegalityAsOf:gameRegistration.expandedLegalityAsOf ?? null,
    eventDate:gameRegistration.eventDate ?? null,
    formatReviewStatus:preDeal.policyRegistration.formatReviewStatus
  };
  for (const [field,value] of Object.entries(boundRegistrationFields)) {
    if (trial[field]!==undefined && !sameJson(trial[field],value))
      fail('postgame trial '+field+' differs from the frozen pre-deal registration');
  }
  const boundTrial={...trial,...boundRegistrationFields};
  if (trial.opponentRank!==undefined && trial.opponentRank!==null &&
      trial.opponentRank!==policyApplicationReceipt?.opponentRank)
    fail('runner trial opponent rank disagrees with policy application receipt');
  if (trial.policyPlanSha256!==undefined &&
      trial.policyPlanSha256!==preDeal.policyPlanSha256)
    fail('runner trial policy-plan digest disagrees with pre-deal registration');
  if (trial.policyAttestationBundleSha256!==undefined &&
      trial.policyAttestationBundleSha256!==preDeal.policyAttestationBundleSha256)
    fail('runner trial attestation digest disagrees with pre-deal registration');
  if (trial.policyRegistrationSha256!==undefined &&
      trial.policyRegistrationSha256!==preDeal.policyRegistrationSha256)
    fail('runner trial registration digest disagrees with pre-deal registration');
  if (trial.policySha256BySeat!==undefined &&
      JSON.stringify(trial.policySha256BySeat)!==
        JSON.stringify(policyApplicationReceipt?.policySha256BySeat))
    fail('runner trial seat-policy hashes disagree with actual application receipt');
  if (trial.candidateSeat===trial.originalSourceSeat ||
      ![0,1].includes(trial.candidateSeat) ||
      ![0,1].includes(trial.originalSourceSeat) ||
      ![0,1].includes(trial.actualFirstPlayerSeat))
    fail('trial seat and first-player fields are invalid');

  const receipt = checkedReceipt(policyApplicationReceipt,true,fixtureOnly);
  validateReceiptAgainstPlan(receipt,preDeal,boundTrial,fixtureOnly);
  const receipts = [...policyPanelReceipts.map(x=>checkedReceipt(x,false,fixtureOnly))];
  if (!receipts.some(x=>x.trialId===receipt.trialId &&
      x.receiptSha256===receipt.receiptSha256)) receipts.push(receipt);
  const trialIds = new Set();
  for (const item of receipts) {
    if (trialIds.has(item.trialId)) fail('duplicate trial id in policy panel receipt ledger');
    trialIds.add(item.trialId);
  }

  const trialOut = {
    ...boundTrial,
    opponentRank:receipt.opponentRank,
    policySha256BySeat:receipt.policySha256BySeat,
    policyPlanSha256:preDeal.policyPlanSha256,
    policyAttestationBundleSha256:preDeal.policyAttestationBundleSha256,
    policyRegistrationSha256:preDeal.policyRegistrationSha256
  };
  const policyEvidence = {
    preDealArtifactRef:preDeal.preDealArtifactRef,
    preDealArtifactSha256:preDeal.preDealArtifactSha256,
    preDealPersistenceReceipt:chronology.persistenceReceipt,
    dealGenerationReceipt:chronology.dealReceipt,
    policyPlanCore:preDeal.policyPlanCore,
    policyAttestationBundle:preDeal.policyAttestationBundle,
    policyRegistration:preDeal.policyRegistration,
    policyApplicationReceipt:receipt,
    policyPanelReceipts:receipts
  };
  // Postgame reviews sign the finalized bundle and must remain external to it.
  const required = [
    'original-printed-60','contender-printed-60','full-physical-deal',
    'accepted-native-root-ledger','owner-payment-and-targets','paper-rules',
    'clock-continuity'
  ];
  if (!plainObject(evidence)) fail('evidence object map is required');
  const evidenceManifest = [{
    kind:'registration',
    ref:preDeal.gameRegistration.registrationRef,
    sha256:evidenceBundleSha256(preDeal.gameRegistration)
  }];
  for (const kind of required)
    evidenceManifest.push(checkedEvidence(kind,evidence[kind]));
  const policyRef = evidence['policy-and-counterplay'];
  if (!plainObject(policyRef) || !nonempty(policyRef.ref))
    fail('policy-and-counterplay evidence reference is required');
  evidenceManifest.push({
    kind:'policy-and-counterplay',
    ref:policyRef.ref,
    sha256:evidenceBundleSha256(policyEvidence)
  });
  assert.deepEqual(evidenceManifest.map(x=>x.kind),MANIFEST,
    'Evidence manifest must match the existing nine-object contract');

  const bundle = {
    schema:BUNDLE_SCHEMA,
    admissionContract:SCHEMA,
    producerId:preDeal.producerId,
    trialId:preDeal.trialId,
    trial:trialOut,
    evidenceManifest,
    policyPlanCore:preDeal.policyPlanCore,
    policyPlanSha256:preDeal.policyPlanSha256,
    policyAttestationBundle:preDeal.policyAttestationBundle,
    policyAttestationBundleSha256:preDeal.policyAttestationBundleSha256,
    policyRegistration:preDeal.policyRegistration,
    policyRegistrationSha256:preDeal.policyRegistrationSha256,
    policyApplicationReceipt:receipt,
    policyPanelReceipts:receipts
  };
  const structural = bundleFailures(bundle);
  if (structural.length) fail('existing complete-game bundle contract: '+structural.join(','));
  const panel = inspectPolicyPanelConsistency(bundle);
  if (!panel.valid) fail('existing policy-panel validator: '+panel.failures.join(','));
  const assessment = fixtureOnly ?
    inspectAdmissionV3(bundle,reviews,reviewerRegistry) :
    evaluateCompetitiveAdmissionV3(bundle,reviews);
  return {
    bundle,assessment,preDeal,preDealPersistenceReceipt:chronology.persistenceReceipt,
    dealGenerationReceipt:chronology.dealReceipt,policyEvidence,policyPanelConsistency:panel,
    fieldStatus:panel.status,
    fieldComplete:panel.fieldComplete,
    fullFieldPanelComplete:panel.fullFieldPanelComplete,
    fixtureOnly,
    fullProcessClosureCovered:
      preDeal.policyPlanCore?.runtimePinEvidence?.fullProcessClosureCovered===true,
    competitiveAdmission:fixtureOnly?false:assessment.competitiveAdmission===true,
    admissionEligible:fixtureOnly?false:assessment.admissionEligible===true
  };
}

function assertPersistedPreDealMatches(persisted,verified) {
  const fields=[
    'ready','status','fixtureOnly','producerId','trialId','gameRegistration','policyPlanCore','policyPlanSha256',
    'policyAttestationBundle','policyAttestationBundleSha256',
    'policyRegistration','policyRegistrationSha256','preDealArtifactRef','preDealArtifactSha256'
  ];
  for(const field of fields)
    if(!sameJson(persisted?.[field],verified?.[field]))
      fail('persisted pre-deal artifact changed or omitted field '+field);
}

function buildV3GameBundle(input) {
  if (input?.preDeal?.fixtureOnly===true)
    fail('fixture-only pre-deal artifacts cannot enter the production builder');
  if (input?.preDeal?.ready!==true ||
      input.preDeal.status!=='ready-before-deal')
    fail('persisted pre-deal artifact was not marked ready before deal generation');
  const preDealInput = {
    producerId:input?.preDeal?.producerId,
    trialId:input?.preDeal?.trialId,
    gameRegistration:input?.preDeal?.gameRegistration,
    preDealArtifactRef:input?.preDeal?.preDealArtifactRef,
    policyPlanCore:input?.preDeal?.policyPlanCore,
    policyAttestationBundle:input?.preDeal?.policyAttestationBundle
  };
  const verifiedPreDeal = prepareWithRegistry(preDealInput,authorized,false);
  if (!verifiedPreDeal.ready)
    fail('production pre-deal policy gate blocked: '+verifiedPreDeal.failures.join(','));
  assertPersistedPreDealMatches(input.preDeal,verifiedPreDeal);
  return assembleBundle({
    ...input,preDeal:verifiedPreDeal
  },authorized,false);
}

function buildV3GameBundleFixture(input,fixtureRegistry) {
  assert.ok(plainObject(fixtureRegistry),'Fixture reviewer registry is required');
  if (input?.preDeal?.fixtureOnly!==true)
    fail('fixture builder requires an explicitly fixture-only pre-deal artifact');
  if (input?.preDeal?.ready!==true ||
      input.preDeal.status!=='ready-before-deal')
    fail('fixture pre-deal artifact was not marked ready before deal generation');
  const preDealInput = {
    producerId:input?.preDeal?.producerId,
    trialId:input?.preDeal?.trialId,
    gameRegistration:input?.preDeal?.gameRegistration,
    preDealArtifactRef:input?.preDeal?.preDealArtifactRef,
    policyPlanCore:input?.preDeal?.policyPlanCore,
    policyAttestationBundle:input?.preDeal?.policyAttestationBundle
  };
  const verifiedPreDeal = prepareWithRegistry(preDealInput,fixtureRegistry,true);
  if (!verifiedPreDeal.ready)
    fail('fixture pre-deal policy gate blocked: '+verifiedPreDeal.failures.join(','));
  assertPersistedPreDealMatches(input.preDeal,verifiedPreDeal);
  return assembleBundle({...input,preDeal:verifiedPreDeal},
    fixtureRegistry,true);
}

module.exports = {
  POLICY_PLAN_SCHEMA,POLICY_ATTESTATION_BUNDLE_SCHEMA,POLICY_REGISTRATION_SCHEMA,
  POLICY_RECEIPT_SCHEMA,preparePreDealPolicyRegistration,
  revalidatePreDealPolicyRegistration,
  preparePreDealPolicyRegistrationFixture,buildV3GameBundle,
  buildV3GameBundleFixture
};
