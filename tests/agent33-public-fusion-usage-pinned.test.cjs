'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {publicFusionUsageAtRoot,MARKER}=
  require('../simulation/twinleaf/agent33-public-fusion-usage.cjs');
const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const {Player}=require(path.join(base,'game/store/state/player'));
const {PokemonCardList}=require(path.join(base,
  'game/store/state/pokemon-card-list'));

test('pinned native physical per-copy Genesect V FST marker is separable',()=>{
  const manager=initializeCards();
  const first=manager.getCardByName('Genesect V FST');
  const second=manager.getCardByName('Genesect V FST');
  assert.equal(first?.fullName,'Genesect V FST');
  assert.equal(second?.fullName,'Genesect V FST');
  assert.notEqual(first,second,
    'Two native physical copies must not share the same source object');
  const owner=new Player(),opponent=new Player();
  owner.active.cards.push(first);
  const bench=new PokemonCardList();bench.cards.push(second);
  owner.bench.push(bench);
  owner.marker.addMarker(MARKER,first,'ability','pokemon');
  const state={activePlayer:1,turn:7,players:[opponent,owner]};
  const before=publicFusionUsageAtRoot(state,1);
  assert.equal(before.faceUpGenesectCount,2);
  assert.equal(before.usedCount,1);
  assert.equal(before.faceUp[0].usedThisTurn,true);
  assert.equal(before.faceUp[1].usedThisTurn,false);
  owner.marker.addMarker(MARKER,second,'ability','pokemon');
  assert.equal(publicFusionUsageAtRoot(state,1).usedCount,2);
  owner.marker.removeMarker(MARKER,first);
  assert.equal(publicFusionUsageAtRoot(state,1).usedCount,1);
});
