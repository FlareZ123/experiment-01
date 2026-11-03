'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {screenEnglishDisplayChronology,screenRepositoryEnglishChronology}=
  require('../scripts/agent6-original-field-english-release-chronology.cjs');

test('conservatively flags only three post-event English-display card rows',()=>{
  const result=screenRepositoryEnglishChronology();
  assert.equal(result.originalPublishedLists,29);
  assert.deepEqual(result.missingOriginalRankLists,[23,25,28]);
  assert.equal(result.sourceRows,989);
  assert.equal(result.sourceCopies,1740);
  assert.deepEqual(result.coverage,{
    uniqueEnglishSet:856,
    multipleEnglishSetsSameDate:76,
    missingEnglishSetMetadata:57,
    conflictingEnglishSetDates:0
  });
  assert.equal(result.postEventEnglishReleaseCopies,5);
  assert.deepEqual(result.postEventEnglishReleaseRows.map(row=>({
    rank:row.rank,name:row.name,count:row.count,
    sourceSetCode:row.sourceSetCode,
    sourceSetNumber:row.sourceSetNumber,englishReleaseDate:row.englishReleaseDate
  })),[
    {rank:5,name:'Special Red Card',count:2,
      sourceSetCode:'CRI',sourceSetNumber:'82',englishReleaseDate:'2026-05-22'},
    {rank:16,name:'Trubbish',count:2,
      sourceSetCode:'CRI',sourceSetNumber:'56',englishReleaseDate:'2026-05-22'},
    {rank:26,name:'Special Red Card',count:1,
      sourceSetCode:'CRI',sourceSetNumber:'82',englishReleaseDate:'2026-05-22'}
  ]);
  assert.deepEqual(Object.keys(result.unresolvedEnglishSetCodeCopies),
    ['BWP','MEE','SMP','SP','XYP']);
});

test('same-date multi-set identity can establish chronology but not exact printing',()=>{
  const source={decks:[{rank:1,cards:[
    {name:'One',count:1,printing:{set:'AAA',number:'4'}},
    {name:'Two',count:2,printing:{set:'BBB',number:'5'}},
    {name:'Three',count:3,printing:{set:'CCC',number:'6'}},
    {name:'Four',count:4,printing:{set:'DDD',number:'7'}}
  ]}],missing_full_lists:[]};
  const sets=[
    {id:'aa0',ptcgoCode:'AAA',releaseDate:'2026/06/02'},
    {id:'aa1',ptcgoCode:'AAA',releaseDate:'2026/06/02'},
    {id:'bb',ptcgoCode:'BBB',releaseDate:'2026/04/02'},
    {id:'cc1',ptcgoCode:'CCC',releaseDate:'2026/02/01'},
    {id:'cc2',ptcgoCode:'CCC',releaseDate:'2026/07/01'}
  ];
  const before=JSON.stringify({source,sets});
  const result=screenEnglishDisplayChronology(source,sets);
  assert.equal(JSON.stringify({source,sets}),before);
  assert.deepEqual(result.coverage,{
    uniqueEnglishSet:1,multipleEnglishSetsSameDate:1,
    missingEnglishSetMetadata:1,conflictingEnglishSetDates:1
  });
  assert.equal(result.postEventEnglishReleaseCopies,1);
  assert.deepEqual(result.postEventEnglishReleaseRows[0].englishSetIds,
    ['aa0','aa1']);
  assert.deepEqual(result.unresolvedEnglishSetCodeCopies,{CCC:3,DDD:4});
  assert.match(result.caveat,/not event-day Japanese printing legality/);
});

test('invalid source cardinality and event date fail safely',()=>{
  const source={decks:[{rank:1,cards:[
    {name:'Card',count:0,printing:{set:'CRI',number:'1'}}
  ]}],missing_full_lists:[]};
  assert.throws(()=>screenEnglishDisplayChronology(source,[]),
    /Invalid original printed-card row/);
  assert.throws(()=>screenEnglishDisplayChronology(
    {decks:[],missing_full_lists:[]},[],'May 10, 2026'),
  /YYYY-MM-DD/);
});
