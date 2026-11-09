'use strict';

const assert = require('node:assert/strict');
const {isDeepStrictEqual} = require('node:util');

const VERSION = 'agent26-fixed60-paired-censor-envelope-v1';
const PHYSICAL_PASS = 'SETTLED_PHYSICAL_INTEGRITY_PASSED';

/**
 * Preserve native terminal versus censored status. A native win is only an
 * observed engine event, never a paper-qualified or human-play win.
 * @param {object} row One original raw outcome diagnostic.
 * @returns {{min:number,max:number,kind:string}}
 */
function armWinInterval(row) {
  assert.ok(row && typeof row === 'object');
  assert.ok(row.candidateSeat === 0 || row.candidateSeat === 1);
  if (row.nativeDisposition === 'ENGINE_TERMINAL') {
    assert.equal(row.nativeFinished, true, 'Contradictory native terminal');
    assert.ok(row.nativeWinner === 0 || row.nativeWinner === 1,
      'Native terminal winner missing');
    const win = Number(row.nativeWinner === row.candidateSeat);
    return {min: win, max: win, kind: win ? 'native-win' : 'native-loss'};
  }
  assert.ok(['ACTION_CAP','NATIVE_ABORT','PRECHECK_REJECTED',
    'CONFLICTING_NATIVE_FIELDS','NATIVE_INCOMPLETE','UNVERIFIED',
    'MISSING_ROW','INVALID_ROW'].includes(row.nativeDisposition),
    'Unknown native disposition: ' + row.nativeDisposition);
  assert.ok(row.nativeFinished !== true,
    'Censored attempt must not claim native game completion');
  return {min: 0, max: 1, kind: row.nativeDisposition};
}

/**
 * Compare real source physical setup. Different candidate decks necessarily
 * have different candidate hands; this is only conditional pairing of source
 * opening and start order, not an unconditional field experiment.
 * @param {object} a @param {object} b
 * @returns {string|null} Null only when source opening is comparable.
 */
function unpairedReason(a, b) {
  if (!a || !b) return 'missing-arm';
  if (a.physicalStatus !== PHYSICAL_PASS || b.physicalStatus !== PHYSICAL_PASS)
    return 'physical-integrity-not-passed';
  if (!a.sourceDealFingerprint ||
    a.sourceDealFingerprint !== b.sourceDealFingerprint)
    return 'different-source-physical-deal';
  if (a.candidateSeat !== b.candidateSeat ||
    a.originalSeat !== b.originalSeat)
    return 'different-seat-assignment';
  if ((a.actualStarterSeat !== 0 && a.actualStarterSeat !== 1) ||
    a.actualStarterSeat !== b.actualStarterSeat)
    return 'different-or-missing-start-order';
  return null;
}

/**
 * Report the first changed root, only as an action observation. Store context
 * and chosen payment require independent paper-rule adjudication.
 * @param {object[]} a @param {object[]} b
 * @returns {object|null}
 */
function firstDivergentRoot(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return null;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (isDeepStrictEqual(a[i], b[i])) continue;
    const minimal = x => x ? {
      actionOrdinal: x.actionOrdinal ?? null,
      turnBefore: x.turnBefore ?? null,
      playerSlot: x.playerSlot ?? null,
      action: x.action ?? null,
      card: x.card ?? null,
      attack: x.attack ?? null
    } : null;
    return {index: i, left: minimal(a[i]), right: minimal(b[i])};
  }
  return null;
}

/**
 * @param {object[]} groups Exact preregistered two-contender groups.
 * @param {[string,string]} contenderIds Stable registered left/right labels.
 * @returns {object} Deterministic missing-outcome bounds, never a win rate.
 */
function auditFixed60PairedCensoring(groups, contenderIds) {
  assert.ok(Array.isArray(groups) && groups.length > 0);
  assert.ok(Array.isArray(contenderIds) && contenderIds.length === 2 &&
    contenderIds[0] !== contenderIds[1]);
  const ids = contenderIds;
  const keys = new Set();
  const detail = groups.map(g => {
    assert.ok(g && typeof g.key === 'string' && Number.isInteger(g.rank));
    assert.ok(!keys.has(g.key), 'Duplicate registered group: ' + g.key);
    keys.add(g.key);
    const left = g.contenders?.[ids[0]];
    const right = g.contenders?.[ids[1]];
    assert.ok(left && right, 'Missing registered contender: ' + g.key);
    assert.equal(left.candidateId, ids[0]);
    assert.equal(right.candidateId, ids[1]);
    assert.equal(left.rank, g.rank);
    assert.equal(right.rank, g.rank);
    const l = armWinInterval(left);
    const r = armWinInterval(right);
    const reason = unpairedReason(left, right);
    const sameSourceOpening = reason === null;
    return {key: g.key, rank: g.rank, repeat: g.repeat,
      candidateSlot: g.candidateSlot,
      actualStarterSeat: sameSourceOpening ? left.actualStarterSeat : null,
      sourceDealFingerprint: sameSourceOpening ? left.sourceDealFingerprint : null,
      paired: sameSourceOpening, unpairedReason: reason,
      left: l, right: r,
      difference: sameSourceOpening ?
        {min: l.min - r.max, max: l.max - r.min} : null,
      bothNativeTerminal: sameSourceOpening && l.min === l.max &&
        r.min === r.max,
      firstDivergentRoot: sameSourceOpening ?
        firstDivergentRoot(left.rootActionLedger, right.rootActionLedger) : null};
  });

  /** @param {object[]} selected */
  function subtotal(selected) {
    const paired = selected.filter(x => x.paired);
    const sum = (a, f) => a.reduce((n, x) => n + f(x), 0);
    const mins = [sum(selected, x => x.left.min),
      sum(selected, x => x.right.min)];
    const maxes = [sum(selected, x => x.left.max),
      sum(selected, x => x.right.max)];
    return {registeredGroups: selected.length,
      matchedSourcePhysicalGroups: paired.length,
      unmatchedGroups: selected.length - paired.length,
      bothNativeTerminalMatched: paired.filter(x => x.bothNativeTerminal).length,
      nativeWinCountsAllRegistered: {
        [ids[0]]: {min: mins[0], max: maxes[0]},
        [ids[1]]: {min: mins[1], max: maxes[1]}
      },
      allRegisteredDifference: {
        min: mins[0] - maxes[1], max: maxes[0] - mins[1]
      },
      matchedOnlyDifference: {
        min: sum(paired, x => x.difference.min),
        max: sum(paired, x => x.difference.max)
      }};
  }
  const ranks = [...new Set(detail.map(x => x.rank))].sort((a,b) => a-b);
  return {schema: VERSION, contenderIds: [...ids],
    conditioning: 'matched original-source opening and start order; different candidate physical decks',
    paperQualifiedGames: 0, competitiveWinRate: null,
    overall: subtotal(detail),
    byRank: ranks.map(rank => ({rank, ...subtotal(detail.filter(x => x.rank === rank))})),
    groups: detail};
}

module.exports = {VERSION, PHYSICAL_PASS, armWinInterval,
  unpairedReason, firstDivergentRoot, auditFixed60PairedCensoring};
