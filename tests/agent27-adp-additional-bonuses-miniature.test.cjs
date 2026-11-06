'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {C,PROFILES,countMulliganBonuses:exact}=
 require('../simulation/evaluation/agent27-adp-additional-bonuses-exact.cjs');
const {minimumProtectedPayments:baselineCost}=
 require('../simulation/evaluation/agent27-adp-protected-payment-cost.cjs');
const bitcount=n=>n.toString(2).replace(/0/g,'').length;
test('independent labeled physical miniature agrees for 3 and 4 bonus draws',()=>{
 const counts=[1,2,1,1,1,1,1,1,2,0,0,1];
 const cards=counts.flatMap((v,i)=>Array(v).fill(i)),all=(1<<cards.length)-1;
 for(const bonuses of [3,4]){
  const expected=exact(bonuses,counts,{handSize:4,prizeCount:2});
  const D=bonuses+1,perms=D===4?24n:120n;
  const hist=Object.fromEntries(PROFILES.map(p=>[p,Array(5).fill(0n)]));
  let denominator=0n,mechanical=0n;
  for(let h=0;h<=all;h++){
   if(bitcount(h)!==4)continue;
   const hand=Array(12).fill(0);
   cards.forEach((c,i)=>{if(h&(1<<i))hand[c]++;});
   if(!hand[C.adp]&&!hand[C.basic])continue;
   for(let p=0;p<=all;p++){
    if(bitcount(p)!==2||h&p)continue;
    const free=all^(h|p);
    for(let d=free;d;d=(d-1)&free){
     if(bitcount(d)!==D)continue;
     denominator+=perms;
     const seen=[...hand],remaining=Array(12).fill(0);
     cards.forEach((c,i)=>{
      if(d&(1<<i))seen[c]++;
      else if(!(p&(1<<i))&&!(h&(1<<i)))remaining[c]++;
     });
     const available={adp:remaining[C.adp]>0,gh:remaining[C.gh]>0,
      dde:remaining[C.dde]>0};
     let any=false;
     for(const name of PROFILES){
      const k=baselineCost(hand,seen,available,name);
      if(k!==null){hist[name][k]+=perms;any=true;}
     }
     if(any)mechanical+=perms;
    }
   }
  }
  assert.equal(denominator,expected.denominator);
  assert.equal(mechanical,expected.mechanical);
  assert.deepEqual(hist,expected.histograms);
 }
});
