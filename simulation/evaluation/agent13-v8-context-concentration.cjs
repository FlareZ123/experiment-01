"use strict";

const assert = require('node:assert/strict');

const VERSION = 'agent13-v8-context-concentration-v1';
const INPUT = 'agent36-prospective-v8-original-field-native-census-v1';

/**
 * Summarize independently root-hash-verified v8 source contexts. Attack roots
 * are repeated observations within a game, never independent game samples.
 * Missing Store attack traces after an abort remain unknown rather than zero.
 *
 * @param {object} census Verified output of agent36-v8-original-field-archive-audit.inspect.
 * @returns {object} A coverage census, never a win-rate estimate.
 */
function summarizeContextCoverage(census) {
  assert.equal(census?.schema, INPUT);
  assert.equal(census.allNativeRootLedgersDigestVerified, true);
  assert.ok(Array.isArray(census.rows));
  assert.equal(census.rows.length, census.actualAttempts);
  assert.equal(census.rows.length, census.registeredAttempts);
  assert.equal(census.competitiveGameQualifiedCount, 0);

  const seen = new Set();
  const rows = census.rows.map(row => {
    assert.ok(typeof row.id === 'string' && !seen.has(row.id));
    seen.add(row.id);
    assert.ok(Number.isInteger(row.rank) && row.rank >= 1 && row.rank <= 32);
    assert.ok(row.sourceSeat === 0 || row.sourceSeat === 1);
    assert.equal(row.publicRootHashPass, true);
    assert.equal(row.actualSourceSeatAuthenticated, true);
    assert.equal(typeof row.candidateSeatAuthenticated, 'boolean');
    assert.equal(row.competitiveGameQualified, false);
    const declarations = row.sourceStoreAttackDeclarations;
    const settlements = row.actualAttackSettlements;
    assert.equal(declarations === null, settlements === null);
    if (settlements !== null)
      assert.equal(row.candidateSeatAuthenticated, true,
        'Known source-attack settlement requires authenticated opponent seat');

    if (settlements === null) {
      assert.equal(row.settledSourceAttackCount, null);
      return {
        id: row.id, rank: row.rank, candidateId: row.candidateId,
        sourceSeat: row.sourceSeat, disposition: row.nativeDisposition,
        candidateSeatAuthenticated: row.candidateSeatAuthenticated,
        acceptedRoots: row.acceptedRoots,
        sourceDealFingerprint: row.sourceOpeningFingerprint ?? null,
        attackTraceStatus: 'unknown-after-unclosed-native-trace',
        attackDeclarations: null, settledAttacks: null,
        sameEpochOpponentRootCount: null,
        immediateOpponentActionCounts: null,
        sourcePrizeTakingAttacks: null, sourcePrizesTaken: null,
        independentGameSamples: 0,
        opponentDecisionQualityCertified: false,
        paperQualified: false
      };
    }

    assert.ok(Array.isArray(declarations) && Array.isArray(settlements));
    assert.equal(declarations.length, settlements.length);
    assert.equal(row.settledSourceAttackCount,
      settlements.filter(x => x.publicSettlement === true).length);
    let sourcePrizesTaken = 0;
    let prizeTakingAttacks = 0;
    let sameEpochOpponentRootCount = 0;
    const immediateOpponentActions = new Map();
    for (let i = 0; i < settlements.length; i++) {
      const x = settlements[i];
      assert.equal(x.ordinal, declarations[i].originatingActionOrdinal);
      assert.equal(x.attack, declarations[i].attack);
      assert.equal(x.publicSettlement,
        declarations[i].settledPromptChain === true);
      if (!x.publicSettlement) continue;
      if (x.nextOpponentSameEpochCertified === true) {
        const reply = x.nextOpponentRoot;
        assert.ok(Number.isSafeInteger(reply?.ordinal) &&
          Number.isSafeInteger(reply?.turn) &&
          typeof reply?.action === 'string' && reply.action.length > 0,
        'Native opponent action requires its ordinal, turn and action');
        sameEpochOpponentRootCount++;
        immediateOpponentActions.set(reply.action,
          (immediateOpponentActions.get(reply.action) ?? 0) + 1);
      }
      const before = x.prizeBefore?.[row.sourceSeat];
      const after = x.prizeAfter?.[row.sourceSeat];
      assert.ok(Number.isInteger(before) && Number.isInteger(after) &&
        before >= 0 && before <= 6 && after >= 0 && after <= before,
      'Settled source Prize transition must be a verified 0..6 decrease');
      const taken = before - after;
      sourcePrizesTaken += taken;
      if (taken > 0) prizeTakingAttacks++;
    }
    return {
      id: row.id, rank: row.rank, candidateId: row.candidateId,
      sourceSeat: row.sourceSeat, disposition: row.nativeDisposition,
      acceptedRoots: row.acceptedRoots,
      sourceDealFingerprint: row.sourceOpeningFingerprint ?? null,
      attackTraceStatus: 'observed-root-joined-store-trace',
      attackDeclarations: declarations.length,
      settledAttacks: row.settledSourceAttackCount,
      sameEpochOpponentRootCount,
      immediateOpponentActionCounts: Object.fromEntries(immediateOpponentActions),
      sourcePrizeTakingAttacks: prizeTakingAttacks,
      sourcePrizesTaken, independentGameSamples: 0,
      opponentDecisionQualityCertified: false,
      paperQualified: false
    };
  });

  const known = rows.filter(x => x.attackTraceStatus ===
    'observed-root-joined-store-trace');
  const attackContexts = known.filter(x => x.settledAttacks > 0);
  const observedPrizeContexts = known.filter(x => x.sourcePrizesTaken > 0);
  const sum = key => known.reduce((n, x) => n + x[key], 0);
  const attackConcentration = attackContexts.map(x => ({
    id: x.id, settledAttacks: x.settledAttacks
  })).sort((a, b) => b.settledAttacks - a.settledAttacks);
  const totalSettled = sum('settledAttacks');
  const immediateOpponentActionCounts = new Map();
  for (const context of known) {
    for (const [action, count] of Object.entries(
      context.immediateOpponentActionCounts)) {
      immediateOpponentActionCounts.set(action,
        (immediateOpponentActionCounts.get(action) ?? 0) + count);
    }
  }
  const pairedSourceDeals = [];
  const bySource = new Map();
  for (const row of rows) {
    const parts = row.id.split(':');
    assert.equal(parts.length, 4);
    assert.equal(Number(parts[0]), row.rank);
    const group = parts.slice(0, 3).join(':');
    const list = bySource.get(group) ?? [];
    list.push(row);
    bySource.set(group, list);
  }
  for (const [group, list] of bySource) {
    if (list.length !== 2) continue;
    const [a, b] = list;
    pairedSourceDeals.push({
      group, candidateIds: [a.candidateId, b.candidateId],
      physicalSameSourceDeal: a.sourceDealFingerprint &&
        b.sourceDealFingerprint ?
        a.sourceDealFingerprint === b.sourceDealFingerprint : null
    });
  }
  pairedSourceDeals.sort((a, b) => a.group.localeCompare(b.group));
  return {
    schema: VERSION, sourceCensusSchema: INPUT,
    originalNativeAttempts: rows.length,
    sourceAttackTraceKnownContexts: known.length,
    sourceAttackTraceUnknownContexts: rows.length - known.length,
    observedSettledAttackContexts: attackContexts.length,
    observedPrizeTakingContexts: observedPrizeContexts.length,
    totalKnownSourceDeclarations: sum('attackDeclarations'),
    totalKnownSourceSettlements: totalSettled,
    totalKnownSameEpochOpponentRoots: sum('sameEpochOpponentRootCount'),
    immediateOpponentActionCounts: Object.fromEntries(
      [...immediateOpponentActionCounts].sort((a,b)=>a[0].localeCompare(b[0]))),
    totalObservedSourcePrizeTakingAttacks: sum('sourcePrizeTakingAttacks'),
    totalObservedSourcePrizesTaken: sum('sourcePrizesTaken'),
    attackConcentration,
    highestSingleContextShare: totalSettled > 0 ?
      attackConcentration[0].settledAttacks / totalSettled : null,
    pairedSourceDeals,
    rows, competitivelyQualifiedGames: 0, estimatedWinRate: null,
    interpretation: 'Repeated source attacks are correlated within one game. Opponent root existence is not proof of a competent response. Aborted traces are unknown. This module cannot certify games.'
  };
}

module.exports = {VERSION, summarizeContextCoverage};
