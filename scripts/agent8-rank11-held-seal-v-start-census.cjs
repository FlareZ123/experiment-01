'use strict';
const assert=require('node:assert/strict');
const {loadCounts,goodPrizeGroups,C,censusAfterFirstDraw}=
 require('./rank11-boostshake-opening-census.cjs');
// Rank11: Oranguru0,VIP1,Float2,Seal3,Shake4,Trubbish5,
// Garbodor6,Crobat7,Muscle8,otherBasic9,other10.
function census(){
 const n=loadCounts(),h=Array(n.length).fill(0);
 let vInStartingSeven=0n;
 function visit(i,left,ways){
  if(i<n.length){for(let q=0;q<=Math.min(left,n[i]);q++){
   h[i]=q;visit(i+1,left-q,ways*C(n[i],q));
  }return;}
  if(left||!h[3]||h[4]||!(h[5]||h[1])||
   !(h[2]||h[8]||h[3]>=2))return;
  const v=h[0]+h[7];
  if(!v)return;
  const eligibleLastDrawPositions=v>=2?8:7;
  const targets=[[4],[6],...(h[5]?[]:[[5]])];
  vInStartingSeven+=ways*BigInt(eligibleLastDrawPositions)*
   goodPrizeGroups(n,h,targets,52);
 }
 visit(0,8,1n);
 const broad=censusAfterFirstDraw();
 assert.equal(vInStartingSeven,4486654794466293n);
 assert.equal(broad.anyToolHeldSeal,10403861960264413n);
 return {vInStartingSeven:String(vInStartingSeven),
  broaderHeldSeal:String(broad.anyToolHeldSeal),
  legalSevenAndFirstDraw:String(broad.valid),
  restrictedPercent:100*Number(vInStartingSeven)/Number(broad.valid),
  structuralAdditionalPercent:100*Number(broad.anyToolHeldSeal-vInStartingSeven)/Number(broad.valid),
  competitiveQualified:false};
}
if(require.main===module)console.log(JSON.stringify(census(),null,2));
module.exports={census};
