'use strict';
const assert=require('node:assert/strict');
const {runExperiment}=require('../../scripts/2026-11/agent15-hood-natural-door-under-thorns.cjs');
// 60-card exact physical shuffle with 7 opening, 6 Prizes, T1 + T2 draws.
// A non-Gate Hood line requires a T1 Benched Rider V, T2 evolution VMAX,
// effective Stealthy Hood attached to this Benched VMAX, and a held Psychic.
// Same trial seeds are deliberately independent of policy scenario to pair
// the physical opening deals and the post-T1 exchangeable T2 draw.
const a=runExperiment(2000,28112027,false,false);
const p=runExperiment(2000,28112027,false,true);
const b=runExperiment(2000,28112027,true,false);
const q=runExperiment(2000,28112027,true,true);
assert.equal(a.valid,1730);
assert.equal(a.benched,1484);
assert.equal(a.fully,406);
assert.equal(p.valid,1730);
assert.equal(p.benched,1465);
assert.equal(p.fully,368);
assert.equal(b.valid,1730);
assert.equal(b.benched,1527);
assert.equal(b.fully,413);
assert.equal(q.valid,1730);
assert.equal(q.benched,1508);
assert.equal(q.fully,375);
for(const v of [a,p,b,q]){
 assert.ok(v.fully<=v.benched&&v.benched<=v.valid&&v.valid<=v.n);
 assert.ok(v.doorRate>=0&&v.doorRate<=1);
 assert.ok(v.sourceNoR<=v.initialNoNaturalR);
}
assert.ok(a.fully>p.fully);
assert.ok(b.fully>q.fully);
assert.ok(b.benched>=a.benched);
assert.ok(q.benched>=p.benched);
assert.equal(a.arvenT1Uses,0);
assert.ok(b.arvenT1Uses>0);
console.log('Natural T2 Bench Hood/Underworld Door paired opening regression passed');
