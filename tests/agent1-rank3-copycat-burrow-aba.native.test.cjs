'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {run} = require('../simulation/evaluation/agent1-rank3-copycat-burrow-aba.cjs');

test('native rank3/rank1 Copycat-Burrow A/B/A is deterministic and resolves one-card mill',()=>{
  const result=run();
  assert.equal(result.controls.sameOriginalPhysicalDealAllArms,true);
  assert.equal(result.controls.exactControlRepeat,true);
  assert.equal(result.controls.copycatPolicyEnabledOnlyInTreatment,true);
  assert.ok(result.arms.every(arm=>arm.status!=='native-error'));
  const treatment=result.arms[1];
  assert.ok(treatment.copycatDeclarations>0,
    'Treatment must declare Mimikyu Copycat at least once');
  assert.ok(treatment.copycatEffects.every(effect=>effect.effectObserved),
    'Each Copycat must discard one source-deck card and no owner-deck card');
  assert.ok(treatment.copycatTurnEvidence.every(item=>
    item.previousOpponentAttack==='Burrow'&&item.activeMimikyu),
  'Every Copycat must be preceded by a public Burrow record with Active Mimikyu');
  assert.equal(result.controls.everyCopycatHasBurrowDeckEffect,true);
  assert.equal(result.controls.everyCopycatHadBurrowTurnEvidence,true);
  assert.equal(result.controls.competitiveQualifiedGames,0);
  console.log('AGENT1_COPYCAT_BURROW_ABA',JSON.stringify(result));
});
