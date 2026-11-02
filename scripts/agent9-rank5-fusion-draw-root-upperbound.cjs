'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const VERSION = 'agent9-original-rank5-genesect-upperbound-v1';
const MODES = Object.freeze({
  v31: Object.freeze(['frozenV2Control', 'integratedV3']),
  fusionMobility: Object.freeze(['integratedV3Control',
    'integratedV3FusionMobility'])
});

/**
 * Native count-only upper bound: even if all occupied board Pokémon have the
 * Fusion Strike tag, at most one Active plus occupied Bench slots count.
 * This assumption overestimates eligible Pokémon and thus fails closed when
 * certifying a zero-card draw. No identities of deck, hand or Prize cards enter.
 * @param {object} root Actual native Store accepted actor-root record.
 * @param {0|1} sourceSeat Actual physical owner seat for source rank 5.
 * @returns {{handCount:number,maxFusionCount:number,drawUpperBound:number,margin:number}}
 */
function upperBoundAtSourceRoot(root, sourceSeat) {
  assert.equal(root?.seat, sourceSeat);
  assert.equal(root?.accepted, true);
  const before = root.before;
  assert.ok(before && before.activePrintings?.[sourceSeat],
    'Source root requires physically observed Active Pokémon');
  const handCount = before.handCounts?.[sourceSeat];
  const benchCount = before.benchCounts?.[sourceSeat];
  assert.ok(Number.isSafeInteger(handCount) && handCount >= 0);
  assert.ok(Number.isSafeInteger(benchCount) &&
    benchCount >= 0 && benchCount <= 8);
  const maxFusionCount = 1 + benchCount;
  return {
    handCount,
    maxFusionCount,
    drawUpperBound: Math.max(0, maxFusionCount - handCount),
    margin: handCount - maxFusionCount
  };
}

/**
 * Evaluate actual native accepted source actor-root decision snapshots from
 * an immutable rank-5 archive. Root acceptance and public count snapshots
 * remain distinct from complete turn coverage or a printed-legal play.
 * @param {object} archive Genuine JSON from the original rank-5 runner.
 * @param {'v31'|'fusionMobility'} family Known preregistered experiment.
 * @returns {object} Censored, causal-neutral root availability audit.
 */
function auditRank5FusionDrawUpperBound(archive, family) {
  assert.ok(Object.hasOwn(MODES, family));
  const modeNames = MODES[family];
  const expected = family === 'v31' ? 16 : 8;
  assert.equal(family === 'v31' ? archive?.attempted :
    archive?.requestedNativeAttempts, expected);
  const result = {version: VERSION, family,
    archivedNativeAttempts: expected, totalSourceActorRoots: 0,
    sourceRootsWithPotentialPositiveFusionDraw: 0,
    minHandOverMaxFusionMargin: null, modes: {},
    competitiveQualifiedGames: 0,
    scope: 'Accepted native actor-owned root decisions only; full player-turn, ' +
      'opponent decision and paper-clock competence unverified'};
  for (const name of modeNames) {
    const attempts = archive.modes?.[name]?.attempts;
    assert.ok(Array.isArray(attempts) && attempts.length === expected / 2,
      'Mode must retain every registered arm and both fixed candidates');
    const ids = new Set();
    const mode = {attempts: attempts.length, roots: 0,
      possiblePositiveDrawRoots: 0, minMargin: null, perArm: []};
    for (const attempt of attempts) {
      const id = attempt.trial?.id;
      assert.ok(typeof id === 'string' && !ids.has(id));
      ids.add(id);
      assert.equal(attempt.trial?.rank, 5);
      const row = attempt.rawNativeRow;
      assert.ok([0, 1].includes(row?.sourceSeat));
      assert.ok(Array.isArray(row.rootActionLedger));
      assert.equal(row.rootActionCount, row.rootActionLedger.length);
      assert.equal(row.actionCount, row.rootActionLedger.length);
      const roots = row.actorOnlyDecisionCoverage?.
        detailedComponentAudits?.root?.nativeRootAcceptances;
      assert.ok(Array.isArray(roots),
        'Require native Store source-root acceptances with physical counts');
      const sourceRoots = roots.filter(r => r.seat === row.sourceSeat);
      assert.ok(sourceRoots.length > 0);
      let possible = 0;
      let minMargin = Infinity;
      let minHand = Infinity;
      let maxBoard = 0;
      for (const root of sourceRoots) {
        const bound = upperBoundAtSourceRoot(root, row.sourceSeat);
        if (bound.drawUpperBound > 0) possible++;
        minMargin = Math.min(minMargin, bound.margin);
        minHand = Math.min(minHand, bound.handCount);
        maxBoard = Math.max(maxBoard, bound.maxFusionCount);
      }
      mode.roots += sourceRoots.length;
      mode.possiblePositiveDrawRoots += possible;
      mode.minMargin = mode.minMargin === null ?
        minMargin : Math.min(mode.minMargin, minMargin);
      mode.perArm.push({trialId: id, originalSourceSeat: row.sourceSeat,
        observedNativeSourceActorRoots: sourceRoots.length,
        possiblePositiveDrawRoots: possible,
        minObservedOwnerHand: minHand,
        maxBoardPokemonUpperBound: maxBoard,
        minHandOverMaxFusionMargin: minMargin,
        outcomeQualified: false});
    }
    result.totalSourceActorRoots += mode.roots;
    result.sourceRootsWithPotentialPositiveFusionDraw +=
      mode.possiblePositiveDrawRoots;
    result.minHandOverMaxFusionMargin =
      result.minHandOverMaxFusionMargin === null ? mode.minMargin :
        Math.min(result.minHandOverMaxFusionMargin, mode.minMargin);
    result.modes[name] = mode;
  }
  return result;
}

if (require.main === module) {
  assert.equal(process.argv.length, 4,
    'Provide the two archived original rank-5 JSON files in v3.1/fusion-mobility order');
  const [v31, mobility] = process.argv.slice(2).map(f =>
    JSON.parse(fs.readFileSync(f, 'utf8')));
  const audits = [auditRank5FusionDrawUpperBound(v31, 'v31'),
    auditRank5FusionDrawUpperBound(mobility, 'fusionMobility')];
  process.stdout.write(JSON.stringify({audits,
    totalObservedSourceActorRoots: audits.reduce((n, a) =>
      n + a.totalSourceActorRoots, 0),
    possibleDrawRoots: audits.reduce((n, a) =>
      n + a.sourceRootsWithPotentialPositiveFusionDraw, 0),
    competitiveQualifiedGames: 0}, null, 2) + '\n');
}

module.exports = {VERSION, MODES, upperBoundAtSourceRoot,
  auditRank5FusionDrawUpperBound};
