'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {runDevelopment} = require('../agent41-bilateral-v2-development.cjs');
const {registration, gameCapture} =
  require('./agent44-first-original-rank5-newmoon-case.cjs');
const sourceFunding = require('./agent8-source-mew-funding-v6.cjs');
const {withOwnerPathAfterPass} =
  require('../../twinleaf/2026-11/agent42-owner-path-to-peak-pass.cjs');

const ROOT = path.resolve(__dirname, '../../..');
const OUTPUT = path.join(ROOT,
  'artifacts/agent42-rank5-lillie-path-counterfactual.json');
const SOURCE_DEAL =
  '65b0ab58d71b58e4125e5a87004fcc0d1a4560ec6962ecfabf683838e0f49922';
const FULL_DEAL =
  '45ff848189119b7fa551dc86f9c6eeefa82db81117c7a7fdae8bc38361b72349';
const FIRST45 =
  'd9d04e586b89784682e68d0fe71a1c85927643d4a12853c119a0699ce8e3b751';
const FIRST_LILLIE_NATIVE_ARTIFACT = 13681335041;
const sha256 = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Install after all default actor policies, inside the native runMatch call.
 * The outer canonical actor root would otherwise hide a replacement Pass.
 *
 * @template T
 * @param {()=>T} execute Current one-case development.
 * @returns {{result:T,nativeAudits:object[]}}
 */
function withNestedNativePath(execute) {
  const headless = require('../../twinleaf/headless.cjs');
  const before = Object.getOwnPropertyDescriptor(headless, 'runMatch');
  assert.equal(typeof before?.value, 'function');
  const nativeAudits = [];
  function nested(request) {
    const observed = withOwnerPathAfterPass(() =>
      before.value.call(headless, request));
    nativeAudits.push(observed.audit);
    return observed.result;
  }
  Object.defineProperty(headless, 'runMatch', {...before, value: nested});
  try {
    return {result: execute(), nativeAudits};
  } finally {
    assert.strictEqual(headless.runMatch, nested);
    Object.defineProperty(headless, 'runMatch', before);
  }
}

/**
 * Retrospective exact-opening follow-up to Agent21's already accepted
 * Lillie's Determination. Adds one symmetric owner-visible Stadium policy
 * and requires identical first 45 real native roots.
 */
function replay() {
  const {reg, registrationSha256} = registration();
  const capture = gameCapture();
  const frozen = require('../agent41-frozen-bilateral-development-v2.json');
  const observed = withNestedNativePath(() => runDevelopment({
    ...frozen.policyOptions, ...sourceFunding.options(true),
    sourceIndependentCommonPolicy: true,
    bilateralPerfectionRoot: true,
    actorVipAfterPass: true,
    actorMewMaxMiracleOverSelfCopy: true,
    sourceScopedQuickBallRoot: true,
    actorMewQuickBallPaymentGuard: true,
    actorMewUltraBallPaymentGuard: true,
    actorMewUltraBallRoot: true,
    actorMewUltraBallSearch: true,
    actorOnlySingleSearch: true,
    actorMewGenesectQuickBallSearch: true,
    nativeAcceptedTargets: true,
    nativeSetupCoinChoiceReceipt: true,
    nativeSetupCompensationAudit: true,
    nativePublicMulliganRevealsAudit: true,
    physicalZoneGate: true,
    losslessNativeRootJoin: true,
    paperSupporterQuota: true,
    paperSameTargetAttachEnergy: true,
    isolatePolicyRandomness: true,
    isolatePhysicalShuffleRandomnessAfterSetup: true,
    specialRedCardPaperPreselection: true,
    specialRedCardPaperCorrection: true,
    specialRedCardPaperSpeculativeShuffle: true,
    allowExtendedRegisteredNativeRootCap: true,
    allowSingleCandidateArm: true,
    allowAdditionalOriginalSourceRanks: true,
    actorBilateralLillieAfterPass: true,
    registeredTrials: reg.preRegisteredTrials,
    registeredFrameName:
      'agent42-retrospective-path-following-agent21-native-lillie',
    nativeRootActionLimit: reg.nativeRootCap,
    onRootActionDispatched: capture.onRootActionDispatched
  }));
  assert.equal(observed.result.rows.length, 1);
  assert.equal(observed.nativeAudits.length, 1);
  const row = observed.result.rows[0];
  const roots = row.rootActionLedger ?? [];
  const audit = observed.nativeAudits[0];
  const tape = capture.evidence();
  const pre = tape.postAcceptedRoots[44]?.physicalZones?.[1];
  const post = tape.postAcceptedRoots[45]?.physicalZones?.[1];
  const priorControl = {
    originalArtifact: 13678516703,
    priorLillieArtifact: FIRST_LILLIE_NATIVE_ARTIFACT,
    originalNativeWinner: 0,
    originalNativeCandidateAttacks: 0,
    lillieNativeWinner: 0,
    lillieNativeCandidateAttacks: 0
  };
  const checks = {
    sourceDealPreserved: row.sourceDealFingerprint === SOURCE_DEAL,
    fullDealPreserved: row.fullPhysicalDealFingerprint === FULL_DEAL,
    sameLilliePrefix45: sha256(roots.slice(0, 45)) === FIRST45,
    heldOwnerPath: pre?.hand?.some(c =>
      c.printing === 'Path to the Peak CRE') === true,
    proposedAcceptedOnce: audit.accepted === 1 && audit.rejected === 0,
    ownedRoot45Path: roots[45]?.playerSlot === 1 &&
      roots[45]?.turnBefore === 4 &&
      roots[45]?.action === 'PlayCardAction' &&
      roots[45]?.card === 'Path to the Peak',
    nativeStadiumInPlay: post?.stadium?.some(c =>
      c.printing === 'Path to the Peak CRE') === true
  };
  return {
    schema: 'agent42-rank5-lillie-then-path-first-native-fork-v1',
    existingOriginalCase: reg.caseId,
    originalRegistrationSha256: registrationSha256,
    evidenceClass: 'Retrospective exact-original-physical-deal native policy fork',
    priorControl, firstNewDecisionRoot: 45,
    sourceDealFingerprint: row.sourceDealFingerprint,
    fullDealFingerprint: row.fullPhysicalDealFingerprint,
    checks, nativePathAudit: audit,
    prePathCandidatePublicCustody: pre ?? null,
    postPathCandidatePublicCustody: post ?? null,
    firstPathRoot: roots[45] ?? null,
    sourceAttacks: roots.filter(x =>
      x.playerSlot === 0 && x.action === 'AttackAction').length,
    candidateAttacks: roots.filter(x =>
      x.playerSlot === 1 && x.action === 'AttackAction').length,
    nativeFinished: row.finished === true,
    nativeWinner: row.finished === true ? row.winner ?? null : null,
    finalPrizes: row.finalPrizes ?? null,
    nativeError: row.error ?? null,
    nativeAcceptedRoots: roots.length,
    fullNativeRow: row,
    fullPostAcceptedPhysicalZoneTape: tape,
    competitivePaperQualifiedGames: 0
  };
}

function save(data) {
  fs.mkdirSync(path.dirname(OUTPUT), {recursive: true});
  const lock = OUTPUT + '.lock';
  const fd = fs.openSync(lock, 'wx', 0o600);
  const temp = OUTPUT + '.tmp.' + process.pid;
  try {
    fs.writeFileSync(temp, JSON.stringify(data, null, 2) + '\n', {flag: 'wx'});
    const file = fs.openSync(temp, 'r');
    try {fs.fsyncSync(file);} finally {fs.closeSync(file);}
    fs.renameSync(temp, OUTPUT);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

function main() {
  const output = replay();
  save(output);
  console.log('AGENT42_RANK5_PATH_FORK', JSON.stringify({
    checks: output.checks,
    pathAudit: output.nativePathAudit,
    nativeFinished: output.nativeFinished,
    nativeWinner: output.nativeWinner,
    finalPrizes: output.finalPrizes,
    sourceAttacks: output.sourceAttacks,
    candidateAttacks: output.candidateAttacks,
    nativeAcceptedRoots: output.nativeAcceptedRoots,
    nativeError: output.nativeError,
    competitivePaperQualifiedGames: 0
  }));
  assert.ok(Object.values(output.checks).every(Boolean),
    'Owner-held native Path must be the first changed root of the exact Lillie deal');
  return output;
}
if (require.main === module) main();
module.exports = {withNestedNativePath, replay, main};
