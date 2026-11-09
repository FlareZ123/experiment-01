'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const registration = require('../../../results/aichi-2026/registrations/2026-11/agent39-temple-fixed60-nine-dde-prospective-v1.json');
const frozen = require('../agent41-frozen-bilateral-development-v2.json');
const { runDevelopment, validateRegisteredTrialGroups } = require('../agent41-bilateral-v2-development.cjs');
const { classifyNativeAttempt } = require('../agent41-native-attempt-disposition.cjs');
const { withPaperSemanticsProfileV1, PINNED_TWINLEAF } =
  require('../../twinleaf/2026-11/agent19-paper-semantics-profile-v1.cjs');

const ROOT = path.resolve(__dirname, '../../..');
const OUT = path.join(ROOT, 'agent39-temple-nine-dde-native.json');
const SUMMARY = path.join(ROOT, 'agent39-temple-nine-dde-summary.json');
const VERSION = 'agent39-temple-fixed60-nine-dde-prospective-v1';

/** @param {Buffer} bytes */
function gitBlob(bytes) {
  return createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
}
/** @param {unknown} object */
function digest(object) {
  return createHash('sha256').update(JSON.stringify(object)).digest('hex');
}

/** @returns {object} Deterministic immutable experiment preflight. */
function inspect() {
  assert.equal(registration.schema, VERSION);
  assert.deepEqual(registration.sourceRanks, [10, 12, 13, 14, 18, 20, 21, 27, 32]);
  assert.deepEqual(registration.fixedContenderIds, ['champion-reference', 'temple-shadow-rider-v1']);
  assert.equal(registration.sourceGroups.length, 18);
  assert.equal(registration.registeredTrials.length, 36);
  assert.equal(registration.rootCap, 260);
  assert.equal(PINNED_TWINLEAF, registration.pinnedTwinleaf);
  assert.equal(frozen.pinnedVendorRevision, PINNED_TWINLEAF);
  for (const item of registration.sourceManifestGitBlobs) {
    assert.equal(gitBlob(fs.readFileSync(path.join(ROOT, item.path))), item.blob,
      'Frozen input changed: ' + item.path);
  }

  const roster = require('../../../results/aichi-2026/full-decklists.json');
  const temple = require('../../../results/aichi-2026/candidate-temple-shadow-rider.json');
  const originals = registration.sourceRanks.map(rank => {
    const deck = roster.decks.find(x => x.rank === rank);
    assert.ok(deck, 'Original rank absent: ' + rank);
    assert.equal(deck.cards.reduce((n, card) => n + card.count, 0), 60);
    assert.ok(deck.cards.some(x => x.name === 'Double Dragon Energy' && x.count >= 1),
      'Registered Regidrago opponent lacks Double Dragon Energy: ' + rank);
    return { rank, cards: deck.cards };
  });
  assert.equal(temple.cards.reduce((n, card) => n + card.count, 0), 60);
  assert.equal(temple.cards.find(x => x.name === 'Temple of Sinnoh')?.count, 2);
  const { authenticatedSourceRanks } = require('../agent25-authenticated-source-admission.cjs');
  const admittedRanks = authenticatedSourceRanks(roster, true);
  for (const id of registration.fixedContenderIds) {
    const trials = registration.registeredTrials.filter(row => row.candidateId === id);
    validateRegisteredTrialGroups(trials, admittedRanks, false, true);
    assert.equal(trials.length, 18);
  }
  for (const group of registration.sourceGroups) {
    const exact = registration.registeredTrials.filter(row =>
      row.rank === group.rank && row.repeat === group.repeat &&
      row.candidateSlot === group.candidateSlot && row.seed === group.seed);
    assert.deepEqual(exact.map(x => x.candidateId), registration.fixedContenderIds);
  }
  return { schema: VERSION, registrationSha256: digest(registration),
    fixedContenders: registration.fixedContenderIds,
    sourceRanks: registration.sourceRanks, groups: 18, games: 36,
    originalRegidragoDoubleDragonDecks: originals.length,
    pinnedTwinleaf: PINNED_TWINLEAF, rootCap: 260, paperQualifiedGames: 0 };
}

/** @param {object} row */
function project(row) {
  const roots = row.rootActionLedger ?? row.nativeAbortEvidence?.rootActionLedger ?? [];
  const winner = row.finished === true ? row.winner ?? null : null;
  return { id: row.trial.id, rank: row.trial.rank, repeat: row.trial.repeat,
    candidateSlot: row.trial.candidateSlot, candidateId: row.trial.candidateId,
    candidateSeat: row.trial.candidateSlot === 'A' ? 0 : 1,
    actualStarterSeat: row.actualStarterSeat ?? null,
    sourceDealFingerprint: row.sourceDealFingerprint ?? null,
    fullPhysicalDealFingerprint: row.fullPhysicalDealFingerprint ?? null,
    physicalStatus: row.physicalZoneQualification?.status ?? null,
    rootCount: roots.length,
    rootDigest: row.rootActionLedgerSha256 ?? digest(roots),
    roots,
    nativeDisposition: classifyNativeAttempt(row).kind,
    nativeFinished: row.finished === true,
    nativeWinner: winner,
    nativeEndReason: row.endReason ?? null,
    error: row.error ? String(row.error).slice(0, 1000) : null,
    paperQualified: false };
}
/** @param {object} row @returns {[number,number]} */
function winInterval(row) {
  if (!row.nativeFinished || row.error || row.nativeWinner === null)
    return [0, 1];
  const value = Number(row.nativeWinner === row.candidateSeat);
  return [value, value];
}
/** @param {object[]} rows */
function compare(rows) {
  assert.equal(rows.length, 36);
  const byId = new Map(rows.map(row => [row.id, row]));
  assert.equal(byId.size, 36);
  const groups = registration.sourceGroups.map(source => {
    const key = [source.rank, source.repeat, source.candidateSlot].join(':');
    const [champion, temple] = registration.fixedContenderIds.map(id => {
      const row = byId.get(key + ':' + id);
      assert.ok(row, 'Missing arm: ' + key + ':' + id);
      return row;
    });
    const sourceMatched = Boolean(champion.sourceDealFingerprint &&
      champion.sourceDealFingerprint === temple.sourceDealFingerprint);
    const starterMatched = champion.actualStarterSeat !== null &&
      champion.actualStarterSeat === temple.actualStarterSeat;
    const comparable = sourceMatched && starterMatched;
    const c = winInterval(champion), t = winInterval(temple);
    return { key, rank: source.rank, candidateSlot: source.candidateSlot,
      seed: source.seed, sourceMatched, starterMatched,
      comparable, champion, temple,
      championMinusTemple: comparable ? [c[0] - t[1], c[1] - t[0]] : null,
      observedNativeContrast: comparable && c[0] === c[1] && t[0] === t[1] ?
        c[0] - t[0] : null,
      paperQualified: false };
  });
  const perRank = registration.sourceRanks.map(rank => {
    const a = groups.filter(g => g.rank === rank);
    return { rank, physicalMatched: a.filter(g => g.comparable).length,
      bothTerminal: a.filter(g => g.observedNativeContrast !== null).length,
      championWins: a.filter(g => winInterval(g.champion).every(x => x === 1)).length,
      templeWins: a.filter(g => winInterval(g.temple).every(x => x === 1)).length,
      capsOrUnknown: a.flatMap(g => [g.champion, g.temple])
        .filter(row => winInterval(row)[0] !== winInterval(row)[1]).length,
      comparableChampionMinusTempleBounds: a.filter(g => g.comparable)
        .reduce((interval, g) => [
          interval[0] + g.championMinusTemple[0],
          interval[1] + g.championMinusTemple[1]
        ], [0, 0]) };
  });
  const matched = groups.filter(g => g.comparable);
  const bounds = matched.reduce((range, g) => [
    range[0] + g.championMinusTemple[0],
    range[1] + g.championMinusTemple[1]
  ], [0, 0]);
  const all = groups.flatMap(g => [g.champion, g.temple]);
  return { groups, perRank, summary: {
    attempted: all.length, pairedGroups: groups.length,
    physicalSourcePairsMatched: matched.length,
    bothNativeTerminalMatched: matched.filter(g => g.observedNativeContrast !== null).length,
    championMinusTempleOnComparableGroups: bounds,
    unmatchedSourceGroups: groups.filter(g => !g.comparable).map(g => g.key),
    championNativeWins: all.filter(row => row.candidateId === 'champion-reference' &&
      winInterval(row).every(x => x === 1)).length,
    templeNativeWins: all.filter(row => row.candidateId === 'temple-shadow-rider-v1' &&
      winInterval(row).every(x => x === 1)).length,
    nativeTerminals: all.filter(row => row.nativeFinished && !row.error).length,
    nativeErrors: all.filter(row => row.error).length,
    nativeCapsOrUnknown: all.filter(row => winInterval(row)[0] !== winInterval(row)[1]).length,
    paperQualifiedGames: 0, competitiveWinRateClaim: null } };
}
/** Exclusive lock and same-filesystem rename to prevent incomplete output. */
function archive(file, data) {
  const lock = file + '.lock', fd = fs.openSync(lock, 'wx', 0o600);
  const temp = file + '.tmp.' + process.pid;
  try {
    fs.writeFileSync(temp, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
    fs.renameSync(temp, file);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
function run() {
  const preflight = inspect();
  const roster = require('../../../results/aichi-2026/candidate-temple-shadow-rider.json');
  const previous = process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  assert.equal(previous, undefined);
  process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV = 'true';
  const raw = [], audits = {};
  try {
    for (const candidateId of registration.fixedContenderIds) {
      const registeredTrials = registration.registeredTrials.filter(x =>
        x.candidateId === candidateId);
      const batch = withPaperSemanticsProfileV1(() => runDevelopment({
        ...frozen.policyOptions, ...registration.commonActorOptions,
        registeredTrials,
        registeredFrameName: VERSION + ':' + candidateId,
        allowAdditionalOriginalSourceRanks: true,
        allowSingleCandidatePerGroup: true,
        registeredCandidateDecks: candidateId === 'temple-shadow-rider-v1' ?
          { [candidateId]: { label: candidateId, cards: roster.cards } } : null,
        nativeRootActionLimit: registration.rootCap,
        isolatePolicyRandomness: true,
        isolatePhysicalShuffleRandomnessAfterSetup: true
      }), registration.profileEnabled);
      assert.equal(batch.result.attempted, 18);
      assert.equal(batch.result.rows.length, 18);
      assert.deepEqual(batch.result.rows.map(row => row.trial.id),
        registeredTrials.map(row => row.id));
      raw.push(...batch.result.rows);
      audits[candidateId] = batch.audit;
    }
  } finally {
    if (previous === undefined) delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV = previous;
  }
  const projected = raw.map(project);
  const comparison = compare(projected);
  const outcome = { schema: VERSION, preflight, registration,
    execution: { codeRevision: process.env.GITHUB_SHA ?? null,
      pinnedTwinleaf: PINNED_TWINLEAF, profileAudit: audits,
      nativeRunner: 'agent41-bilateral-v2-development.cjs',
      officialClock: 'unobserved',
      independentPaperReview: 'unavailable',
      paperQualifiedGames: 0 },
    comparison, allNativeRows: raw,
    claim: 'Native developmental comparison; censoring bounds, no paper competitive inference' };
  archive(OUT, outcome);
  archive(SUMMARY, { preflight, execution: outcome.execution,
    summary: comparison.summary, perRank: comparison.perRank,
    groups: comparison.groups.map(({ champion, temple, ...rest }) => ({
      ...rest, champion: { ...champion, roots: undefined },
      temple: { ...temple, roots: undefined } })) });
  process.stdout.write('AGENT39_TEMPLE_NINE_DDE ' +
    JSON.stringify({ ...comparison.summary, perRank: comparison.perRank }) + '\n');
  return outcome;
}
if (require.main === module) {
  if (process.argv.includes('--inspect-only')) console.log(JSON.stringify(inspect()));
  else if (process.argv.includes('--self-test')) {
    assert.deepEqual(winInterval({ nativeFinished: true, error: null,
      nativeWinner: 0, candidateSeat: 0 }), [1, 1]);
    assert.deepEqual(winInterval({ nativeFinished: false, candidateSeat: 0 }), [0, 1]);
    console.log(JSON.stringify({ preflight: inspect(), pure: 'PASS' }));
  } else {
    const result = run();
    if (result.comparison.summary.nativeTerminals === 0)
      process.exitCode = 1;
  }
}
module.exports = { VERSION, inspect, winInterval, compare, project, run };
