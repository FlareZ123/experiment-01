'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {PHOTO,RANKS,key,bag,overlap,compute}=
  require('../scripts/aichi-rank28-provisional-overlap.cjs');

test('source image transcription has exactly sixty name-only cards',()=>{
  assert.equal(PHOTO.length,38);
  const cards=bag(PHOTO);
  assert.equal([...cards.values()].reduce((n,c)=>n+c,0),60);
  assert.equal(RANKS.length,9);
});

test('Professor aliases are distinguished unless comparison explicitly groups them',()=>{
  assert.equal(key('Basic Fire Energy'),'Fire Energy');
  assert.equal(key('Professor Juniper'),'Professor Juniper');
  assert.equal(key('Professor Juniper',true),"Professor's Research");
  const first=bag(PHOTO),grouped=bag(PHOTO,true);
  assert.equal(first.get('Professor Juniper'),2);
  assert.equal(grouped.get("Professor's Research"),2);
  assert.equal(overlap(first,first).minimumNameSubstitutions,0);
});

test('full 9-list comparison keeps unpublished rank28 outside the source importer',()=>{
  const x=compute();
  assert.equal(x.photoRegistrationAuthenticated,false);
  assert.equal(x.competitiveGamesQualified,0);
  assert.equal(x.ranking.length,9);
  assert.equal(x.photoCount,60);
  assert.equal(x.ranking[0].rank,10);
  assert.equal(x.ranking[0].strictName.shared,53);
  assert.equal(x.ranking[0].groupedProfessor.shared,55);
  assert.deepEqual(x.ranking.map(v=>[v.rank,v.groupedProfessor.shared]),[
    [10,55],[13,51],[21,51],[20,50],[12,48],[27,48],
    [14,46],[32,45],[18,43]]);
});

test('strict and grouped comparison report only accountable name differences',()=>{
  const nearest=compute().ranking[0];
  const strict=nearest.strictName.differences;
  const family=nearest.groupedProfessor.differences;
  assert.ok(strict.some(r=>r.name==='Professor Juniper'&&r.photo===2));
  assert.ok(strict.some(r=>r.name==="Professor's Research"&&r.published===2));
  assert.equal(family.some(r=>r.name.startsWith('Professor')),false);
  assert.deepEqual(family.map(r=>[r.name,r.photo,r.published]),[
    ['Budew',1,2],['Carmine',0,1],['Double Dragon Energy',3,4],
    ['Fire Energy',3,2],['Noivern ex',1,0],
    ['Path to the Peak',1,0],['Quick Ball',1,3],['Ultra Ball',2,0]
  ]);
});
