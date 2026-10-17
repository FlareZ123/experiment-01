'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {ARMS,runRank2Mode1Ablation}=
  require('../simulation/twinleaf/rank2-gh-mode1-ablation.cjs');

test('exact seed70 preserves baseline and isolates three source-K0 policy stages',()=>{
  const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
  const old=SimpleTacticsAi.prototype.decodeNextAction;
  const r=runRank2Mode1Ablation({maxActions:70});
  assert.equal(SimpleTacticsAi.prototype.decodeNextAction,old);
  assert.equal(r.results.length,ARMS.length);
  assert.equal(r.sameSourceHashes,true);
  assert.equal(r.sameFirstTurn,true);
  for(let i=0;i<ARMS.length;i++){
    assert.deepEqual(r.results[i].flags,ARMS[i]);
    assert.equal(r.results[i].firstTurnSlot,1);
    assert.equal(r.results[i].verifiedByDrawLog,true);
    assert.equal(r.results[i].actions,70);
  }
  // Reproduce the registered source-pair fork in endpoint policies.
  assert.equal(r.results[0].fork?.card,'Guzma & Hala');
  assert.equal(r.results[3].fork?.card,'Bellelba & Brycen-Man');
  assert.equal(r.results[0].fork.actionOrdinal,68);
  assert.equal(r.results[3].fork.actionOrdinal,68);
  // Intermediate ablations are measurements, not presumed outcomes.
  assert.equal(typeof r.sameVisibleContext,'boolean');
  assert.ok(r.results.every(a=>a.meaningfulPrefixLength>=0));
});
