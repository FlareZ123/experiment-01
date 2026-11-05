'use strict';
const assert=require('node:assert/strict');
const VERSION='agent19-independent-seat-rng-v1';
/** @template T @param {()=>T} execute @param {{headless?:{runMatch:Function}}} [deps] */
function withIndependentSeatRng(execute,deps={}){
  assert.equal(typeof execute,'function');
  const headless=deps.headless??require('./headless.cjs');
  const original=headless.runMatch;
  assert.equal(typeof original,'function');
  let count=0;
  function isolated(request){
    count++;
    return original({...request,isolatePhysicalShuffleRandomness:true,isolatePolicyRandomness:true});
  }
  headless.runMatch=isolated;
  try{return {result:execute(),audit:{version:VERSION,matches:count,paperQualified:false}};}
  finally{assert.equal(headless.runMatch,isolated);headless.runMatch=original;}
}
module.exports={VERSION,withIndependentSeatRng};
