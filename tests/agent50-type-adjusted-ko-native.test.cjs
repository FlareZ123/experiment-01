'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {probeTypeAdjustedKoNative}=
  require('../simulation/twinleaf/agent50-type-adjusted-ko-native.cjs');

for(const seat of [0,1]){
  test(`actual pinned two-seat Purrloin Scratch x2 takes 3 physical TAG TEAM Prizes in seat ${seat}`,()=>{
    const receipt=probeTypeAdjustedKoNative(seat);
    assert.equal(receipt.olderRawNominalPreference,'Slash');
    assert.equal(receipt.actualNativeAttack,'Scratch');
    assert.equal(receipt.attacker,'Purrloin BLW');
    assert.equal(receipt.defender,'Gengar & Mimikyu-GX TEU');
    assert.equal(receipt.typeAdjustedDamage,20);
    assert.equal(receipt.targetRemainingBefore,20);
    assert.equal(receipt.defenderKnockedOut,true);
    assert.equal(receipt.sourcePrizesBefore,6);
    assert.equal(receipt.sourcePrizesAfter,3);
    assert.equal(receipt.sourcePrizesTaken,3);
    assert.equal(receipt.sourceDeckPhysicalComplete,false);
    assert.equal(receipt.originalAichiPair,false);
    assert.equal(receipt.qualifiedGame,false);
    assert.equal(receipt.competitivelyQualifiedGames,0);
    console.log('AGENT50_NATIVE_TYPE_KO '+JSON.stringify(receipt));
  });
}
