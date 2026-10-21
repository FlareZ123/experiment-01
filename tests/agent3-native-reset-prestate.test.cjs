'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {captureNativeResetPrestate}=require('../simulation/evaluation/agent3-native-reset-prestate.cjs');

/** @param {boolean} active @param {number} prizes @param {number} bench */
function seat(active,prizes,bench){return {
  active:{cards:active?[{fullName:'public Pokemon'}]:[]},
  prizes:Array.from({length:6},(_,i)=>({cards:i<prizes?[{private:'hidden'}]:[]})),
  bench:Array.from({length:5},(_,i)=>({cards:i<bench?[{}]:[]})),
  hand:{cards:[{private:'secret'}]},deck:{cards:[{private:'secret'}]}
};}

test('ordinary field: no native win predicates',()=>{
  const result=captureNativeResetPrestate({players:[seat(true,6,1),seat(true,6,2)]});
  assert.deepEqual(result.nativeCheckWinnerPointsIfCheckedNow,[0,0]);
  assert.equal(result.bothSeatsWouldScoreIfCheckedNow,false);
  assert.deepEqual(result.players.map(s=>s.occupiedBenchSlots),[1,2]);
  assert.equal(JSON.stringify(result).includes('private'),false);
});

test('dual empty Active: native checker would select reset',()=>{
  const result=captureNativeResetPrestate({players:[seat(false,5,0),seat(false,4,0)]});
  assert.deepEqual(result.nativeCheckWinnerPointsIfCheckedNow,[1,1]);
  assert.equal(result.bothSeatsWouldScoreIfCheckedNow,true);
  assert.equal(result.provesTransitionCause,false);
});

test('mutual zero Prizes: dual win candidates',()=>{
  const result=captureNativeResetPrestate({players:[seat(true,0,1),seat(true,0,1)]});
  assert.deepEqual(result.nativeCheckWinnerPointsIfCheckedNow,[1,1]);
  assert.equal(result.bothSeatsWouldScoreIfCheckedNow,true);
});

test('one empty Active only: other seat scores',()=>{
  const result=captureNativeResetPrestate({players:[seat(false,5,0),seat(true,5,0)]});
  assert.deepEqual(result.nativeCheckWinnerPointsIfCheckedNow,[0,1]);
  assert.equal(result.bothSeatsWouldScoreIfCheckedNow,false);
});
