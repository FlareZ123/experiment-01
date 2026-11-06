'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  normalizeName,stadiumNames,choose,
  distinctStadiumOpening,analyzeRoster
}=require('../scripts/agent26-field-stadium-multi-name-census.cjs');
const roster=require('../results/aichi-2026/full-decklists.json');

test('card archive identifies Stadiums and normalizes Prism Star diamond variants',()=>{
  const names=stadiumNames();
  for(const name of ['Artazon','Grand Tree','Sky Field',
    'Thunder Mountain ◇','Wondrous Labyrinth ◇'])
    assert.ok(names.has(name),name);
  assert.equal(normalizeName('Thunder Mountain ♢'),
    'Thunder Mountain ◇');
  assert.equal(normalizeName('Thunder Mountain ◇'),
    'Thunder Mountain ◇');
});

test('exact arithmetic counts unordered opening hands without replacement',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.deepEqual(distinctStadiumOpening([1,1]),{
    numerator:4582116n,denominator:386206920n
  });
  assert.deepEqual(distinctStadiumOpening([2,1]),{
    numerator:8769222n,denominator:386206920n
  });
  assert.deepEqual(distinctStadiumOpening([1,1,1]),{
    numerator:12956328n,denominator:386206920n
  });
  assert.equal(distinctStadiumOpening([4]).numerator,0n);
  assert.equal(distinctStadiumOpening([]).numerator,0n);
});

test('same printed name in different art is one Stadium category',()=>{
  const names=new Set(['Thunder Mountain ◇']);
  const mock={decks:[{rank:99,archetype:'synthetic',cards:[
    {category:'Trainer',name:'Thunder Mountain ♢',count:1},
    {category:'Trainer',name:'Thunder Mountain ◇',count:1},
    {category:'Pokémon',name:'Basic',count:58}
  ]}]};
  const row=analyzeRoster(mock,names).rows[0];
  assert.equal(row.distinctNames,1);
  assert.equal(row.stadiumCopies,2);
  assert.equal(row.opening7DifferentNamesNumerator,'0');
});

test('authenticated 29-original roster yields expected multi-name population',()=>{
  const result=analyzeRoster(roster,stadiumNames());
  assert.equal(result.authenticatedDecks,29);
  assert.equal(result.multiNameDecks,18);
  assert.equal(result.singleNameDecks,11);
  assert.equal(result.noStadiumDecks,0);
  const byRank=new Map(result.rows.map(row=>[row.rank,row]));
  assert.equal(byRank.get(15).distinctNames,4);
  assert.equal(byRank.get(15).opening7DifferentNamesNumerator,'34852059');
  assert.equal(byRank.get(9).opening7DifferentNamesNumerator,'20595960');
  assert.equal(byRank.get(6).opening7DifferentNamesNumerator,'12956328');
  assert.equal(byRank.get(4).opening7DifferentNamesNumerator,'0');
  assert.ok(Math.abs(result.unweightedMeanUnconditionalOpening7Percent-
    1.697300407)<0.00001);
});

test('non-sixty source inventory fails instead of silently modeling it',()=>{
  assert.throws(()=>analyzeRoster({decks:[{rank:1,cards:[
    {category:'Trainer',name:'Sky Field',count:1}
  ]}]},new Set(['Sky Field'])),/60 cards/);
});
