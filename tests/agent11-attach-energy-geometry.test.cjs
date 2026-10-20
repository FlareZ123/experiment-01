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
