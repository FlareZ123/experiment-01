'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {assessFieldEvidence,countQualifiedWins}=require('../scripts/aichi-anytime-field-evidence.cjs');

/** @param {number} [loss] Index of a single nonwin cell. */
function round(loss=-1) {
  return Array.from({length:64},(_,i)=>({
    rank:(i%32)+1,startingSeat:i<32?'first':'second',
    outcome:i===loss?'loss':'win'
  }));
}

test('all 64 rank-by-actual-seat cells are mandatory',()=>{
  assert.equal(countQualifiedWins(round()),64);
  assert.equal(countQualifiedWins([...round()].reverse()),64);
  assert.equal(countQualifiedWins(round(0)),63);
  assert.throws(()=>countQualifiedWins(round().slice(1)),/64/);
  const duplicate=round();duplicate[0]=duplicate[1];
  assert.throws(()=>countQualifiedWins(duplicate),/Repeated/);
  const invalid=round();invalid[0].startingSeat='slotA';
  assert.throws(()=>countQualifiedWins(invalid),/Invalid/);
  const draw=round();draw[0].outcome='draw';
  assert.equal(countQualifiedWins(draw),63);
});

test('10 complete perfect rounds cross, 9 do not',()=>{
  const full=Array.from({length:10},()=>round());
  const nine=assessFieldEvidence(full.slice(0,9));
  const ten=assessFieldEvidence(full);
  assert.equal(nine.games,576);
  assert.equal(nine.currentCrosses,false);
  assert.equal(ten.games,640);
  assert.equal(ten.currentCrosses,true);
  assert.equal(ten.firstCrossedAtRound,10);
  assert.equal(assessFieldEvidence([]).eValue,1);
});
test('one loss still yields a defined finite exponential mixture',()=>{
  const full=Array.from({length:10},()=>round());
  full[0]=round(0);
  const value=assessFieldEvidence(full);
  assert.equal(value.nonWins,1);
  assert.equal(value.currentCrosses,false);
  assert.ok(Number.isFinite(value.logEValue));
});
