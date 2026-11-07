'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {starAlchemyOpening}=require('../scripts/agent6-copycat-star-alchemy-opening.cjs');

/** @param {number} a @param {number} b */
function near(a,b) {assert.ok(Math.abs(a-b)<1e-12,'actual '+a+' expected '+b);}
const cases=[
  {B:14,V:3, direct:0.005861397951390492, base:0.143832822930647,
    sealHeld:0.016447525023453615, sealMissingV:0.010586127072063124,
    sealPrized:0.012699368096966165},
  {B:14,V:4,direct:0.0074699046266298585,base:0.143832822930647,
    sealHeld:0.016447525023453615,sealMissingV:0.008977620396823758,
    sealPrized:0.012699368096966165},
  {B:15,V:4,direct:0.007291389521243119,base:0.14421847736619808,
    sealHeld:0.016575776043910244,sealMissingV:0.009284386522667127,
    sealPrized:0.012726044321092178}
];
for(const {B,V,direct,base,sealHeld,sealMissingV,sealPrized} of cases) {
 test('exact four named cards plus V presence B='+B+' V='+V,()=>{
  const r=starAlchemyOpening({basicCount:B,shadowRiderVCopies:V});
  near(r.singleCorePrizeBallDeck,base);
  near(r.directSealVPhysicalOpening,direct);
  near(r.sealInOpeningHand,sealHeld);
  near(r.sealInHandWithoutV,sealMissingV);
  near(r.sealPrized,sealPrized);
  near(r.sealInOpeningHand,r.directSealVPhysicalOpening+r.sealInHandWithoutV);
  near(r.directFractionAmongBallDeck,direct/base);
 });
}
test('more V copies improves fixed-B direct physical opportunity',()=>{
 const low=starAlchemyOpening({basicCount:14,shadowRiderVCopies:3});
 const high=starAlchemyOpening({basicCount:14,shadowRiderVCopies:4});
 assert.ok(high.directSealVPhysicalOpening>low.directSealVPhysicalOpening);
});
test('bad category configuration throws',()=>{
 for(const opts of [
  {basicCount:14,shadowRiderVCopies:0},
  {basicCount:14,shadowRiderVCopies:5},
  {basicCount:4,shadowRiderVCopies:4},
  {basicCount:59,shadowRiderVCopies:4},
  {basicCount:14.2,shadowRiderVCopies:4}
 ])assert.throws(()=>starAlchemyOpening(opts));
});
