'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {singletonAccess}=require('../scripts/aichi-snorlax-scoop-access.cjs');
test('exact disjoint direct Cassius and Lele Wonder Tag opening resources',()=>{
  const x=singletonAccess(14,2);
  assert.equal(x.denominator,332682240);
  assert.equal(x.inHandCount,19807788);
  assert.equal(x.leleHandCount,60473490);
  assert.ok(Math.abs(x.inHand-0.05953966163026917)<1e-13);
  assert.ok(Math.abs(x.leleAvailableAndSingletonUnprized-0.16119716678684706)<1e-13);
  assert.ok(Math.abs(x.combined-0.22073682841711623)<1e-13);
});
