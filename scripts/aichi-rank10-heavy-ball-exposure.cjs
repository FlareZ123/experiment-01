'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');

/**
 * Count actual root-Store Trainer plays from the archived source-dealt game.
 * Complete agreement between the authoritative Store action count, the
 * name-bearing decision log and the per-seat played-card ledger is required.
 * @param {object} archive Source-ranked rank-10 branch archive.
 * @returns {object} Verified sample-specific exposure, not card-rule fidelity.
 */
function auditHeavyBallExposure(archive) {
  assert.equal(archive?.schema, 'rank10-source-branch-live-dispatch-v1');
  const arms = [];
  for (const arm of ['control', 'alternate']) {
    const trace = archive[arm]?.fullLiveDispatchTrace;
    const game = archive[arm]?.result;
    assert.ok(Array.isArray(trace) && trace.length >= 3);
    assert.ok(Array.isArray(game?.decisionTrace));
    assert.ok(Array.isArray(game?.cardsPlayedBySeat) && game.cardsPlayedBySeat.length === 2);
    const dispatches = trace.filter(entry => entry.action === 'PlayCardAction');
    const named = game.decisionTrace.filter(entry => entry.action === 'PlayCardAction');
    assert.equal(named.length, dispatches.length, arm+' lacks source-Store card name coverage');
    const counts = [Object.create(null), Object.create(null)];
    for (const entry of named) {
      assert.ok([0, 1].includes(entry.playerSlot));
      assert.ok(typeof entry.card === 'string' && entry.card.length > 0);
      counts[entry.playerSlot][entry.card] = (counts[entry.playerSlot][entry.card] || 0) + 1;
    }
    for (let seat = 0; seat < 2; seat += 1) {
      assert.deepEqual({...counts[seat]}, game.cardsPlayedBySeat[seat],
        arm+' playable-card totals disagree at seat '+seat);
    }
    const heavyBallPlays = named.filter(entry => entry.card === 'Hisuian Heavy Ball')
      .map(entry => ({turn:entry.turnBefore,seat:entry.playerSlot,
        ordinal:entry.actionOrdinal}));
    arms.push({arm,rootPlayCardDispatches:dispatches.length,
      verifiedNamedCardPlays:named.length,heavyBallPlays,
      status:heavyBallPlays.length === 0 ? 'not-played-in-this-deal' : 'played-correction-review-required'});
  }
  return {schema:'rank10-hisuian-heavy-ball-exposure-v1',
    sourceTrial:archive.trial?.id,
    historicalUncorrectedReplayOnly:true,
    qualifiedForCompetitiveInference:false,arms};
}

if(require.main === module) {
  const filename=process.argv[2];
  assert.ok(filename,'Pass the authentic source archive JSON path');
  const data=JSON.parse(fs.readFileSync(filename,'utf8'));
  process.stdout.write(JSON.stringify(auditHeavyBallExposure(data),null,2)+'\n');
}
module.exports={auditHeavyBallExposure};
