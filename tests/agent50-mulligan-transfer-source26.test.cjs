'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const field=require('../results/aichi-2026/full-decklists.json');
const adp=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const alchemy=require('../results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json');
const sets=require('../resources/sets/en.json');
const {choose,miss,transfer}=require('../simulation/evaluation/agent50-mulligan-transfer.cjs');
const cache=new Map();

/** @param {string} id @returns {object} */
function card(id){
  const setId=id.slice(0,id.lastIndexOf('-'));
  if(!cache.has(setId))cache.set(setId,require(path.resolve(__dirname,'../resources/cards/en',setId+'.json')));
  const printing=cache.get(setId).find(x=>x.id===id);
  assert.ok(printing,'Missing printing '+id);
  return printing;
}

/** @param {Array<object>} rows @returns {number} */
function manifestBasics(rows){
  assert.equal(rows.reduce((n,x)=>n+x.count,0),60);
  return rows.reduce((n,x)=>{const printing=card(x.id||x.cardId);return n+(printing.supertype==='Pokémon'&&printing.subtypes.includes('Basic')?x.count:0);},0);
}

/** @param {number} rank @returns {number} */
function sourceBasics(rank){
  const deck=field.decks.find(x=>x.rank===rank);
  assert.ok(deck);
  assert.equal(deck.cards.reduce((n,x)=>n+x.count,0),60);
  return deck.cards.filter(x=>x.category==='Pokémon').reduce((n,x)=>{
    const matching=sets.filter(s=>s.ptcgoCode===x.printing.set);
    
    const printing=card((matching[0]?.id||x.printing.set.toLowerCase())+'-'+x.printing.number);
    return n+(printing.subtypes.includes('Basic')?x.count:0);
  },0);
}

/** @param {number} a @param {number} b */
function close(a,b){assert.ok(Math.abs(a-b)<1e-12,a+' != '+b);}

test('printed source and unchanged candidate counts',()=>{
  assert.equal(choose(60,7),386206920);
  assert.equal(manifestBasics(adp.cards),7);
  assert.equal(manifestBasics(alchemy.cards),12);
  assert.equal(sourceBasics(26),12);
  assert.equal(sourceBasics(6),4);
  assert.equal(sourceBasics(1),14);
});
test('direct algebra and independent mulligan-pair summation agree',()=>{
  for(const [b,s] of [[7,12],[12,12],[7,4],[14,12]]){
    const a=transfer(b,s),p=miss(b),q=miss(s);
    let one=0,two=0,mean=0;
    for(let i=0;i<90;i++)for(let j=0;j<90;j++){
      const probability=(1-p)*p**i*(1-q)*q**j;
      const offered=Math.min(Math.max(i-j,0),47);
      if(offered>0)one+=probability;
      if(offered>1)two+=probability;
      mean+=probability*offered;
    }
    close(one,a.sourceOne);close(two,a.sourceTwo);close(mean,a.sourceExpected);
  }
});
test('registered rank-26 donation contrast remains opportunity-only',()=>{
  const a=transfer(7,12),b=transfer(12,12);
  close(a.sourceOne,0.34963341055673314);
  close(a.sourceTwo,0.13954584442484708);
  close(a.sourceExpected,0.5818693796509244);
  close(b.sourceOne,0.16012028914865803);
  close(b.sourceTwo,0.030526403562078485);
  close(b.sourceExpected,0.19783731987819125);
  const opening=(7/60)/(1-miss(12));
  const observed=(x)=>opening+(1-opening)*x.sourceExpected/53;
  close(observed(a),0.15354412205972623);
  close(observed(b),0.14734271444627067);
  assert.equal(field.decks.find(d=>d.rank===26).cards.find(c=>c.name==='Meloetta ex').count,1);
  console.log(JSON.stringify({rank26SourceBasics:12,agent5:a,agent43:b,
    singletonMeloettaSeenIfAllBonusTaken:{agent5:observed(a),agent43:observed(b)},
    qualification:'opening only, no native games, no game-win inference'},null,2));
});
