'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {probeRank31DusknoirCursedBlast}=
  require('../simulation/twinleaf/agent49-rank31-dusknoir-cursed-blast-native.cjs');

for(const seat of [0,1]){
  test(`rank31 Dusknoir PRE Cursed Blast takes two Prizes for one self-KO, seat ${seat}`,()=>{
    const result=probeRank31DusknoirCursedBlast(seat);
    assert.equal(result.source60K0,true);
    assert.equal(result.source60Counts.dusknoirPRE,3);
    assert.equal(result.source60Counts.dusclopsPRE,3);
    assert.equal(result.ability,'Cursed Blast');
    assert.equal(result.abilityCounters,13);
    assert.equal(result.targetDamageBefore,80);
    assert.equal(result.targetExpectedDamageAfter,210);
    assert.equal(result.targetKnockedOut,true);
    assert.equal(result.sourcePrizeCardsTaken,2);
    assert.equal(result.opponentPrizeCardsTaken,1);
    assert.equal(result.netPrizeAdvantage,1);
    assert.equal(result.sourceStackPhysicallyDiscarded,true);
    assert.equal(result.targetPhysicallyDiscarded,true);
    assert.equal(result.pendingPrompts,0);
    assert.equal(result.qualifiedGame,false);
    assert.equal(result.competitiveResult,false);
  });
}
