'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const VERSION = 'agent4-original-rank6-trainers-mail-pass14-fork-v1';
const regPath = path.resolve(__dirname, '../../results/aichi-2026/registrations/agent4-rank6-trainers-mail-pass14-20261105.json');
const nativeOutput = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const sha = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Compare a real native one-Item source fork with the frozen untreated deal.
 * Capture failures and censoring; accepted Item does not imply settled search.
 * @param {{result:object,audit:object}} observed
 * @param {object} reg
 * @returns {object}
 */
function evaluate(observed, reg) {
  assert.equal(reg.schema, 'agent4-original-rank6-trainers-mail-pass14-same-deal-v1');
  assert.equal(reg.sourceCardToPlay, "Trainers' Mail ROS");
  assert.equal(reg.originalSourceSeat, 1);
  assert.equal(reg.sourcePassRootOrdinal, 14);
  const rows = observed.result?.rawDevelopment?.rows;
  assert.ok(Array.isArray(rows) && rows.length === reg.preregisteredNativeAttempts);
  const ids = rows.map(row => row.trial?.id ?? row.id);
  assert.equal(new Set(ids).size, reg.preregisteredNativeAttempts);
  const matches = rows.filter(row => (row.trial?.id ?? row.id) === reg.selectedOriginalId);
  assert.equal(matches.length, 1);
  const row = matches[0];
  const roots = row.rootActionLedger ?? row.nativeAbortEvidence?.rootActionLedger ?? [];
  const originalSourceDealMatched = row.sourceDealFingerprint === reg.originalSourceDealSha256;
  const fullPhysicalOpeningMatched = row.fullPhysicalDealFingerprint === reg.originalWholePhysicalDealSha256;
  const prefix = roots.slice(0, reg.sourcePassRootOrdinal);
  const originalNativeRootPrefixMatched = prefix.length === reg.sourcePassRootOrdinal &&
    sha(prefix) === reg.beforePassRootPrefixLedgerSha256;
  const actual = roots[reg.sourcePassRootOrdinal] ?? null;
  const physicallyHeldItemAcceptedByStore = actual?.action === 'PlayCardAction' &&
    actual.playerSlot === reg.originalSourceSeat &&
    actual.turnBefore === reg.sourceTurn &&
    /Trainers.? Mail/i.test(actual.card ?? '');
  const hand = observed.audit?.actorSnapshot?.ownHand ?? null;
  const sourceOwnerHandMatched = Array.isArray(hand) &&
    sha(hand) === reg.sourceOwnedHandAtPassSha256 &&
    hand.filter(x => x === reg.sourceCardToPlay).length === reg.originalSourceHeldCopiesAtPass;
  const later = roots.filter(root => root.actionOrdinal > reg.sourcePassRootOrdinal);
  const originalAllEightStatuses = rows.map(item => ({
    id: item.trial?.id ?? item.id, status: item.status ?? null,
    acceptedRoots: item.rootActionLedger?.length ??
      item.nativeAbortEvidence?.rootActionLedger?.length ?? null
  }));
  return {
    schema: VERSION, originalSourceId: reg.selectedOriginalId,
    observedTwinleaf: observed.result?.manifest?.observedTwinleafGitCommit ?? null,
    originalAttemptsRetained: rows.length,
    originalSourceDealMatched, fullPhysicalOpeningMatched,
    originalNativeRootPrefixMatched, sourceOwnerHandMatched,
    completePreTreatmentIdentityProven: originalSourceDealMatched &&
      fullPhysicalOpeningMatched && originalNativeRootPrefixMatched && sourceOwnerHandMatched,
    originallyHeldMailCopies: reg.originalSourceHeldCopiesAtPass,
    originalOwnerSeat: reg.originalSourceSeat, ownerTurn: reg.sourceTurn,
    proposedNativeItem: observed.audit?.proposedAction ?? null,
    actualNativeRoot: actual, physicallyHeldItemAcceptedByStore,
    ownerPromptRootsAfterItem: later.filter(root =>
      root.playerSlot === reg.originalSourceSeat && root.action === 'ResolvePromptAction'),
    sourceAttackRootsAfterItem: later.filter(root =>
      root.playerSlot === reg.originalSourceSeat && root.action === 'AttackAction'),
    candidateReplyRootsAfterItem: later.filter(root =>
      root.playerSlot === reg.candidateSeat && root.action !== 'ResolvePromptAction'),
    targetNativeStatus: row.status ?? null,
    targetNativeError: row.error ?? null,
    targetNativeStoreCause: row.nativeStoreCauseStack ?? null,
    sourceNativeAbort: row.nativeAbortEvidence ? {
      failureStage: row.nativeAbortEvidence.failureStage ?? null,
      pendingPrompt: row.nativeAbortEvidence.pendingPrompt ?? null,
      actionOrdinal: row.nativeAbortEvidence.actionOrdinal ?? null,
      redactedMessageDigest: row.nativeAbortEvidence.redactedMessageDigest ?? null
    } : null,
    sourceOwnerObservation: observed.audit?.actorSnapshot ?? null,
    sourceRootCount: roots.length, originalAllEightStatuses,
    completePaperGameQualified: false, competitivelyQualifiedGames: 0,
    demonstratedWinRate: null
  };
}

/** @param {object} [deps] */
function run(deps = {}) {
  const reg = deps.registration ?? require(regPath);
  const headless = deps.headless ?? require('../twinleaf/headless.cjs');
  const native = file => require(path.join(nativeOutput, file));
  const SimpleTacticsAi = deps.SimpleTacticsAi ??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const PlayCardAction = deps.PlayCardAction ??
    native('game/store/actions/play-card-action').PlayCardAction;
  const fork = deps.fork ??
    require('./agent35-rank11-source-letter-pass37-fork.cjs').withLetterFork;
  const runner = deps.runner ??
    require('./agent36-issue25-steward-innermost-prize-v5.cjs').runStewardInnermostPrizeV5;
  return evaluate(fork(() => runner(), {
    headless, SimpleTacticsAi, PlayCardAction, registration: reg
  }), reg);
}

/** Atomic and exclusive result write. */
function write(filename, result) {
  assert.equal(result.schema, VERSION);
  fs.mkdirSync(path.dirname(filename), {recursive:true});
  const lock = filename + '.lock';
  const fd = fs.openSync(lock, 'wx');
  const temporary = filename + '.' + process.pid + '.tmp';
  try {
    const bytes = Buffer.from(JSON.stringify(result, null, 2) + '\n');
    fs.writeFileSync(temporary, bytes, {flag:'wx'});
    fs.renameSync(temporary, filename);
    return {bytes:bytes.length, sha256:createHash('sha256').update(bytes).digest('hex')};
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

if (require.main === module) {
  const output = process.env.AGENT4_RANK6_MAIL_FORK_OUTPUT;
  assert.ok(output, 'Set AGENT4_RANK6_MAIL_FORK_OUTPUT');
  const result = run();
  const artifact = write(output, result);
  process.stdout.write('AGENT4_ORIGINAL_MAIL_FORK ' + JSON.stringify({
    originalSourceId:result.originalSourceId,
    sameOriginalOpening:result.completePreTreatmentIdentityProven,
    nativeItemAccepted:result.physicallyHeldItemAcceptedByStore,
    sourcePrompts:result.ownerPromptRootsAfterItem.length,
    sourceAttacks:result.sourceAttackRootsAfterItem.length,
    candidateReplies:result.candidateReplyRootsAfterItem.length,
    targetNativeStatus:result.targetNativeStatus,
    errorSummary:String(result.targetNativeError?.message ??
      result.targetNativeError ?? '').slice(0,280),
    artifact, qualifiedGames:0
  }) + '\n');
}

module.exports = {VERSION,evaluate,run,write};
