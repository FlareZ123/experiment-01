'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {audit,run}=require('../scripts/aichi-initialization-potential-census.cjs');

test('29 source 60s have four no-target ranks and one evolution-only rank',()=>{
  const x=run();
  assert.equal(x.published,29);
  assert.deepEqual(x.missing,[23,25,28]);
  assert.deepEqual(x.noTarget,[6,7,24,29]);
  assert.deepEqual(x.evolutionOnly,[2]);
  assert.equal(x.basicPossible.length,24);
  const byRank=new Map(x.rows.map(row=>[row.rank,row]));
  assert.equal(byRank.get(1).eligible,10);
  assert.equal(byRank.get(1).eligibleBasic,6);
  assert.equal(byRank.get(2).eligible,3);
  assert.equal(byRank.get(7).ordinary,8);
  assert.equal(byRank.get(7).future,0);
  for(const rank of [6,24,29]){
    assert.equal(byRank.get(rank).eligible,0);
    assert.equal(byRank.get(rank).future,4);
  }
  assert.equal(x.competitiveQualifiedGames,0);
  assert.deepEqual(x.crossLockNoTarget,{
    path:[7],klefki:[],wobbuffet:[],garbotoxin:[]
  });
  assert.equal(byRank.get(7).crossLocks.path,0);
  assert.equal(byRank.get(7).crossLocks.klefki,8);
  assert.equal(byRank.get(7).crossLocks.wobbuffet,2);
  assert.equal(byRank.get(7).crossLocks.garbotoxin,8);
  for(const rank of [6,24,29]){
    assert.deepEqual(byRank.get(rank).crossLocks,{
      path:4,klefki:4,wobbuffet:4,garbotoxin:4
    });
  }
});

test('printed non-Rule Box, Future and evolution-only Abilities are distinct',()=>{
  const cards=[
    {name:'Plain',number:'1',types:['Psychic'],subtypes:['Basic'],abilities:[{name:'Block'}]},
    {name:'Future ex',number:'2',types:['Lightning'],subtypes:['Basic','ex','Future'],
      rules:['Pokémon ex rule'],abilities:[{name:'Future Power'}]},
    {name:'Evolved ex',number:'3',types:['Psychic'],subtypes:['Stage 2','ex'],
      rules:['Pokémon ex rule'],abilities:[{name:'Search'}]}
  ];
  const deck=(rank,keys)=>({rank,archetype:'test',
    category_counts:{'Pokémon':keys.length},
    cards:[...keys.map(n=>({category:'Pokémon',count:1,
      name:cards[n-1].name,printing:{set:'EX',number:String(n)}})),
      {category:'Energy',name:'Basic Energy',count:60-keys.length}]
  });
  const field={published_deck_count:3,missing_full_lists:[],
    decks:[deck(1,[1,2]),deck(2,[1,3]),deck(3,[2,3])]};
  const result=audit(field,[{ptcgoCode:'EX',id:'fixture'}],id=>{
    assert.equal(id,'fixture');
    return cards;
  });
  assert.deepEqual(result.noTarget,[1]);
  assert.deepEqual(result.evolutionOnly,[2,3]);
  assert.equal(result.rows[0].ordinary,1);
  assert.equal(result.rows[0].future,1);
  assert.deepEqual(result.crossLockNoTarget,{
    path:[],klefki:[],wobbuffet:[2],garbotoxin:[]
  });
});
