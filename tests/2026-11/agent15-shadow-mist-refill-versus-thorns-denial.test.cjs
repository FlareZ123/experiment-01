'use strict';
const assert=require('node:assert/strict');
const {mistRefillScreen}=require('../../scripts/2026-11/agent15-shadow-mist-refill-versus-thorns-denial.cjs');
const r=mistRefillScreen(2000,28112031);
assert.equal(r[6].both,669);assert.equal(r[6].mist,273);
assert.equal(r[6].refill,202);assert.equal(r[6].sourceStrip,176);
assert.equal(r[24].both,663);assert.equal(r[24].mist,277);
assert.equal(r[24].refill,227);assert.equal(r[24].sourceStrip,163);
assert.equal(r[29].both,674);assert.equal(r[29].mist,307);
assert.equal(r[29].refill,224);assert.equal(r[29].sourceStrip,177);
for(const rank of [6,24,29]){
 const x=r[rank];
 assert.ok(x.refill<=x.mist && x.sourceStrip<=x.mist && x.sourceGust<=x.mist);
 assert.equal(x.jointStripAndRefill+x.jointStripAndDry,x.sourceStrip);
 assert.ok(x.jointStripAndRefill<=x.refill);
 assert.ok(x.jointGustAndRefill<=x.refill);
}
assert.equal(r[24].sourceHammerExpected,0);
assert.ok(r[6].sourceHammerExpected>0);
assert.ok(r[29].sourceHammerExpected>0);
console.log('Two-turn Shadow Mist attachment refill and source denial access checks passed');
