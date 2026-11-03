'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {runExperiment,SPECIFIC_ENERGY_NAMES}=
  require('../simulation/evaluation/agent1-rank17-generic-special-energy-prospective.cjs');
const setup={
  reg:{schema:'agent1-rank17-public-context-special-energy-prospective-v1',
    seeds:[2781263540,3213416555,3668291815,3239786043],
    sourceSeats:[0,1]},
  source:{reg:{enginePin:'pinned-source-test'}}
};
function fake(_source,seed,seat,enabled){
  return {seed,sourceSeat:seat,enabled,error:null,
    deckAHash:seat===0?'rank17':'rank1',
    deckBHash:seat===1?'rank17':'rank1',
    fullPhysicalDealHash:`${seed}/${seat}`,
    actualStarterSeat:0,nativeStatus:'action-limit',
    sourceRoots:{attackRoots:enabled?[{attackName:'Electro Rain'}]:[],
      manualEnergyRoots:enabled?[{printedCard:'Reversal Energy'}]:[]}};
}
test('actual registered 4 RNG seed groups x both source seats x two policies',()=>{
 const data=runExperiment(fake,setup);
 assert.equal(data.attemptedNativeArms,16);
 assert.equal(data.prospectivePhysicalGroups,8);
 assert.equal(data.physicallyMatchedPairs,8);
 assert.equal(data.completePairs,8);
 assert.equal(data.originalSourceControl.nativeManualEnergyRoots,0);
 assert.equal(data.originalSourcePublicContextSpecial.nativeManualEnergyRoots,8);
 assert.equal(data.originalSourcePublicContextSpecial.nativeAttackRoots,8);
 assert.equal(data.certifiedWinRate,null);
 assert.equal(data.competitivelyQualifiedGames,0);
});
test('all physical mismatches and failed original Store arms remain unqualified',()=>{
 const data=runExperiment((src,seed,seat,enabled)=>{
  const r=fake(src,seed,seat,enabled);
  if(seed===3213416555&&seat===1&&enabled){
    r.fullPhysicalDealHash='OTHER';
  }
  if(seed===3668291815&&seat===0&&enabled){
    r.error='Native policy refused selected root';
  }
  return r;
 },setup);
 assert.equal(data.completePairs,7);
 assert.equal(data.physicallyMatchedPairs,6);
 assert.equal(data.pairs.length,8);
 assert.equal(data.certifiedWinRate,null);
 assert.equal(data.competitivelyQualifiedGames,0);
});
test('all original printed rank17 Special Energy names are counted as such',()=>{
 assert.deepEqual([...SPECIFIC_ENERGY_NAMES].sort(),
   ['Counter Energy','Reversal Energy','Unit Energy LPM']);
});
