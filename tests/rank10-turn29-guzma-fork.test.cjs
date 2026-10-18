'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withGuzmaFork}=require('../simulation/twinleaf/rank10-turn29-guzma-fork.cjs');
test('source hook always restores Store and bot prototypes',()=>{
 class Store{dispatch(){}}
 class Bot{decodeNextAction(){}}
 const ds=Store.prototype.dispatch,db=Bot.prototype.decodeNextAction;
 assert.throws(()=>withGuzmaFork({Store,Bot},()=>{
   throw Error('source branch failure');
 },{forceGuzma:true}),/source branch failure/);
 assert.equal(Store.prototype.dispatch,ds);
 assert.equal(Bot.prototype.decodeNextAction,db);
});
