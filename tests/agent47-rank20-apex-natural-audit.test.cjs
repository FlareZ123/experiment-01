'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {SEEDS,OPPONENT_RANKS,registration}=
  require('../simulation/twinleaf/agent47-rank20-apex-natural-audit.cjs');

test('registered source20 native census is full, small, and outcome-independent',()=>{
 const {trials,byRank}=registration();
 assert.equal(SEEDS.length,6);
 assert.equal(OPPONENT_RANKS.length,2);
 assert.deepEqual([...OPPONENT_RANKS],[1,11]);
 assert.equal(new Set(SEEDS).size,6);
 assert.equal(trials.length,24);
 assert.equal(new Set(trials.map(t=>t.id)).size,24);
 assert.equal(trials.filter(t=>t.sourceSeat===0).length,12);
 assert.equal(trials.filter(t=>t.sourceSeat===1).length,12);
 for(const rank of [1,11,20]){
   assert.equal(byRank.get(rank).cardIds.length,60);
   assert.equal(byRank.get(rank).playableUnderEngine,true);
 }
});
