'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {originalFieldLossBudget,FIELD_SIZE,DEFAULT_TARGET}=
  require('../simulation/evaluation/agent33-field-loss-budget.cjs');

/** @param {number[]} ranks @param {number} lower @param {number} [upper] */
function originals(ranks,lower=1,upper=lower){
  return ranks.map(rank=>({rank,exactOriginal60:true,lower,upper}));
}
const all=Array.from({length:FIELD_SIZE},(_,i)=>i+1);

test('target .995 allocates 0.16 summed rank-level loss budget',()=>{
 const result=originalFieldLossBudget(originals(all));
 assert.equal(result.fieldSize,32);
 assert.equal(result.target,DEFAULT_TARGET);
 assert.ok(Math.abs(result.totalLossBudget-0.16)<1e-12);
 assert.equal(result.minimumFieldMean,1);
 assert.equal(result.maximumFieldMean,1);
 assert.equal(result.mathematicallyGuaranteedByAssumedLowerBounds,true);
});
test('one 80% matchup makes target unattainable even if all others perfect',()=>{
 const r=originals(all).map(x=>x.rank===13?{...x,lower:.8,upper:.8}:x);
 const result=originalFieldLossBudget(r);
 assert.ok(Math.abs(result.maximumFieldMean-.99375)<1e-12);
 assert.equal(result.mathematicallyImpossibleEvenAtOptimisticBounds,true);
});
test('at exact 84% one bad matchup exhausts all 0.16 loss budget',()=>{
 const r=originals(all).map(x=>x.rank===7?{...x,lower:.84,upper:.84}:x);
 const result=originalFieldLossBudget(r);
 assert.ok(Math.abs(result.minimumFieldMean-.995)<1e-12);
 assert.equal(result.mathematicallyImpossibleEvenAtOptimisticBounds,false);
});
test('29 exact originals leave ranks23/25/28 unknown even if all known are perfect',()=>{
 const known=all.filter(rank=>![23,25,28].includes(rank));
 const b=originalFieldLossBudget(originals(known));
 assert.deepEqual(b.unknownOriginalRanks,[23,25,28]);
 assert.equal(b.exactOriginalSourceCount,29);
 assert.ok(Math.abs(b.minimumFieldMean-29/32)<1e-12);
 assert.equal(b.maximumFieldMean,1);
 assert.ok(Math.abs(b.uncertaintyWidth-3/32)<1e-12);
 assert.ok(Math.abs(b.minimumMissingMeanRequiredOptimistically-
   (32*.995-29)/3)<1e-12);
 assert.equal(b.mathematicallyGuaranteedByAssumedLowerBounds,false);
 assert.equal(b.mathematicallyImpossibleEvenAtOptimisticBounds,false);
});
test('missing original ranks cannot be laundered through archetype proxies',()=>{
 const r=originals(all.filter(x=>x!==25));
 assert.throws(()=>originalFieldLossBudget([...r,{
   rank:25,exactOriginal60:false,lower:1,upper:1
 }]),/Proxy cannot certify/);
 const result=originalFieldLossBudget([...r,{
   rank:25,exactOriginal60:false
 }]);
 assert.deepEqual(result.unknownOriginalRanks,[25]);
});
test('unknown interval is never treated as certified or independent evidence',()=>{
 const r=originals(all);
 r[0]={rank:1,exactOriginal60:true,lower:.88,upper:1};
 const b=originalFieldLossBudget(r);
 assert.ok(Math.abs(b.uncertaintyWidth-.12/32)<1e-12);
 assert.equal(b.mathematicallyGuaranteedByAssumedLowerBounds,false);
 assert.equal(b.mathematicallyImpossibleEvenAtOptimisticBounds,false);
 assert.equal(b.qualifiedCompetitiveGames,0);
});
test('rank uniqueness, range and interval validation fail closed',()=>{
 assert.throws(()=>originalFieldLossBudget([
   {rank:1,exactOriginal60:true,lower:.8,upper:1},
   {rank:1,exactOriginal60:true,lower:.9,upper:1}
 ]),/Duplicate/);
 assert.throws(()=>originalFieldLossBudget([
   {rank:33,exactOriginal60:true,lower:0,upper:1}
 ]));
 assert.throws(()=>originalFieldLossBudget([
   {rank:4,exactOriginal60:true,lower:.8,upper:.7}
 ]),/valid independently justified/);
 assert.throws(()=>originalFieldLossBudget([], {target:1.1}));
});

test('supplied exact Aichi original roster is 29 source 60s with specific missing ranks',()=>{
 const roster=require('../results/aichi-2026/full-decklists.json');
 const known=roster.decks.map(deck=>{
   assert.equal(deck.cards.reduce((sum,c)=>sum+c.count,0),60);
   return {rank:deck.rank,exactOriginal60:true,lower:0,upper:1};
 });
 const b=originalFieldLossBudget(known);
 assert.equal(b.exactOriginalSourceCount,29);
 assert.deepEqual(b.unknownOriginalRanks,[23,25,28]);
 assert.equal(b.mathematicallyGuaranteedByAssumedLowerBounds,false);
 assert.equal(b.mathematicallyImpossibleEvenAtOptimisticBounds,false);
});
