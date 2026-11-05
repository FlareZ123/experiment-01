'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const source=require('../results/aichi-2026/full-decklists.json');
const {VERSION,sourceEnergyMatrix}=
 require('../simulation/evaluation/agent8-shadowmist-all-special-source-matrix.cjs');

test('all 29 original authenticated source Energy counts are classified without proxy inference',()=>{
 const row=sourceEnergyMatrix(source);
 assert.equal(row.version,VERSION);
 assert.equal(row.authenticatedOriginalRanks,29);
 assert.deepEqual(row.missingOriginalRanks,[23,25,28]);
 assert.deepEqual(row.allSpecialRanks,[4,5,6,7,17,24,29]);
 for(const rank of [6,24,29]){
   const target=row.rows.find(r=>r.rank===rank);
   assert.equal(target.basicEnergy,0);
   assert.equal(target.specialEnergy,8);
 }
 assert.equal(row.rows.find(r=>r.rank===1).basicEnergy,11);
 assert.equal(row.rows.find(r=>r.rank===1).specialEnergy,0);
 assert.equal(row.competitiveGamesQualified,0);
});
test('unknown Energy names fail closed; missing originals never counted as all-special',()=>{
 const altered={decks:[{
   rank:23,archetype:'unverified',cards:[{
     category:'Energy',name:'UNKNOWN ENERGY',count:1
   }]
 }]};
 assert.throws(()=>sourceEnergyMatrix(altered),/Unclassified printed Energy/);
 const empty={decks:[{rank:23,archetype:'empty',cards:[]}]};
 const matrix=sourceEnergyMatrix(empty);
 assert.equal(matrix.rows[0].allEnergySpecial,false);
 assert.equal(matrix.missingOriginalRanks.includes(23),false);
 assert.equal(matrix.authenticatedOriginalRanks,1);
});
