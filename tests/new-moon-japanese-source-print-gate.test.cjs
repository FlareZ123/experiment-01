'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditFromResources}=require('../scripts/aichi-new-moon-japanese-source-print-gate.cjs');

test('source Japanese card ids and quantities match original 60',()=>{
  const result=auditFromResources();
  assert.equal(result.printedCopies,60);
  assert.equal(result.sourceRows,33);
  assert.equal(result.originalJapaneseCardIdsPresent,true);
  assert.equal(result.namedBannedPrintingCollision,false);
  assert.equal(result.paperLegalityCertified,false);
});
