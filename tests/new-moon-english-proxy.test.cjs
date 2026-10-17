'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
/** @param {string} name @returns {any} */
const json=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const fixture=json('results/als/new-moon-perfection-english-proxy-60.json');
const source=json('results/als/new-moon-perfection-source-60.json');
const sets=new Map(json('resources/sets/en.json').map(s=>[s.id,s]));
const bans=json('results/legality/japan-expanded-aichi-2026.json').banned_identities;
assert.equal(fixture.entries.length,33);
assert.equal(fixture.entries.reduce((n,c)=>n+c.count,0),60);
assert.deepEqual(fixture.counts,source.counts);
assert.equal(fixture.source_deck_code,source.official_japanese_deck_code);
let basics=0,aceSpecs=0;
const abilities=new Map();
for(let i=0;i<33;i++){
 const e=fixture.entries[i],s=source.entries[i];
 assert.deepEqual([e.name_en,e.name_ja,e.count,e.type],[s.name_en,s.name_ja,s.count,s.type]);
 const setId=e.english_proxy_card_id.split('-')[0];
 const card=json('resources/cards/en/'+setId+'.json').find(c=>c.id===e.english_proxy_card_id);
 assert.ok(card,'Unmapped English printing '+e.english_proxy_card_id);
 assert.equal(card.name,e.english_database_name);
 assert.equal(card.legalities.expanded,'Legal');
 assert.ok(sets.get(setId).releaseDate<='2026/05/10');
 if(card.supertype==='Pokémon'&&card.subtypes.includes('Basic'))basics+=e.count;
 if(card.subtypes.includes('ACE SPEC'))aceSpecs+=e.count;
 const names=(card.abilities||[]).map(a=>a.name);
 abilities.set(e.name_en,names);
 for(const b of bans){
  if(b.english_name!==card.name)continue;
  const type=b.selector.type,v=b.selector.value;
  const hit=type==='trainer_name'||type==='pokemon_name'||
   (type==='ability'&&names.includes(v))||
   (type==='attack'&&(card.attacks||[]).some(a=>a.name===v));
  assert.equal(hit,false,'Banned English equivalent '+card.id);
 }
}
assert.equal(basics,17);
assert.equal(aceSpecs,1);
for(const [n,a] of [['Mewtwo & Mew-GX','Perfection'],['Unown','Farewell Letter'],['Dusclops','Cursed Blast'],['Lunatone','New Moon'],['Solrock','Sunbeam'],['Klefki','Mischievous Lock']]) assert.ok(abilities.get(n).includes(a));
assert.deepEqual(abilities.get('Duskull'),[]);
const lines=fixture.entries.map(e=>e.english_proxy_card_id+':'+e.count+'\n').sort().join('');
assert.equal(crypto.createHash('sha256').update(lines).digest('hex'),fixture.canonical_id_count_sha256);
console.log('New Moon English proxy passed: 60 cards; 17 Basics; one ACE SPEC; expected effects, ban selectors and hash');
