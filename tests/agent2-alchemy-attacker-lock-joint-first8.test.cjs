'use strict';
const assert = require('node:assert/strict');
const {attackerLockFirstEight, choose} = require('../simulation/evaluation/agent2-alchemy-attacker-lock-joint-first8.cjs');
/** @param {number} a @param {number} b @param {number} [tolerance] */
function near(a,b,tolerance=1e-10) { assert.ok(Math.abs(a-b)<tolerance, 'Unexpected floating-point result'); }
assert.equal(choose(60,8),2558620845n);
assert.throws(()=>attackerLockFirstEight({shake:2,quick:4}),RangeError);
const expectations = [
  {opts:{shake:3,quick:3},M:0.2012400842493091,B:0.4150397560277045,E:0.5179476939193482,
    V:0.839202912016199, MV:0.14526932320740691, BV:0.32032963432305, EV:0.3961163033359953,
    collision:0.07743590658987435,startB:0.14414800757090118,startBV:0.11303402854494824},
  {opts:{shake:4,quick:2},M:0.237669910512683,B:0.3401388181442946,E:0.4810564588022285,
    V:0.8107510152899495,MV:0.1666686777523687,BV:0.25386157827241433,EV:0.3551466201819768,
    collision:0.07153615291509688,startB:0.14414800757090118,startBV:0.10784915717670724}
];
for(const e of expectations){
  const r=attackerLockFirstEight(e.opts),p=r.conditional;
  near(r.basicValidInitialSeven,0.8093533072892635);
  near(p.muk,e.M);near(p.budew,e.B);near(p.eitherLock,e.E);
  near(p.regidrago,e.V);near(p.mukWithRegidrago,e.MV);
  near(p.budewWithRegidrago,e.BV);near(p.eitherLockWithRegidrago,e.EV);
  near(p.eitherLockRegidragoConnectorCollision,e.collision);
  near(p.budewInitiallyActive,e.startB);
  near(p.budewInitiallyActiveWithRegidrago,e.startBV);
  near(p.mukWithRegidrago+p.budewWithRegidrago-p.bothAlternativesWithRegidrago,p.eitherLockWithRegidrago,1e-14);
  near(p.eitherLockWithRegidrago+p.eitherLockRegidragoConnectorCollision,
    p.eitherLockAndRegidrago,1e-14);
  assert.ok(p.eitherLockWithRegidrago<=p.eitherLock);
  assert.ok(p.eitherLockWithRegidrago<=p.regidrago);
  assert.equal(BigInt(r.exactCounts.valid),337271985613442880n);
}
console.log('Agent2 exact joint attacker / lock first-eight tests passed');
