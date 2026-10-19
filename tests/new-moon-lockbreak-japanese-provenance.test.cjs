'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const original=require('../results/als/new-moon-official-japanese-print-60.json');
const candidate=require('../results/als/new-moon-lockbreak-japanese-print-60.json');
const {validateJapanesePrintCandidate,EXPECTED_SHA256}=
  require('../scripts/new-moon-lockbreak-japanese-provenance.cjs');

/** @returns {object} Independent mutable snapshot for a deliberate falsifier. */
function clone() { return structuredClone(candidate); }

test('one complete Japanese-printing 60 traces exactly to source and four-card swap',()=>{
  const result=validateJapanesePrintCandidate(candidate,original);
  console.log('Validated source code:',original.source_code);
  console.log('Declared Japanese candidate fingerprint:',result.sha256);
  console.log('Physical inventory:',result);
  assert.equal(result.sha256,EXPECTED_SHA256);
  assert.equal(result.total,60);
  assert.equal(result.pokemon,19);
  assert.equal(result.trainer,35);
  assert.equal(result.energy,6);
  assert.equal(result.unique,34);
});

test('provenance validator refuses a changed original Japanese printing',()=>{
  const altered=clone();
  const mew=altered.entries.find(e=>e.name_en==='Mewtwo & Mew-GX');
  mew.japanese_card_id=999999;
  assert.throws(()=>validateJapanesePrintCandidate(altered,original),/Source print ID altered/);
  console.log('Refused an unverified substitution for official-source Mewtwo.');
});

test('provenance validator refuses altered counter-Item print and quantity',()=>{
  const printing=clone();
  printing.entries.find(e=>e.name_en==='Canceling Cologne').japanese_card_id=999999;
  assert.throws(()=>validateJapanesePrintCandidate(printing,original),
    /Expected values to be strictly equal/);
  const count=clone();
  count.entries.find(e=>e.name_en==='Field Blower').count=3;
  assert.throws(()=>validateJapanesePrintCandidate(count,original),/Unexpected copy count/);
  console.log('Refused a fabricated Japanese Cologne print and added Blower copy.');
});

test('provenance validator refuses omitted or restored source packages',()=>{
  const missing=clone();
  missing.entries=missing.entries.filter(e=>e.name_en!=='Rescue Carrier');
  assert.throws(()=>validateJapanesePrintCandidate(missing,original),
    /Expected values to be strictly equal/);
  const stray=clone();
  const carrier=stray.entries.find(e=>e.name_en==='Rescue Carrier');
  carrier.count=4;
  assert.throws(()=>validateJapanesePrintCandidate(stray,original),/Unexpected copy count/);
  console.log('Refused removing all Rescue Carrier or restoring pre-swap count.');
});

test('provenance validator refuses duplicate prints and metadata drift',()=>{
  const duplicate=clone();
  duplicate.entries.find(e=>e.name_en==='Field Blower').japanese_card_id=
    duplicate.entries.find(e=>e.name_en==='Canceling Cologne').japanese_card_id;
  assert.throws(()=>validateJapanesePrintCandidate(duplicate,original),
    /Repeated Japanese print ID/);
  const wrongTotals=clone();
  wrongTotals.counts.energy=7;
  assert.throws(()=>validateJapanesePrintCandidate(wrongTotals,original),
    /Expected values to be strictly deep-equal/);
  console.log('Refused duplicate Japanese print IDs and false type totals.');
});
