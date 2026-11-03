'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const {inventory,countFogBridge} = require('../scripts/agent15-rank31-roxie-fog-crystal-bridge.cjs');
const {inventory:priorInventory,countTriad} = require('../scripts/agent15-rank31-roxie-radiant-triad.cjs');
const manifest=JSON.parse(fs.readFileSync(
  path.join(__dirname,'..','results','aichi-2026','full-decklists.json'),'utf8'));
const source=manifest.decks.find(d=>d.rank===31);
test('source IDs and Psychic type search',()=>{
  assert.deepEqual(inventory(source),[3,1,4,4,11,37]);
  for(const [set,n,name] of [
    ['swsh6','140','Fog Crystal'],['sm12','76','Koffing'],
    ['swsh12','59','Radiant Alakazam']]){
    const cards=JSON.parse(fs.readFileSync(path.join(__dirname,'..',
      'resources','cards','en',set+'.json'),'utf8'));
    const c=cards.find(card=>card.id===set+'-'+n);
    assert.equal(c.name,name);
    if(name==='Fog Crystal')assert(c.rules.some(s=>s.includes('Basic Psychic Pokémon')));
    else assert(c.types.includes('Psychic') && c.subtypes.includes('Basic'));
  }
});
test('all six-Prize partition weights and exact independent triad parity',()=>{
  const r=countFogBridge(inventory(source));
  const e=r.events;
  assert.equal(r.validSeven,'340827300');
  assert.equal(r.denominator,'367753188390588000');
  assert.equal(e.roxieHeld.numerator,'158827184335747200');
  assert.equal(e.directRoxieKoffingRadiant.numerator,'6306357599272640');
  assert.equal(e.fogSearchOnlyRadiant.numerator,'12694283190625680');
  assert.equal(e.fogSearchOnlyKoffing.numerator,'6051029052666864');
  assert.equal(e.twoFogSearchBoth.numerator,'5931608527188336');
  assert.equal(e.oneFogCannotGetBoth.numerator,'33861408798220640');
  assert.equal(e.anyAvailableTriad.numerator,'30983278369753520');
  assert(Math.abs(e.anyAvailableTriad.percent-8.425019645743058)<1e-10);
  const prior=countTriad(priorInventory(source)).events.roxieRetainedKoffingAndRadiant;
  assert(Math.abs(e.directRoxieKoffingRadiant.percent-prior.percent)<1e-10);
  const sum=['directRoxieKoffingRadiant','fogSearchOnlyRadiant',
    'fogSearchOnlyKoffing','twoFogSearchBoth'].reduce(
    (s,k)=>s+BigInt(e[k].numerator),0n);
  assert.equal(String(sum),e.anyAvailableTriad.numerator);
});
