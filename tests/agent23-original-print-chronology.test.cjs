'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditEnglishDisplayDates}=
  require('../scripts/agent23-original-print-chronology.cjs');
const sets=[
  {id:'me4',ptcgoCode:'CRI',releaseDate:'2026/05/22',name:'Chaos Rising'},
  {id:'me3',ptcgoCode:'PRE',releaseDate:'2026/03/27',name:'Perfect Order'},
  {id:'rsv10pt5',ptcgoCode:'BLK',releaseDate:'2025/07/18',name:'Black Bolt'}
];
const deck=(rank,name,copies,code)=>({rank,archetype:'fixture',cards:[
  {category:'Trainer',name,count:copies,printing:{set:code,number:'82'}},
  {category:'Energy',name:'Basic Psychic Energy',count:60-copies,
    printing:{set:'MEE',number:'5'}}
]});

test('postevent English printing is flagged without declaring paper illegality',()=>{
  const report=auditEnglishDisplayDates({decks:[
    deck(5,'Special Red Card',2,'CRI'),
    deck(16,'Trubbish',2,'CRI'),
    deck(26,'Special Red Card',1,'CRI')]},sets);
  assert.equal(report.sourceDeckCount,3);
  assert.equal(report.originalCardCopies,180);
  assert.equal(report.englishDisplayPostEventCopies,5);
  assert.equal(report.englishDisplayPostEventEntries,3);
  assert.deepEqual(report.englishDisplayPostEventRanks,[5,16,26]);
  assert.equal(report.englishDisplayAfterEvent[0].englishReleaseDate,'2026-05-22');
  assert.equal(report.unresolvedEnglishCodeCopies,175);
  assert.equal(report.japaneseLegalityCertified,false);
});

test('a previously dated English print is not flagged as postevent',()=>{
  const result=auditEnglishDisplayDates({decks:[
    deck(1,'Older Print',3,'PRE')]},sets);
  assert.equal(result.englishDisplayPostEventCopies,0);
  assert.equal(result.datedEnglishCopies,3);
});

test('unrecognized promo code remains unresolved without false date inference',()=>{
  const result=auditEnglishDisplayDates({decks:[
    deck(24,'Promo',1,'SP')]},sets);
  assert.equal(result.unresolvedEnglishCodes.length,2);
  assert.ok(result.unresolvedEnglishCodes.some(x=>x.code==='SP'&&x.copies===1));
});

test('refuses malformed original 60 and invalid dates',()=>{
  assert.throws(()=>auditEnglishDisplayDates({decks:[{
    rank:1,cards:[{count:2,name:'A',printing:{set:'CRI',number:'82'}}]
  }]},sets),/Original full deck must have 60 cards/);
  assert.throws(()=>auditEnglishDisplayDates({decks:[]},sets,'2026/05/10'),
    /regular expression/);
});

test('set-code collisions are unresolved rather than arbitrarily dated',()=>{
  const colliding=[...sets,{id:'collision',ptcgoCode:'CRI',
    releaseDate:'2025/01/01',name:'Collision'}];
  const result=auditEnglishDisplayDates({decks:[
    deck(5,'Special Red Card',2,'CRI')]},colliding);
  assert.equal(result.datedEnglishCopies,0);
  assert.ok(result.unresolvedEnglishCodes.some(x=>x.code==='CRI'&&
    x.reason==='set-code-maps-to-multiple-sets'));
});


test('set ID fallback must not claim a specific promo printing existed at set launch',()=>{
  const promos=[...sets,{id:'smp',ptcgoCode:'PR-SM',
    releaseDate:'2017/02/03',name:'SM Black Star Promos'}];
  const result=auditEnglishDisplayDates({decks:[
    deck(7,'Palace Book',3,'SMP')]},promos);
  assert.equal(result.datedEnglishCopies,0);
  assert.ok(result.unresolvedEnglishCodes.some(x=>
    x.code==='SMP'&&x.copies===3));
});
