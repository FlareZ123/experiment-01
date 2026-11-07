'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const originalEn=require('../results/als/new-moon-lockbreak-english-proxy-60.json');
const originalJp=require('../results/als/new-moon-lockbreak-japanese-print-60.json');
const candidateEn=require('../results/als/agent21-energy-retrieval-slot-english-proxy-60.json');
const candidateJp=require('../results/als/agent21-energy-retrieval-slot-japanese-print-60.json');
const cards=require('../resources/cards/en/sv1.json');

/**
 * @param {object} deck
 * @param {'name_en'|'english_database_name'} [key]
 * @returns {Map<string,number>}
 */
function names(deck,key='name_en'){
  return new Map(deck.entries.map(card=>[card[key],card.count]));
}

/** @param {Map<string,number>} map @returns {number} */
function total(map) {
  return [...map.values()].reduce((a,b)=>a+b,0);
}

test('English and Japanese source-proxy variants remain physical 60',()=>{
  for(const deck of [originalEn,originalJp,candidateEn,candidateJp]){
    assert.equal(deck.entries.length,deck.counts.unique??34);
    assert.equal(total(names(deck)),60);
    assert.equal(deck.counts.total,60);
  }
  assert.equal(candidateEn.counts['Pokémon'],19);
  assert.equal(candidateEn.counts.Trainer,35);
  assert.equal(candidateEn.counts.Energy,6);
});

test('single exact named-card change in each 60, all other names equal',()=>{
  for(const [oldDeck,newDeck] of [
    [originalEn,candidateEn],[originalJp,candidateJp]
  ]){
    const before=names(oldDeck),after=names(newDeck);
    const all=[...new Set([...before.keys(),...after.keys()])].sort();
    const changed=all.map(name=>[name,
      (after.get(name)??0)-(before.get(name)??0)])
      .filter(row=>row[1]!==0);
    assert.deepEqual(changed,[
      ['Energy Retrieval',1],['Fog Crystal',-1]
    ]);
    assert.equal(after.get('Fog Crystal'),3);
    assert.equal(after.get('Energy Retrieval'),1);
  }
});

test('English and Japanese candidate variants have the same 60 names',()=>{
  assert.deepEqual(
    [...names(candidateEn)].sort(([a],[b])=>a.localeCompare(b)),
    [...names(candidateJp)].sort(([a],[b])=>a.localeCompare(b))
  );
});

test('source card database says Energy Retrieval is an Expanded legal Item',()=>{
  const retrieval=cards.find(x=>x.id==='sv1-171');
  assert.equal(retrieval.name,'Energy Retrieval');
  assert.equal(retrieval.supertype,'Trainer');
  assert.ok(retrieval.subtypes.includes('Item'));
  assert.equal(retrieval.legalities.expanded,'Legal');
  assert.ok(retrieval.rules.some(rule=>
    rule==='Put up to 2 Basic Energy cards from your discard pile into your hand.'));
});

test('printed variant specifies official Japanese I-era recovery printing',()=>{
  const recovery=candidateJp.entries.find(row=>row.name_en==='Energy Retrieval');
  assert.equal(recovery.japanese_set,'SV11W');
  assert.equal(recovery.japanese_number,'079/086');
  assert.equal(recovery.japanese_card_id,47701);
  assert.equal(recovery.printing_source,
    'https://www.pokemon-card.com/card-search/details.php/card/47701');
  assert.equal(candidateEn.entries.find(
    row=>row.name_en==='Energy Retrieval').english_proxy_card_id,'sv1-171');
});

test('ACE SPEC and four-copy named limit remain intact',()=>{
  const en=names(candidateEn);
  for(const [name,copies] of en){
    if(name!=='Basic Psychic Energy')
      assert.ok(copies<=4,name+' exceeds four copies');
    assert.ok(copies>=1);
  }
  assert.equal(en.get('Secret Box'),1);
  assert.equal([...en].filter(([name])=>/^(Secret Box|Computer Search|Prime Catcher)$/
    .test(name)).reduce((n,[,copies])=>n+copies,0),1);
});

test('proposals retain an explicit unqualified status and original provenance',()=>{
  assert.match(candidateEn.status,/HYPOTHESIS ONLY/);
  assert.match(candidateJp.status,/PROPOSED/);
  assert.equal(candidateEn.source_path,
    'results/als/new-moon-lockbreak-english-proxy-60.json');
  assert.equal(candidateJp.source_print_manifest,
    'results/als/new-moon-lockbreak-japanese-print-60.json');
});
