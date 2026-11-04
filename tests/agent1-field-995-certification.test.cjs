'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  minZeroLossGames,balancedAllWinPanel,
  simultaneousPerCellAllWinPanel
}=require('../simulation/evaluation/agent1-field-995-certification.cjs');

/** @param {number} a @param {number} b */
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,
  'Expected '+b+', received '+a);

test('an iid 95% one-sided all-win benchmark needs 598 successes at 99.5%',()=>{
  assert.equal(minZeroLossGames(),598);
  assert.ok(Math.pow(0.995,597)>0.05);
  assert.ok(Math.pow(0.995,598)<=0.05);
  assert.equal(minZeroLossGames(0.995,0.01),919);
});

test('all 32 exact sources and both physical seats: 10 clean wins per cell',()=>{
  const p=balancedAllWinPanel();
  assert.equal(p.cells,64);
  assert.equal(p.games,640);
  assert.equal(p.gamesPerCell,10);
  near(p.allWinNullBound,0.040436324889279666);
  near(p.oneSidedLowerBound,0.9953301063421702);
  assert.equal(p.qualifiesIfAllWins,true);
  assert.equal(p.qualifiesWithAnyUnresolvedOrLoss,false);
  assert.equal(p.assumptions.length,6);
});

test('nine per rank and seat misses 95% confidence',()=>{
  const p=balancedAllWinPanel(32,2,9);
  assert.equal(p.games,576);
  assert.equal(p.qualifiesIfAllWins,false);
  assert.ok(p.allWinNullBound>0.05);
});

test('99% simultaneous full field needs 15 all wins per rank/seat',()=>{
  const p=balancedAllWinPanel(32,2,15,0.995,0.01);
  assert.equal(p.games,960);
  assert.ok(p.allWinNullBound<=0.01);
  assert.ok(balancedAllWinPanel(32,2,14,0.995,0.01)
    .allWinNullBound>0.01);
});

test('all cells meeting 99.5% simultaneously is far more stringent',()=>{
  assert.deepEqual(simultaneousPerCellAllWinPanel(32),{
    cells:32,gamesPerCell:1290,totalGames:41280
  });
  assert.deepEqual(simultaneousPerCellAllWinPanel(64),{
    cells:64,gamesPerCell:1428,totalGames:91392
  });
});

test('29/32 original opponents are never sufficient for full-field scope',()=>{
  const incomplete=balancedAllWinPanel(29,2,10);
  assert.equal(incomplete.opponents,29);
  assert.equal(incomplete.games,580);
  assert.equal(incomplete.qualifiesIfAllWins,false);
  assert.notEqual(incomplete.opponents,32);
});

test('reject invalid probability and zero-opponent panel definitions',()=>{
  assert.throws(()=>minZeroLossGames(1,0.05), {name:'AssertionError'});
  assert.throws(()=>minZeroLossGames(.995,0), {name:'AssertionError'});
  assert.throws(()=>balancedAllWinPanel(0,2,10), {name:'AssertionError'});
  assert.throws(()=>simultaneousPerCellAllWinPanel(0), {name:'AssertionError'});
});
