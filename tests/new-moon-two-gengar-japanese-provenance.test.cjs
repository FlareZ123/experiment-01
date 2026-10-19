'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {verify,FINGERPRINT}=require('../scripts/new-moon-two-gengar-japanese-provenance.cjs');
const alternate=require('../results/als/new-moon-two-gengar-one-cologne-japanese-print-60.json');
const frozen=require('../results/als/new-moon-lockbreak-japanese-print-60.json');
const english=require('../results/als/new-moon-two-gengar-one-cologne-english-proxy-60.json');

/** @returns {object} */
function clone(){return structuredClone(alternate);}

test('complete proposed Japanese two-Gengar 60 has authentic source print IDs',()=>{
  const report=verify();
  console.log('Proposed print-name inventory:',report);
  assert.equal(report.sha256,FINGERPRINT);
  assert.equal(report.printedCopies,60);
  assert.equal(report.names,34);
  assert.deepEqual(report.englishProxyNameCopyCountParity,{names:34,cards:60});
  assert.equal(report.explicitHistoricalBanPrintingCollisions,0);
  assert.equal(report.fullLegalityCertified,false);
  assert.equal(report.qualifyingCompetitiveGames,0);
});

test('59 retained physical prints and sole one-for-one change cannot drift',()=>{
  const changed=clone();
  changed.entries.find(e=>e.name_en==='Gengar & Mimikyu-GX').count=1;
  assert.throws(()=>verify(changed),/Unexpected second-candidate count/);
  const source=clone();
  source.entries.find(e=>e.name_en==='Gengar & Mimikyu-GX').japanese_card_id=999999;
  assert.throws(()=>verify(source),/Altered official Japanese printing identity/);
  const moved=clone();
  moved.entries.find(e=>e.name_en==='Canceling Cologne').japanese_set='invented';
  assert.throws(()=>verify(moved),/Altered official Japanese set/);
});

test('cross-language alternate card count discrepancy fails before play',()=>{
  const drift=structuredClone(english);
  drift.entries.find(e=>e.name_en==='Canceling Cologne').count=2;
  assert.throws(()=>verify(alternate,frozen,drift),/English proxy differs/);
});

test('falsified physical fingerprint and source code fail',()=>{
  const fingerprint=clone();
  fingerprint.japanese_id_count_sha256='1'.repeat(64);
  assert.throws(()=>verify(fingerprint),/Expected values to be strictly equal/);
  const key=clone();
  key.source_deck_code='fabricated';
  assert.throws(()=>verify(key),/Expected values to be strictly equal/);
});
