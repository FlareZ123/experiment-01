'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
const {ticketStoneMeloetta}=require('../scripts/aichi-ticket-stone-meloetta.cjs');
test('rank26 direct Meloetta co-access',()=>{const x=ticketStoneMeloetta(60,12,7,6);assert.ok(Math.abs(x.firstEight-0.00001900326602798801)<1e-12);assert.ok(Math.abs(x.meloettaInitially-0.000016627857774489508)<1e-12);});

/** Enumerate exact physical miniature opening and Prize assignments. */
function enumerate(n,b,h,q){
 const cards=['D','T','S','V','M',...Array.from({length:b-2},(_,i)=>'B'+i)];
 while(cards.length<n)cards.push('X'+cards.length);
 const used=Array(n).fill(false),p=[];
 let legal=0,early=0,meloettaInitial=0;
 function visit(){
  if(p.length===h+q+1){
   const seven=p.slice(0,h),first=p[h+q];
   if(!seven.some(x=>x==='V'||x==='M'||x[0]==='B'))return;
   legal++;
   if(!p.slice(h,h+q).includes('D'))return;
   const all=seven.concat(first);
   if(!['T','S','V','M'].every(x=>all.includes(x)))return;
   early++;
   if(seven.includes('M'))meloettaInitial++;
   return;
  }
  for(let i=0;i<n;i++)if(!used[i]){
   used[i]=true;p.push(cards[i]);visit();p.pop();used[i]=false;
  }
 }
 visit();
 return {early:early/legal,meloettaInitial:meloettaInitial/legal};
}
