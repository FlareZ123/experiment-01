'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {runTurn5ForkObserver}=require(
  '../simulation/twinleaf/rank2-turn5-source-fork-observer.cjs');

test('one authentic original-source turn5 Supporter decision per policy',()=>{
  const root=path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(
    root,'simple-bot/simple-tactics-ai'));
  const before=SimpleTacticsAi.prototype.decodeNextAction;
  const study=runTurn5ForkObserver({maxActions:70});
  assert.equal(SimpleTacticsAi.prototype.decodeNextAction,before,
    'Root bot observer must restore prototype hook');
  assert.equal(study.identicalSourceDeckHashes,true);
  assert.equal(study.identicalFirstTurn,true);
  assert.equal(study.arms.length,2);
  const [v1,v2]=study.arms;
  for(const arm of [v1,v2]){
    assert.equal(arm.firstTurnSlot,1);
    assert.equal(arm.verifiedByDrawLog,true);
    assert.equal(arm.capture.length,1);
    assert.equal(arm.fork?.actionOrdinal,68);
    assert.equal(arm.fork?.turn,5);
    assert.equal(arm.fork?.playerSlot,1);
    assert.equal(arm.capture[0].before.ownHand.perspectiveSeat,1);
    assert.equal(arm.capture[0].before.publicBoard.length,2);
  }
  assert.equal(v1.fork.card,'Guzma & Hala');
  assert.equal(v2.fork.card,'Bellelba & Brycen-Man');
  assert.equal(study.firstRecordedMeaningfulDifference?.firstProfile.card,
    'Guzma & Hala');
  assert.equal(study.firstRecordedMeaningfulDifference?.secondProfile.card,
    'Bellelba & Brycen-Man');
  // We report visible root-state equality as evidence, not an assumption.
  assert.equal(typeof study.samePredecisionVisibleSnapshot,'boolean');
});
