'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {evaluateCounts,evaluate,run}=require('../simulation/evaluation/agent33-rank29-firstturn-tagcall-ghala-envelope.cjs');
const original={basic:4,tag:2,supporter:2,dce:1,thunder:1};
test('original source and exact first-turn counts',()=>{
 const r=run();
 assert.deepEqual(r.sourceCounts,original);
 assert.equal(r.denominator,'166478632771651200');
 assert.equal(r.connectorNumerator,'54789632330677440');
 assert.equal(r.unionNumerator,'56238988836673440');
 assert.ok(Math.abs(r.unionOfConnectorAndDirectGivenLegalOpening-
   0.3378150571059356)<1e-12);
 assert.equal(r.qualifiedGames,0);
});
test('held and Tag paths partition connector, direct overlaps correctly',()=>{
 const r=evaluateCounts(original);
 assert.equal(BigInt(r.heldSupporterNumerator)+BigInt(r.tagSearchNumerator),
   BigInt(r.connectorNumerator));
 assert.ok(r.unionOfConnectorAndDirectGivenLegalOpening>
   r.connectorResourceAvailabilityGivenLegalOpening);
 assert.ok(r.unionOfConnectorAndDirectGivenLegalOpening<
   r.connectorResourceAvailabilityGivenLegalOpening+
   r.directBothResourcesHeldGivenLegalOpening);
});
test('structural slot sensitivity and source drift',()=>{
 const r=evaluateCounts(original);
 const moreTag=evaluateCounts({...original,tag:3});
 const moreGH=evaluateCounts({...original,supporter:3});
 assert.ok(moreTag.unionOfConnectorAndDirectGivenLegalOpening>
   r.unionOfConnectorAndDirectGivenLegalOpening);
 assert.ok(moreGH.unionOfConnectorAndDirectGivenLegalOpening>
   moreTag.unionOfConnectorAndDirectGivenLegalOpening);
 assert.ok(Math.abs(moreTag.unionOfConnectorAndDirectGivenLegalOpening-
   0.39773278747394625)<1e-12);
 assert.throws(()=>evaluateCounts({...original,tag:5}));
 assert.throws(()=>evaluate({decks:[]}));
});
