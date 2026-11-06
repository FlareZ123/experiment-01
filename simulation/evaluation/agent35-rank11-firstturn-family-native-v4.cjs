'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {run: observeOriginal} =
  require('./agent49-rank11-first-letter-attack-root-observer.cjs');
const {run: runLateLetter} =
  require('./agent35-rank11-letter-owner-late-v3.cjs');
const {withLateOwnedLetterPrompt} =
  require('../twinleaf/agent35-letter-owner-match-late-hook.cjs');
const {withLateOwnedCallFamilyPrompt} =
  require('../twinleaf/agent49-rank11-firstturn-call-family-owner-prompt.cjs');
const registration = require('../../results/aichi-2026/registrations/agent35-rank11-firstturn-family-owner-prompt-v1-20261106.json');

const VERSION = 'agent35-rank11-firstturn-family-owner-native-v4';

/**
 * Install the Letter decoder outside the Family decoder. The Letter layer
 * remains the last native decoder and delegates non-Letter prompts into the
 * Family layer. Both hook implementations restore their descriptors in finally.
 * @template T
 * @param {()=>T} next Actual frozen original-eight runner.
 * @param {object} deps Native Store and bot interfaces, supplied by v3.
 * @param {Function} letter Genuine owner Letter prompt wrapper.
 * @param {Function} family Genuine owner Family prompt wrapper.
 * @returns {{result:T,audit:object,familyAudit:object}}
 */
function compose(next, deps, letter, family) {
  const outer = letter(() => family(next, deps), deps);
  assert.ok(outer && outer.result && outer.audit);
  assert.ok(outer.result.audit && 'result' in outer.result);
  return {
    result: outer.result.result,
    audit: outer.audit,
    familyAudit: outer.result.audit
  };
}

/**
 * Continue one original source first-turn Letter treatment with an owner-only
 * response to Trubbish's real Call for Family Basic-search prompt.
 *
 * All eight historical arms remain observable. This retrospective experiment
 * cannot certify policy competitiveness, opponent optimality or a game win.
 * @param {{observe?:Function,late?:Function,letter?:Function,family?:Function}} [deps]
 * @returns {object} Custody-conscious native developmental result.
 */
function run(deps = {}) {
  const observer = deps.observe ?? observeOriginal;
  const late = deps.late ?? runLateLetter;
  const letter = deps.letter ?? withLateOwnedLetterPrompt;
  const family = deps.family ?? withLateOwnedCallFamilyPrompt;
  let familyAudit = null;
  const result = observer({
    lateRun: ({registration: reg, baseRun}) => late({
      registration: reg,
      baseRun,
      wrapper: (next, components) => {
        const combined = compose(next, components, letter, family);
        familyAudit = combined.familyAudit;
        return {result: combined.result, audit: combined.audit};
      }
    })
  });

  const id = registration.originalSourceId;
  assert.equal(result.sourceOriginalRegistration, id);
  assert.equal(result.exactOriginalDeal, true);
  assert.equal(result.identicalOriginalRootPrefix, true);
  assert.equal(result.nativeLetterAccepted, true);
  assert.equal(result.nativeLetterPhysicalTwoDarkness, true);
  assert.equal(result.allEightOriginalNativeDispositions.length, 8);
  assert.ok(familyAudit && familyAudit.version ===
    'agent49-firstturn-source-call-for-family-owner-bench-prompt-v1');

  const actionTape = result.sourceAttackCustody.nativeSourceTurnRootActions;
  assert.ok(Array.isArray(actionTape));
  const sourceAttack = actionTape.find(row =>
    row.actionOrdinal === registration.sourceAttackOrdinalObservedHistorical &&
    row.action === 'AttackAction' && row.attack === 'Call for Family');
  assert.ok(sourceAttack,
    'Previously observed original-source Call for Family root must survive');
  const sourceDamage = result.sourceAttackCustody
    .beforeAndAfterSourceTurnAttackTransitions ?? [];
  // The default sourceTurn2 experiment has exactly one owner Basic transfer.
  // An explicitly registered later-turn extension may have additional proven
  // transfers. Preserve the first-turn proof when every submitted reply is
  // physically settled and at least one has been moved.
  const physicalBasic = familyAudit.oneOriginalBasicMovedToBench >= 1 &&
    familyAudit.physicalBenchTransferFailures === 0 &&
    familyAudit.ownerBasicPromptAnswersNativeAccepted ===
      familyAudit.oneOriginalBasicMovedToBench;

  return {
    schema: VERSION,
    frozenOriginalSourceId: id,
    frozenSourceDealSha256: registration.frozenSourceDealSha256,
    frozenWholeDealSha256: registration.frozenWholeDealSha256,
    pinnedTwinleafGitlink: registration.twinleafPin,
    exactOriginalDeal: true,
    preForkOriginalPublicActionsPreserved: true,
    originalSourceLetterNativeAccepted: true,
    originalSourceLetterPhysicalTwoDarkness: true,
    originalSourceAttackAction: sourceAttack,
    physicalCallForFamilyBasicToBench: physicalBasic,
    genuineFamilyPromptAudit: familyAudit,
    letterPromptAudit: result.lateLetterAudit,
    sourceAttackTransitions: sourceDamage,
    sourceAttackSettled: sourceDamage.some(x => x.sourceAttackSettled),
    originalFirstTurnActionTape: actionTape,
    originalNativeDisposition: result.actualSourceDisposition,
    failureInclusiveEight: result.allEightOriginalNativeDispositions,
    opponentStrategicReplyIndependentlyQualified: false,
    competitivelyQualifiedGames: 0,
    fieldWinRate: null
  };
}

/** Exclusive lock and atomic rename for a reproducible native receipt. */
function write(filename, receipt) {
  assert.equal(receipt.schema, VERSION);
  fs.mkdirSync(path.dirname(filename), {recursive: true});
  const lock = filename + '.lock';
  const fd = fs.openSync(lock, 'wx');
  const tmp = filename + '.' + process.pid + '.tmp';
  try {
    const body = JSON.stringify(receipt, null, 2) + '\n';
    fs.writeFileSync(tmp, body, {flag: 'wx'});
    fs.renameSync(tmp, filename);
    return {
      bytes: Buffer.byteLength(body),
      sha256: createHash('sha256').update(body).digest('hex')
    };
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

if (require.main === module) {
  const filename = process.env.AGENT35_FIRSTTURN_FAMILY_NATIVE_RECEIPT;
  assert.ok(filename, 'AGENT35_FIRSTTURN_FAMILY_NATIVE_RECEIPT required');
  const result = run();
  const saved = write(filename, result);
  process.stdout.write('AGENT35_FIRSTTURN_FAMILY_NATIVE ' +
    JSON.stringify({
      ...saved,
      sourceAttackOrdinal: result.originalSourceAttackAction.actionOrdinal,
      ownerFamilyPrompts: result.genuineFamilyPromptAudit
        .genuineOwnerBasicDeckPrompts,
      nativeFamilyAnswers: result.genuineFamilyPromptAudit
        .ownerBasicPromptAnswersNativeAccepted,
      physicalBasicBenchMoves: result.genuineFamilyPromptAudit
        .oneOriginalBasicMovedToBench,
      attackSettled: result.sourceAttackSettled,
      originalDisposition: result.originalNativeDisposition,
      competitivelyQualifiedGames: 0
    }) + '\n');
}

module.exports = {VERSION,compose,run,write};
