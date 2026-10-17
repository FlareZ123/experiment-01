'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {jointOpening}=require('../scripts/new-moon-meloetta-joint-resource.cjs');
test('joint probabilities',()=>{
  const x=jointOpening(path.resolve(__dirname,'..'));
  assert.ok(Math.abs(x.simultaneousMulliganMass-1)<1e-12);
  assert.ok(Math.abs(x.soleKlefki-0.01615458199593612)<1e-12);
  assert.ok(Math.abs(x.combined-0.0045725608244355)<1e-12);
});
