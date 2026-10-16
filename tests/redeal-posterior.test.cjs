'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,prizeRedealPosterior}=require('../simulation/twinleaf/redeal-posterior.cjs');

/** @param {string[]} deck @param {number} n @returns {string[][]} */
function subsets(deck,n) {
  if(n===0)return [[]];
  if(deck.length<n)return [];
  return [...subsets(deck.slice(1),n-1).map(xs=>[deck[0],...xs]),
    ...subsets(deck.slice(1),n)];
}

test('exact combinatorial coefficients',()=>{
  assert.equal(choose(60,6),50063860n);
  assert.equal(choose(7,3),35n);
  assert.equal(choose(7,8),0n);
  assert.equal(choose(0,0),1n);
});

test('independent exhaustive seven-card posterior',()=>{
  const deck=['X','X','A','B','C','D','E'];
  const counts=[0,0,0];
  const selections=subsets(deck,3);
  assert.equal(selections.length,35);
  for(const subset of selections)counts[subset.filter(x=>x==='X').length]++;
  const result=prizeRedealPosterior({
    deckCardNames:deck,previousPrizeNames:['X','Y','Z'],
    targetName:'X',uniformUnknownOrder:true});
  assert.deepEqual(result.distribution.map(x=>Number(x.numerator)),counts);
  assert.equal(result.returnedToDeckBottom,1);
  assert.equal(result.anyNewPrizeProbability,(35-counts[0])/35);
});

test('a known old Prized singleton returns to bottom and avoids immediate new Prizes',()=>{
  const result=prizeRedealPosterior({
    deckCardNames:Array(46).fill('Other'),
    previousPrizeNames:['DCE',...Array(5).fill('Old')],
    targetName:'DCE',uniformUnknownOrder:true});
  assert.equal(result.anyNewPrizeProbability,0);
  assert.equal(result.returnedToDeckBottom,1);
  assert.deepEqual(result.distribution.map(x=>x.copies),[0]);
});

test('one of 46 previously decked copies has six-in-46 new Prize risk',()=>{
  const result=prizeRedealPosterior({
    deckCardNames:['Target',...Array(45).fill('Other')],
    previousPrizeNames:Array(6).fill('Old'),
    targetName:'Target',uniformUnknownOrder:true});
  assert.ok(Math.abs(result.anyNewPrizeProbability-6/46)<1e-12);
  assert.ok(Math.abs(result.expectedCopies-6/46)<1e-12);
});

test('unknown order must be certified and redeal cannot exceed deck',()=>{
  const input={deckCardNames:['X'],previousPrizeNames:['Y'],
    targetName:'X',uniformUnknownOrder:false};
  assert.throws(()=>prizeRedealPosterior(input),/Uniformly unknown/);
  assert.throws(()=>prizeRedealPosterior({...input,
    uniformUnknownOrder:true,previousPrizeNames:['Y','Z']}),/Too few deck/);
});

test('unknown singleton has identical marginal Prize risk before and after a blind redeal',()=>{
  const names=['X','A','B','C','D','E'];
  const oldPrizePartitions=subsets(names,2);
  assert.equal(oldPrizePartitions.length,15);
  let before=0,after=0;
  for(const old of oldPrizePartitions){
    const deck=names.filter(name=>!old.includes(name));
    const model=prizeRedealPosterior({deckCardNames:deck,
      previousPrizeNames:old,targetName:'X',uniformUnknownOrder:true});
    before+=Number(old.includes('X'));
    after+=model.anyNewPrizeProbability;
  }
  assert.equal(before/oldPrizePartitions.length,1/3);
  assert.equal(after/oldPrizePartitions.length,1/3);
});
