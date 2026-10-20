'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {validAttachEnergyTargets}=require('../simulation/twinleaf/attach-energy-targets.cjs');
test('distinct recipient constraint',()=>{
 const a={player:2,slot:2,index:0},b={player:2,slot:2,index:1};
 const pool=[{target:a},{target:b}],one={provides:['LIGHTNING']},two={provides:['LIGHTNING']};
 assert.equal(validAttachEnergyTargets([{card:one,to:a},{card:two,to:b}],pool,{differentTargets:true}),true);
 assert.equal(validAttachEnergyTargets([{card:one,to:a},{card:two,to:{...a}}],pool,{differentTargets:true}),false);
 assert.equal(validAttachEnergyTargets([{card:one,to:a}],pool,{blockedTo:[{...a}]}),false);
});
test('differentTypes cannot be bypassed through a card-type restriction',()=>{
 const a={player:2,slot:2,index:0},b={player:2,slot:2,index:1};
 const pool=[{target:a},{target:b}];
 const e1={provides:['LIGHTNING']},e2={provides:['LIGHTNING']};
 assert.equal(validAttachEnergyTargets([{card:e1,to:a},{card:e2,to:b}],pool,
   {differentTypes:true,validCardTypes:['LIGHTNING']}),false);
 assert.equal(validAttachEnergyTargets([{card:e1,to:a},{card:e2,to:b}],pool,
   {sameTarget:true,validCardTypes:['LIGHTNING']}),false);
});
test('invalid and outside-player locations fail with real target geometry',()=>{
 const a={player:2,slot:2,index:0},pool=[{target:a}],e={provides:['LIGHTNING']};
 assert.equal(validAttachEnergyTargets([{card:e,to:{player:1,slot:2,index:0}}],pool),false);
 assert.equal(validAttachEnergyTargets([{card:e,to:{player:2,slot:2,index:4}}],pool),false);
 assert.equal(validAttachEnergyTargets([{}],pool),false);
 assert.equal(validAttachEnergyTargets(null,pool),false);
});
