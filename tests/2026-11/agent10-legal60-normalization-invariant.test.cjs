'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const original=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
const normalized=require('../../results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.json');
function totals(deck){
 const count={total:0,'Pokémon':0,Trainer:0,Energy:0};
 for(const row of deck.cards){
  assert.ok(Number.isSafeInteger(row.count)&&row.count>0);
  assert.ok(row.printing.language==='en');
  assert.ok(row.category in count);
  count[row.category]+=row.count;count.total+=row.count;
 }
 return count;
}
test('original and normalized source are both fixed 18/31/11 sixty-card decks',()=>{
 const want={total:60,'Pokémon':18,Trainer:31,Energy:11};
 assert.deepEqual(totals(original),want);
 assert.deepEqual(totals(normalized),want);
 assert.equal(original.cards.length,normalized.cards.length);
 assert.equal(normalized.cards.length,34);
});
test('normalizer changes only one full Battle Compressor name and one Basic Energy printing',()=>{
 const seen=[];
 for(let i=0;i<original.cards.length;i++){
  const a=original.cards[i],b=normalized.cards[i];
  assert.equal(a.count,b.count);assert.equal(a.category,b.category);
  if(a.name===b.name&&JSON.stringify(a.printing)===JSON.stringify(b.printing))
    continue;
  seen.push(i);
  if(a.name==='Battle Compressor'){
   assert.equal(a.printing.set,'PHF');assert.equal(a.printing.number,'92');
   assert.equal(b.name,'Battle Compressor Team Flare Gear');
   assert.deepEqual(b.printing,a.printing);continue;
  }
  assert.equal(a.category,'Energy');
  assert.equal(a.name,'Psychic Energy');
  assert.equal(a.count,11);
  assert.deepEqual(a.printing,{set:'MEE',number:'13',language:'en'});
  assert.equal(b.name,'Basic Psychic Energy');
  assert.deepEqual(b.printing,{set:'CRE',number:'232',language:'en'});
 }
 assert.equal(seen.length,2);
});
test('all non-Basic-Energy card counts stay <=4; singleton ACE SPEC and Radiant limit',()=>{
 const unique=new Set();
 for(const card of normalized.cards){
  const id=[card.name,card.printing.set,card.printing.number].join('|');
  assert.ok(!unique.has(id));unique.add(id);
  if(card.category==='Energy'&&card.name==='Basic Psychic Energy')continue;
  assert.ok(card.count<=4);
 }
 assert.equal(normalized.cards.filter(c=>c.name==='Unfair Stamp').reduce((n,c)=>n+c.count,0),1);
 assert.equal(normalized.cards.filter(c=>c.name.startsWith('Radiant ')).reduce((n,c)=>n+c.count,0),1);
});
test('source normalization preserves names and counts for all Pokémon and Supporters',()=>{
 const project=deck=>deck.cards.filter(c=>c.category==='Pokémon'||
  ['Supporter','Teammates','Raihan','Acerola','Iono','Guzma'].some(n=>
    c.name===n || c.name===n+' Supporter')||
  ["Lillie's Determination",'Pokémon Ranger','Arven'].includes(c.name)).map(c=>
    [c.category,c.name,c.count,c.printing.set,c.printing.number]);
 assert.deepEqual(project(original),project(normalized));
});
test('the exact 60 normalization is experimental and cites original immutable source',()=>{
 assert.equal(normalized.rank,0);
 assert.equal(normalized.normalization.originalCandidatePreserved,true);
 assert.equal(normalized.normalization.from,
  'results/aichi-2026/candidate-hood-shadow-rider.json');
 assert.equal(normalized.normalization.changes.length,2);
 assert.match(normalized.normalization.competitiveStatus,/not nominated/);
});