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
