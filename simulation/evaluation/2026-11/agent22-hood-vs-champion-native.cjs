'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const registration = require('../../../results/aichi-2026/registrations/agent22-hood-shield-vs-champion-20261109.json');
const originalProfile = require('../../../results/aichi-2026/registrations/agent19-dual-fixed60-four-source-papercore-prospective-20261109.json');
const hood = require('../../../results/aichi-2026/candidate-hood-shadow-rider.json');
const frozen = require('../agent41-frozen-bilateral-development-v2.json');
const { runDevelopment, validateRegisteredTrialGroups } = require('../agent41-bilateral-v2-development.cjs');
const { classifyNativeAttempt } = require('../agent41-native-attempt-disposition.cjs');
const { withPaperSemanticsProfileV1, PINNED_TWINLEAF } =
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');

const VERSION = 'agent22-hood-shield-vs-champion-paperprofile-prospective-v1';
const ROOT = path.resolve(__dirname, '../../..');
const OUTPUT = path.join(ROOT, 'agent22-hood-vs-champion-32-native.json');
const IDS = Object.freeze(['champion-reference', 'hood-shield-v1']);

/** @param {unknown} data @returns {string} */
function sha256(data) {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/** Validates the complete prospective design before observing an outcome. */
function inspect() {
  assert.equal(registration.schema, VERSION);
  assert.deepEqual(registration.sourceRanks, [5, 6, 11, 13]);
  assert.deepEqual(registration.fixedContenderIds, IDS);
  assert.equal(registration.sourceGroups.length, 16);
  assert.equal(registration.registeredTrials.length, 32);
  assert.equal(registration.rootCap, 260);
  assert.equal(registration.pinnedTwinleaf, PINNED_TWINLEAF);
  assert.equal(frozen.pinnedVendorRevision, PINNED_TWINLEAF);
  assert.deepEqual(registration.paperProfile, originalProfile.profileEnabled);
  assert.equal(hood.cards.reduce((n, card) => n + card.count, 0), 60);
  const seeds = new Set();
  for (const group of registration.sourceGroups) {
    assert.ok(!seeds.has(group.seed), 'Seed reused within prospective groups');
    seeds.add(group.seed);
    const arms = registration.registeredTrials.filter(trial =>
      trial.rank === group.rank && trial.repeat === group.repeat &&
      trial.candidateSlot === group.candidateSlot);
    assert.deepEqual(arms.map(row => row.candidateId), IDS);
    assert.ok(arms.every(row => row.seed === group.seed));
  }
  const { authenticatedSourceRanks } =
    require('../agent25-authenticated-source-admission.cjs');
  const originals =
    require('../../../results/aichi-2026/full-decklists.json');
  const admitted = authenticatedSourceRanks(originals, true);
  for (const id of IDS) {
    const trials = registration.registeredTrials.filter(
      row => row.candidateId === id);
    validateRegisteredTrialGroups(trials, admitted, false, true);
  }
  return {
    registrationSha256: sha256(registration),
    hoodSixtySha256: sha256(hood.cards),
    championSixtySha256: sha256(
      originals.decks.find(deck => deck.rank === 1).cards),
    policyOriginalProfileSha256: sha256(originalProfile.commonActorOptions),
    sourceGroups: 16,
    twoArmNativeAttempts: 32,
    enginePin: PINNED_TWINLEAF,
    competitiveQualifiedGames: 0
  };
}

/**
 * Native terminal status is known only if the real engine reports a winner.
 * A cap or engine error keeps both win/loss possibilities open.
 * @param {object} row Original native result including the physical action log.
 * @returns {{kind:string,result:string,roots:number,physical:string|null}}
 */
function outcome(row) {
  const native = classifyNativeAttempt(row);
  const seat = row.trial.candidateSlot === 'A' ? 0 : 1;
  const known = native.kind === 'ENGINE_TERMINAL' &&
    row.finished === true && Number.isSafeInteger(row.winner);
  return {
    kind: native.kind,
    result: known ? (row.winner === seat ? 'W' : 'L') :
      native.kind === 'ENGINE_TERMINAL' ? 'T' : 'C',
    roots: (row.rootActionLedger ?? []).length,
    physical: row.physicalZoneQualification?.status ?? null
  };
}

/**
 * Keeps all original games, while conditioning paired inference on actually
 * identical source physical openings and equal first-turn player.
 * @param {object[]} champ Original run rows, in registration order.
 * @param {object[]} shield Hood run rows, in registration order.
 */
function compare(champ, shield) {
  assert.equal(champ.length, 16);
  assert.equal(shield.length, 16);
  const indexed = new Map([...champ, ...shield].map(row => [row.trial.id, row]));
  assert.equal(indexed.size, 32);
  const groups = registration.sourceGroups.map(group => {
    const stem = [group.rank, group.repeat, group.candidateSlot].join(':');
    const a = indexed.get(stem + ':' + IDS[0]);
    const b = indexed.get(stem + ':' + IDS[1]);
    assert.ok(a && b);
    assert.equal(a.trial.seed, group.seed);
    assert.equal(b.trial.seed, group.seed);
    const reference = outcome(a);
    const hood = outcome(b);
    const sourceMatch = Boolean(a.sourceDealFingerprint &&
      a.sourceDealFingerprint === b.sourceDealFingerprint);
    const starterMatch = a.actualStarterSeat !== null &&
      a.actualStarterSeat !== undefined &&
      a.actualStarterSeat === b.actualStarterSeat;
    const comparable = sourceMatch && starterMatch &&
      reference.physical === 'SETTLED_PHYSICAL_INTEGRITY_PASSED' &&
      hood.physical === 'SETTLED_PHYSICAL_INTEGRITY_PASSED';
    const lower = Number(hood.result === 'W') -
      Number(reference.result === 'W' || reference.result === 'C');
    const upper = Number(hood.result === 'W' || hood.result === 'C') -
      Number(reference.result === 'W');
    assert.ok(lower <= upper);
    return {
      id: stem, ...group, sourceMatch, starterMatch, comparable,
      reference, hood, nativeWinDifferenceBounds: [lower, upper],
      bothNativeTerminal: reference.result !== 'C' && hood.result !== 'C',
      paperQualified: false
    };
  });
  /** @param {object[]} selected */
  function summarize(selected) {
    return {
      groups: selected.length,
      referenceWins: selected.filter(g => g.reference.result === 'W').length,
      hoodWins: selected.filter(g => g.hood.result === 'W').length,
      referenceCensored: selected.filter(g => g.reference.result === 'C').length,
      hoodCensored: selected.filter(g => g.hood.result === 'C').length,
      bothNativeTerminal: selected.filter(g => g.bothNativeTerminal).length,
      hoodMinusReferenceNativeWinsLower:
        selected.reduce((n, g) => n + g.nativeWinDifferenceBounds[0], 0),
      hoodMinusReferenceNativeWinsUpper:
        selected.reduce((n, g) => n + g.nativeWinDifferenceBounds[1], 0)
    };
  }
  return {
    groups,
    registered: summarize(groups),
    physicallyMatched: summarize(groups.filter(g => g.comparable)),
    rankSummaries: registration.sourceRanks.map(rank => ({
      rank,
      all: summarize(groups.filter(g => g.rank === rank)),
      matched: summarize(groups.filter(g => g.rank === rank && g.comparable))
    })),
    pairingExcluded: groups.filter(g => !g.comparable).map(g => g.id),
    competentOppositionVerified: false,
    paperGamesQualified: 0,
    fieldWinRate: null
  };
}

/** Exclusive lock and atomic rename ensure a partly written result is never used. */
function save(data) {
  const lock = OUTPUT + '.lock';
  const fd = fs.openSync(lock, 'wx', 0o600);
  const temp = OUTPUT + '.tmp.' + process.pid;
  try {
    fs.writeFileSync(temp, JSON.stringify(data) + '\n', { flag: 'wx' });
    const file = fs.openSync(temp, 'r');
    try { fs.fsyncSync(file); } finally { fs.closeSync(file); }
    fs.renameSync(temp, OUTPUT);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

function run() {
  const preflight = inspect();
  assert.equal(process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV, undefined);
  const byId = {};
  const profileAudits = {};
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV = 'true';
  try {
    for (const id of IDS) {
      const trials = registration.registeredTrials.filter(
        row => row.candidateId === id);
      const batch = withPaperSemanticsProfileV1(() => runDevelopment({
        ...frozen.policyOptions,
        ...originalProfile.commonActorOptions,
        registeredTrials: trials,
        registeredFrameName: VERSION,
        registeredCandidateDecks: { 'hood-shield-v1': hood },
        allowSingleCandidatePerGroup: true,
        allowAdditionalOriginalSourceRanks: true,
        nativeRootActionLimit: registration.rootCap,
        isolatePolicyRandomness: true,
        isolatePhysicalShuffleRandomnessAfterSetup: true
      }), registration.paperProfile);
      assert.equal(batch.result.attempted, 16);
      assert.equal(batch.result.rows.length, 16);
      byId[id] = batch.result.rows;
      profileAudits[id] = batch.audit;
    }
  } finally {
    delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  }
  const comparison = compare(byId[IDS[0]], byId[IDS[1]]);
  const result = {
    version: VERSION, preflight, comparison,
    nativeRows: byId, profileAudits,
    codeRevision: process.env.GITHUB_SHA ?? null,
    nativeDevelopmentOnly: true,
    competitiveQualifiedGames: 0
  };
  save(result);
  process.stdout.write('AGENT22_HOOD_VS_CHAMPION_NATIVE ' +
    JSON.stringify({ summary: comparison.registered,
      matched: comparison.physicallyMatched,
      rankSummaries: comparison.rankSummaries,
      excluded: comparison.pairingExcluded,
      output: path.basename(OUTPUT) }) + '\n');
  return result;
}

if (require.main === module) {
  if (process.argv.includes('--inspect-only')) {
    process.stdout.write(JSON.stringify(inspect()) + '\n');
  } else {
    run();
  }
}

module.exports = { VERSION, inspect, outcome, compare, run };
