'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const VERSION = 'agent46-issue25-steward-archive-audit-v1';
const EXPECTED = Object.freeze([
  '6:100:A:champion-reference',
  '6:100:A:new-moon-lockbreaker-v1',
  '6:101:B:champion-reference',
  '6:101:B:new-moon-lockbreaker-v1',
  '11:102:A:champion-reference',
  '11:102:A:new-moon-lockbreaker-v1',
  '11:103:B:champion-reference',
  '11:103:B:new-moon-lockbreaker-v1'
]);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

/**
 * Independently inspect a genuine exported steward v4 or v5 public receipt.
 * This does not read concealed game state or infer playable alternatives to Pass.
 *
 * @param {Buffer} bytes Exact downloaded JSON bytes.
 * @param {string} sidecar Exact downloaded checksum sidecar.
 * @param {'v4'|'v5'} version Registered treatment, chosen before reading outcomes.
 * @returns {object} Failure-inclusive archive-custody and source-root census.
 */
function inspect(bytes, sidecar, version) {
  assert.ok(Buffer.isBuffer(bytes) && bytes.length > 0 &&
    bytes.length <= 8 * 1024 * 1024, 'Invalid bounded archive bytes');
  assert.ok(version === 'v4' || version === 'v5');
  assert.equal(typeof sidecar, 'string');
  const filename = 'issue25-steward-' + version + '.json';
  const digest = sha256(bytes);
  const checksumPass = sidecar === digest + '  ' + filename + '\n';
  if (!checksumPass) return {
    version: VERSION, cohort: version, checksumPass: false,
    integrity: 'FAIL-checksum', failures: ['detached-checksum-mismatch'],
    competitiveGamesQualified: 0
  };

  const data = JSON.parse(bytes.toString('utf8'));
  const failures = [];
  const warnings = [];
  const expectedPolicy = version === 'v4'
    ? 'simulation/evaluation/agent36-issue25-steward-selected-v4.cjs'
    : 'simulation/evaluation/agent36-issue25-steward-innermost-prize-v5.cjs';
  if (data.schema !== 'agent1-issue25-joined-v4-public-execution-receipt-v1')
    failures.push('unexpected-receipt-schema');
  const manifest = data.actuallyExecutingManifest ?? {};
  if (manifest.policyEntryPoint !== expectedPolicy)
    failures.push('wrong-selected-policy-entry-point');
  if (manifest.nativeRootActionLimit !== 48)
    failures.push('unexpected-historical-root-cap');
  if (manifest.releaseQualified !== false ||
      manifest.competitiveGamesQualified !== 0 ||
      data.qualifiedCompetitiveGames !== 0 ||
      data.developmentGate?.competitiveGameQualified !== false)
    failures.push('unexpected-competitive-promotion');

  const registered = data.registration?.expectedIds;
  const returned = data.registration?.returnedIds;
  const attempts = data.attempts;
  assert.ok(Array.isArray(registered) && Array.isArray(returned) &&
    Array.isArray(attempts), 'Missing actual receipt row arrays');
  const expected = [...EXPECTED].sort();
  const matches = ids => ids.length === expected.length &&
    new Set(ids).size === ids.length &&
    ids.every(x => typeof x === 'string') &&
    JSON.stringify([...ids].sort()) === JSON.stringify(expected);
  if (!matches(registered)) failures.push('wrong-registered-original-eight');
  if (!matches(returned)) failures.push('missing-or-duplicate-returned-ids');
  if (!matches(attempts.map(x => x.id)))
    failures.push('missing-or-duplicate-actual-attempts');
  if (data.registration?.exactJoinedByTrialId !== true)
    failures.push('unreconciled-raw-row-identity');

  let sourcePasses = 0;
  let sourceAttacks = 0;
  let sourceNonPromptNonPass = 0;
  let nativePromptRoots = 0;
  let missingLedgers = 0;
  let engineDigestUnverified = 0;
  const rows = [];
  for (const row of attempts) {
    const id = row?.id ?? null;
    const slot = /^(\d+):(\d+):([AB]):/.exec(id ?? '');
    if (!slot) {
      failures.push('invalid-attempt-id');
      continue;
    }
    const sourceSeat = slot[3] === 'A' ? 1 : 0;
    const nativeSourceSeat = row.originalSourceSeat ?? row.sourceSeat ?? null;
    if (nativeSourceSeat !== null && nativeSourceSeat !== sourceSeat)
      failures.push(id + ':source-seat-mismatch');
    if (row.actualRawTrialId !== id)
      failures.push(id + ':raw-trial-id-mismatch');
    const roots = row.publicRootActions;
    if (!Array.isArray(roots) || row.publicRootActionsTruncated !== false) {
      missingLedgers++;
      failures.push(id + ':missing-or-truncated-public-ledger');
      rows.push({id, sourceSeat, rootCount: null, sourcePasses: null,
        sourceAttackRoots: null, sourceNonPromptNonPass: null,
        disposition: row.status ?? null, dispositionQualified: false});
      continue;
    }
    if (row.publicRootActionCount !== roots.length)
      failures.push(id + ':root-count-mismatch');
    const reported = row.publicRootLedgerSha256Reported ?? null;
    const computed = sha256(Buffer.from(JSON.stringify(roots)));
    if (row.publicRootLedgerSha256Computed !== computed)
      failures.push(id + ':archived-computed-ledger-hash-mismatch');
    if (reported !== null && reported !== computed)
      failures.push(id + ':engine-reported-ledger-hash-mismatch');
    if (reported === null) engineDigestUnverified++;
    if (!roots.every((r, i) => Number.isSafeInteger(r.actionOrdinal) &&
      r.actionOrdinal === i && [0, 1].includes(r.playerSlot) &&
      Number.isSafeInteger(r.turnBefore)))
      failures.push(id + ':invalid-root-order-or-seat');
    if (roots.length > 48)
      failures.push(id + ':root-cap-exceeded');
    const pass = roots.filter(r => r.playerSlot === sourceSeat &&
      r.action === 'PassTurnAction').length;
    const attack = roots.filter(r => r.playerSlot === sourceSeat &&
      r.action === 'AttackAction').length;
    const nonPrompt = roots.filter(r => r.playerSlot === sourceSeat &&
      !['ResolvePromptAction','PassTurnAction'].includes(r.action)).length;
    sourcePasses += pass;
    sourceAttacks += attack;
    sourceNonPromptNonPass += nonPrompt;
    nativePromptRoots += roots.filter(r =>
      r.action === 'ResolvePromptAction').length;
    rows.push({id, sourceSeat, rootCount: roots.length, sourcePasses: pass,
      sourceAttackRoots: attack, sourceNonPromptNonPass: nonPrompt,
      disposition: row.status ?? null, dispositionQualified: false});
  }
  if (engineDigestUnverified)
    warnings.push(engineDigestUnverified + ' rows lack an engine-reported root digest');
  const integral = failures.length === 0;
  return {
    version: VERSION, cohort: version, checksumPass: true, digest,
    integrity: integral ? 'PASS-bounded-file-and-root-custody' : 'FAIL-custody',
    failures, warnings, registeredAttempts: registered.length,
    returnedAttempts: attempts.length, missingLedgers, engineDigestUnverified,
    sourcePassRoots: sourcePasses, sourceAttackRoots: sourceAttacks,
    sourceNonPromptNonPassRoots: sourceNonPromptNonPass,
    bothSeatPromptRoots: nativePromptRoots, attempts: rows,
    ownerVisiblePassOpportunityProven: false,
    paperPaymentCertified: false, opponentCompetenceCertified: false,
    officialPaperClockCertified: false, competitiveGamesQualified: 0,
    interpretation: 'Post-Store native roots only. Passes are an observation denominator; legal alternatives, source payoff, and opponent reply require separate physical evidence.'
  };
}


/**
 * Compare two historical variants of the same immutable registered eight,
 * independent of runner-produced matched-deal claims. Only physical pre-game
 * deal equality and native *accepted-root* prefix equality are certified.
 * Different contender 60s can legitimately yield distinct physical openings.
 *
 * @param {Buffer} v4Bytes
 * @param {string} v4Sidecar
 * @param {Buffer} v5Bytes
 * @param {string} v5Sidecar
 * @returns {object} Bounded, failure-inclusive controlled-pair audit.
 */
function compareStewardV4V5(v4Bytes, v4Sidecar, v5Bytes, v5Sidecar) {
  const before = inspect(v4Bytes, v4Sidecar, 'v4');
  const after = inspect(v5Bytes, v5Sidecar, 'v5');
  const failures = [];
  if (before.integrity !== 'PASS-bounded-file-and-root-custody')
    failures.push('v4-independent-custody-not-passed');
  if (after.integrity !== 'PASS-bounded-file-and-root-custody')
    failures.push('v5-independent-custody-not-passed');
  if (failures.length) return {
    version: VERSION + '-controlled-pair-v1',
    status: 'FAIL', failures, competitiveGamesQualified: 0
  };
  const original = JSON.parse(v4Bytes.toString('utf8'));
  const treatment = JSON.parse(v5Bytes.toString('utf8'));
  const byId = new Map(treatment.attempts.map(row => [row.id, row]));
  let matchedInitialSources = 0;
  let matchedInitialWholeDeals = 0;
  let exactRootPrefixes = 0;
  let rescuedNativeErrors = 0;
  let newNativeErrors = 0;
  const attempts = [];
  for (const a of original.attempts) {
    const b = byId.get(a.id);
    assert.ok(b, 'Already verified eight original IDs must match');
    const sourceMatched = typeof a.sourceDealFingerprint === 'string' &&
      /^[0-9a-f]{64}$/.test(a.sourceDealFingerprint) &&
      a.sourceDealFingerprint === b.sourceDealFingerprint;
    const wholeMatched = typeof a.fullPhysicalDealFingerprint === 'string' &&
      /^[0-9a-f]{64}$/.test(a.fullPhysicalDealFingerprint) &&
      a.fullPhysicalDealFingerprint === b.fullPhysicalDealFingerprint;
    if (sourceMatched) matchedInitialSources++;
    else failures.push(a.id + ':source-initial-deal-mismatch-or-absent');
    if (wholeMatched) matchedInitialWholeDeals++;
    else failures.push(a.id + ':whole-initial-deal-mismatch-or-absent');
    const firstPlayerMatch = a.actualFirstPlayer === null ||
      b.actualFirstPlayer === null ||
      a.actualFirstPlayer === b.actualFirstPlayer;
    if (!firstPlayerMatch)
      failures.push(a.id + ':actual-starter-seat-mismatch');
    const prefixMatches = b.publicRootActions.length >=
      a.publicRootActions.length &&
      JSON.stringify(b.publicRootActions.slice(0, a.publicRootActions.length)) ===
        JSON.stringify(a.publicRootActions);
    if (prefixMatches) exactRootPrefixes++;
    else failures.push(a.id + ':accepted-native-prefix-diverged');
    const rescued = a.status === 'engine-error' &&
      b.status !== 'engine-error';
    const regressed = a.status !== 'engine-error' &&
      b.status === 'engine-error';
    if (rescued) rescuedNativeErrors++;
    if (regressed) {
      newNativeErrors++;
      failures.push(a.id + ':new-native-error-under-v5');
    }
    attempts.push({
      id: a.id, originalRoots: a.publicRootActions.length,
      treatmentRoots: b.publicRootActions.length,
      initialSourceDealMatched: sourceMatched,
      initialWholeDealMatched: wholeMatched,
      actualFirstPlayerConsistent: firstPlayerMatch,
      originalAcceptedRootsPreserved: prefixMatches,
      v4Status: a.status, v5Status: b.status,
      rescuedNativeError: rescued
    });
  }
  return {
    version: VERSION + '-controlled-pair-v1',
    status: failures.length ? 'FAIL' : 'PASS-bounded-controlled-prefix',
    failures, originalArchiveSha256: before.digest,
    treatmentArchiveSha256: after.digest,
    registeredArms: attempts.length, matchedInitialSources,
    matchedInitialWholeDeals, exactRootPrefixes,
    rescuedNativeErrors, newNativeErrors, attempts,
    naturalCrossContenderOpeningEquivalenceNotAsserted: true,
    paperPaymentCertified: false, strategicBenefitCertified: false,
    competitiveGamesQualified: 0,
    interpretation: 'Only same-contender pre-game physical starts and actually accepted Store-prefix events are compared. Changed policy after an early abort creates additional censored observation, not an independently qualified game.'
  };
}

module.exports = {VERSION, EXPECTED, inspect, compareStewardV4V5};
