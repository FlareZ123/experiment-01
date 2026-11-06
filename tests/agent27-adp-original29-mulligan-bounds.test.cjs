'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {AXES,main}=require('../simulation/evaluation/agent27-adp-original29-mulligan-bounds.cjs');
const close=(x,y)=>assert.ok(Math.abs(x-y)<1e-11,`Expected ${y}, got ${x}`);
test('fixed source two-party mulligan weighting preserves all 29 originals',()=>{
 const out=main();
 assert.equal(out.originals,29);
 assert.deepEqual(out.missingRanks,[23,25,28]);
 assert.equal(out.rows.filter(r=>r.basicCopies===4).length,3);
 close(out.bonusFrequency.any,0.1439448732010315);
 close(out.bonusFrequency.exactlyOne,0.09759562939962944);
 close(out.bonusFrequency.twoOrMore,0.046349243801402054);
 close(out.equallyWeighted.mechanical.lower,0.3857236439522212);
 close(out.equallyWeighted.mechanical.upper,0.4125662917576017);
 for(const axis of AXES)for(const row of out.rows){
  const b=row.axes[axis];
  assert.ok(b.lower<=b.upper&&b.lower>=b.noBonus&&b.upper<=1);
 }
});
