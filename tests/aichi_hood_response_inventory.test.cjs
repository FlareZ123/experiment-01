'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditHoodResponses,exactAnswerAccess} =
  require('../scripts/aichi_hood_response_inventory.cjs');

test('published 29-list Hood-response inventory is complete and count-based', () => {
  const report = auditHoodResponses();
  assert.equal(report.sourceDeckCount,29);
  assert.deepEqual(report.missingSourceRanks,[23,25,28]);
  assert.equal(report.withAtLeastOneNamedHardRemoval,20);
  assert.deepEqual(report.withNoNamedHardRemoval,[4,9,11,15,16,17,18,26,27]);
  assert.equal(report.rows.every(row =>
    row.totalHardRemovalCopies === Object.values(row.namedToolRemoval)
      .reduce((sum,n)=>sum+n,0)),true);
});

test('all Thorns and half Garbodor source lists carry the named hard-answer package', () => {
  const rows = new Map(auditHoodResponses().rows.map(r=>[r.rank,r]));
  for(const rank of [6,24]) {
    const row=rows.get(rank);
    assert.equal(row.initialBasicCount,4);
    assert.equal(row.namedToolRemoval.Faba,1);
    assert.equal(row.namedToolRemoval['Megaton Blower'],1);
    assert.equal(row.totalHardRemovalCopies,2);
    assert.ok(Math.abs(row.directNineCardRemovalAccessConditionalBasic -
      0.258945779337443) < 1e-10);
  }
  assert.equal(rows.get(29).totalHardRemovalCopies,3);
  assert.ok(Math.abs(rows.get(29).directNineCardRemovalAccessConditionalBasic -
    0.36481460309164226)<1e-10);
  assert.equal(rows.get(8).namedToolRemoval['Field Blower'],1);
  assert.equal(rows.get(22).namedToolRemoval['Field Blower'],1);
  assert.equal(rows.get(11).totalHardRemovalCopies,0);
  assert.equal(rows.get(16).totalHardRemovalCopies,0);
});

test('restricted printed-answer access is bounded and monotone', () => {
  for (let basics=1;basics<=20;basics++) {
    let prior=0;
    for (let answer=0;answer<=8;answer++) {
      const value=exactAnswerAccess(basics,answer);
      assert.ok(value>=0 && value<=1);
      assert.ok(value>=prior);
      prior=value;
    }
  }
  assert.equal(exactAnswerAccess(4,0),0);
  assert.throws(()=>exactAnswerAccess(0,2),/Invalid/);
  assert.throws(()=>exactAnswerAccess(59,2),/Invalid/);
});
