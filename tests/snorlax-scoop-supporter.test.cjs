'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {probeAll}=require('../simulation/twinleaf/snorlax-scoop-supporter.cjs');
test('root Store characterizes proposed non-retreat Active removal',()=>{
  const report=probeAll();
  assert.equal(report.sourceDeckMatch,false);
  assert.equal(report.competitiveInferenceQualified,false);
  assert.equal(report.cases.length,4);
  for(const x of report.cases){
    assert.ok(Array.isArray(x.prompts));
    assert.equal(typeof x.activeAfter,'string');
    assert.equal(typeof x.supporterDiscarded,'boolean');
  }
});
