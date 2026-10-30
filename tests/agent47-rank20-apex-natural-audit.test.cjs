'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {SEEDS,OPPONENT_RANKS,trialManifest}=
  require('../simulation/twinleaf/agent47-rank20-apex-natural-audit.cjs');

test('registered source20 native census is full, small, and outcome-independent',()=>{
 const trials=trialManifest();
 const {decks}=require('../results/aichi-2026/full-decklists.json');
 const byRank=new Map(decks.map(d=>[d.rank,d]));
 assert.equal(SEEDS.length,6);
 assert.equal(OPPONENT_RANKS.length,2);
 assert.deepEqual([...OPPONENT_RANKS],[1,11]);
 assert.equal(new Set(SEEDS).size,6);
 assert.equal(trials.length,24);
 assert.equal(new Set(trials.map(t=>t.id)).size,24);
 assert.equal(trials.filter(t=>t.sourceSeat===0).length,12);
 assert.equal(trials.filter(t=>t.sourceSeat===1).length,12);
 for(const rank of [1,11,20]){
   assert.equal(byRank.get(rank).cards.reduce((n,c)=>n+c.count,0),60);
 }
});
