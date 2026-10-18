'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withOnePrizeRetreat}=require('../simulation/twinleaf/rank10-turn29-one-prize-retreat.cjs');
test('restores intercepted prototypes on failure',()=>{
 class Store{dispatch(){}}
 class Bot{decodeNextAction(){}}
 const before=Store.prototype.dispatch;
 assert.throws(()=>withOnePrizeRetreat({Store,Bot},()=>{throw Error('failed');},true),/failed/);
 assert.equal(Store.prototype.dispatch,before);
});
