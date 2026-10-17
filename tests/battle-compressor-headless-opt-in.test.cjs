'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch,upstreamSmokeDeck}=require('../simulation/twinleaf/headless.cjs');

test('Battle Compressor paper-rule hook is explicitly versioned and reversible across matches',()=>{
  const {Store}=require(path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const original=Store.prototype.dispatch;
  const cards=upstreamSmokeDeck();
  assert.equal(cards.length,60);
  const request={deckA:cards,deckB:cards,seed:20261017,maxActions:16};
  const corrected=runMatch({...request,battleCompressorPositiveSelectionCorrection:true});
  assert.equal(corrected.battleCompressorPositiveSelectionCorrection,true);
  assert.match(corrected.policy,/BattleCompressorMin1-paper-v1/);
  assert.equal(Store.prototype.dispatch,original);
  const baseline=runMatch(request);
  assert.equal(baseline.battleCompressorPositiveSelectionCorrection,false);
  assert.doesNotMatch(baseline.policy,/BattleCompressorMin1-paper-v1/);
  assert.equal(Store.prototype.dispatch,original);
  assert.deepEqual(corrected.deckHashes,baseline.deckHashes);
  assert.equal(corrected.engine,baseline.engine);
});
