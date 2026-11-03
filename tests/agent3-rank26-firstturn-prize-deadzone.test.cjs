'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const original=require('../results/aichi-2026/full-decklists.json').decks.find(d=>d.rank===26);

/** @param {number} n @param {number} k @returns {bigint} */
function C(n,k){
  if(k<0||k>n)return 0n;
  let v=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)v=v*BigInt(n-i+1)/BigInt(i);
  return v;
}
/** @param {bigint} a @param {bigint} b */
function gcd(a,b){while(b!==0n)[a,b]=[b,a%b];return a;}
/** @param {bigint} n @param {bigint} d */
function fraction(n,d){const g=gcd(n,d);return [n/g,d/g];}
/** @param {number} x */
function countBits(x){let n=0;for(;x;x&=x-1)n++;return n;}
const eventMasks=[3,13,193,305,561];
const eventNames=[
  'Ticket+DCE','Ticket+both Lightning','Ticket+both Crisis TMs',
  'Ticket+both Heavy Balls+Meloetta','Ticket+both Heavy Balls+Koko'
];
/** @returns {object} */
function calculate(){
  const totalPrizes=C(60,6),totalOpenings=C(60,7);
  const validOpenings=totalOpenings-C(48,7),afterPrizes=C(54,7);
  let unionWays=0n,conditionalWays=0n;
  const individuals=eventMasks.map(()=>0n);
  for(let mask=0;mask<1024;mask++){
    const hits=eventMasks.map((e,i)=>(mask&e)===e?i:-1).filter(i=>i!==-1);
    if(!hits.length)continue;
    const remaining=6-countBits(mask);
    if(remaining<0)continue;
    const trackedBasic=Number(Boolean(mask&256))+Number(Boolean(mask&512));
    const trackedNonbasic=countBits(mask)-trackedBasic;
    for(let otherBasic=0;otherBasic<=10;otherBasic++){
      const otherNonbasic=remaining-otherBasic;
      const ways=C(10,otherBasic)*C(40,otherNonbasic);
      if(!ways)continue;
      const valid7=afterPrizes-C(48-trackedNonbasic-otherNonbasic,7);
      unionWays+=ways;
      conditionalWays+=ways*valid7;
      for(const i of hits)individuals[i]+=ways*valid7;
    }
  }
  const denominator=totalPrizes*afterPrizes*validOpenings;
  return {
    conditional:fraction(conditionalWays*totalOpenings,denominator),
    unconditional:fraction(unionWays,totalPrizes),
    individuals:individuals.map(v=>fraction(v*totalOpenings,denominator))
  };
}
/** @param {[bigint,bigint]} fractionPair */
function percent(fractionPair){return 100*Number(fractionPair[0])/Number(fractionPair[1]);}
test('source rank26 print identities and Basic count are exact',()=>{
  assert.ok(original);
  assert.equal(original.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(original.cards.filter(c=>c.category==='Pokémon').reduce((n,c)=>n+c.count,0),12);
  for(const [name,count,set,number] of [
    ['Redeemable Ticket',1,'JTG','156'],
    ['Double Colorless Energy',1,'SUM','136'],
    ['Lightning Energy',2,'MEE','12'],
    ['Hisuian Heavy Ball',2,'ASR','146'],
    ['Technical Machine: Crisis Punch',2,'PAF','90'],
    ['Meloetta ex',1,'BLK','44'],
    ['Tapu Koko ♢',1,'TEU','51']
  ]){
    const row=original.cards.find(c=>c.name===name);
    assert.ok(row,name);
    assert.equal(row.count,count,name);
    assert.deepEqual([row.printing.set,row.printing.number],[set,number]);
  }
});
test('printed source-card effects preserve the no-alternate-resource proof',()=>{
  /** @param {string} set @param {string} id */
  const card=(set,id)=>{
    const row=require('../resources/cards/en/'+set+'.json').find(x=>x.id===id);
    assert.ok(row,id);return row;
  };
  const ticket=card('sv9','sv9-156');
  assert.match(ticket.rules[0],/Prize cards.*bottom of your deck/);
  const heavy=card('swsh10','swsh10-146');
  assert.match(heavy.rules[0],/Basic Pok(?:é|e)mon/);
  const koko=card('sm9','sm9-51');
  assert.match(koko.abilities[0].text,/choose 2 of your Benched Pok(?:é|e)mon/);
  assert.match(koko.abilities[0].text,/a Lightning Energy card.*each of them/);
  const melo=card('zsv10pt5','zsv10pt5-44');
  assert.match(melo.abilities[0].text,/If you go first.*first turn/);
  const crisis=card('sv4pt5','sv4pt5-90').attacks[0];
  assert.deepEqual(crisis.cost,['Colorless','Colorless','Colorless']);
  assert.equal(crisis.damage,'280');
  assert.match(crisis.text,/exactly 1 Prize card remaining/);
});

test('exact conditioned Prize-union probabilities, no duplicated masks',()=>{
  const v=calculate();
  assert.deepEqual(v.conditional,[8787403607887n,896999961737880n]);
  assert.deepEqual(v.unconditional,[120642n,12515965n]);
  assert.ok(Math.abs(percent(v.conditional)-0.9796436992998269)<1e-10);
  const expected=[0.8606833848066566,0.059817753855913126,
    0.059817753855913126,0.003056973782571123,0.003056973782571123];
  for(let i=0;i<5;i++)assert.ok(Math.abs(percent(v.individuals[i])-expected[i])<1e-10);
  assert.ok(v.individuals.reduce((sum,f)=>sum+percent(f),0)>percent(v.conditional));
  console.log('AGENT3_RANK26_PRIZE_UNION',JSON.stringify({
    sourceRank:26,condition:'valid starting 7 from 12 Basics',
    event:'Ticket Prized together with at least one blocked firstturn Crisis Punch resource chain',
    conditionalPercent:percent(v.conditional),unconditionalPercent:percent(v.unconditional),
    eventPercents:Object.fromEntries(eventNames.map((name,i)=>[name,percent(v.individuals[i])])),
    wholeGameLossProved:false,qualifiedCompetitiveGames:0
  }));
});
