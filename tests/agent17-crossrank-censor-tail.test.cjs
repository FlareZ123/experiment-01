'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {ARCHIVED_CENSORS,selectedCensors}=
  require('../simulation/evaluation/agent17-crossrank-censor-tail.cjs');
const {TRIGGER_IDS}=
  require('../simulation/evaluation/agent17-crossrank-trigger-replay.cjs');

test('all ten and only original action-cap arms are selected',()=>{
  const rows=selectedCensors();
  assert.equal(rows.length,10);
  assert.equal(new Set(rows.map(row=>row.id)).size,10);
  assert(rows.every(row=>row.repeat<=2));
  assert.equal(rows.filter(row=>row.rank===6).length,6);
  assert.equal(rows.filter(row=>row.rank===11).length,4);
  assert(rows.every(row=>!TRIGGER_IDS.includes(row.id)));
  assert.equal(new Set(rows.map(row=>row.seed)).size,8);
});

test('source-candidate attack tallies and original missing activity are retained',()=>{
  assert.deepEqual(ARCHIVED_CENSORS['6:1:A:new-moon-lockbreaker-v1'],
    {turns:46,prizes:[6,6],attacks:[0,0]});
  assert.deepEqual(ARCHIVED_CENSORS['11:2:B:new-moon-lockbreaker-v1'],
    {turns:49,prizes:[6,6],attacks:[0,23]});
  assert.deepEqual(ARCHIVED_CENSORS['6:1:B:champion-reference'],
    {turns:31,prizes:[2,2],attacks:[3,6]});
});
