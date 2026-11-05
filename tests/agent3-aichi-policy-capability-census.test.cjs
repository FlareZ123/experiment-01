'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const {summarizeOriginalCapabilities}=require('../simulation/evaluation/agent3-aichi-policy-capability-census.cjs');
const source=()=>JSON.parse(fs.readFileSync(path.join(__dirname,'../results/aichi-2026/full-decklists.json'),'utf8'));

test('frozen original 29 capability census',()=>{
  const r=summarizeOriginalCapabilities(source());
  assert.equal(r.authenticatedOriginalDecks,29);
  assert.deepEqual(r.missingOriginalRanks,[23,25,28]);
  assert.equal(r.energyCopies,238);
  assert.equal(r.specialEnergyCopies,118);
  assert.deepEqual(r.specialEnergyOnly,[4,5,6,7,17,24,29]);
  assert.equal(r.withSpecialEnergy.length,24);
  assert.equal(r.withPrintedVmaxOrVstar.length,11);
  assert.equal(r.withExactGuzma.length,25);
  assert.equal(r.exactGuzmaCopies,48);
  assert.equal(r.qualifiedPaperGames,0);
});
test('source row cannot silently change from a 60',()=>{
  const d=source();
  d.decks[0].cards[0].count++;
  assert.throws(()=>summarizeOriginalCapabilities(d));
});
test('different Guzma & Hala Supporter is excluded',()=>{
  const d=source();
  d.decks[1].cards.find(c=>c.name==='Guzma').name='Guzma & Hala';
  const r=summarizeOriginalCapabilities(d);
  assert.equal(r.exactGuzmaCopies,46);
  assert.ok(!r.withExactGuzma.includes(2));
});
