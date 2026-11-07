'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  probeRank31LegalBCRAlakazamCursedBlast
}=require('../simulation/twinleaf/agent49-rank31-dusknoir-legal-transfer-cursed-blast-native.cjs');

test('rank31 legal Roxie/Koffing + BCR + one-source Painful Spoons + PRE Cursed Blast works on both physical seats',()=>{
  for(const seat of [0,1]){
    const result=probeRank31LegalBCRAlakazamCursedBlast(seat);
    console.log('AGENT49_LEGAL_BCR_ALAKAZAM_CURSED_BLAST '+JSON.stringify(result));
    assert.equal(result.seat,seat);
    assert.equal(result.source60K0,true);
    assert.deepEqual(result.source60Counts,{
      roxie:4,koffing:3,radiantAlakazam:1,
      duskullPRE:3,dusclopsPRE:3,dusknoirPRE:3,dusknoirBCR:1
    });
    assert.equal(result.damageAfterRoxieKoffing,90);
    assert.equal(result.damageAfterSinisterHand,100);
    assert.equal(result.damageAfterPainfulSpoons,110);
    assert.equal(result.expectedTargetDamageAfterPrintedCursedBlast,240);
    assert.equal(result.targetKnockedOut,true);
    assert.equal(result.sourcePrizeCountBefore,6);
    assert.equal(result.sourcePrizeCountAfter,4);
    assert.equal(result.sourcePrizeCardsTaken,2);
    assert.equal(result.opponentPrizeCountBefore,6);
    assert.equal(result.opponentPrizeCountAfter,5);
    assert.equal(result.opponentPrizeCardsTaken,1);
    assert.equal(result.netPrizeAdvantage,1);
    assert.equal(result.physicalKoffingDiscarded,true);
    assert.equal(result.physicalRoxieDiscarded,true);
    assert.equal(result.physicalPreDusknoirStackDiscarded,true);
    assert.equal(result.bcrDusknoirRemainsInPlay,true);
    assert.equal(result.targetPhysicallyDiscarded,true);
    assert.equal(result.sourceBenchSlots,5);
    assert.equal(result.sourceBenchOccupiedAfter,1);
    assert.equal(result.pendingPrompts,0);
    assert.equal(result.qualifiedGame,false);
    assert.equal(result.competitiveResult,false);
  }
});

test('two Koffing produce an exact-lethal 80-damage Cursed Blast line from only 20 staged target damage',()=>{
  for(const seat of [0,1]){
    const result=probeRank31LegalBCRAlakazamCursedBlast(seat,{
      koffingCount:2,
      initialTargetDamage:20,
      bcrMoveCount:2,
      painfulSpoonsMoveCount:2
    });
    console.log('AGENT49_TWO_KOFFING_EXACT_LETHAL '+JSON.stringify(result));
    assert.equal(result.seat,seat);
    assert.equal(result.koffingCount,2);
    assert.equal(result.initialTargetDamage,20);
    assert.equal(result.bcrSinisterHandMoves,2);
    assert.equal(result.painfulSpoonsCountersMoved,2);
    assert.equal(result.damageAfterRoxieKoffing,40);
    assert.equal(result.damageAfterSinisterHand,60);
    assert.equal(result.damageAfterPainfulSpoons,80);
    assert.equal(result.expectedTargetDamageAfterPrintedCursedBlast,210);
    assert.equal(result.targetKnockedOut,true);
    assert.equal(result.sourcePrizeCountAfter,4);
    assert.equal(result.opponentPrizeCountAfter,5);
    assert.equal(result.netPrizeAdvantage,1);
    assert.equal(result.physicalKoffingDiscardCount,2);
    assert.equal(result.physicalRoxieDiscarded,true);
    assert.equal(result.physicalPreDusknoirStackDiscarded,true);
    assert.equal(result.bcrDusknoirRemainsInPlay,true);
    assert.equal(result.pendingPrompts,0);
  }
});
