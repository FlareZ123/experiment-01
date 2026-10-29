'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {supporterVocabulary,SCHEMA,SOURCE}=
  require('../simulation/evaluation/agent25-29-source-supporter-vocabulary.cjs');
const field=JSON.parse(fs.readFileSync(
  path.resolve(__dirname,'..',SOURCE),'utf8'));

test('all and only 29 published original source sixties enter Supporter coverage',()=>{
  const x=supporterVocabulary(field);
  assert.equal(x.schema,SCHEMA);
  assert.equal(x.verifiedOriginalSixties,29);
  assert.deepEqual(x.missingOriginalFullSixties,[23,25,28]);
  assert.equal(x.rows.length,29);
  assert.equal(x.withSelectedCoreSupporter,29);
  assert.ok(x.rows.every(row=>row.totalCards===60));
  assert.ok(x.rows.every(row=>row.anyTargetedSupporter));
});

test('core printed Supporter frequency includes correct source rank and copies',()=>{
  const x=supporterVocabulary(field);
  const byName=new Map(x.frequency.map(row=>[row.name,row]));
  assert.equal(byName.get('Guzma').sourceSixties,25);
  assert.equal(byName.get("Lillie's Determination").sourceSixties,16);
  assert.equal(byName.get('Marnie').sourceSixties,13);
  assert.equal(byName.get('Carmine').sourceSixties,12);
  assert.equal(byName.get('Raihan').sourceSixties,12);
  assert.equal(byName.get('Iono').sourceSixties,10);
  assert.equal(byName.get('Plumeria').sourceSixties,8);
  assert.equal(byName.get('Roxie').sourceSixties,1);
  assert.deepEqual(byName.get('Roxie').ranks,[31]);
  assert.equal(byName.get('Roxie').originalPrintedCopies,4);
  assert.equal(byName.get('Guzma').originalPrintedCopies,48);
});

test('duplicate or fabricated missing full source registration fails',()=>{
  const x=structuredClone(field);
  x.decks[0].cards[0].count++;
  assert.throws(()=>supporterVocabulary(x),/exact 60/);
  x.decks[0].cards[0].count--;
  x.decks.push(x.decks[0]);
  assert.throws(()=>supporterVocabulary(x));
  x.decks.pop();
  x.missing_full_lists[0].rank=22;
  assert.throws(()=>supporterVocabulary(x));
});
