'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {createHash} = require('node:crypto');
const {run: runFamilyV4} =
  require('./agent35-rank11-firstturn-family-native-v4.cjs');
const {run: runRootObserver} =
  require('./agent49-rank11-first-letter-attack-root-observer.cjs');
const {runStewardInnermostPrizeV5} =
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const reg = require('../../results/aichi-2026/registrations/agent35-rank11-firstturn-family-postattack-chronology-v5-20261106.json');

const VERSION = 'agent35-firstturn-family-postattack-original-root-chronology-v5';
const ROOT_FIELDS = [
  'actionOrdinal', 'turnBefore', 'playerSlot', 'action', 'card',
  'attack', 'attackName', 'pendingPrompt'
];

/**
 * Strictly project permitted public Store root fields. Never serialize source
 * or opposing private card zones, even from a diagnostic native abort.
 * @param {object} root Original native accepted public root record.
 * @returns {object} Bounded printable action observation.
 */
function publicRoot(root) {
  assert.ok(root && Number.isInteger(root.actionOrdinal));
  const safe = {};
  for (const field of ROOT_FIELDS) {
    const value = root[field];
    if (typeof value === 'string' || Number.isInteger(value)) {
      safe[field] = value;
    } else if (value === null) {
      safe[field] = null;
    }
  }
  return safe;
}

/**
 * Read the exact complete accepted native Store action sequence for the
 * registered original rank11 source. The physical live state is untouched.
 * @param {object} completed Real eight-arm native runner result.
 * @returns {object} Full original source/candidate public action chronology.
 */
function extractOriginal(completed) {
  const rows = completed?.rawDevelopment?.rows;
  assert.ok(Array.isArray(rows) && rows.length === 8);
  const matches = rows.filter(row =>
    (row.trial?.id ?? row.id) === reg.sourceId);
  assert.equal(matches.length, 1);
  const row = matches[0];
  const rawRoots = row.rootActionLedger ??
    row.nativeAbortEvidence?.rootActionLedger;
  assert.ok(Array.isArray(rawRoots));
  const roots = rawRoots.map(publicRoot);
  const attack = roots.find(root =>
    root.actionOrdinal === reg.attackRoot17 &&
    root.playerSlot === reg.sourceSeat &&
    root.turnBefore === reg.firstTurnSource &&
    root.action === 'AttackAction');
  assert.ok(attack,
    'Original registered source attack root17 must be present');
  const following = roots.filter(root =>
    root.actionOrdinal > attack.actionOrdinal);
  const opponent = following.filter(root =>
    root.playerSlot === reg.candidateSeat);
  const opponentOnNextTurn = opponent.filter(root =>
    root.turnBefore > reg.firstTurnSource);
  const voluntary = opponentOnNextTurn.filter(root =>
    !['ResolvePromptAction', 'AddPlayerAction'].includes(root.action));
  const sourceReturn = following.filter(root =>
    root.playerSlot === reg.sourceSeat &&
    root.turnBefore > reg.firstTurnSource);
  const err = row.nativeAbortEvidence ?? {};
  return {
    sourceOriginalId: reg.sourceId,
    selectedNativeStatus: row.status ?? null,
    rootsTotal: roots.length,
    sourceAttackRoot: attack,
    postAttackAcceptedPublicRoots: following,
    opponentAfterAttackPublicRoots: opponent,
    opponentAfterAttackNextTurnRoots: opponentOnNextTurn,
    opponentNextTurnNonpromptRoots: voluntary,
    nextOwnTurnAcceptedRoots: sourceReturn,
    hasNextTurnOpponentRoot: opponentOnNextTurn.length > 0,
    hasOpponentVoluntaryRoot: voluntary.length > 0,
    nativeAbort: {
      failureStage: typeof err.failureStage === 'string' ?
        err.failureStage : null,
      actionOrdinal: Number.isInteger(err.actionOrdinal) ?
        err.actionOrdinal : null,
      actingSeat: Number.isInteger(err.actingSeat) ?
        err.actingSeat : null,
      pendingPrompt: typeof err.pendingPrompt === 'string' ?
        err.pendingPrompt : null
    },
    failureInclusiveEight: rows.map(row => ({
      id: row.trial?.id ?? row.id,
      status: row.status ?? null,
      acceptedRoots:
        row.rootActionLedger?.length ??
        row.nativeAbortEvidence?.rootActionLedger?.length ?? null
    })),
    opponentPrivateZonesNotAccessedForChoices: true
  };
}

/**
 * Re-run the prior, strictly frozen original source Letter and Basic-search
 * continuation with an additional read-only native action chronology capture.
 * This is an observational replay, never a new policy or competitive sample.
 * @param {{runV4?:Function,observer?:Function,steward?:Function}} [deps]
 * @returns {object} Historical native original root chronology.
 */
function run(deps = {}) {
  const source = deps.steward ?? runStewardInnermostPrizeV5;
  const observe = deps.observer ?? runRootObserver;
  let chronology = null;
  const augmentedObserver = options => observe({
    ...options,
    steward: () => {
      const result = source();
      chronology = extractOriginal(result);
      return result;
    }
  });
  const v4 = (deps.runV4 ?? runFamilyV4)({
    observe: augmentedObserver
  });
  assert.ok(chronology);
  assert.equal(v4.schema, 'agent35-rank11-firstturn-family-owner-native-v4');
  assert.equal(v4.exactOriginalDeal, true);
  assert.equal(v4.preForkOriginalPublicActionsPreserved, true);
  assert.equal(v4.originalSourceLetterPhysicalTwoDarkness, true);
  assert.equal(v4.physicalCallForFamilyBasicToBench, true);
  assert.equal(v4.originalSourceAttackAction.actionOrdinal, reg.attackRoot17);
  assert.equal(chronology.failureInclusiveEight.length, 8);
  assert.equal(chronology.sourceOriginalId, reg.sourceId);
  return {
    schema: VERSION,
    sourceOriginalId: reg.sourceId,
    exactOriginalDeal: true,
    originalNativeAttackRoot17AndPhysicalBasicBench: true,
    sourceBenchPrompt: v4.genuineFamilyPromptAudit.promptShape,
    sourceLetterPrompt: {
      nativeSettled: v4.letterPromptAudit.searchPromptsSettled,
      physicalDarknessToHand: v4.letterPromptAudit.physicalDarknessToHand
    },
    ...chronology,
    competitorPolicyCompetenceCertified: false,
    originalSourceAttackFullySettledIndependently: false,
    competitivelyQualifiedGames: 0,
    winRate: null
  };
}

/** Atomic locked output of a complete original eight-arm public-root report. */
function write(file, value) {
  assert.equal(value.schema, VERSION);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  const fd = fs.openSync(file + '.lock', 'wx');
  const tmp = file + '.' + process.pid + '.tmp';
  try {
    const body = JSON.stringify(value, null, 2) + '\n';
    fs.writeFileSync(tmp, body, {flag: 'wx'});
    fs.renameSync(tmp, file);
    return {
      bytes: Buffer.byteLength(body),
      sha256: createHash('sha256').update(body).digest('hex')
    };
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(file + '.lock');
  }
}

if (require.main === module) {
  const file = process.env.AGENT35_FIRSTTURN_FAMILY_POSTATTACK_OUTPUT;
  assert.ok(file, 'AGENT35_FIRSTTURN_FAMILY_POSTATTACK_OUTPUT required');
  const result = run();
  const saved = write(file, result);
  process.stdout.write('AGENT35_FIRSTTURN_FAMILY_POSTATTACK ' +
    JSON.stringify({
      ...saved,
      rootsAfterAttack: result.postAttackAcceptedPublicRoots.length,
      opponentNextTurn: result.hasNextTurnOpponentRoot,
      opponentVoluntary: result.hasOpponentVoluntaryRoot,
      ownReturnRoots: result.nextOwnTurnAcceptedRoots.length,
      nativeAbort: result.nativeAbort,
      qualifiedGames: 0
    }) + '\n');
}

module.exports = {VERSION, publicRoot, extractOriginal, run, write};
