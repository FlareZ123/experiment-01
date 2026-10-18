'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loadDefaultCampaign}=require('../scripts/aichi-comparison-campaign.cjs');

test('historical rank10 source replay retains the archived three-list plan digest',()=>{
  const legacy=loadDefaultCampaign('decorrelated-slots-v3',false);
  assert.equal(legacy.planDigest,
    '01ab9959e9b94f8d89fe6dc010072b9959ce3dfa2c4d670f9864ed3d237c9d60');
  assert.deepEqual(legacy.pilotRanks,[1,2,3,4,5,6,8,10,26]);
  assert.equal(legacy.trialCountByPhase.pilot,54);
  assert.equal(legacy.trialCountByPhase.publishedField,174);
  const matching=legacy.trials.filter(t=>
    t.trialId==='pilot:10:0:champion-reference:B');
  assert.equal(matching.length,1);
  assert.equal(matching[0].seed,4246551499);
  assert.equal(matching[0].rank,10);
  assert.equal(matching[0].candidateEngineSlot,'B');
  assert.equal(matching[0].actualStartingTurn,'requires-runtime-verification');
});

test('added provisional opponent/candidate invalidates old whole-plan hash',()=>{
  const original=loadDefaultCampaign('decorrelated-slots-v3',false);
  const modern=loadDefaultCampaign('decorrelated-slots-v3');
  assert.notEqual(modern.planDigest,original.planDigest);
  assert.ok(modern.pilotRanks.includes(11));
  assert.ok(!original.pilotRanks.includes(11));
  assert.equal(modern.candidateRows.length,4);
  assert.equal(original.candidateRows.length,3);
});
