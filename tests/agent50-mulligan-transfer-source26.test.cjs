'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const field=require('../results/aichi-2026/full-decklists.json');
const adp=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const alchemy=require('../results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json');
const sets=require('../resources/sets/en.json');
const {choose,miss,transfer,soloAfterSourceBonus}=require('../simulation/evaluation/agent50-mulligan-transfer.cjs');
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
    
    const number=x.printing.set==='SMP'?'SM'+x.printing.number:x.printing.number;
    const printing=card((matching[0]?.id||x.printing.set.toLowerCase())+'-'+number);
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
  assert.ok(Math.abs(a.sourceOne-0.34963341055673314)<1e-9);
  assert.ok(Math.abs(a.sourceTwo-0.13954584442484708)<1e-9);
  assert.ok(Math.abs(a.sourceExpected-0.5818693796509244)<1e-9);
  assert.ok(Math.abs(b.sourceOne-0.16012028914865803)<1e-9);
  assert.ok(Math.abs(b.sourceTwo-0.030526403562078485)<1e-9);
  assert.ok(Math.abs(b.sourceExpected-0.19783731987819125)<1e-9);
  const opening=(7/60)/(1-miss(12));
  const observed=(x)=>opening+(1-opening)*x.sourceExpected/53;
  close(observed(a),0.15354412205972623);
  close(observed(b),0.14734271444627067);
  assert.equal(field.decks.find(d=>d.rank===26).cards.find(c=>c.name==='Meloetta ex').count,1);
  console.log(JSON.stringify({rank26SourceBasics:12,agent5:a,agent43:b,
    singletonMeloettaSeenIfAllBonusTaken:{agent5:observed(a),agent43:observed(b)},
    qualification:'opening only, no native games, no game-win inference'},null,2));
});

test('rank26 source-first solo Active survives optional bonus draws',()=>{
  const tested=[[7,0.6924920315030554,0.6807491907649441],
    [12,0.4711087012154489,0.4526058717205819],
    [14,0.3941763347511427,0.37506796023082156],
    [17,0.2927817855650311,0.27462789393091397]];
  for(const [basics,opening,postBonus] of tested){
    const actual=soloAfterSourceBonus(basics,sourceBasics(26));
    close(actual.soloSeven,opening);
    close(actual.soloAfterAllSourceBonuses,postBonus);
    assert.ok(actual.soloAfterAllSourceBonuses<=actual.soloSeven);
  }
  const adp=soloAfterSourceBonus(manifestBasics(require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json').cards),12);
  const alchemy=soloAfterSourceBonus(manifestBasics(require('../results/aichi-2026/agent43-apex-alchemy-paper-expanded-v0.json').cards),12);
  assert.ok(adp.soloAfterAllSourceBonuses>alchemy.soloAfterAllSourceBonuses);
  const basics=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json').cards
    .filter(x=>{const p=card(x.id);return p.supertype==='Pokémon'&&p.subtypes.includes('Basic');});
  assert.equal(basics.reduce((n,x)=>n+x.count,0),7);
  for(const row of basics)assert.ok(Number(card(row.id).hp)<=280,row.name);
});

test('equal-weight original 29 ranks candidate bonus asymmetry',()=>{
  const audit=require('../results/aichi-2026/opening-hand-audit.json');
  assert.equal(audit.decks.length,29);
  const originalRanks=field.decks.map(d=>d.rank).sort((a,b)=>a-b);
  assert.deepEqual(audit.decks.map(d=>d.rank).sort((a,b)=>a-b),originalRanks);
  const basicCounts=audit.decks.map(d=>{
    assert.equal(d.unresolved_pokemon.length,0);
    assert.ok(Number.isInteger(d.basic_count_known));
    return d.basic_count_known;
  });
  const mean=(candidateBasics)=>{
    const rows=basicCounts.map(sourceCount=>transfer(candidateBasics,sourceCount));
    const avg=key=>rows.reduce((a,b)=>a+b[key],0)/rows.length;
    const candidateReceived=avg('candidateExpected'),sourceReceived=avg('sourceExpected');
    return {
      candidateOne:avg('candidateOne'),sourceOne:avg('sourceOne'),
      candidateReceived,sourceReceived,net: candidateReceived-sourceReceived
    };
  };
  const a=mean(7),b=mean(12),reference=mean(14),newMoon=mean(17);
  assert.ok(Math.abs(a.candidateOne-0.1439448732)<1e-9);
  assert.ok(Math.abs(a.sourceOne-0.3416691081)<1e-9);
  assert.ok(Math.abs(a.candidateReceived-0.2386327448)<1e-9);
  assert.ok(Math.abs(a.sourceReceived-0.5686149720)<1e-9);
  assert.ok(Math.abs(a.net-(-0.3299822273))<1e-9);
  assert.ok(Math.abs(b.candidateOne-0.1796223153)<1e-9);
  assert.ok(Math.abs(b.sourceOne-0.1564022924)<1e-9);
  assert.ok(Math.abs(b.candidateReceived-0.2919340055)<1e-9);
  assert.ok(Math.abs(b.sourceReceived-0.1932435328)<1e-9);
  assert.ok(Math.abs(b.net-0.0986904727)<1e-9);
  assert.ok(Math.abs(reference.net-0.1733565235)<1e-9);
  assert.ok(Math.abs(newMoon.net-0.2432118312)<1e-9);
  console.log(JSON.stringify({field:'29 known original ranks only',
    candidateADP7:a,candidateApexAlchemy12:b,reference14:reference,newMoon17:newMoon,
    qualification:'setup offers, not game strength or all32'},null,2));
});
