'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {ticketStoneCrobat}=require('../scripts/aichi-ticket-stone-search.cjs');
test('rank26 direct Stone event',()=>assert.ok(Math.abs(ticketStoneCrobat(60,12,7,6).directRoute-0.0002043271707307589)<1e-12));

/** Enumerate miniature source-deal prefixes and starting Basic hands. */
function enumerate(n,b,h,q){
 const cards=['D','T','S','V',...Array.from({length:b-1},(_,i)=>'B'+i)];
 while(cards.length<n)cards.push('X'+cards.length);
 const used=Array(n).fill(false),p=[];
 let legal=0,one=0,t=0,s=0,v=0;
 function visit(){
  if(p.length===h+q+1){
   const opening=p.slice(0,h),last=p[h+q];
   if(!opening.some(x=>x==='V'||x[0]==='B'))return;
   legal++;
   if(!p.slice(h,h+q).includes('D'))return;
   if(!['T','S','V'].every(x=>opening.includes(x)||last===x))return;
   if(opening.includes('T')&&opening.includes('S')&&opening.includes('V'))one++;
   else if(last==='T')t++;else if(last==='S')s++;else if(last==='V')v++;
   return;
  }
  for(let i=0;i<n;i++)if(!used[i]){used[i]=true;p.push(cards[i]);visit();p.pop();used[i]=false;}
 }
 visit();
 return [one,t,s,v].map(x=>x/legal);
}

test('physical miniature deal audit',()=>{ const a=ticketStoneCrobat(9,2,2,2),b=enumerate(9,2,2,2); assert.ok(Math.abs(a.directRoute-b.reduce((x,y)=>x+y,0))<1e-12); });
test('second deck and invalid dimensions',()=>{ const a=ticketStoneCrobat(10,3,3,2),b=enumerate(10,3,3,2); assert.ok(Math.abs(a.directRoute-b.reduce((x,y)=>x+y,0))<1e-12); assert.throws(()=>ticketStoneCrobat(60,12,7,0),RangeError); });
