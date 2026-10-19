'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/rank11-hidden-hand-action-choice.cjs');
test('hidden-source-hand alternative leaves acting player observation equal',()=>{const x=run();assert.equal(x.sourceCards,60);assert.equal(x.pairs,12);assert.equal(x.rows.length,12);assert.equal(x.reversals,6);assert.equal(x.reversals,x.rows.filter(r=>r.changed).length);assert.equal(x.sampledChoices.length,2);assert.equal(x.sampledChoices[0],x.sampledChoices[1]);assert.equal(x.sampledRows.length,12);assert.equal(x.sampledReversals,0,'All 12 observation-equivalent attack choices must match under blind sampling');});
