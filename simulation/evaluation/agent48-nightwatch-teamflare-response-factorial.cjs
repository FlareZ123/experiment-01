'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { initializeCards } = require('../twinleaf/headless.cjs');
const { originals } =
  require('./agent41-rank3-arbitration-original-store.cjs');
const { runArm } =
  require('./agent2-fresh-rank1-rank3-multibasic-panel.cjs');
const { TRIAL, EXPECTED } =
  require('./agent17-skyliner-reply-owner-pass-native.cjs');
const { withPaperRandomDirectNightWatch } =
  require('../twinleaf/agent43-nightwatch-paper-random-resolver.cjs');
const { ENTROPY_SEEDS } =
  require('./agent43-nightwatch-paper-random-skyliner-pair.cjs');

const VERSION = 'agent48-original-nightwatch-x-teamflare-response-factorial-v1';
const REGISTRATION =
  'results/aichi-2026/registrations/agent48-nightwatch-teamflare-factorial-20261106.json';
const EXPECTED_60 = Object.freeze({
  rank3: '72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f',
  rank1: 'de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311'
});
const FIRST_PAIRS = Object.freeze({
  20261106: [3, 4],
  20261107: [3, 2],
  20261108: [3, 0],
  20261109: [3, 0]
});

/** @param {object} obj @returns {string} */
const digest = obj =>
  createHash('sha256').update(JSON.stringify(obj)).digest('hex');

/** Exclusive, atomic save; used after each arm to preserve early failures. */
function writeLockedAtomic(filename, value) {
  const dest = path.resolve(filename);
  const lock = dest + '.lock';
  const temp = dest + '.' + process.pid + '.tmp';
  const fd = fs.openSync(lock, 'wx');
  try {
    fs.writeFileSync(temp, JSON.stringify(value, null, 2) + '\n', 'utf8');
    fs.renameSync(temp, dest);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

/**
 * One pre-registered treatment of one already-selected original physical deal.
 * @param {object} decks Exact rank3/rank1 original printed 60s.
 * @param {number} entropySeed Original fixed Night Watch seed.
 * @param {boolean} teamflare Whether to offer rank3's held Team Flare at turn59.
 * @returns {object} Failure-inclusive native Store witness.
 */
function observeArm(decks, entropySeed, teamflare) {
  const label = teamflare ? 'teamflare' : 'control';
  const id = 'agent48:' + entropySeed + ':' + label;
  try {
    const wrapped = withPaperRandomDirectNightWatch(() =>
      runArm({
        ...TRIAL, id,
        captureOwnerPassSnapshots: true,
        captureOwnerPassSeat: 0,
        captureOwnerPassTurns: [59],
        targetedTeamFlareNative: teamflare
      }, decks), { seed: entropySeed });
    const game = wrapped.result;
    const randomness = wrapped.audit;
    const root = game.rootActionLedger ?? [];
    const ownerAt59 = game.ownerPassFrontierAudit?.events?.find(
      event => event.globalTurn === 59 && event.actorSeat === 0) ?? null;
    const attempted = game.targetedTeamFlareAudit ?? null;
    const accepted = game.nativeAcceptedTargetSidecar?.events?.find(event =>
      event.turnBefore === 59 &&
      event.playerSlot === 0 &&
      event.action === 'PlayCardAction' &&
      event.declared?.ownerHandPrinting === 'Team Flare Grunt XY' &&
      event.storeAccepted === true) ?? null;
    return {
      id, entropySeed, teamflare, status: game.status,
      error: game.error ?? null,
      seed: game.seed ?? null,
      actualFirstSeat: game.actualFirstSeat ?? null,
      winner: game.winner ?? null,
      nativeTerminal: game.nativeTerminal ?? null,
      nativeRootCount: game.rootCount ?? null,
      nativeRootSha256: game.rootLedgerSha256 ?? null,
      fullDealSha256: game.fullDealSha256 ?? null,
      sourceDealSha256: game.rank3DealSha256 ?? null,
      rootLedger: root,
      rank1AttackCount: game.rank1AttackCount ?? null,
      rank3AttackCount: game.rank3AttackCount ?? null,
      firstNightWatch: randomness.samples[0] ?? null,
      allNightWatchSamples: randomness.samples,
      patchedRandomPromptCount: randomness.samples.length,
      patchRestored: randomness.restored,
      originalFirstPromptPredictionMatched:
        Array.isArray(randomness.samples[0]?.sampledIndices) &&
        JSON.stringify(randomness.samples[0].sampledIndices) ===
          JSON.stringify(FIRST_PAIRS[entropySeed]),
      ownerTurn59Observation: ownerAt59,
      teamflarePolicy: attempted,
      acceptedTeamFlareNativeStore: accepted,
      sourceActorHandWasVisibleToOwnerOnly: true,
      competitivelyQualifiedGames: 0
    };
  } catch (error) {
    return {
      id, entropySeed, teamflare, status: 'native-error',
      error: String(error?.stack ?? error).slice(0, 5000),
      randomPromptSamplesUnavailable: true,
      competitivelyQualifiedGames: 0
    };
  }
}

/** @param {object} control @param {object} treatment @returns {object} */
function comparePair(control, treatment) {
  const rootsA = control.rootLedger ?? [];
  const rootsB = treatment.rootLedger ?? [];
  const prefixA = rootsA.filter(root => root.actionOrdinal < 227);
  const prefixB = rootsB.filter(root => root.actionOrdinal < 227);
  const samePrefix = digest(prefixA) === digest(prefixB) &&
    prefixA.length === 227 && prefixB.length === 227;
  const opponentBefore = control.ownerTurn59Observation?.opponentPublic.active;
  const opponentAfter = treatment.ownerTurn59Observation?.opponentPublic.active;
  const samePokemon = opponentBefore?.printing != null &&
    opponentBefore.printing === opponentAfter?.printing;
  const energyRemoved = samePokemon ?
    opponentBefore.energies.length - opponentAfter.energies.length : null;
  const originalTeamflareInHand =
    (control.ownerTurn59Observation?.actorHandPrintings ?? [])
      .includes('Team Flare Grunt XY');
  const physicalAccepted = treatment.acceptedTeamFlareNativeStore != null;
  return {
    entropySeed: control.entropySeed,
    controlStatus: control.status, treatmentStatus: treatment.status,
    sameSourcePhysicalDeal: control.fullDealSha256 === treatment.fullDealSha256 &&
      control.sourceDealSha256 === treatment.sourceDealSha256 &&
      control.fullDealSha256 === EXPECTED.fullDeal &&
      control.sourceDealSha256 === EXPECTED.sourceDeal,
    identicalRootPrefixBeforeOriginalPass227: samePrefix,
    controlFirstNightWatchPair: control.firstNightWatch?.sampledIndices ?? null,
    treatmentFirstNightWatchPair: treatment.firstNightWatch?.sampledIndices ?? null,
    originalOwnerTeamFlareStillHeldAtTurn59: originalTeamflareInHand,
    ownerTeamFlareNativeStoreAccepted: physicalAccepted,
    opponentActiveSamePrintingAfterReply: samePokemon,
    nativeOpponentActiveEnergyCardsRemoved: energyRemoved,
    originalNativeWinner: control.winner ?? null,
    treatedNativeWinner: treatment.winner ?? null,
    winnerChanged: control.status === 'native-terminal' &&
      treatment.status === 'native-terminal' ?
      control.winner !== treatment.winner : null,
    sourceAttackCounts: [control.rank3AttackCount, treatment.rank3AttackCount],
    referenceAttackCounts: [control.rank1AttackCount, treatment.rank1AttackCount],
    competitiveGameQualified: false
  };
}

/**
 * Execute exactly eight earlier registered original-deal factorial cells.
 * Outcome is retrospective mechanistic information; never a win-rate sample.
 * @param {string|null} filename Optional locked atomic failure-inclusive output.
 * @returns {object}
 */
function run(filename = null) {
  initializeCards();
  const decks = originals();
  assert.equal(digest(decks.source), EXPECTED_60.rank3);
  assert.equal(digest(decks.candidate), EXPECTED_60.rank1);
  assert.deepEqual(ENTROPY_SEEDS, [20261106, 20261107, 20261108, 20261109]);
  const result = {
    version: VERSION, registration: REGISTRATION,
    pinnedTwinleaf: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalRank3Sha256: EXPECTED_60.rank3,
    originalRank1Sha256: EXPECTED_60.rank1,
    physicalSourceSeed: TRIAL.seed, rank3Seat: 0, rank1Seat: 1,
    entropySeeds: [...ENTROPY_SEEDS],
    plannedArmCount: 8, arms: [], pairs: [],
    allArmsExecuted: false,
    competitivelyQualifiedGames: 0,
    limitations: [
      'Retrospectively selected positive original physical deal, not independent trials',
      'Direct Night Watch printed-paper randomness patch only, copied attacks uncorrected',
      'Owner Team Flare optional one-root intervention selected post hoc',
      'Both bots retain unqualified opponent decision policies',
      'Original four adjacent entropy seeds share first-hand-index xorshift coupling',
      'No full paper rules or tournament clock release'
    ]
  };
  if (filename) writeLockedAtomic(filename, result);
  for (const entropySeed of ENTROPY_SEEDS) {
    for (const teamflare of [false, true]) {
      result.arms.push(observeArm(decks, entropySeed, teamflare));
      if (filename) writeLockedAtomic(filename, result);
    }
  }
  result.pairs = ENTROPY_SEEDS.map((seed, i) =>
    comparePair(result.arms[i * 2], result.arms[i * 2 + 1]));
  result.allArmsExecuted = result.arms.length === 8;
  result.physicalDeckInvariant = result.arms.every(arm =>
    arm.fullDealSha256 === EXPECTED.fullDeal &&
    arm.sourceDealSha256 === EXPECTED.sourceDeal &&
    arm.actualFirstSeat === 0);
  result.predictedFirstSamplesMatched = result.arms.every(arm =>
    arm.originalFirstPromptPredictionMatched === true);
  result.allNativeRunsTerminal = result.arms.every(arm =>
    arm.status === 'native-terminal');
  result.nativePairedPrefixInvariant = result.pairs.every(
    pair => pair.identicalRootPrefixBeforeOriginalPass227);
  result.acceptanceStatus = result.physicalDeckInvariant &&
    result.predictedFirstSamplesMatched &&
    result.allNativeRunsTerminal && result.nativePairedPrefixInvariant ?
    'PASS-retrospective-mechanistic-only' : 'UNRESOLVED-or-native-failed';
  if (filename) writeLockedAtomic(filename, result);
  return result;
}

if (require.main === module) {
  try {
    const outcome = run(process.env.AGENT48_FACTORIAL_OUTPUT ?? null);
    process.stdout.write(JSON.stringify({
      version: outcome.version,
      acceptanceStatus: outcome.acceptanceStatus,
      pairSummaries: outcome.pairs,
      allNativeRunsTerminal: outcome.allNativeRunsTerminal,
      outputSaved: Boolean(process.env.AGENT48_FACTORIAL_OUTPUT),
      competitivelyQualifiedGames: 0
    }) + '\n');
    if (outcome.acceptanceStatus !== 'PASS-retrospective-mechanistic-only') {
      process.exitCode = 1;
    }
  } catch (error) {
    process.stdout.write(JSON.stringify({
      version: VERSION, status: 'runner-error',
      error: String(error?.stack ?? error).slice(0, 5000),
      competitivelyQualifiedGames: 0
    }) + '\n');
    process.exitCode = 1;
  }
}

module.exports = { VERSION, REGISTRATION, EXPECTED_60, FIRST_PAIRS,
  writeLockedAtomic, observeArm, comparePair, run };
