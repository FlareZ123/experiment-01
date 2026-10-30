'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const manifest=require('../results/aichi-2026/full-decklists.json');
const {nativePrintingPublicPosterior}=
 require('../scripts/agent26-public-mulligan-native-printed-posterior.cjs');
const {publicFailedHandHistoryPosterior}=
 require('../scripts/agent26-public-mulligan-fullhistory.cjs');
function fixture(){
 const names=new Map(),decks=new Map();
 for(const d of manifest.decks){
  const cards=[];
  for(const c of d.cards){
   const id=c.name+' '+c.printing.set+'_'+c.printing.number;
   names.set(id,c.name);
   for(let i=0;i<c.count;i++)cards.push(id);
  }
  assert.equal(cards.length,60);
  decks.set(d.rank,cards);
 }
 return {names,plan:{
  candidateRank:1,candidate:{cards:decks.get(1)},
  opponents:[...decks].filter(([rank])=>rank!==1)
    .map(([rank,cards])=>({rank,cards,status:'ready'}))
 }};
}
const f=fixture(),near=(a,b)=>
 assert.ok(Math.abs(a-b)<1e-12,String(a)+' != '+String(b));
test('zero invalid sevens agrees with known-source count-only model',()=>{
 const a=nativePrintingPublicPosterior(manifest,f.plan,f.names,[]);
 const b=publicFailedHandHistoryPosterior(manifest,[]);
 for(let i=0;i<29;i++)near(a.models[i].posterior,b.models[i].posterior);
 assert.equal(a.competitiveQualifiedGames,0);
});
test('exact observed non-Basic printing remains possible in its source',()=>{
 const d=manifest.decks.find(x=>x.rank===6);
 const hand=['Crushing Hammer','Camping Gear','Echoing Horn',
  'Wondrous Labyrinth ♢','Guzma & Hala','Guzma',
  'Speed Lightning Energy'].map(name=>{
   const c=d.cards.find(x=>x.name===name);
   return c.name+' '+c.printing.set+'_'+c.printing.number;
  });
 const a=nativePrintingPublicPosterior(manifest,f.plan,f.names,[hand]);
 assert.ok(a.models.find(x=>x.rank===6).posterior>0);
});
test('a Basic printing is impossible in a failed opening seven',()=>{
 const all=f.plan.opponents.find(x=>x.rank===6).cards;
 const basic=all.find(x=>x.startsWith('Iron Thorns ex '));
 const invalid=[basic,...all.filter(x=>!x.startsWith('Iron Thorns ex ')).slice(0,6)];
 assert.throws(()=>nativePrintingPublicPosterior(manifest,
  f.plan,f.names,[invalid]),/impossible/i);
});
