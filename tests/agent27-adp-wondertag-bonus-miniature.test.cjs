'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {C,PROFILES,countWonderTagBonuses:count}=
 require('../simulation/evaluation/agent27-adp-wondertag-bonus.cjs');
const {findPaidLine:originalLine}=
 require('../simulation/evaluation/agent5-adp-wondertag-paid-opening.cjs');
const popcount=x=>x.toString(2).replace(/0/g,'').length;
test('independent labeled paper-card mini-deals reproduce both sides of 1/2 bonus Wonder Tag',()=>{
 const toy=[1,2,1,1,1,1,1,1,1,2,0,0,1],cards=toy.flatMap((n,k)=>Array(n).fill(k));
 const all=(1<<cards.length)-1;
 for(const bonuses of [1,2]){
  const D=bonuses+1,perm=D===2?2n:6n,expected=count(bonuses,toy,{handSize:4,prizeCount:2});
  const numerator=Object.fromEntries(PROFILES.map(p=>[p,{without:0n,with:0n}]));
  const routes=Object.fromEntries(PROFILES.map(p=>[p,{leleHeld:0n,leleQuick:0n,leleUltra:0n}]));
  let denominator=0n;
  for(let h=0;h<=all;h++){
   if(popcount(h)!==4)continue;
   const initial=Array(13).fill(0);
   cards.forEach((kind,i)=>{if(h&(1<<i))initial[kind]++;});
   if(!initial[C.adp]&&!initial[C.basic]&&!initial[C.lele])continue;
   const unheld=all^h;
   for(let prizes=unheld;prizes;prizes=(prizes-1)&unheld){
    if(popcount(prizes)!==2)continue;
    const free=unheld^prizes;
    for(let draws=free;draws;draws=(draws-1)&free){
     if(popcount(draws)!==D)continue;
     denominator+=perm;
     const seen=[...initial],deck=Array(13).fill(0);
     cards.forEach((kind,i)=>{
      if(draws&(1<<i))seen[kind]++;
      else if(!(h&(1<<i))&&!(prizes&(1<<i)))deck[kind]++;
     });
     const a={adp:deck[C.adp]>0,gh:deck[C.gh]>0,dde:deck[C.dde]>0,
      lele:deck[C.lele]>0};
     for(const p of PROFILES){
      const without=originalLine(initial,seen,a,p,false);
      const withTag=originalLine(initial,seen,a,p,true);
      if(without)numerator[p].without+=perm;
      if(withTag)numerator[p].with+=perm;
      if(withTag&&!without)routes[p][withTag.ghVia]+=perm;
     }
    }
   }
  }
  assert.equal(denominator,expected.denominator,'denominator '+bonuses);
  assert.deepEqual(numerator,expected.numerators,'numerators '+bonuses);
  assert.deepEqual(routes,expected.extraBy,'route attribution '+bonuses);
 }
});
