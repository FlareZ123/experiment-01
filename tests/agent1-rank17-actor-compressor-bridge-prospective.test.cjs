'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {runExperiment}=
 require('../simulation/evaluation/agent1-rank17-actor-compressor-bridge-prospective.cjs');
const seeds=[725554645,1648575463,1505670861,2143415530,
 1965282964,2208314832,194900276,4010383176];
const setup={source:{},reg:{schema:'test',enginePin:'test',
 prospectiveSeedGroups:seeds,prospectiveSourceSeats:[0,1],
 retrospectivePositiveControl:[
  {seed:2443530385,sourceSeat:0},
  {seed:1246820961,sourceSeat:0},
  {seed:3029174418,sourceSeat:0}
 ]}};
/** @param {object} ignored @param {number} seed @param {0|1} seat
 * @param {boolean} enabled */
function fake(_ignored,seed,seat,enabled){
 const prior=[2443530385,1246820961,3029174418].includes(seed);
 return {error:null,deckAHash:'A',deckBHash:'B',
  fullPhysicalDealHash:seed+':'+seat,actualStarterSeat:seat,
  allNativeRootActions:[{action:'PassTurnAction'}],
  sourceCompressorRoots:prior&&enabled?[{card:'Battle Compressor'}]:[],
  bridge:enabled?{proposed:prior?1:0,rejected:0}:null};
}
test('19 real registered source pairs in separate cohorts',()=>{
 const r=runExperiment(fake,setup);
 assert.equal(r.attemptedNativeArms,38);
 assert.equal(r.completePairs,19);
 assert.equal(r.physicalMatchedPairs,19);
 assert.equal(r.knownPositiveAcceptedItems,3);
 assert.equal(r.prospectiveAcceptedItems,0);
 assert.equal(r.knownPositiveBridgeProposed,3);
 assert.equal(r.prospectiveBridgeProposed,0);
 assert.equal(r.competitivelyQualifiedGames,0);
 assert.equal(r.pairs.filter(p=>p.cohort==='fresh').length,16);
 assert.equal(r.pairs.filter(p=>p.cohort==='known-positive').length,3);
});
test('loss of identical starting deals is retained, not silently excluded',()=>{
 const r=runExperiment((source,seed,seat,enabled)=>{
  const out=fake(source,seed,seat,enabled);
  if(seed===725554645&&seat===0&&enabled)
   out.fullPhysicalDealHash='wrong';
  return out;
 },setup);
 assert.equal(r.completePairs,19);
 assert.equal(r.physicalMatchedPairs,18);
 assert.ok(r.pairs.some(x=>x.complete&&!x.matched));
});
test('actual native exceptions retain the attempt and censor the pair',()=>{
 const r=runExperiment((source,seed,seat,enabled)=>{
  const out=fake(source,seed,seat,enabled);
  if(seed===2443530385&&enabled)out.error='native rejected';
  return out;
 },setup);
 assert.equal(r.attemptedNativeArms,38);
 assert.equal(r.completePairs,18);
 assert.equal(r.physicalMatchedPairs,18);
});
