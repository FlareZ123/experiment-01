'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,census}=require('../scripts/agent6-public-skyliner-lock-field-census.cjs');

test('all exact original source field records validated',()=>{
 const r=census();
 assert.equal(r.version,VERSION);
 assert.equal(r.authenticatedOriginals,29);
 assert.equal(r.originalRank30HasSkyliner,true);
 assert.deepEqual(r.knownMissingOriginalRanks,[23,25,28]);
});

test('each printed lock has an exact distinct rank count',()=>{
 const r=census();
 assert.deepEqual(r.byMechanism['path-to-the-peak'],[5,9,12,15,20,21,27]);
 assert.deepEqual(r.byMechanism['silent-lab'],[9,13,15,32]);
 assert.deepEqual(r.byMechanism['iron-thorns-initialization'],[6,24,29]);
 assert.deepEqual(r.byMechanism['active-klefki'],[4,17]);
 assert.deepEqual(r.byMechanism['garbotoxin-with-tool'],[8,11,16,22]);
 assert.deepEqual(r.byMechanism['active-galarian-weezing'],[]);
 assert.deepEqual(r.byMechanism['alolan-muk'],[]);
 assert.deepEqual(r.unionRanks,
   [4,5,6,8,9,11,12,13,15,16,17,20,21,22,24,27,29,32]);
 assert.equal(r.unionCount,18);
 assert.equal(r.conditionalCardPresenceOnly,true);
});

test('rank30 Float Stone versus Tool Jammer is a separate mechanism',()=>{
 const r=census();
 assert.equal(r.sourceRank30FloatStoneCount,1);
 assert.deepEqual(r.toolJammerRanks,[3,6,7,24,29]);
 assert.deepEqual(r.thornsWithToolJammer,[6,24,29]);
 assert.deepEqual(r.pathWithToolJammer,[]);
 assert.equal(r.unionCount,18);
});

test('duplicates and illegal 59-card records fail',()=>{
 const x={rank:777,cards:[{name:'Psychic Energy',count:60}]};
 assert.equal(census([x]).unionCount,0);
 assert.throws(()=>census([x,x]),/duplicate source rank/);
 assert.throws(()=>census([{rank:777,cards:[
   {name:'Psychic Energy',count:59}]}]),/59 !== 60/);
});
