'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent49-native-print-release-gate-v1';
const EXACT = new Set(['exact', 'exact-alias']);

/**
 * Independently join published 60-card printings, actual pinned CardManager
 * coverage, and the native deck resolver. This audits *identifiers*, never
 * whether a card's attack, Ability or Trainer effect works on paper.
 * @param {object} manifest Unmodified source full-decklists.json.
 * @param {object} coverage Actual card-coverage.reportCoverage(manifest) result.
 * @param {object} plan Actual planAichi result.
 * @returns {object} One row for each final placement, including missing 60s.
 */
function auditSourcePrintings(manifest, coverage, plan) {
  assert.ok(Array.isArray(manifest?.decks));
  assert.ok(Array.isArray(coverage?.decks));
  assert.ok(Array.isArray(plan?.opponents));
  const source = new Map(manifest.decks.map(d => [d.rank, d]));
  const native = new Map(coverage.decks.map(d => [d.rank, d]));
  const resolved = new Map(plan.opponents.map(d => [d.rank, d]));
  assert.equal(source.size, manifest.decks.length);
  assert.equal(native.size, coverage.decks.length);
  assert.equal(resolved.size, plan.opponents.length);
  assert.equal(plan.opponents.length, 32);
  const ranks = [];
  for (let rank = 1; rank <= 32; rank++) {
    const original = source.get(rank);
    if (!original) {
      assert.equal(resolved.get(rank)?.status, 'missing-published-list');
      ranks.push({rank, status: 'MISSING_ORIGINAL_60', printings: []});
      continue;
    }
    const cov = native.get(rank), engine = resolved.get(rank);
    assert.ok(cov && engine, 'Missing native coverage at rank ' + rank);
    assert.equal(cov.rows.length, original.cards.length);
    const printings = original.cards.map((card, index) => {
      const row = cov.rows[index];
      assert.equal(row.name, card.name);
      assert.equal(row.count, card.count);
      assert.equal(String(row.requested?.set).toUpperCase(),
        String(card.printing?.set).toUpperCase());
      assert.equal(String(row.requested?.number), String(card.printing?.number));
      const exact = EXACT.has(row.status) && row.exact.length === 1;
      return {
        name: card.name, count: card.count, requested: {...card.printing},
        nativeId: exact ? row.exact[0].fullName : null,
        nativeIdStatus: exact ? (row.status === 'exact' ?
          'EXACT_PRINT_LOADED' : 'EXACT_GLYPH_ALIAS_LOADED') :
          'UNSUPPORTED_OR_AMBIGUOUS_PRINT',
        implementationSignals: exact ? [...row.exact[0].signals] : [],
        effectStatus: 'PAPER_EQUIVALENCE_UNVERIFIED'
      };
    });
    const total = original.cards.reduce((n, card) => n + card.count, 0);
    assert.equal(total, 60);
    const substitutions = engine.substitutions ?? [];
    const exactIds = printings.every(p =>
      p.nativeIdStatus === 'EXACT_PRINT_LOADED' ||
      p.nativeIdStatus === 'EXACT_GLYPH_ALIAS_LOADED');
    const clean = exactIds && engine.status === 'ready' &&
      Array.isArray(engine.cards) && engine.cards.length === 60 &&
      substitutions.length === 0;
    ranks.push({rank, player: original.player,
      status: clean ? 'EXACT_NATIVE_IDS_READY' :
        'NATIVE_PRINT_OR_DECK_RESOLUTION_BLOCKED',
      sourceCardCount: total,
      engineStatus: engine.status,
      nativeSubstitutions: substitutions,
      printings});
  }
  const missingRanks = ranks.filter(r => r.status === 'MISSING_ORIGINAL_60')
    .map(r => r.rank);
  return {version: VERSION, ranks, missingRanks,
    sourceLists: 32 - missingRanks.length,
    exactNativeIdRanks: ranks.filter(r => r.status ===
      'EXACT_NATIVE_IDS_READY').length,
    completeOriginalField: missingRanks.length === 0,
    completeExactNativeIds: ranks.every(r => r.status ===
      'EXACT_NATIVE_IDS_READY'),
    semanticEffectsCertified: false};
}

/**
 * An explicit required-fixture contract. A passing CI job does not imply
 * executed tests; a loaded printed identifier does not prove a settled effect.
 * Witness flags are claimant-supplied and require separate artifact review.
 * @param {object[]} rows Machine-readable fixture outcome receipts.
 * @param {string[]} requiredIds Frozen exact native fixture identifiers.
 * @returns {object}
 */
function auditRequiredFixtures(rows, requiredIds) {
  assert.ok(Array.isArray(rows) && Array.isArray(requiredIds));
  const map = new Map();
  for (const row of rows) {
    assert.ok(typeof row.id === 'string' && row.id.length > 0);
    assert.ok(!map.has(row.id), 'Duplicate fixture ' + row.id);
    assert.ok(['passed', 'failed', 'skipped'].includes(row.testStatus));
    map.set(row.id, row);
  }
  assert.equal(new Set(requiredIds).size, requiredIds.length);
  const required = requiredIds.map(id => {
    const row = map.get(id);
    if (!row) return {id, status:'REQUIRED_TEST_MISSING', qualified:false};
    if (row.testStatus === 'skipped') return {
      id, status:'TEST_SKIPPED_UNSUPPORTED_PRINT', qualified:false};
    if (row.testStatus === 'failed') return {
      id, status:'TEST_FAILED', qualified:false};
    if (row.nativeAccepted !== true || row.effectSettled !== true) return {
      id, status:'NATIVE_EFFECT_NOT_SETTLED', qualified:false};
    if (row.laterOwnerRoot !== true || row.opponentContinued !== true) return {
      id, status:'NO_BILATERAL_FOLLOWTHROUGH', qualified:false};
    if (row.paperEquivalent !== true ||
        typeof row.evidenceArtifact !== 'string' || !row.evidenceArtifact) return {
      id, status:'PAPER_EQUIVALENCE_UNVERIFIED', qualified:false};
    return {id,status:'REQUIRED_NATIVE_WITNESS_COMPLETE',qualified:true,
      evidenceArtifact:row.evidenceArtifact};
  });
  return {version:VERSION, required,
    requiredCount:requiredIds.length,
    completedCount:required.filter(r => r.qualified).length,
    passed:required.length > 0 && required.every(r => r.qualified)};
}

/**
 * Promotion remains fail-closed until every field source, candidate, release
 * fixture, frozen policy and actual paper clock is independently attested.
 * @param {object} packet
 * @returns {object}
 */
function evaluateRelease(packet) {
  const field = auditSourcePrintings(packet.manifest,
    packet.coverage, packet.plan);
  const fixtures = auditRequiredFixtures(packet.fixtures ?? [],
    packet.requiredFixtureIds ?? []);
  const candidate = packet.candidate ?? {};
  const candidateComplete = Array.isArray(candidate.exactNative60) &&
    candidate.exactNative60.length === 60 &&
    candidate.unchangedSourcePrintingAttested === true &&
    candidate.nativeSubstitutions?.length === 0;
  const blockers = [];
  if (!field.completeOriginalField) blockers.push('MISSING_ORIGINAL_SOURCE_LISTS');
  if (!field.completeExactNativeIds) blockers.push('INCOMPLETE_EXACT_NATIVE_PRINTS');
  if (!candidateComplete) blockers.push('CANDIDATE_PRINTING_UNVERIFIED');
  if (!fixtures.passed) blockers.push('REQUIRED_NATIVE_FIXTURES_NOT_QUALIFIED');
  if (packet.policy?.ownerInformationSafe !== true ||
      packet.policy?.identicalTwoSeatPolicy !== true ||
      packet.policy?.frozenVersion !== true)
    blockers.push('POLICY_NOT_QUALIFIED');
  if (packet.paperClockQualified !== true)
    blockers.push('PAPER_CLOCK_UNVERIFIED');
  return {version:VERSION, field, fixtures,
    candidateComplete, blockers,
    competitiveQualified: blockers.length === 0,
    caveat:'Flags and artifact references require independent native and paper review; identifier loading and CI success alone confer no game wins.'};
}

module.exports = {VERSION, auditSourcePrintings,
  auditRequiredFixtures, evaluateRelease};
