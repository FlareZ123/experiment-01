'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {auditPromoChronology} = require('../scripts/agent22-aichi-promo-chronology.cjs');

const root = path.resolve(__dirname,'..');
const source = JSON.parse(fs.readFileSync(path.join(root,
  'results/aichi-2026/full-decklists.json'),'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root,
  'results/aichi-2026/agent22-original-promo-source-chronology-20261105.json'),'utf8'));

test('all 29 original source inventories have exactly 31 dated promo copies',()=>{
  const result=auditPromoChronology(source,manifest);
  assert.equal(result.originalSourceDecks,29);
  assert.equal(result.promoRows,22);
  assert.equal(result.promoCopies,31);
  assert.equal(result.documentedCopies,31);
  assert.deepEqual(result.uncovered,[]);
  assert.deepEqual(result.countMismatches,[]);
  assert.equal(result.releaseDateCoverageComplete,true);
  assert.equal(result.historicalPhysicalPrintingsCertified,false);
  assert.equal(result.paperExpandedLegalityCertified,false);
  assert.equal(result.competitiveGamesQualified,0);
});

test('a shifted printing number remains unresolved even with identical name',()=>{
  const changed=structuredClone(source);
  const card=changed.decks.flatMap(d=>d.cards)
    .find(c=>c.name==='Palace Book'&&c.printing.set==='SMP');
  assert.ok(card);
  card.printing.number='NAN24';
  const result=auditPromoChronology(changed,manifest);
  assert.equal(result.releaseDateCoverageComplete,false);
  assert.ok(result.uncovered.some(x=>x.name==='Palace Book'&&x.reason==='unmapped-printing'));
});

test('release evidence after event is rejected rather than inferred legal',()=>{
  const changed=structuredClone(manifest);
  changed.entries.find(e=>e.name==='Karen').availableBy='2026-05-11';
  const result=auditPromoChronology(source,changed);
  assert.equal(result.releaseDateCoverageComplete,false);
  assert.ok(result.uncovered.some(x=>x.name==='Karen'&&x.reason==='post-event-bound'));
});

test('a correct promo name paired with the wrong printed number is excluded',()=>{
  const changed=structuredClone(manifest);
  changed.entries.find(e=>e.name==='Regirock').name='Jirachi';
  const result=auditPromoChronology(source,changed);
  assert.equal(result.releaseDateCoverageComplete,false);
  assert.ok(result.uncovered.some(x=>x.name==='Regirock'&&x.reason==='name-mismatch'));
});

test('duplicate manifest aliases are rejected',()=>{
  const changed=structuredClone(manifest);
  changed.entries.push(structuredClone(changed.entries[0]));
  assert.throws(()=>auditPromoChronology(source,changed),/duplicate promo printing/);
});
