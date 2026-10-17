'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {runMatrix} = require('../simulation/twinleaf/wobbuffet-vileplume-stoutland-matrix.cjs');

test('actual Store enforces Hood-dependent dual-lock under Active Wobbuffet and Benched Latias', () => {
  const report = runMatrix();
  assert.equal(report.schema, 'aichi-2-vs-10-staged-wobbuffet-hood-lock-v1');
  assert.equal(report.rows.length, 4);
  assert.equal(report.qualifiedForCompetitiveInference, false);
  for (const row of report.rows) {
    assert.equal(row.abilities.bideBarricade, true);
    assert.equal(row.abilities.skyliner, true);
    assert.equal(row.abilities.sentinel, row.stoutlandHood);
    assert.equal(row.abilities.irritatingPollen, row.vileplumeHood);
    assert.equal(row.item.accepted, !row.vileplumeHood);
    assert.equal(row.supporter.accepted, !row.stoutlandHood);
  }
});

test('retreat restores both locks',()=>{ const r=require('../simulation/twinleaf/wobbuffet-vileplume-stoutland-matrix.cjs').retreatWindow(); assert.equal(r.after.sentinel,true); assert.equal(r.after.irritatingPollen,true); });
