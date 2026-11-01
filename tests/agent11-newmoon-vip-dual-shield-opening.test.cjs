'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const f=require('../scripts/agent11-newmoon-vip-dual-shield-opening.cjs');
test('VIP both-shield exact physical opening',()=>{
 const x=f.eligibleUninterruptedPairSearch();
 assert.ok(Math.abs(x.eligibleInitialSevenConditionalOnValid-0.3015128113312939)<1e-12);
 assert.ok(Math.abs(x.bothShieldPartnersOutOfPrize-0.7844702467343977)<1e-12);
 assert.ok(Math.abs(x.combinedPhysicalEligibility-0.236527829498642)<1e-12);
 assert.equal(x.noGameWinInference,true);
});
