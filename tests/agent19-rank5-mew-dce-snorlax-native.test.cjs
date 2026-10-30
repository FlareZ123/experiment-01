'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/agent19-rank5-mew-dce-snorlax-native.cjs');

test('rank5 published Mew VMAX + Genesect + held DCE is one attachment away from sole-Snorlax KO',()=>{
  const audit=run();
  assert.equal(audit.competitiveQualifiedGames,0);
  assert.equal(audit.actualRegisteredSourcePieces,true);
  assert.deepEqual(audit.citedRegisteredRanks,[3,5,7]);
  const [solo,backup]=audit.cases;
  assert.equal(solo.publicEnergyBeforeOpponentTurn,0);
  assert.equal(backup.publicEnergyBeforeOpponentTurn,0);
  assert.equal(solo.nativeFinished,true);
  assert.equal(solo.nativeWinner,1);
  assert.deepEqual(solo.currentSourceCards,[]);
  assert.equal(backup.nativeFinished,false);
  assert.equal(backup.currentSourceActive,'Mimikyu PAL');
  for(const arm of [solo,backup]){
    assert.equal(arm.sourceGuardDecision,'withhold-ordinary-basic');
    assert.equal(arm.opponentPublicEnergyAfter.includes('Double Colorless Energy SUM'),true);
    assert.ok(arm.trace.some(x=>x.selected==='Techno Blast'));
  }
});
