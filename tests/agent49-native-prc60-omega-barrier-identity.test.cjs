'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {reportCoverage}=require('../simulation/twinleaf/card-coverage.cjs');
const {resolveManifest}=require('../simulation/twinleaf/resolve-field.cjs');

const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json'),'utf8'));

test('original rank7 PRC60 Omega Barrier is uniquely discriminated by real pinned card power',()=>{
  const original=manifest.decks.find(d=>d.rank===7);
  assert.ok(original);
  const source=original.cards.find(c=>c.name==='Electrike'&&
    c.printing.set==='PRC'&&String(c.printing.number)==='60');
  assert.equal(source.count,1);
  const coverage=reportCoverage({decks:[original]}).decks[0];
  const row=coverage.rows.find(r=>r.name==='Electrike'&&
    r.requested.set==='PRC'&&String(r.requested.number)==='60');
  assert.equal(row.status,'ambiguous-exact');
  assert.equal(row.exact.length,2);
  const manager=initializeCards();
  const omega=row.exact.filter(c=>{
    const card=manager.getCardByName(c.fullName);
    return card?.powers?.some(power=>power.name==='Ω Barrier');
  });
  assert.equal(omega.length,1);
  const other=row.exact.filter(c=>c.fullName!==omega[0].fullName);
  assert.equal(other.length,1);
  assert.equal(manager.getCardByName(other[0].fullName).powers
    .some(power=>power.name==='Ω Barrier'),false);
  const resolved=resolveManifest({source:manifest.source,decks:[original]},
    {allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  assert.equal(resolved.totalPublishedDecks,1);
  assert.equal(resolved.resolvedDecks,1);
  const mapping=resolved.decks[0].modifications.find(m=>
    m.reason==='verified-prc60-omega-barrier-disambiguation');
  assert.ok(mapping);
  assert.equal(mapping.count,1);
  assert.equal(mapping.resolvedId,omega[0].fullName);
  assert.ok(resolved.decks[0].cardIds.includes(omega[0].fullName));
  assert.equal(resolved.decks[0].cardIds.length,60);
});
