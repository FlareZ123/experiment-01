'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {PROMOS,auditJapaneseOnlyPromos,auditRepositoryJapaneseOnlyPromos}=
  require('../scripts/agent6-original-field-japanese-only-promo-census.cjs');

test('original 29 lists contain 14 Japanese-only promo copies in five ranks',()=>{
  const report=auditRepositoryJapaneseOnlyPromos();
  assert.equal(report.sourceOriginalLists,29);
  assert.deepEqual(report.knownMissingOriginalRanks,[23,25,28]);
  assert.equal(report.originalSourceRows,9);
  assert.equal(report.originalSourceCopies,14);
  assert.deepEqual(report.affectedRanks,[3,6,7,24,29]);
  assert.deepEqual(report.byIdentity.map(x=>({
    name:x.name,rows:x.originalSourceRows,copies:x.copies,ranks:x.sourceRanks
  })),[
    {name:'Palace Belt',rows:2,copies:3,ranks:[6,29]},
    {name:'Palace Book',rows:3,copies:6,ranks:[6,7,24]},
    {name:"Player's Ceremony",rows:4,copies:5,ranks:[3,6,24,29]}
  ]);
  assert.equal(PROMOS.length,3);
  assert.ok(report.provenance.every(p=>p.sourceLanguageToken==='en'));
  assert.ok(report.provenance.every(p=>!p.englishDatabaseNamePresent));
  assert.ok(report.byIdentity.every(p=>!p.englishDatabaseNamePresent));
  assert.match(report.scope,/not original physical-language evidence/);
});

test('source language and source card identities are preserved without mutation',()=>{
  const field={decks:[{rank:42,cards:[
    {name:'Palace Book',count:2,printing:{set:'SMP',number:'NAN25',language:'en'}},
    {name:'Palace Book',count:1,printing:{set:'SMP',number:'NAN25',language:'ja'}},
    {name:'Palace Book',count:3,printing:{set:'SMP',number:'OTHER',language:'en'}},
    {name:'Palace Belt',count:1,printing:{set:'BWP',number:'153',language:'en'}}
  ]}],missing_full_lists:[{rank:1}]};
  const before=JSON.stringify(field),names=new Set(['Palace Book']);
  const report=auditJapaneseOnlyPromos(field,names);
  assert.equal(JSON.stringify(field),before);
  assert.equal(report.originalSourceCopies,4);
  assert.equal(report.originalSourceRows,3);
  assert.deepEqual(report.provenance.map(x=>x.sourceLanguageToken),['en','ja','en']);
  assert.deepEqual(report.byIdentity.map(x=>x.copies),[1,3,0]);
  assert.equal(report.byIdentity[1].englishDatabaseNamePresent,true);
  assert.deepEqual(report.affectedRanks,[42]);
});

test('reject missing source set and invalid target quantity',()=>{
  assert.throws(()=>auditJapaneseOnlyPromos({},new Set()),/Expected original/);
  assert.throws(()=>auditJapaneseOnlyPromos({decks:[]},[]),/Expected original/);
  const field={decks:[{rank:1,cards:[{
    name:"Player's Ceremony",count:0,
    printing:{set:'SP',number:'127',language:'en'}
  }]}],missing_full_lists:[]};
  assert.throws(()=>auditJapaneseOnlyPromos(field,new Set()),/Invalid source rank or quantity/);
});
