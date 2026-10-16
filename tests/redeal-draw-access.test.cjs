'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {afterRedealDrawProbability}=require('../simulation/twinleaf/redeal-draw-access.cjs');
function run(k,r,t){return afterRedealDrawProbability({
 deck:[...Array(k).fill('X'),...Array(46-k).fill('O')],
 oldPrizes:[...Array(r).fill('X'),...Array(6-r).fill('O')],
 target:'X',drawCount:t,unknownUniformOrder:true});}
test('originally Prized singleton is at bottom until 40 draws',()=>{
 assert.equal(run(0,1,40).probability,0);
 assert.equal(run(0,1,41).probability,1/6);
 assert.equal(run(0,1,46).probability,1);
});
test('formerly decked singleton has exact one-in-46 first-draw access',()=>{
 assert.equal(run(1,0,1).probability,1/46);
 assert.equal(run(1,0,40).probability,40/46);
 assert.equal(run(1,0,46).probability,40/46);
});
test('no draw yields zero and uncertainty precondition is mandatory',()=>{
 assert.equal(run(1,1,0).probability,0);
 assert.throws(()=>afterRedealDrawProbability({
  deck:[],oldPrizes:[],target:'X',drawCount:0}),/Unknown uniform/);
});
