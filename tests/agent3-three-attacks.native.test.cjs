'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {runDevelopment}=require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const m=require('../simulation/evaluation/agent36-issue25-nightwatch-futuresight-v3.cjs');
const {withSourceStampedGetLostOwner}=require('../simulation/twinleaf/agent36-source-stamped-getlost-owner.cjs');
let getLost;
test('frozen four native attempts',()=>{
 const out=m.runNightWatchFutureSightIssue25V3({
  runner:o=>runDevelopment({...o,sourceIndependentCommonPolicy:true}),
  attackLayer:next=>m.withNightWatchAndFutureSightFrontier(()=>{
   const r=withSourceStampedGetLostOwner(next);
   getLost=r.audit;
   return r.result;
  })
 });
 const rows=out.rawDevelopment.rows;
 console.log('AGENT3_THREE_SOURCE_RESULTS',JSON.stringify({
  rows:rows.map(x=>({id:x.trial.id,status:x.status,
   finished:x.finished,winner:x.winner,endReason:x.endReason,
   roots:x.nativeRootActionCount,source:x.sourceDealFingerprint,
   turns:x.verifiedFirstTurn,policy:x.policyAudit?.twoSeatVersion})),
  lost:getLost}));
 assert.equal(rows.length,4);
 assert.equal(out.rawDevelopment.sourceIndependentCommonPolicyOptIn,true);
 assert.equal(out.diagnostic.rawDecoderExecuted,false);
 assert.ok(getLost?.acceptedStoreActions>=1);
 assert.equal(out.manifest.releaseQualified,false);
});
