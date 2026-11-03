'use strict';
const assert=require('node:assert/strict');
const {choose,jointOpeningOpportunities}=require('../simulation/evaluation/agent2-alchemy-two-axis-joint-first8.cjs');
/** @param {number} a @param {number} b @param {number} [tol] */
function near(a,b,tol=1e-10){assert.ok(Math.abs(a-b)<tol,`${a} !== ${b}`);}
assert.equal(choose(60,8),2558620845n);
assert.throws(()=>jointOpeningOpportunities({shake:2,quick:4}),RangeError);
const expected=[
 [{shake:3,quick:3},0.2012400842,0.4150397560,0.5179476939,0.0304813274],
 [{shake:4,quick:2},0.2376699105,0.3401388181,0.4810564588,0.0288514461]
];
for(const [opts,muk,budew,either,conflict] of expected){
 const r=jointOpeningOpportunities(opts),p=r.conditional;
 near(r.basicValidInitialSeven,0.809353307289);
 near(p.muk,muk);near(p.budew,budew);near(p.either,either);near(p.quickContendedBoth,conflict);
 near(p.muk+p.budew-p.both,p.either,1e-14);
 near(p.both,p.compatibleBoth+p.quickContendedBoth,1e-14);
 near(p.muk+p.budewOnly+p.neither,1,1e-14);
 near(p.muk,p.directGrimerMuk+p.searchedGrimerMuk,1e-14);
 near(p.budew,p.directBudew+p.searchedBudew,1e-14);
 assert.equal(BigInt(r.exactCounts.valid),BigInt(r.exactCounts.mukOnly)
  +BigInt(r.exactCounts.budewOnly)+BigInt(r.exactCounts.both)+BigInt(r.exactCounts.neither));
}
process.stdout.write('Exact two-axis opening eight joint census passed\n');
