'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {check,audit}=require('../scripts/new-moon-lockbreak-japanese-ban-screen.cjs');
const dated=require('../results/legality/japan-expanded-aichi-2026.json');
const candidate=require('../results/als/new-moon-lockbreak-japanese-print-60.json');

test('exact proposed 60 clears event-date named printed-ban collision screen',()=>{
  const result=audit();
  assert.equal(result.printedCards,60);
  assert.equal(result.eventDate,'2026-05-10');
  assert.equal(result.restrictedPrintCollisions,0);
  assert.equal(result.fullPaperLegalityCertified,false);
  assert.equal(result.competitiveGamesQualified,0);
  assert.deepEqual(result.listedNameContacts.map(x=>x.name).sort(),
    ['Duskull','Unown','Unown']);
  assert.equal(candidate.entries.find(x=>x.name_en==='Duskull').japanese_set,'S4');
  assert.equal(candidate.entries.find(x=>x.name_en==='Unown').japanese_set,'XY');
  console.log('Japanese source-proposed 60: no explicit dated restricted-print collisions.');
  console.log('Same-name source contacts:',result.listedNameContacts);
});

test('a specific restricted Duskull and two restricted Unown printings fail',()=>{
  for(const [name,set] of [['Duskull','SM11a'],['Unown','SM8']]){
    const altered=structuredClone(candidate.entries);
    altered.find(x=>x.name_en===name).japanese_set=set;
    assert.throws(()=>check(altered,dated),/Specifically restricted Japanese set/);
    console.log('Refused printed form:',name,set);
  }
});

test('whole-name restricted trainers cannot be excused by using a different set',()=>{
  const changed=structuredClone(candidate.entries);
  changed.find(x=>x.name_en==='Field Blower').name_en="Lysandre's Trump Card";
  assert.throws(()=>check(changed,dated),/Whole card name restricted/);
});

test('event-date mismatch fails before evidence is attributed to 2026 Aichi',()=>{
  const changed={...dated,valid_for_event:'2025-05-10'};
  assert.throws(()=>audit(candidate,
    require('../results/als/new-moon-official-japanese-print-60.json'),
    changed),/Expected values to be strictly equal/);
});

test('unknown historical ban selector is rejected',()=>{
  const changed=structuredClone(dated);
  changed.banned_identities=[{english_name:'Field Blower',
    japanese_printing:'SM4p',selector:{type:'unknown'}}];
  assert.throws(()=>check(candidate.entries,changed),
    /expression evaluated to a falsy value/);
});
