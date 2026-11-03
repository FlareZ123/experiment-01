'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const source=require('../results/aichi-2026/full-decklists.json')
  .decks.find(d=>d.rank===26);

/** @param {number} n @param {number} k @returns {bigint} */
function C(n,k){
  if(k<0||k>n)return 0n;
  let v=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)v=v*BigInt(n-i+1)/BigInt(i);
  return v;
}
/** @param {bigint} a @param {bigint} b */
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
/** @param {bigint} n @param {bigint} d */
function frac(n,d){const g=gcd(n,d);return [n/g,d/g];}
/** @param {number} n */
function bits(n){let c=0;for(;n;n&=n-1)c++;return c;}
/** @param {number} mask */
function mincut(mask){
  if(!(mask&1))return false; // All seven cuts require Ticket to be Prized.
  const core=[
    3,13,193,305,561 // DCE, double Lightning/TM, Heavy+Melo/Koko.
  ];
  const allRisky=1|(15<<14);
  return core.some(event=>(mask&event)===event) ||
    bits(mask&(15<<10))>=3 || (mask&allRisky)===allRisky;
}
/** @returns {{conditional:[bigint,bigint],unconditional:[bigint,bigint]}} */
function compute(){
  let count=0n,weighted=0n;
  for(let mask=1;mask<(1<<18);mask+=2){
    const marked=bits(mask),other=6-marked;
    if(other<0||!mincut(mask))continue;
    const markedBasic=Number(Boolean(mask&256))+Number(Boolean(mask&512));
    const markedNonbasic=marked-markedBasic;
    for(let b=0;b<=10;b++){
      const n=other-b,ways=C(10,b)*C(32,n);
      if(!ways)continue;
      count+=ways;
      const valid=C(54,7)-C(48-markedNonbasic-n,7);
      weighted+=ways*valid;
    }
  }
  const sixtyCSeven=C(60,7),validOpenings=sixtyCSeven-C(48,7);
  return {
    conditional:frac(weighted*sixtyCSeven,
      C(60,6)*C(54,7)*validOpenings),
    unconditional:frac(count,C(60,6))
  };
}
/** @param {[bigint,bigint]} f */
function percent(f){return 100*Number(f[0])/Number(f[1]);}

test('one Ticket, Dowsing; four Pump and Risky in original 60',()=>{
  assert.ok(source);
  assert.equal(source.cards.reduce((n,c)=>n+c.count,0),60);
  for(const [name,count,set,num] of [
    ['Redeemable Ticket',1,'JTG','156'],
    ['Dowsing Machine',1,'PLS','128'],
    ['Damage Pump',4,'LOR','156'],
    ['Risky Ruins',4,'MEG','127'],
    ['Exeggcute',2,'PLF','4'],
    ['Unown',4,'AOR','30']
  ]){
    const row=source.cards.find(c=>c.name===name);
    assert.ok(row,name);
    assert.equal(row.count,count,name);
    assert.deepEqual([row.printing.set,row.printing.number],[set,num]);
  }
  const pump=require('../resources/cards/en/swsh11.json').find(c=>c.id==='swsh11-156');
  const ruins=require('../resources/cards/en/me1.json').find(c=>c.id==='me1-127');
  const dowsing=require('../resources/cards/en/bw8.json').find(c=>c.id==='bw8-128');
  const unown=require('../resources/cards/en/xy7.json').find(c=>c.id==='xy7-30');
  const egg=require('../resources/cards/en/bw9.json').find(c=>c.id==='bw9-4');
  assert.match(pump.rules[0],/up to 2 damage counters from 1 of your Pok(?:é|e)mon/);
  assert.match(ruins.rules[0],/place 2 damage counters/);
  assert.match(dowsing.rules[0],/Put a Trainer card from your discard pile/);
  assert.match(unown.abilities[0].text,/does not count as a Knock Out/);
  assert.equal(egg.hp,'30');
});

test('seven cuts count exact probability of source-first signature failure',()=>{
  const p=compute();
  assert.deepEqual(p.conditional,[8894980623433n,896999961737880n]);
  assert.deepEqual(p.unconditional,[122098n,12515965n]);
  assert.ok(Math.abs(percent(p.conditional)-0.9916366781331345)<1e-11);
  assert.ok(percent(p.conditional)>0.9796436992998269);
  console.log('AGENT3_RANK26_MINCUT_V2',JSON.stringify({
    sourceRank:26,markedCards:18,remainingBasics:10,remainingNonbasics:32,
    deadzoneConditionalPercent:percent(p.conditional),
    deadzoneUnconditionalPercent:percent(p.unconditional),
    exactFraction:p.conditional.map(x=>x.toString()).join('/'),
    requirement:'source-first single-turn five Exeggcute self-KOs, Crisis Punch attack',
    validInitialSeven:true,externalPreTurnDamage:false,
    provesGameLoss:false,competitiveQualifiedGames:0
  }));
});
