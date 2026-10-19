'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {classify,run}=
  require('../scripts/aichi-special-energy-exposure.cjs');

test('classification counts only printed Basic Energy names as Basic',()=>{
  const row=classify({rank:99,archetype:'test',cards:[
    {name:'Iron Thorns ex',category:'Pokémon',count:4},
    {name:'Plumeria',category:'Trainer',count:48},
    {name:'Lightning Energy',category:'Energy',count:2},
    {name:'Speed Lightning Energy',category:'Energy',count:4},
    {name:'Double Colorless Energy',category:'Energy',count:2}
  ]});
  assert.equal(row.basicCount,2);
  assert.equal(row.specialCount,6);
  assert.equal(row.onlySpecial,false);
});

test('all published Iron Thorns exact 60s have eight Special and zero Basic',()=>{
  const matrix=run();
  for(const rank of [6,24,29]){
    const row=matrix.rows.find(x=>x.rank===rank);
    assert.ok(row);
    assert.equal(row.basicCount,0);
    assert.equal(row.specialCount,8);
    assert.equal(row.onlySpecial,true);
  }
});

test('rank-one Shadow Rider and rank-ten Regidrago retain Basic routes',()=>{
  const matrix=run();
  const rank1=matrix.rows.find(x=>x.rank===1);
  const rank10=matrix.rows.find(x=>x.rank===10);
  assert.deepEqual([rank1.basicCount,rank1.specialCount],[11,0]);
  assert.deepEqual([rank10.basicCount,rank10.specialCount],[6,4]);
});

test('known zero-Basic source ranks remain identifiable with missing lists',()=>{
  const matrix=run();
  for(const rank of [4,5,6,7,17,24,29])
    assert.ok(matrix.allSpecialRanks.includes(rank));
  assert.ok(matrix.missingRanks.every(rank=>!matrix.rows.some(x=>x.rank===rank)));
});
