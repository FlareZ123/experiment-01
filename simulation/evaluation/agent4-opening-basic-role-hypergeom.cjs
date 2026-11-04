'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent4-opening-basic-role-hypergeom-v1';
const SPECS=[
  {rank:1,main:'Shadow Rider Calyrex V',
    evolutions:['Shadow Rider Calyrex VMAX'],
    triggers:['Tapu Lele-GX','Radiant Eternatus']},
  {rank:5,main:'Mew V',evolutions:['Mew VMAX'],
    triggers:['Dedenne-GX','Crobat V']}
];
/** @param {number} n @param {number} k */
function comb(n,k){
  if(k<0||k>n)return 0;
  let result=1;
  for(let i=1;i<=Math.min(k,n-k);i++)
    result=result*(n-i+1)/i;
  return Math.round(result);
}
/**
 * Exact seven-card opening distribution conditioned on a valid Basic.
 * Source-specific Basic and on-Bench-trigger classifications were checked
 * against the provided printed card database and advanced rules.
 * @param {object} deck
 * @param {object} spec
 */
function analyse(deck,spec){
  assert.equal(deck.rank,spec.rank);
  assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60);
  const pokemon=deck.cards.filter(c=>c.category==='Pokémon');
  const basic=pokemon.filter(c=>!spec.evolutions.includes(c.name));
  const K=basic.reduce((s,c)=>s+c.count,0);
  const main=basic.find(c=>c.name===spec.main)?.count??0;
  const trigger=basic.filter(c=>spec.triggers.includes(c.name))
    .reduce((s,c)=>s+c.count,0);
  assert.ok(K>main&&main>0&&trigger>0);
  assert.equal(pokemon.filter(c=>spec.evolutions.includes(c.name)).length,
    spec.evolutions.length);
  const N=60,n=7,den=comb(N,n);
  const p=Array.from({length:n+1},(_,i)=>
    comb(K,i)*comb(N-K,n-i)/den);
  const valid=1-p[0];
  const triggerWithOther=(1-comb(N-trigger,n)/den-
    comb(N-(K-trigger),n)/den+comb(N-K,n)/den)/valid;
  return {
    rank:deck.rank,archetype:deck.archetype,
    totalBasics:K,mainName:spec.main,mainCount:main,
    triggerCopies:trigger,
    pMulligan:p[0],
    pTwoOrMoreBasicsGivenValid:p.slice(2).reduce((s,x)=>s+x,0)/valid,
    extraBasicsUnusedGivenValid:
      p.reduce((s,x,i)=>s+x*Math.max(0,i-1),0)/valid,
    benchSlotsUnusedGivenValid:
      p.reduce((s,x,i)=>s+x*Math.min(5,Math.max(0,i-1)),0)/valid,
    pMainSelectedFirstEligible:main/K,
    pMainPresentGivenValid:(1-comb(N-main,n)/den)/valid,
    pTriggerAndOtherBasicGivenValid:triggerWithOther
  };
}
function run(){
  const root=path.resolve(__dirname,'../../results/aichi-2026/full-decklists.json');
  const decks=JSON.parse(fs.readFileSync(root,'utf8')).decks;
  return SPECS.map(spec=>analyse(decks.find(d=>d.rank===spec.rank),spec));
}
if(require.main===module)
  console.log(JSON.stringify({schema:VERSION,results:run(),qualifiedGames:0},null,2));
module.exports={VERSION,SPECS,comb,analyse,run};
