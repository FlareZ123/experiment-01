'use strict';
const assert=require('node:assert/strict');
// Rank6 source60: Basics,DCE,SpeedLightning,Thunder,G&H,TagCall,others.
const n=[4,1,4,1,2,2,46],h=Array(7).fill(0);
const C=(a,b)=>{if(b<0||b>a)return 0n;let v=1n;for(let i=1,m=Math.min(b,a-b);i<=m;i++)v=v*BigInt(a-m+i)/BigInt(i);return v;};
function count(){
 let valid=0n,bypass=0n;
 function visit(i,left,ways){
  if(i<7){for(let x=0;x<=Math.min(left,n[i]);x++){h[i]=x;visit(i+1,left-x,ways*C(n[i],x));}return;}
  if(left||!h[0])return;
  const legalDrawPositions=BigInt(h[0]===1?56:h[0]===2?70:72);
  const w=ways*legalDrawPositions;
  valid+=w;
  if(h[1]&&h[2]&&!h[3]&&!h[4]&&!h[5])bypass+=w;
 }
 visit(0,9,1n);
 assert.equal(valid,425221917120n);
 assert.equal(bypass,13344865308n);
 return {valid:String(valid),bypass:String(bypass),
  conditionalRate:Number(bypass)/Number(valid),competitiveQualified:false};
}
if(require.main===module)console.log(JSON.stringify(count(),null,2));
module.exports={count};
