'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {registeredPairs}=
  require('../simulation/twinleaf/regidrago-ball-dragon-cost-registered-panel.cjs');

test('sixteen immutable physical seat and seed pairs are exactly registered',()=>{
  const rows=registeredPairs();
  assert.equal(rows.length,16);
  assert.deepEqual(rows.map(row=>row.seat),
    [...Array(8).fill('A'),...Array(8).fill('B')]);
  assert.deepEqual(rows.map(row=>row.seed),[
    2702931450,660363063,253175655,264538979,3744887656,
    3729853389,2760456509,1440488303,1717868401,2791159342,
    3138887417,993084810,1278080764,2968070840,2651059650,
    4278731837
  ]);
  assert.equal(new Set(rows.map(row=>row.seed)).size,16);
  assert.ok(rows.every(row=>Number.isSafeInteger(row.seed)&&
    row.seed>=0&&row.seed<=0xffffffff));
  assert.ok(rows.every(row=>Number.isInteger(row.repeat)&&
    row.repeat>=0&&row.repeat<8));
});
