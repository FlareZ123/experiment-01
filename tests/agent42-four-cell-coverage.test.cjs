'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditFourCellCoverage}=require('../simulation/evaluation/agent42-four-cell-coverage.cjs');

/** @param {number} rank @param {0|1} seat @param {'candidate'|'source'} first */
const pair=(rank,seat,first)=>({
  rank,candidateSeat:seat,actualStarter:first,
  firstObservationComparable:true
});

test('complete four-way coverage includes every aligned seat/start stratum',()=>{
  const result=auditFourCellCoverage([
    pair(6,0,'candidate'),pair(6,0,'source'),
    pair(6,1,'candidate'),pair(6,1,'source')
  ],[6]);
  assert.deepEqual(Object.values(result.byRank[6].counts),[1,1,1,1]);
  assert.equal(result.allRanksFourCellCovered,true);
  assert.equal(result.allRanksTwoRealStarts,true);
  assert.deepEqual(result.confoundedRanks,[]);
});

test('both real starters may be perfectly confounded with seat',()=>{
  const result=auditFourCellCoverage([
    pair(6,0,'source'),pair(6,0,'source'),
    pair(6,1,'candidate'),pair(6,1,'candidate')
  ],[6]);
  assert.equal(result.allRanksTwoRealStarts,true);
  assert.equal(result.allRanksFourCellCovered,false);
  assert.deepEqual(result.confoundedRanks,[6]);
  assert.deepEqual(result.byRank[6].counts,{
    'seat0-candidate-first':0,'seat0-source-first':2,
    'seat1-candidate-first':2,'seat1-source-first':0
  });
});

test('unaligned pair never supplies a valid coverage cell',()=>{
  const rows=[pair(6,0,'source'),pair(6,1,'candidate'),
    {...pair(6,0,'candidate'),firstObservationComparable:false},
    pair(11,0,'candidate'),pair(11,1,'source')];
  const result=auditFourCellCoverage(rows,[6,11]);
  assert.equal(result.byRank[6].unalignedPairs,1);
  assert.equal(result.byRank[6].counts['seat0-candidate-first'],0);
  assert.equal(result.allRanksFourCellCovered,false);
  assert.equal(result.allRanksTwoRealStarts,true);
  assert.deepEqual(result.confoundedRanks,[6,11]);
});

test('partial starts stay distinct from a fully confounded two-start panel',()=>{
  const result=auditFourCellCoverage([pair(24,0,'source')],[24]);
  assert.equal(result.byRank[24].twoRealStarts,false);
  assert.equal(result.byRank[24].seatFirstConfounded,false);
});

test('invalid registrations and malformed aligned pairs fail closed',()=>{
  assert.throws(()=>auditFourCellCoverage([],[6,6]),/Duplicate/);
  assert.throws(()=>auditFourCellCoverage([pair(11,0,'source')],[6]),/Unregistered/);
  assert.throws(()=>auditFourCellCoverage([pair(6,2,'source')],[6]));
  assert.throws(()=>auditFourCellCoverage([pair(6,0,'other')],[6]));
});
