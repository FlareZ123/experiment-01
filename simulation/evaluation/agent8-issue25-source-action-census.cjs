'use strict';

const assert = require('node:assert/strict');
const VERSION = 'agent8-original-eight-source-root-census-v1';

/**
 * Count accepted original-source root actions from a complete Issue25 native
 * archive. Missing direct seat attribution is recovered from the registered
 * A/B candidate orientation and explicitly labeled as inferred.
 * @param {object} receipt Original v5 public JSON receipt.
 * @returns {object}
 */
function censusSourceRoots(receipt) {
  assert.equal(receipt?.schema,
    'agent1-issue25-joined-v4-public-execution-receipt-v1');
  const registered = receipt.registration.expectedIds;
  const attempts = receipt.attempts;
  assert.ok(Array.isArray(registered) && registered.length === 8);
  assert.ok(Array.isArray(attempts) && attempts.length === 8);
  assert.equal(new Set(registered).size, 8);
  assert.equal(new Set(attempts.map(r => r.id)).size, 8);
  assert.equal(receipt.registration.exactJoinedByTrialId, true);
  const records = attempts.map(row => {
    const [rank, repeat, candidateSlot] = row.id.split(':');
    assert.ok(['6', '11'].includes(rank));
    assert.ok(/^\d+$/.test(repeat));
    assert.ok(['A', 'B'].includes(candidateSlot));
    assert.ok(registered.includes(row.id));
    assert.equal(row.actualRawTrialId, row.id);
    assert.equal(row.publicRootActionsTruncated, false);
    assert.equal(row.publicRootLedgerDigestConsistent, true);
    assert.equal(row.nativeRootActionCount, row.publicRootActionCount);
    assert.equal(row.publicRootActions.length, row.publicRootActionCount);
    const seat = candidateSlot === 'A' ? 1 : 0;
    if (row.originalSourceSeat !== null)
      assert.equal(row.originalSourceSeat, seat);
    const counts = {}, plays = [];
    for (const [i, root] of row.publicRootActions.entries()) {
      assert.equal(root.actionOrdinal, i);
      assert.ok(root.playerSlot === 0 || root.playerSlot === 1);
      if (root.playerSlot !== seat) continue;
      counts[root.action] = (counts[root.action] ?? 0) + 1;
      if (root.action !== 'ResolvePromptAction' &&
          root.action !== 'PassTurnAction')
        plays.push({ordinal: i, turn: root.turnBefore,
          action: root.action, printing: root.card ?? null,
          attack: root.attack ?? null});
    }
    return {
      id: row.id, status: row.status, sourceRank: Number(rank), sourceSeat: seat,
      inferredSeatFromRegistration: row.originalSourceSeat === null,
      allRoots: row.publicRootActionCount,
      sourceRoots: Object.values(counts).reduce((a,b) => a+b,0),
      counts, plays
    };
  });
  const kinds = {};
  for (const record of records)
    for (const [type,count] of Object.entries(record.counts))
      kinds[type] = (kinds[type] ?? 0) + count;
  return {
    version: VERSION, acceptedRootsAllSeats:
      records.reduce((sum,r) => sum + r.allRoots,0),
    acceptedRootsOriginalSource:
      records.reduce((sum,r) => sum + r.sourceRoots,0),
    originalSourceActionCounts: kinds,
    originalSourceAttackActions: kinds.AttackAction ?? 0,
    qualifiedGames: 0, records,
    scope: 'Frozen selected v5 eight accepted-root ledgers; seven caps and one error.'
  };
}
module.exports = {VERSION,censusSourceRoots};
