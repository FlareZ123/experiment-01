'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {indexTypes,census,fromPinnedEngine} = require('../scripts/aichi-supporter-census.cjs');

test('count only unambiguous Supporter type and disclose unrecognized trainer rows',()=>{
  const type = indexTypes([
    {name:'Researcher',trainerType:3},
    {name:'Quick Search',trainerType:2},
    {name:'Duplicate',trainerType:3},
    {name:'Duplicate',trainerType:2}
  ]);
  const field = {decks:[{rank:1,archetype:'fixture',cards:[
    {category:'Trainer',name:'Researcher',count:4},
    {category:'Trainer',name:'Quick Search',count:3},
    {category:'Trainer',name:'Duplicate',count:2},
    {category:'Trainer',name:'Unknown',count:1},
    {category:'Energy',name:'Psychic Energy',count:50}
  ]}]};
  const r=census(field,type,3);
  assert.equal(r.supporterCopyTotal,4);
  assert.equal(r.decksWithSupporters,1);
  assert.equal(r.unclassifiedTrainerCopyTotal,3);
  assert.deepEqual(r.rows[0].unclassifiedTrainers,[{name:'Duplicate',count:2},
    {name:'Unknown',count:1}]);
});

test('pinned engine identifies Supporters in each published Aichi list',()=>{
  const r=fromPinnedEngine();
  assert.equal(r.publishedDecks,29);
  assert.equal(r.decksWithSupporters,29);
  assert.equal(r.supporterCopyTotal,297);
  assert.equal(r.rows.find(row=>row.rank===1).supporterCopies,9);
  assert.equal(r.rows.find(row=>row.rank===24).supporterCopies,24);
  assert.equal(r.rows.find(row=>row.rank===26).supporterCopies,2);
  assert.deepEqual(r.rows.filter(row=>row.unclassifiedTrainers.some(
    c=>['Guzma','Iono',"Professor's Research"].includes(c.name))),[]);
});
