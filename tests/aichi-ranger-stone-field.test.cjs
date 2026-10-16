'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {fieldReport}=require('../scripts/aichi-ranger-stone-field.cjs');

test('published rank-4/5 Ranger + Forest Seal Stone source identities and restricted access',()=>{
  const report=fieldReport();
  assert.deepEqual(report.map(x=>x.rank),[4,5]);
  assert.deepEqual(report.map(x=>({
    basics:x.profile.basics, lele:x.profile.lele,
    eligibleBasicV:x.profile.shadowV,
    ranger:x.profile.ranger,stone:x.profile.stone
  })),[
    {basics:13,lele:1,eligibleBasicV:3,ranger:1,stone:1},
    {basics:11,lele:0,eligibleBasicV:9,ranger:1,stone:1}
  ]);
  const [raichu,mew]=report.map(x=>x.windows[2].rates);
  assert.ok(Math.abs(raichu.either-0.2920169)<1e-7);
  assert.ok(Math.abs(mew.either-0.2444151)<1e-7);
  assert.equal(mew.wonderOnly,0);
  assert.equal(mew.bothSearch,0);
  assert.ok(mew.stoneOnly > raichu.stoneOnly);
  for(const row of report){
    for(const window of row.windows){
      const x=window.rates;
      assert.ok(Math.abs(x.either-(x.direct+x.wonderOnly+x.stoneOnly+x.bothSearch))<1e-12);
    }
  }
});
