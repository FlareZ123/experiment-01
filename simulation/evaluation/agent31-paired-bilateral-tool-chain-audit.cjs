'use strict';

const assert = require('node:assert/strict');

const SCHEMA = 'agent31-bilateral-tool-attack-audit-v1';

/**
 * Certifies a narrow actual-Store action chain for one actor role.
 * This is native-action evidence, not independent paper-rule approval.
 *
 * @param {object} row - Native bilateral game record.
 * @param {'source'|'candidate'} role
 * @returns {Array<{playRoot:number,retreatRoot:number,attackRoot:number,turn:number}>}
 */
function settledFloatStoneChains(row, role) {
  assert.ok(role === 'source' || role === 'candidate');
  const seat = role === 'source' ? row.sourceSeat : row.candidateSeat;
  assert.ok(seat === 0 || seat === 1);
  const roots = row.rootActionLedger;
  const accepted = row.nativeAcceptedTargetSidecar.events;
  const settlement = role === 'source'
    ? row.sourceAttackSettlement.attacks
    : row.candidateAttackSettlement.attacks;
  const acceptedEvent = (root, action) => accepted.find(event =>
    event.rootActionOrdinal === root.actionOrdinal &&
    event.playerSlot === seat &&
    event.action === action &&
    event.storeAccepted === true);
  const hasStone = tools => tools?.some(name => name.startsWith('Float Stone')) ?? false;
  const physicalToolOnActive = event => event?.publicBoardChanges?.some(change =>
    change.seat === seat && change.position === 'active' &&
    !hasStone(change.before?.tools) && hasStone(change.after?.tools));
  const physicalRetreat = event => event?.publicBoardChanges?.some(change =>
    change.seat === seat && change.position === 'active' &&
    hasStone(change.before?.tools) && !hasStone(change.after?.tools)) &&
    event.publicBoardChanges.some(change =>
      change.seat === seat && change.position === 'bench' &&
      hasStone(change.after?.tools));
  const settled = new Set(settlement.filter(attack =>
    attack.attackName === 'Max Geist' &&
    attack.settledPromptChain === true &&
    attack.settlementCrossesClockReset === false
  ).map(attack => attack.actionOrdinal));
  const chains = [];
  for (let i = 0; i + 2 < roots.length; i++) {
    const [play, retreat, attack] = roots.slice(i, i + 3);
    if (play.playerSlot !== seat || retreat.playerSlot !== seat ||
        attack.playerSlot !== seat ||
        play.action !== 'PlayCardAction' || play.card !== 'Float Stone' ||
        retreat.action !== 'RetreatAction' ||
        attack.action !== 'AttackAction' || attack.attack !== 'Max Geist' ||
        play.turnBefore !== retreat.turnBefore ||
        retreat.turnBefore !== attack.turnBefore ||
        !physicalToolOnActive(acceptedEvent(play, 'PlayCardAction')) ||
        !physicalRetreat(acceptedEvent(retreat, 'RetreatAction')) ||
        !settled.has(attack.actionOrdinal)) continue;
    chains.push({
      playRoot: play.actionOrdinal,
      retreatRoot: retreat.actionOrdinal,
      attackRoot: attack.actionOrdinal,
      turn: play.turnBefore
    });
  }
  return chains;
}

/**
 * Reassesses a frozen paired archive on BOTH physical roles, preserving
 * every registered trial, censor, abort and terminal. Does not re-run games.
 *
 * @param {object} archive
 * @returns {object}
 */
function auditArchive(archive) {
  assert.equal(archive.rows.length, archive.base.rows.length);
  assert.equal(archive.rows.length, archive.rescue.rows.length);
  const ids = new Set(), positive = [];
  const counts = {
    sourceControl: 0, sourceRescue: 0,
    candidateControl: 0, candidateRescue: 0,
    changedRootHistories: 0,
    sameInitialPhysicalDeals: 0,
    censoredControl: 0, censoredRescue: 0
  };
  for (let i = 0; i < archive.rows.length; i++) {
    const digest = archive.rows[i], a = archive.base.rows[i], b = archive.rescue.rows[i];
    assert.equal(digest.id, a.trial.id);
    assert.equal(digest.id, b.trial.id);
    assert.ok(!ids.has(digest.id), 'duplicate registered trial');
    ids.add(digest.id);
    assert.equal(a.sourceSeat, b.sourceSeat);
    assert.equal(a.candidateSeat, b.candidateSeat);
    assert.equal(a.sourceDealFingerprint, b.sourceDealFingerprint);
    assert.equal(a.fullPhysicalDealFingerprint, b.fullPhysicalDealFingerprint);
    counts.sameInitialPhysicalDeals++;
    counts.changedRootHistories += Number(a.rootActionLedgerSha256 !== b.rootActionLedgerSha256);
    counts.censoredControl += Number(!a.finished);
    counts.censoredRescue += Number(!b.finished);
    const chainByRole = {};
    for (const role of ['source', 'candidate']) {
      const before = settledFloatStoneChains(a, role);
      const after = settledFloatStoneChains(b, role);
      counts[role + 'Control'] += before.length;
      counts[role + 'Rescue'] += after.length;
      chainByRole[role] = {before, after};
    }
    if (chainByRole.source.after.length || chainByRole.candidate.after.length) {
      positive.push({id: digest.id, ...chainByRole});
    }
  }
  return {
    schema: SCHEMA,
    registeredPairs: ids.size,
    nativeAttempts: ids.size * 2,
    counts,
    positive,
    competitivePaperQualifiedGames: 0,
    caution: 'Native Store acceptance and settlement, not paper-game qualification'
  };
}

module.exports = {SCHEMA, settledFloatStoneChains, auditArchive};
