'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {run,count}=require('../scripts/aichi-tool-answer-printing-census.cjs');

test('all 29 exact published 60s retain Tool-counter name counts',()=>{
  const census=run();
  assert.equal(census.publishedExactLists,29);
  assert.deepEqual(census.unavailableRanks,[23,25,28]);
  assert.equal(census.anyListedDirectToolAnswer,14);
  assert.equal(census.noListedDirectToolAnswer,15);
  assert.equal(census.namedPresence['Field Blower'].decks,9);
  assert.equal(census.namedPresence['Field Blower'].copies,11);
  assert.equal(census.namedPresence.Faba.decks,7);
  assert.equal(census.namedPresence.Faba.copies,8);
  assert.equal(census.namedPresence['Lost Vacuum'].decks,1);
  assert.equal(census.namedPresence['Lost Vacuum'].copies,1);
  assert.equal(census.namedPresence['Tool Jammer'].decks,5);
  assert.equal(census.rows.find(r=>r.rank===1).counts['Field Blower'],1);
  assert.equal(census.rows.find(r=>r.rank===11).listedDirectToolCopies,0);
  assert.equal(census.qualifiedMatchupEstimates,0);
});
test('print-count accumulator joins duplicate printings without extra copies',()=>{
  const deck={cards:[
    {name:'Field Blower',count:1},
    {name:'Field Blower',count:2},
    {name:'Faba',count:1}
  ]};
  assert.equal(count(deck,'Field Blower'),3);
  assert.equal(count(deck,'Faba'),1);
  assert.equal(count(deck,'Lost Vacuum'),0);
});
