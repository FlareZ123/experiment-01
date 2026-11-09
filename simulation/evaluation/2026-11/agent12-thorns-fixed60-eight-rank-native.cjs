'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const manifest = require('../../../results/aichi-2026/registrations/agent12-thorns-vs-champion-eight-rank-screen-20261109.json');
const frozen = require('../agent41-frozen-bilateral-development-v2.json');
const {runDevelopment, validateRegisteredTrialGroups} =
  require('../agent41-bilateral-v2-development.cjs');
const {withPaperSemanticsProfileV1, PINNED_TWINLEAF} =
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');

const ROOT = path.resolve(__dirname, '../../..');
const OUTPUT = path.join(ROOT, 'agent12-thorns-fixed60-eight-rank-native.json');

/** @param {string} file @returns {string} Git blob hash of frozen repository file. */
function gitBlob(file) {
  const data = fs.readFileSync(path.join(ROOT, file));
  return crypto.createHash('sha1')
    .update('blob ' + data.length + '\0').update(data).digest('hex');
}

/** @returns {{champion:object,thorns:object}} */
function verify() {
  assert.equal(manifest.schema,
    'agent12-fixed60-iron-thorns-vs-champion-eight-original-ranks-prospective-v1');
  assert.equal(manifest.status, 'FROZEN BEFORE ANY NATIVE GAME');
  assert.equal(manifest.pinnedTwinleaf, PINNED_TWINLEAF);
  assert.equal(manifest.groups.length, 16);
  assert.equal(manifest.expectedNativeAttempts, 32);
  assert.deepEqual(manifest.candidateIds,
    ['champion-reference', 'rank6-iron-thorns-fixed60']);
  const uniqueSeeds = new Set(manifest.groups.map(x => x.seed));
  assert.equal(uniqueSeeds.size, 16);
  for (const item of manifest.frozenSourceAndPolicyGitBlobs) {
    assert.equal(gitBlob(item.path), item.blob, 'Frozen source drift: ' + item.path);
  }
  const roster = require('../../../results/aichi-2026/full-decklists.json');
  const champion = roster.decks.find(x => x.rank === 1);
  const thorns = roster.decks.find(x => x.rank === 6);
  for (const deck of [champion, thorns]) {
    assert.ok(deck);
    assert.equal(deck.cards.reduce((n, card) => n + card.count, 0), 60);
  }
  for (const batch of manifest.batches) {
    assert.equal(batch.registeredTrials.length, 16);
    validateRegisteredTrialGroups(batch.registeredTrials,
      manifest.sourceRanks, false, true);
  }
  return {champion, thorns};
}

/**
 * Frozen native winner indicator, never impute a capped/error game.
 * @param {object} row Real Store result.
 * @returns {object}
 */
function compact(row) {
  const seat = row.trial.candidateSlot === 'A' ? 0 : 1;
  const roots = row.rootActionLedger ??
    row.nativeAbortEvidence?.rootActionLedger ?? [];
  const finished = row.finished === true && !row.error &&
    (row.winner === 0 || row.winner === 1);
  const candidateWins = finished ? Number(row.winner === seat) : null;
  return {
    trialId: row.trial.id,
    rank: row.trial.rank,
    candidateId: row.trial.candidateId,
    candidateSlot: row.trial.candidateSlot,
    originalSeed: row.trial.seed,
    candidateSeat: seat,
    sourceSeat: 1 - seat,
    actualStarterSeat: row.actualStarterSeat ?? null,
    sourceDealFingerprint: row.sourceDealFingerprint ?? null,
    fullPhysicalDealFingerprint: row.fullPhysicalDealFingerprint ?? null,
    physicalZoneQualification: row.physicalZoneQualification?.status ?? null,
    nativeDisposition: row.error ? 'engine-error' : finished ?
      'native-terminal' : row.finished ? 'terminal-nonbinary' : 'right-censored',
    nativeWinner: finished ? row.winner : null,
    candidateWins,
    rootCount: roots.length,
    rootLedgerSHA256: crypto.createHash('sha256')
      .update(JSON.stringify(roots)).digest('hex'),
    actorAttacks: roots.filter(x => x.playerSlot === seat &&
      x.action === 'AttackAction').length,
    actorPasses: roots.filter(x => x.playerSlot === seat &&
      x.action === 'PassTurnAction').length,
    sourceAttacks: roots.filter(x => x.playerSlot === 1 - seat &&
      x.action === 'AttackAction').length,
    turns: row.turns ?? null,
    finalPrizes: row.finalPrizes ?? null,
    error: row.error ? String(row.error).slice(0, 1600) : null,
    paperQualified: false
  };
}

/**
 * Sharp no-assumption bounds on a difference of two binary outcomes,
 * given observed native terminals and unconstrained censored outcomes.
 * The returned low/high are integer win-count differences.
 * @param {number|null} controlWinner
 * @param {number|null} treatmentWinner
 * @returns {{low:number,high:number}}
 */
function pairedContribution(controlWinner, treatmentWinner) {
  const loA = controlWinner === null ? 0 : controlWinner;
  const hiA = controlWinner === null ? 1 : controlWinner;
  const loB = treatmentWinner === null ? 0 : treatmentWinner;
  const hiB = treatmentWinner === null ? 1 : treatmentWinner;
  return {low: loB - hiA, high: hiB - loA};
}

/** @param {object} championBatch @param {object} thornsBatch */
function compare(championBatch, thornsBatch) {
  assert.equal(championBatch.rows.length, manifest.groups.length);
  assert.equal(thornsBatch.rows.length, manifest.groups.length);
  const rows = manifest.groups.map((group, index) => {
    const a = compact(championBatch.rows[index]);
    const b = compact(thornsBatch.rows[index]);
    const sourceMatched = Boolean(a.sourceDealFingerprint &&
      a.sourceDealFingerprint === b.sourceDealFingerprint &&
      a.actualStarterSeat !== null &&
      a.actualStarterSeat === b.actualStarterSeat);
    const bounds = sourceMatched ?
      pairedContribution(a.candidateWins, b.candidateWins) : null;
    const bothTerminal = a.candidateWins !== null && b.candidateWins !== null;
    return {
      groupId: [group.rank, group.repeat, group.candidateSlot].join(':'),
      rank: group.rank, candidateSlot: group.candidateSlot,
      seed: group.seed, sourceMatched, bothTerminal,
      bounds, champion: a, thorns: b,
      observedWinnerDelta: sourceMatched && bothTerminal ?
        b.candidateWins - a.candidateWins : null
    };
  });
  const matched = rows.filter(x => x.sourceMatched);
  const field = manifest.candidateIds.map((candidateId, index) => {
    const selected = rows.map(row => index === 0 ? row.champion : row.thorns);
    return {
      candidateId, attempts: selected.length,
      nativeWins: selected.filter(x => x.candidateWins === 1).length,
      nativeLosses: selected.filter(x => x.candidateWins === 0).length,
      censored: selected.filter(x => x.nativeDisposition === 'right-censored').length,
      nativeErrors: selected.filter(x => x.nativeDisposition === 'engine-error').length,
      otherTerminals: selected.filter(x => x.nativeDisposition ===
        'terminal-nonbinary').length
    };
  });
  const perRank = manifest.sourceRanks.map(rank => {
    const list = rows.filter(row => row.rank === rank);
    return {
      rank, sourceMatched: list.filter(x => x.sourceMatched).length,
      bothTerminal: list.filter(x => x.sourceMatched && x.bothTerminal).length,
      championNativeWins: list.filter(x => x.champion.candidateWins === 1).length,
      thornsNativeWins: list.filter(x => x.thorns.candidateWins === 1).length,
      thornsActorAttacks: list.reduce((n, x) => n + x.thorns.actorAttacks, 0),
      thornsActorPasses: list.reduce((n, x) => n + x.thorns.actorPasses, 0),
      sourceAttacksAgainstThorns: list.reduce((n, x) =>
        n + x.thorns.sourceAttacks, 0)
    };
  });
  return {
    summary: {
      registeredGroups: rows.length,
      nativeAttempts: rows.length * 2,
      sourceMatched: matched.length,
      bothTerminalMatched: matched.filter(x => x.bothTerminal).length,
      unmatched: rows.length - matched.length,
      sharpThornsMinusChampionNativeWinCount: {
        low: matched.reduce((n, x) => n + x.bounds.low, 0),
        high: matched.reduce((n, x) => n + x.bounds.high, 0)
      },
      observedBothTerminalThornsMinusChampionWins: matched
        .filter(x => x.bothTerminal)
        .reduce((n, x) => n + x.observedWinnerDelta, 0),
      competitivelyQualifiedGames: 0
    },
    field, perRank, rows
  };
}

/** Locked and atomic artifact publication, including every registered attempt. */
function archive(report) {
  const lock = OUTPUT + '.lock';
  const handle = fs.openSync(lock, 'wx', 0o600);
  const temp = OUTPUT + '.tmp.' + process.pid;
  try {
    fs.writeFileSync(temp, JSON.stringify(report, null, 2) + '\n',
      {flag: 'wx'});
    const descriptor = fs.openSync(temp, 'r');
    try { fs.fsyncSync(descriptor); }
    finally { fs.closeSync(descriptor); }
    fs.renameSync(temp, OUTPUT);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(handle);
    fs.unlinkSync(lock);
  }
}

/** Actual pinned Twinleaf research execution, frozen before test results. */
function run() {
  const decks = verify();
  const previous = process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV = 'true';
  const batches = [];
  const audits = [];
  try {
    for (const batch of manifest.batches) {
      const native = withPaperSemanticsProfileV1(() =>
        runDevelopment({
          ...frozen.policyOptions,
          ...manifest.commonActorOptions,
          registeredTrials: batch.registeredTrials,
          registeredCandidateDecks: {
            'rank6-iron-thorns-fixed60': {
              label: 'rank6-iron-thorns-fixed60',
              cards: decks.thorns.cards
            }
          },
          registeredFrameName: manifest.schema + ':' + batch.candidateId,
          allowSingleCandidatePerGroup: true,
          allowAdditionalOriginalSourceRanks: true,
          nativeRootActionLimit: manifest.rootCap,
          isolatePolicyRandomness: true,
          isolatePhysicalShuffleRandomnessAfterSetup: true
        }), manifest.profileEnabled);
      assert.equal(native.result.attempted, 16);
      batches.push(native.result);
      audits.push(native.audit);
    }
  } finally {
    if (previous === undefined)
      delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else
      process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV = previous;
  }
  const comparison = compare(...batches);
  const report = {
    schema: manifest.schema,
    registration: manifest,
    frozenSixties: {champion: decks.champion, ironThorns: decks.thorns},
    enginePin: PINNED_TWINLEAF,
    codeRevision: process.env.GITHUB_SHA ?? null,
    auditProfiles: audits,
    comparison,
    actualNativeRuns: batches,
    paperQualifiedGames: 0,
    completeFieldQualified: false,
    verdict: 'Development-only screening, no full-field ranking or 99.5% claim'
  };
  archive(report);
  process.stdout.write('AGENT12_THORNS_FIXED60 ' + JSON.stringify({
    summary: comparison.summary, field: comparison.field,
    perRank: comparison.perRank, output: path.basename(OUTPUT)
  }) + '\n');
  return report;
}

if (require.main === module) {
  if (process.argv.includes('--inspect-only')) {
    const x = verify();
    process.stdout.write(JSON.stringify({
      registeredGroups: manifest.groups.length,
      nativeAttempts: manifest.expectedNativeAttempts,
      candidate60s: [x.champion.rank, x.thorns.rank],
      enginePin: PINNED_TWINLEAF,
      paperQualifiedGames: 0
    }) + '\n');
  } else run();
}

module.exports = {gitBlob, verify, compact, pairedContribution, compare, run};
