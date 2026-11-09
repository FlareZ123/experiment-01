'use strict';

const assert = require('node:assert/strict');
const {runNativeBatch, summarizeRow} =
  require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment} = require('../agent41-bilateral-v2-development.cjs');
const {firstRootDivergence} =
  require('../agent24-v8-perfection-paired-native.cjs');
const previous =
  require('./agent8-source-challenger-2x2-v2.cjs');
const {save} = require('./agent8-source-challenger-2x2.cjs');

const VERSION = 'agent2-retrospective-rank11-rank13-source-quickball-attack-priority-v2';
const REGISTRATION =
  'agent8-prospective-original-source-adversarial-2x2-v2';
const ROOT_LIMIT = 260;

/** @returns {object[]} Four already published rank-11/13 physical deals. */
function registered() {
  const rows = previous.registered().filter(row => [11, 13].includes(row.rank));
  assert.equal(rows.length, 4);
  for (const rank of [11, 13])
    assert.deepEqual(rows.filter(row => row.rank === rank)
      .map(row => row.candidateSlot).sort(), ['A', 'B']);
  assert.equal(new Set(rows.map(row => row.seed)).size, 4);
  return rows;
}

/**
 * Existing owner-only arbitration is applied to the actual source physical
 * seat by the canonical runner. No source or candidate 60 is edited.
 * @param {boolean} preservePayableAttack
 * @returns {object}
 */
function policyOptions(preservePayableAttack) {
  assert.equal(typeof preservePayableAttack, 'boolean');
  return {
    ...previous.options(true),
    sourceQuickBallPreservePayableAttack: preservePayableAttack
  };
}

/**
 * Reuse v2's full native common-policy stack. This is an explicitly
 * retrospective counterfactual to the rank-11 v2 Quick Ball displacement.
 * @param {boolean} preservePayableAttack
 * @param {Function} [runner]
 * @returns {object}
 */
function runArm(preservePayableAttack, runner = runDevelopment) {
  return runNativeBatch(true, options => runner({
    ...options,
    ...policyOptions(preservePayableAttack)
  }), {
    registeredTrials: registered(),
    registeredFrameName: REGISTRATION +
      (preservePayableAttack ? '-attack-first-replay' : '-search-first-replay'),
    nativeRootActionLimit: ROOT_LIMIT,
    vipAfterPass: true,
    vipPreferMewtwoDonor: true,
    perfectionTransition: false
  });
}

/**
 * Distinguish the first accepted source action from any candidate-side change.
 * Neither an opt-in flag nor an intended action counts as native activation.
 * @param {object} baseline Native summary.
 * @param {object} guarded Native summary from the same registered deal.
 * @returns {object}
 */
function comparePair(baseline, guarded) {
  assert.equal(baseline.id, guarded.id);
  assert.ok([11, 13].includes(baseline.rank));
  assert.equal(guarded.rank, baseline.rank);
  assert.equal(baseline.candidateSeat, guarded.candidateSeat);
  assert.equal(baseline.seed, guarded.seed);
  const candidateSeat = baseline.candidateSeat;
  const sourceSeat = 1 - candidateSeat;
  const equal = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  const physicallyMatched = baseline.fullPhysicalDealFingerprint != null &&
    baseline.sourceDealFingerprint != null &&
    guarded.fullPhysicalDealFingerprint != null &&
    guarded.sourceDealFingerprint != null &&
    equal(baseline.fullPhysicalDealFingerprint, guarded.fullPhysicalDealFingerprint) &&
    equal(baseline.sourceDealFingerprint, guarded.sourceDealFingerprint);
  const ledgersPresent = Array.isArray(baseline.rootActionLedger) &&
    Array.isArray(guarded.rootActionLedger);
  const firstDifference = ledgersPresent
    ? firstRootDivergence(baseline.rootActionLedger, guarded.rootActionLedger)
    : null;
  const changed = firstDifference?.ordinal != null;
  const sameSourceOwnerAtFirstChange = changed &&
    firstDifference.baseline?.playerSlot === sourceSeat &&
    firstDifference.treatment?.playerSlot === sourceSeat;
  const sourceAttackReplacesQuickBall = sameSourceOwnerAtFirstChange &&
    firstDifference.baseline.action === 'PlayCardAction' &&
    /^Quick Ball(?: |$)/.test(firstDifference.baseline.card ?? '') &&
    firstDifference.treatment.action === 'AttackAction';
  const status = !physicallyMatched || !ledgersPresent
    ? 'INVALID_DEAL_OR_MISSING_LEDGER'
    : !changed ? 'INACTIVE_PRIORITY'
    : !firstDifference.baseline || !firstDifference.treatment
      ? 'INCOMPLETE_ROOT_TAIL'
      : !sameSourceOwnerAtFirstChange
        ? 'FIRST_CHANGE_NOT_SOURCE_OWNED'
        : sourceAttackReplacesQuickBall
          ? 'SOURCE_ATTACK_REPLACES_QUICK_BALL'
          : 'OTHER_SOURCE_FIRST_CHANGE';
  const terminalComparable = physicallyMatched &&
    baseline.status === 'native-terminal' &&
    guarded.status === 'native-terminal';
  return {
    id: baseline.id,
    rank: baseline.rank,
    candidateSeat,
    sourceSeat,
    seed: baseline.seed,
    physicallyMatched,
    ledgersPresent,
    status,
    sourceAttackReplacesQuickBall,
    sameSourceOwnerAtFirstChange,
    firstDifference,
    baseline: {
      status: baseline.status,
      nativeWinner: baseline.status === 'native-terminal' ? baseline.winner : null,
      candidateWin: baseline.status === 'native-terminal'
        ? baseline.winner === candidateSeat : null,
      rootActions: baseline.rootActions,
      remainingPrizes: baseline.remainingPrizes
    },
    guard: {
      status: guarded.status,
      nativeWinner: guarded.status === 'native-terminal' ? guarded.winner : null,
      candidateWin: guarded.status === 'native-terminal'
        ? guarded.winner === candidateSeat : null,
      rootActions: guarded.rootActions,
      remainingPrizes: guarded.remainingPrizes
    },
    terminalComparable,
    nativeWinnerChanged: terminalComparable &&
      baseline.winner !== guarded.winner,
    paperCompetitiveGames: 0
  };
}

/** @param {{runArm?:Function}} [deps] */
function run(deps = {}) {
  const base = (deps.runArm ?? runArm)(false);
  const guarded = (deps.runArm ?? runArm)(true);
  const baselineRows = base?.selected?.rawDevelopment?.rows;
  const guardedRows = guarded?.selected?.rawDevelopment?.rows;
  assert.ok(Array.isArray(baselineRows) && baselineRows.length === 4);
  assert.ok(Array.isArray(guardedRows) && guardedRows.length === 4);
  const baseline = baselineRows.map(row => summarizeRow(row, true));
  const guard = guardedRows.map(row => summarizeRow(row, true));
  const guardedById = new Map(guard.map(row => [row.id, row]));
  assert.equal(guardedById.size, 4);
  const pairs = baseline.map(row => {
    const matching = guardedById.get(row.id);
    assert.ok(matching, 'Missing source-seat replay ' + row.id);
    return comparePair(row, matching);
  });
  const sourceIsolation = pairs.every(pair =>
    !['FIRST_CHANGE_NOT_SOURCE_OWNED','INVALID_DEAL_OR_MISSING_LEDGER']
      .includes(pair.status));
  return {
    schema: VERSION,
    type: 'retrospective tactical falsification; not prospective winner evidence',
    historicalRegistration: REGISTRATION,
    enginePin: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    fixedOriginalDecks: true,
    sourceOnly: true,
    physicalOrientations: 2,
    sourceRanks: [11, 13],
    nativeAttempts: 8,
    sourceOnlyOptionChanged: 'sourceQuickBallPreservePayableAttack',
    sourceOnlyOptionControl: policyOptions(false),
    sourceOnlyOptionGuard: policyOptions(true),
    matchedBothPhysicalDeals: pairs.every(pair => pair.physicallyMatched),
    sourceIsolation,
    attackOverQuickBallCount: pairs.filter(pair =>
      pair.sourceAttackReplacesQuickBall).length,
    rank11AttackOverQuickBallCount: pairs.filter(pair =>
      pair.rank === 11 && pair.sourceAttackReplacesQuickBall).length,
    nativeTerminalWinnerChanges: pairs.filter(pair =>
      pair.nativeWinnerChanged).length,
    pairs,
    rawNativeRows: {
      control: baselineRows,
      guarded: guardedRows
    },
    paperCompetitiveGames: 0,
    estimatedWinRate: null,
    limitations: [
      'Historical known rank11 deals are the tactical target; the rank13 registered both-seat controls satisfy the four-arm native release minimum.',
      'Historical known deals were selected for falsification, not rate estimation.'
      'A native accepted AttackAction is not by itself a printed damage or tactical-value certificate.',
      'Any root cap or engine error is retained without imputed winner.',
      'The same nominal seed must be accompanied by matching full and source physical-deal fingerprints.'
    ]
  };
}

if (require.main === module) {
  const result = run();
  save('artifacts/agent2-rank11-source-quickball-attack-priority.json', result);
  console.log('AGENT2_RANK11_SOURCE_ATTACK_PRIORITY',
    JSON.stringify({
      status: result.pairs.map(row => row.status),
      matched: result.matchedBothPhysicalDeals,
      sourceIsolation: result.sourceIsolation,
      attackOverQuickBallCount: result.attackOverQuickBallCount,
      rank11AttackOverQuickBallCount: result.rank11AttackOverQuickBallCount,
      nativeTerminalWinnerChanges: result.nativeTerminalWinnerChanges
    }));
  if (!result.matchedBothPhysicalDeals || !result.sourceIsolation)
    process.exitCode = 1;
}

module.exports = {
  VERSION, REGISTRATION, ROOT_LIMIT, registered, policyOptions,
  runArm, comparePair, run
};
