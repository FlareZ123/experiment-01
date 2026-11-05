'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  EVENT_DATE,JAPANESE_CROSSWALKS,
  auditEnglishSetClock,auditRepository
}=require('../scripts/agent12-aichi-release-clock-audit.cjs');

test('all admitted 29 original source sixties scanned: five CRI aliases over three ranks',()=>{
  const result=auditRepository();
  assert.equal(result.date,EVENT_DATE);
  assert.equal(result.deckCount,29);
  assert.equal(result.allDecksHaveSixty,true);
  assert.equal(result.futureEnglishRows,3);
  assert.equal(result.futureEnglishCopies,5);
  assert.equal(result.uncertainRegionalRows,0);
  assert.deepEqual(result.rows.map(row=>({
    rank:row.rank,card:row.card,count:row.count,
    print:row.englishPrinting,englishRelease:row.englishRelease,
    earlierJapanese:row.earlierJapaneseEquivalent
  })),[
    {rank:5,card:'Special Red Card',count:2,
      print:'CRI 82',englishRelease:'2026/05/22',
      earlierJapanese:true},
    {rank:16,card:'Trubbish',count:2,
      print:'CRI 56',englishRelease:'2026/05/22',
      earlierJapanese:true},
    {rank:26,card:'Special Red Card',count:1,
      print:'CRI 82',englishRelease:'2026/05/22',
      earlierJapanese:true}
  ]);
});

test('official Japanese crosswalks are card-specific and predate May 10',()=>{
  const red=JAPANESE_CROSSWALKS['CRI:82:Special Red Card'];
  const trash=JAPANESE_CROSSWALKS['CRI:56:Trubbish'];
  assert.equal(red.japanesePrint,'Ninja Spinner M4 072/083');
  assert.equal(trash.japanesePrint,'Ninja Spinner M4 054/083');
  assert.equal(red.japaneseRelease,'2026/03/13');
  assert.equal(trash.japaneseRelease,'2026/03/13');
  assert.ok(red.officialJapaneseCardUrl.startsWith(
    'https://www.pokemon-card.com/'));
  assert.ok(trash.officialJapaneseCardUrl.startsWith(
    'https://www.pokemon-card.com/'));
});

test('an unknown future English name is unresolved, never auto-legalized',()=>{
  const sets=[{id:'me4',name:'Chaos Rising',ptcgoCode:'CRI',
    releaseDate:'2026/05/22'}];
  const original={decks:[{rank:42,player:'Fixture',cards:[
    {count:60,name:'Unverified Future',
      printing:{set:'CRI',number:'82'}}
  ]}]};
  const got=auditEnglishSetClock(original,sets);
  assert.equal(got.futureEnglishCopies,60);
  assert.equal(got.uncertainRegionalRows,1);
  assert.equal(got.rows[0].japaneseCrosswalk,null);
  assert.equal(got.rows[0].earlierJapaneseEquivalent,false);
});

test('release-day and pre-event English sets do not generate false warnings',()=>{
  const sets=[{id:'old',name:'Old',ptcgoCode:'OLD',
    releaseDate:'2026/01/01'},
  {id:'event',name:'Event',ptcgoCode:'EVT',
    releaseDate:'2026/05/10'}];
  const original={decks:[{rank:1,player:'Fixture',cards:[
    {count:20,name:'Old Print',printing:{set:'OLD',number:'1'}},
    {count:40,name:'On Event Day',
      printing:{set:'EVT',number:'2'}}
  ]}]};
  assert.equal(auditEnglishSetClock(original,sets).futureEnglishRows,0);
});

test('conflicting source abbreviation release clocks fail loudly',()=>{
  const original={decks:[{rank:1,player:'Fixture',cards:[]}]};
  assert.throws(()=>auditEnglishSetClock(original,[
    {id:'a',ptcgoCode:'DUPE',releaseDate:'2026/03/13'},
    {id:'b',ptcgoCode:'DUPE',releaseDate:'2026/05/22'}
  ]),/conflicting release dates/);
});
