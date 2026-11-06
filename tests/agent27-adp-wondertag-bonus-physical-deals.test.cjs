'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {C,COUNTS,PROFILES}=
 require('../simulation/evaluation/agent27-adp-wondertag-bonus.cjs');
const {findPaidLine:originalAgent5Line}= 
 require('../simulation/evaluation/agent5-adp-wondertag-paid-opening.cjs');
const {WITH_LELE}=
 require('../simulation/evaluation/agent27-adp-wondertag-29field-lock-bounds.cjs');
const {FULL60}=
 require('../simulation/evaluation/agent27-adp-original29-four-bonus-bounds.cjs');
const PRINTED=COUNTS.flatMap((count,i)=>Array(count).fill(i));
/** Reproducible seeded Xorshift32 source, not a cryptographic RNG.
 * Independent labelled physical 60 shuffles, unlike the exact multiset method.
 * @param {number} seed @returns {()=>number} */
function random32(seed){
 let state=seed>>>0;
 return ()=>{
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return state>>>0;
 };
}
/** @param {number} bonuses @param {number} accepted @param {number} seed */
function physicallyDeal(bonuses,accepted,seed){
 const next=random32(seed),physical=[...PRINTED],D=bonuses+1;
 const tally=Object.fromEntries(PROFILES.map(p=>[p,{without:0,with:0}]));
 let valid=0,shuffles=0;
 while(valid<accepted){
  shuffles++;
  for(let i=physical.length-1;i>0;i--){
   const j=next()%(i+1);
   [physical[i],physical[j]]=[physical[j],physical[i]];
  }
  const initial=Array(13).fill(0),seen=Array(13).fill(0),deck=Array(13).fill(0);
  for(let i=0;i<7;i++)initial[physical[i]]++;
  if(!initial[C.adp]&&!initial[C.basic]&&!initial[C.lele])continue;
  valid++;
  for(let i=0;i<13;i++)seen[i]=initial[i];
  // Six Prizes are positions 7–12. The receiver accepts all D-1 bonus draws.
  // The final seen card is the ordinary first own draw.
  for(let i=13;i<13+D;i++)seen[physical[i]]++;
  for(let i=13+D;i<60;i++)deck[physical[i]]++;
  const a={adp:deck[C.adp]>0,gh:deck[C.gh]>0,
   dde:deck[C.dde]>0,lele:deck[C.lele]>0};
  for(const p of PROFILES){
   if(originalAgent5Line(initial,seen,a,p,false))tally[p].without++;
   if(originalAgent5Line(initial,seen,a,p,true))tally[p].with++;
  }
 }
 return {accepted,shuffles,tally};
}
test('200,000 independent physical deals recover exact 3/4 bonus paid Lele rates',()=>{
 assert.equal(PRINTED.length,60);
 for(const bonuses of [3,4]){
  const sample=physicallyDeal(bonuses,200000,0x27ad6000+bonuses);
  assert.equal(sample.accepted,200000);
  assert.ok(sample.shuffles>sample.accepted);
  for(const p of PROFILES)for(const variant of ['without','with']){
   const source=variant==='with'?WITH_LELE[bonuses]:FULL60[bonuses];
   const exact=Number(source[p])/Number(source.denominator);
   const observed=sample.tally[p][variant]/sample.accepted;
   const se=Math.sqrt(exact*(1-exact)/sample.accepted);
   assert.ok(Math.abs(observed-exact)<5*se+0.0005,
    'Physical samples differ from exact '+p+' b'+bonuses+' '+variant+
    ': observed '+observed+' expected '+exact);
  }
 }
});
