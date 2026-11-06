'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {VERSION,resolvePrinting,run} =
  require('../simulation/evaluation/agent2-aichi-exact-retreat-prohibition-census.cjs');

test('duplicate set abbreviations resolve by both printed number and name',()=>{
  for(const [set,number,name,id] of [
    ['CRZ','105','Radiant Eternatus','swsh12pt5-105'],
    ['LOR','58','Rotom V','swsh11-58'],
    ['SIT','135','Regidrago V','swsh12-135'],
    ['ASR','133','Oranguru V','swsh10-133'],
    ['XYP','67','Jirachi','xyp-XY67'],
    ['XYP','49','Regirock','xyp-XY49'],
    ['SMP','217','Trevenant & Dusknoir-GX','smp-SM217'],
    ['LOT','154','Ditto ♢','sm8-154'],
    ['TEU','51','Tapu Koko ♢','sm9-51']
  ]){
    const result=resolvePrinting({name,printing:{set,number}});
    assert.equal(result.status,'exact-printing',name);
    assert.equal(result.card.id,id,name);
  }
});

test('invalid set abbreviations and wrong names fail closed',()=>{
  assert.equal(resolvePrinting({
    name:'Rotom V',printing:{set:'DOES-NOT-EXIST',number:'58'}
  }).status,'unresolved-set-code');
  const bad=resolvePrinting({
    name:'Imposter Pokémon',printing:{set:'SIT',number:'135'}
  });
  assert.equal(bad.status,'unresolved-exact-printing');
  assert.ok(bad.candidateIds.includes('swsh12-135'));
});

test('all 29 authenticated source 60s resolve with exact card identity',()=>{
  const result=run();
  assert.match(VERSION,/v3$/);
  assert.equal(result.originalSourceDecks,29);
  assert.equal(result.registeredPokemonRows,309);
  assert.equal(result.exactPokemonRows,309,JSON.stringify(result.unresolved));
  assert.deepEqual(result.unresolved,[]);
  assert.equal(result.exactRetreatProhibitionHits,4);
  assert.deepEqual(result.sourceDeckRanksWithLiteralProhibition,[2,3,7,31]);
  assert.deepEqual(result.hits.map(x=>[x.rank,x.name,x.count,x.category]),[
    [2,'Lillipup',2,'attacks'],
    [3,'Snorlax',3,'abilities'],
    [7,'Snorlax',2,'abilities'],
    [31,'Dusknoir',3,'attacks']
  ]);
});
