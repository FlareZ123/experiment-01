'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

/**
 * Build the deliberately narrow, publicly reconstructable root-action tuple.
 * A matching tuple does not prove that all prompt responses, effects, hidden
 * game state, or bot choices were equal. The full archive must be retained.
 *
 * @param {object} root A genuine Store root ledger event.
 * @returns {object} Public action and physical actor attribution.
 */
function actionTuple(root) {
  return {
    actionOrdinal: root.actionOrdinal,
    turnBefore: root.turnBefore,
    turnAfter: root.turnAfter,
    playerSlot: root.playerSlot,
    action: root.action,
    pendingPrompt: root.pendingPrompt ?? null,
    initiatingRootActionOrdinal: root.initiatingRootActionOrdinal ?? null,
    card: root.card ?? null,
    attack: root.attack ?? null,
    ability: root.ability ?? null
  };
}

/**
 * A chronology check scoped to each native episode. Sudden-death restart
 * boundaries remain observations and may not qualify paper gameplay.
 *
 * @param {object} row Canonical archive row, including failed rows.
 * @returns {object} Root ledger, reset count, and native episode metadata.
 */
function archivedGame(row) {
  const ledger = row.rootActionLedger;
  assert.ok(Array.isArray(ledger), 'Missing full successful native root ledger');
  assert.equal(row.rootActionLedgerProtocol, 'actual-store-root-action-ledger-v1');
  ledger.forEach((root, i) => assert.equal(root.actionOrdinal, i,
    'Native root ordinals must remain contiguous even after a restart'));
  const episodes = row.sourceDealEpochs?.deals;
  assert.ok(Array.isArray(episodes) && episodes.length > 0,
    'Missing native first-episode physical deal evidence');
  const first = episodes[0];
  assert.equal(first.episodeIndex, 0);
  assert.equal(typeof first.fullPhysicalDealDigestSha256, 'string');
  assert.equal(typeof first.sourceDealDigestSha256, 'string');
  assert.equal(first.initialPrizeCounts.length, 2);
  const resets = row.suddenDeathClockResets ?? [];
  assert.ok(Array.isArray(resets));
  assert.equal(episodes.length, resets.length + 1,
    'An unaccounted additional physical deal or tiebreak reset exists');
  return {ledger, episodes, resets, first};
}

/**
 * Find the first root tuple that differs, including unequal ledger lengths.
 * Do not extrapolate beyond a tiebreak boundary or interpret a shared
 * public-action tuple as complete engine-state equality.
 *
 * @param {object[]} left A registered native root ledger.
 * @param {object[]} right A registered native root ledger.
 * @returns {{commonPrefixRoots:number,firstDifferentRoot:object|null,
 *            samePublicRootTuples:boolean}}
 */
function firstRootDifference(left, right) {
  let commonPrefixRoots = 0;
  const shortest = Math.min(left.length, right.length);
  while (commonPrefixRoots < shortest &&
    JSON.stringify(actionTuple(left[commonPrefixRoots])) ===
      JSON.stringify(actionTuple(right[commonPrefixRoots]))) {
    commonPrefixRoots++;
  }
  const firstDifferentRoot = commonPrefixRoots === left.length &&
    commonPrefixRoots === right.length ? null : {
    ordinal: commonPrefixRoots,
    left: left[commonPrefixRoots] ? actionTuple(left[commonPrefixRoots]) : null,
    right: right[commonPrefixRoots] ? actionTuple(right[commonPrefixRoots]) : null
  };
  return {commonPrefixRoots, firstDifferentRoot,
    samePublicRootTuples: firstDifferentRoot === null};
}

/**
 * Pair two historical same-registered-trial panels with a deliberate policy
 * difference. This is an audit, never a win-rate or full policy certification.
 *
 * @param {object} left Archived off/reference panel.
 * @param {object} right Archived on/treatment panel.
 * @returns {object} Per-trial first-divergence, independent of terminal status.
 */
function comparePanels(left, right) {
  assert.equal(left.schema, right.schema, 'Different panel schema');
  assert.equal(left.enginePin, right.enginePin, 'Different native engine pin');
  assert.equal(left.attempted, right.attempted,
    'Different attempted-trial denominator');
  assert.ok(Array.isArray(left.rows) && Array.isArray(right.rows));
  assert.equal(left.rows.length, left.attempted);
  assert.equal(right.rows.length, right.attempted);
  const byId = rows => {
    const map = new Map();
    for (const row of rows) {
      const id = row?.trial?.id;
      assert.equal(typeof id, 'string');
      assert.ok(!map.has(id), 'Duplicate registered trial: ' + id);
      map.set(id, row);
    }
    return map;
  };
  const a = byId(left.rows), b = byId(right.rows);
  assert.deepEqual([...a.keys()].sort(), [...b.keys()].sort(),
    'Both policies must attempt exactly the same registered trials');
  const rows = [...a].map(([trialId, off]) => {
    const on = b.get(trialId);
    const offGame = archivedGame(off), onGame = archivedGame(on);
    const physical = offGame.first.fullPhysicalDealDigestSha256;
    assert.equal(physical, onGame.first.fullPhysicalDealDigestSha256,
      'First-episode physical deal mismatch: ' + trialId);
    assert.equal(offGame.first.sourceDealDigestSha256,
      onGame.first.sourceDealDigestSha256,
      'First-episode source deal mismatch: ' + trialId);
    const diff = firstRootDifference(offGame.ledger, onGame.ledger);
    return {
      trialId, rank: off.trial.rank,
      fullPhysicalFirstEpisodeMatched: true,
      firstEpisodeFullDealSha256: physical,
      firstEpisodeSourceDealSha256: offGame.first.sourceDealDigestSha256,
      ...diff,
      fullRootLedgerSha256Equal:
        off.rootActionLedgerSha256 === on.rootActionLedgerSha256,
      reference: {
        status: off.status ?? 'recorded',
        error: off.error ?? null,
        rootCount: offGame.ledger.length,
        nativeEpisodes: offGame.episodes.length,
        nativeClockResets: offGame.resets.length,
        engineWinner: off.winner ?? null,
        attackDeclarations: off.attackDeclarations ?? null
      },
      treatment: {
        status: on.status ?? 'recorded',
        error: on.error ?? null,
        rootCount: onGame.ledger.length,
        nativeEpisodes: onGame.episodes.length,
        nativeClockResets: onGame.resets.length,
        engineWinner: on.winner ?? null,
        attackDeclarations: on.attackDeclarations ?? null
      },
      competitiveQualified: false,
      warning: 'Identical public root tuples and physical opening do not certify hidden-state, prompt-selection, damage-effect, opponent-policy, clock, or paper rules'
    };
  });
  return {
    schema: 'aichi-actual-store-same-deal-actor-policy-difference-v1',
    enginePin: left.enginePin, attempted: rows.length,
    sourceAndFullPhysicalFirstEpisodesMatched: true,
    competitivelyQualifiedGames: 0,
    pairs: rows
  };
}

if (require.main === module) {
  assert.equal(process.argv.length, 4,
    'Supply reference and treatment canonical JSON archive paths');
  const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
  process.stdout.write(JSON.stringify(comparePanels(
    read(process.argv[2]), read(process.argv[3])), null, 2) + '\n');
}

module.exports = {actionTuple, archivedGame, firstRootDifference, comparePanels};
