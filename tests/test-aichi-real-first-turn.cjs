'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {buildPlan,evaluatePlan}=require('../simulation/evaluation/field-benchmark.cjs');
const row={rank:1,player:'Source',cards:[{name:'Psychic Energy',count:60,printing:{set:'TEST',number:'1'}}]};
const pool=[{name:'Psychic Energy',set:'TEST',setNumber:'1',fullName:'Psychic Energy TEST 1'}];
const plan=buildPlan({source:'source',decks:[row]},pool,1);
const first={finished:true,winner:0,firstTurnSlot:0,firstTurnPlayerId:101,
  firstTurnPlayerName:'research-A',firstDrawLogName:'research-A',verifiedByDrawLog:true};
test('first-turn attribution requires confirmed start event and draw log',()=>{
 const batch=evaluatePlan(plan,{selectedRanks:[1],gamesPerSeat:1,runMatch:()=>first});
 const matchup=batch.opponents[0];
 assert.deepEqual(matchup.trueStartingTurn,{first:1,second:1,unverified:0});
 assert.equal(matchup.games[0].actualFirstPlayerSide,'A');
 assert.equal(matchup.games[0].candidateOrder,'first');
 assert.equal(matchup.games[1].candidateOrder,'second');
 assert.equal(batch.observedMatchupsHaveBothRealStartingTurns,true);
 assert.equal(batch.startingTurnBalanceVerified,false);
});
test('forged or absent draw logs never certify a real starting turn',()=>{
 const invalid={...first,firstDrawLogName:'research-B'};
 const batch=evaluatePlan(plan,{selectedRanks:[1],gamesPerSeat:1,runMatch:()=>invalid});
 assert.deepEqual(batch.opponents[0].trueStartingTurn,{first:0,second:0,unverified:2});
 assert.equal(batch.opponents[0].games[0].actualFirstPlayerSide,null);
 assert.equal(batch.observedMatchupsHaveBothRealStartingTurns,false);
});
