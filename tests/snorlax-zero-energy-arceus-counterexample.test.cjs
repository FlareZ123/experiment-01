'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/snorlax-zero-energy-arceus-counterexample.cjs');
test('Triple Acceleration Energy single attachment native Snorlax risk',()=>{
  const result=run();
  const [solo,backup]=result.cases;
  assert.equal(result.opponentInitialVisibleEnergy,0);
  assert.equal(solo.nativeFinished,true);
  assert.equal(solo.nativeWinner,1);
  assert.equal(backup.nativeFinished,false);
  assert.equal(backup.sourceActive,'Mimikyu PAL');
  assert.equal(result.qualifiedCompetitiveGames,0);
});
