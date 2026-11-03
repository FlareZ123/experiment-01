'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {runExperiment}=
 require('../simulation/evaluation/agent1-rank17-electro-rain-settlement-retrospective.cjs');
const setup={registered:{
  previousSourceElectroRainEvent:{seed:3239786043}},
  original:{}};
function fake(_source,seed,on) {
  return {seed,enabled:on,error:null,
    deckAHash:'rank17',deckBHash:'rank1',
    fullPhysicalDealHash:'same-exact-60-source-physical',
    actualFirstPlayer:0,nativeWinner:1,
    sourceElectroRainRoots:on?[{attack:'Electro Rain'}]:[]};
}
test('disclosed positive native Electro Rain is explicitly retrospective and not a qualified outcome',()=>{
  const x=runExperiment(fake,setup);
  assert.equal(x.complete,true);
  assert.equal(x.matched,true);
  assert.equal(x.sourceRainObserved,1);
  assert.equal(x.selectionIsRetrospective,true);
  assert.equal(x.competitivelyQualifiedGames,0);
  assert.equal(x.certifiedWinRate,null);
});
test('failure or starting physical mismatch remain visible',()=>{
  let x=runExperiment((src,seed,on)=>{
    const item=fake(src,seed,on);
    if(on)item.fullPhysicalDealHash='not physically same';
    return item;
  },setup);
  assert.equal(x.matched,false);
  x=runExperiment((src,seed,on)=>{
    const item=fake(src,seed,on);
    if(on)item.error='source Electro Rain native error';
    return item;
  },setup);
  assert.equal(x.complete,false);
  assert.equal(x.sourceRainObserved,1);
});
