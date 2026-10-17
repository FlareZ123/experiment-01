'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {runMatrix} = require('../simulation/twinleaf/wobbuffet-garbotoxin-field-boundary.cjs');

test('Psychic Garbotoxin survives Bide Barricade on rank-8 and rank-11 source printings',()=>{
  const x=runMatrix();
  assert.equal(x.rows.length,4);
  assert.equal(x.qualifiedForCompetitiveInference,false);
  for(const row of x.rows) {
    assert.equal(row.abilityStatus.garbotoxin,true);
    assert.equal(row.abilityStatus.bideBarricade,!row.attachedTool);
    assert.equal(row.abilityStatus.skyliner,!row.attachedTool);
  }
});
