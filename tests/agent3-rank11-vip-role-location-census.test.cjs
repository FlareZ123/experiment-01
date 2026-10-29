'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {exactRoleLocationProfile}=require('../scripts/agent3-rank11-vip-role-location-census.cjs');

test('original rank11 three-stage first-turn VIP role location split',()=>{
  const p=exactRoleLocationProfile();
  assert.equal(p.valid,324031005021884160n);
  assert.equal(p.qualified,128839931052296972n);
  assert.deepEqual(p.roleSeen,{
    neither:50275816659822968n,
    megaOnly:44735432131911724n,
    trubbishOnly:23435278273089704n,
    both:10393403987472576n
  });
  assert.ok(Math.abs(p.conditionalAmongVipWindows.neither-
    0.3902192142544355)<1e-12);
  assert.ok(Math.abs(Object.values(p.conditionalAmongVipWindows)
    .reduce((a,b)=>a+b,0)-1)<1e-12);
});
