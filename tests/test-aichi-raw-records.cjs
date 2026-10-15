'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {buildPlan,evaluatePlan}=require('../simulation/evaluation/field-benchmark.cjs');
const entry={rank:1,player:'Fixture',cards:[{name:'Psychic Energy',count:60,printing:{set:'TEST',number:'1'}}]};
const pool=[{name:'Psychic Energy',fullName:'Psychic Energy TEST 1',set:'TEST',setNumber:'1'}];
test('planned subset produces exactly two replayable slot records',()=>{
 const plan=buildPlan({source:'fixture',decks:[entry]},pool);
 const batch=evaluatePlan(plan,{selectedRanks:[1],gamesPerSeat:1,runMatch:()=>({finished:true,winner:3,endReason:'engine-game-end'})});
 assert.equal(batch.opponents.length,32);
 assert.equal(batch.opponents[0].games.length,2);
 assert.equal(batch.opponents[0].games[0].candidateEngineSide,'A');
 assert.equal(batch.opponents[0].games[1].candidateEngineSide,'B');
 assert.equal(batch.opponents[0].games[0].actualFirstPlayerSide,null);
 assert.equal(batch.opponents[0].draws,2);
 assert.deepEqual(batch.selectedRanks,[1]);
 assert.throws(()=>evaluatePlan(plan,{selectedRanks:[1,1],runMatch:()=>({})}));
});
