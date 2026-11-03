'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {ownerHandDiscardPareto}=require(
  '../../simulation/twinleaf/planning/owner-hand-discard-pareto.cjs');

test('Regidrago Quick Ball preserves both donor payoff and dead-item tradeoff',()=>{
 const p=ownerHandDiscardPareto({
  hand:['Quick Ball FST','Dragapult ex TWM','Regidrago VSTAR SIT',
    'Double Dragon Energy ROS','Battle VIP Pass FST'],
  sourceIndex:0,cost:1,
  protectedIndices:new Set([2,3]),
  deadIndices:new Set([4]),
  desiredDiscardPrintings:new Set(['Dragapult ex TWM'])
 });
 assert.equal(p.possibleFirstPaymentCount,'4');
 assert.equal(p.noFirstPaymentAvailable,false);
 const f=p.structurallyUndominatedPaymentGroups;
 assert.equal(f.length,2);
 assert.ok(f.some(x=>x.representativePaymentIndices[0]===1&&
   x.vector.distinctDesiredDiscardPrintings===1));
 assert.ok(f.some(x=>x.representativePaymentIndices[0]===4&&
   x.vector.deadCardsSpent===1));
 assert.ok(f.every(x=>x.vector.protectedSacrificed===0));
 assert.equal(p.strategicOptimalityCertified,false);
});

test('distinct attack donors stay separately accessible on the frontier',()=>{
 const p=ownerHandDiscardPareto({
  hand:['Quick Ball FST','Dragapult ex TWM','Noivern ex PAL',
    'Regidrago VSTAR SIT'],
  sourceIndex:0,cost:1,protectedIndices:new Set([3]),
  desiredDiscardPrintings:new Set(['Dragapult ex TWM','Noivern ex PAL'])
 });
 const targets=p.structurallyUndominatedPaymentGroups.map(x=>
   x.distinctDesiredTargets[0]).sort();
 assert.deepEqual(targets,['Dragapult ex TWM','Noivern ex PAL']);
 assert.equal(p.possibleFirstPaymentCount,'3');
});

test('reserve a future Trainer; sacrificing protection can preserve future payment',()=>{
 const p=ownerHandDiscardPareto({
  hand:['Quick Ball FST','Dragapult ex TWM','Noivern ex PAL',
    'Battle VIP Pass FST','Secret Box TWM','Regidrago VSTAR SIT'],
  sourceIndex:0,cost:1,reservedIndices:new Set([4]),
  protectedIndices:new Set([5]),
  desiredDiscardPrintings:new Set(['Dragapult ex TWM','Noivern ex PAL']),
  deadIndices:new Set([3]),nextHandDiscardCost:3
 });
 assert.equal(p.possibleFirstPaymentCount,'4');
 const f=p.structurallyUndominatedPaymentGroups;
 assert.ok(f.some(x=>x.vector.protectedSacrificed===1&&
   x.vector.nextUnprotectedPaymentWays==='1'));
 assert.ok(f.some(x=>x.vector.protectedSacrificed===0&&
   x.vector.nextUnprotectedPaymentWays==='0'));
 assert.ok(f.every(x=>!x.representativePaymentIndices.includes(4)));
});

test('structural payment absence is reported, not invented as a legal play',()=>{
 const p=ownerHandDiscardPareto({
  hand:['Secret Box TWM','Regidrago VSTAR SIT','Grass Energy MEE'],
  sourceIndex:0,cost:3
 });
 assert.equal(p.possibleFirstPaymentCount,'0');
 assert.equal(p.noFirstPaymentAvailable,true);
 assert.deepEqual(p.structurallyUndominatedPaymentGroups,[]);
});

test('all physical indices accounted for exactly without hidden cards',()=>{
 const p=ownerHandDiscardPareto({
  hand:['Secret Box TWM','A','B','C','D','E','F'],
  sourceIndex:0,cost:3,deadIndices:new Set([1,2,3])
 });
 assert.equal(p.possibleFirstPaymentCount,'20');
 const grouped=p.structurallyUndominatedPaymentGroups;
 assert.ok(grouped.length>=1);
 assert.ok(grouped.some(x=>x.vector.deadCardsSpent===3));
 assert.throws(()=>ownerHandDiscardPareto({
  hand:['Secret Box TWM'],sourceIndex:0,cost:1,
  reservedIndices:new Set([0])
 }),/implicitly reserved/);
});
