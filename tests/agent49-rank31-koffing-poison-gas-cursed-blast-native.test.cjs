'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  probeRank31KoffingPoisonGasCursedBlast
}=require('../simulation/twinleaf/agent49-rank31-koffing-poison-gas-cursed-blast-native.cjs');

test('rank31 Koffing Poison Gas and both poison checkups feed a legal Cursed Blast KO line on both seats',()=>{
  for(const seat of [0,1]){
    const result=probeRank31KoffingPoisonGasCursedBlast(seat);
    console.log('AGENT49_KOFFING_POISON_GAS_CURSED_BLAST '+JSON.stringify(result));
    assert.equal(result.seat,seat);
    assert.equal(result.source60K0,true);
    assert.equal(result.source60Count,60);
    assert.equal(result.source60Counts.koffing,3);
    assert.equal(result.source60Counts.roxie,4);
    assert.equal(result.source60Counts.basicPsychic,2);
    assert.equal(result.initialTargetDamage,0);
    assert.equal(result.damageAfterAttackAndFirstCheckup,20);
    assert.equal(result.damageAfterSecondPoisonCheckup,30);
    assert.equal(result.damageAfterTwoKoffingRoxie,50);
    assert.equal(result.damageAfterSinisterHand,70);
    assert.equal(result.damageAfterPainfulSpoons,90);
    assert.equal(result.expectedTargetDamageAfterCursedBlast,220);
    assert.equal(result.targetKnockedOut,true);
    assert.equal(result.sourcePrizeCountAfter,4);
    assert.equal(result.opponentPrizeCountAfter,5);
    assert.equal(result.netPrizeAdvantage,1);
    assert.equal(result.physicalActiveKoffingRemains,true);
    assert.equal(result.physicalTwoKoffingsAndRoxieDiscarded,true);
    assert.equal(result.physicalPreDusknoirStackDiscarded,true);
    assert.equal(result.bcrDusknoirRemainsInPlay,true);
    assert.equal(result.radiantAlakazamRemainsInPlay,true);
    assert.equal(result.targetPhysicallyDiscarded,true);
    assert.equal(result.opponentPromotionResolved,true);
    assert.equal(result.pendingPrompts,0);
    assert.equal(result.qualifiedGame,false);
    assert.equal(result.competitiveResult,false);
  }
});
