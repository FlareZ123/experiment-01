'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runRank2RootScores}=
  require('../simulation/twinleaf/rank2-gh-root-score-probe.cjs');

test('actual rank2 source Supporter fork exposes score and observer parity',()=>{
  const r=runRank2RootScores();
  assert.equal(r.sameSourceHashes,true);
  assert.equal(r.sameFirstTurn,true);
  assert.equal(r.arms.length,2);
  assert.equal(r.arms[0].decisions[0].card,'Guzma & Hala');
  assert.equal(r.arms[1].decisions[0].card,'Bellelba & Brycen-Man');
  for(const arm of r.arms){
    assert.equal(arm.sameFork,true);
    assert.equal(arm.target.turn,5);
    assert.equal(arm.target.seat,1);
    assert.ok(arm.target.botOrdinal>0);
    assert.equal(arm.scoreTrace?.turn,5);
    assert.equal(arm.scoreTrace?.actorSeat,1);
    assert.equal(arm.scoreTrace?.selected.handPrinting,
      arm.target.selected);
    assert.ok(Array.isArray(arm.scoreTrace?.evaluations));
    assert.equal(arm.sourceDecisionTraceUnchanged,true);
  }
  assert.equal(r.sameRootZoneDigest,true);
});
