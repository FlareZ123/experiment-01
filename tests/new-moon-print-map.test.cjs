'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const read = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const original = read('results/als/new-moon-perfection-source-60.json');
const mapped = read('results/als/new-moon-perfection-english-map.json');
const digest = (key) => crypto.createHash('sha256').update([...mapped.entries].sort((a,b)=>a[key]<b[key]?-1:a[key]>b[key]?1:0).map(e=>e[key]+':'+e.count+'\n').join('')).digest('hex');
test('source matches mapped 60', () => {
  const a = original.entries.map(e => [e.name_en,e.count]).sort();
  const b = mapped.entries.map(e => [e.name,e.count]).sort();
  assert.deepEqual(b,a);
  assert.equal(b.reduce((s,e)=>s+e[1],0),60);
  assert.equal(mapped.entries.length,33);
});
test('fixed name and print identity', () => {
  assert.equal(digest('id'),mapped.sha256_id_counts);
  assert.equal(digest('name'),mapped.sha256_name_counts);
  const ids = Object.fromEntries(mapped.entries.map(e=>[e.name,e.id]));
  assert.equal(ids.Unown,'xy7-30');
  assert.equal(ids.Lunatone,'sv3-92');
  assert.equal(ids.Solrock,'sm7-62');
  assert.equal(ids.Dusclops,'sv6pt5-19');
  assert.equal(ids.Klefki,'sv1-96');
});

const {auditFromResources}=require('../scripts/aichi-new-moon-english-print-audit.cjs');
test('source English printings satisfy date, variant and source-inventory audit',()=>{
  const result=auditFromResources();
  assert.equal(result.count,60);
  assert.equal(result.aceSpecCount,1);
  assert.equal(result.authenticJapanesePrintsVerified,false);
  assert.equal(result.englishDatabaseExpandedFlag,true);
});

const {auditFromResources:verifyJapanesePrints}=
  require('../scripts/aichi-new-moon-japanese-source-print-gate.cjs');
test('cross-check exact Japanese source card ids against dated ban names',()=>{
  const result=verifyJapanesePrints();
  assert.equal(result.printedCopies,60);
  assert.equal(result.sourceRows,33);
  assert.equal(result.namedBannedPrintingCollision,false);
  assert.equal(result.paperLegalityCertified,false);
});
