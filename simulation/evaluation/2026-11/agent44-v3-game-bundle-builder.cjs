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
const SHA256 = /^[0-9a-f]{64}$/;
const GIT_SHA = /^[0-9a-f]{40}$/;
const OFFSET_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
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
function validateGameRegistration(gameRegistration, trialId) {
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
  if (!preDealArtifactRef) failures.push('predeal-artifact-reference-invalid');

  if (!stableId(producerId)) failures.push('bundle-producer-id-invalid');
  if (!stableId(trialId)) failures.push('trial-id-invalid');
  failures.push(...validateGameRegistration(gameRegistration,trialId));
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
        policyPlanCore,expectedPolicyPlanSha256:policyPlanSha256,gameReceipts:[]
      });
      if (field.status === 'INVALID')
        failures.push(...field.rejectionReasons.map(x=>'policy-field:'+x));
      if (!Array.isArray(field.availableRanks) || field.availableRanks.length===0)
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
    policyCompetence = inspectPolicyCompetenceAttestations({
      producerId,policyPlanCore,policyAttestationBundle,policyRegistration
    },reviewerRegistry,panel);
    if (!policyCompetence.valid)
      failures.push(...policyCompetence.failures);
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

function checkedReceipt(receipt,allowMissingDigest=false) {
  if (!plainObject(receipt) || receipt.schema !== POLICY_RECEIPT_SCHEMA)
    fail('policy application receipt schema invalid');
  const expected = digestWithout(receipt,'receiptSha256');
  if (receipt.receiptSha256 === undefined && allowMissingDigest)
    return {...receipt,receiptSha256:expected};
  if (receipt.receiptSha256 !== expected)
    fail('policy application receipt digest mismatch');
  return receipt;
}

function validateReceiptAgainstPlan(receipt,preDeal,trial) {
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
  if (!GIT_SHA.test(receipt.enginePin??'') ||
      !GIT_SHA.test(receipt.runnerRevision??'') ||
      !SHA256.test(receipt.decisionTraceSha256??'') ||
      !['none','within-budget','not-exceeded'].includes(receipt.timeoutStatus))
    fail('application receipt engine, runner, trace or timeout status invalid');
}

function assembleBundle({preDeal,trial,evidence,policyApplicationReceipt,
  policyPanelReceipts=[],reviews=[]},reviewerRegistry,fixtureOnly) {
  if (!preDeal?.ready || preDeal.fixtureOnly!==fixtureOnly)
    fail('pre-deal registration is not ready for this builder mode');
  if (!plainObject(trial) || trial.trialId!==preDeal.trialId)
    fail('postgame trial identity does not match frozen pre-deal registration');
  if (!sameJson(trial.preregistration,preDeal.gameRegistration) ||
      trial.preregistrationSha256!==evidenceBundleSha256(preDeal.gameRegistration) ||
      trial.registrationRef!==preDeal.gameRegistration.registrationRef ||
      trial.preregistrationEvidenceRef!==preDeal.gameRegistration.registrationRef ||
      trial.timingMode!==preDeal.gameRegistration.timingProtocol.mode)
    fail('postgame trial does not preserve the exact pre-deal game registration');
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

  const receipt = checkedReceipt(policyApplicationReceipt,true);
  validateReceiptAgainstPlan(receipt,preDeal,trial);
  const receipts = [...policyPanelReceipts.map(x=>checkedReceipt(x,false))];
  if (!receipts.some(x=>x.trialId===receipt.trialId &&
      x.receiptSha256===receipt.receiptSha256)) receipts.push(receipt);
  const trialIds = new Set();
  for (const item of receipts) {
    if (trialIds.has(item.trialId)) fail('duplicate trial id in policy panel receipt ledger');
    trialIds.add(item.trialId);
  }

  const trialOut = {
    ...trial,
    opponentRank:receipt.opponentRank,
    policySha256BySeat:receipt.policySha256BySeat,
    policyPlanSha256:preDeal.policyPlanSha256,
    policyAttestationBundleSha256:preDeal.policyAttestationBundleSha256,
    policyRegistrationSha256:preDeal.policyRegistrationSha256
  };
  const policyEvidence = {
    preDealArtifactRef:preDeal.preDealArtifactRef,
    preDealArtifactSha256:preDeal.preDealArtifactSha256,
    policyPlanCore:preDeal.policyPlanCore,
    policyAttestationBundle:preDeal.policyAttestationBundle,
    policyRegistration:preDeal.policyRegistration,
    policyApplicationReceipt:receipt,
    policyPanelReceipts:receipts,
    postgameReviews:reviews
  };
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
    bundle,assessment,preDeal,policyEvidence,policyPanelConsistency:panel,
    fieldStatus:panel.status,
    fieldComplete:panel.fieldComplete,
    fullFieldPanelComplete:panel.fullFieldPanelComplete,
    fixtureOnly
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
  preparePreDealPolicyRegistrationFixture,buildV3GameBundle,
  buildV3GameBundleFixture
};
