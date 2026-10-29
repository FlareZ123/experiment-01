'use strict';
// Rank6 source counts: Basics,DCE,Thunder,G&H,Tag Call,19-priority discards,other.
const n=[4,1,1,2,2,30,20],h=Array(7).fill(0);
const C=(n,k)=>{if(k<0||k>n)return 0n;let v=1n;for(let i=1,m=Math.min(k,n-k);i<=m;i++)v=v*BigInt(n-m+i)/BigInt(i);return v;};
function count(){
 let valid=0n,direct=0n,gh=0n,tag=0n;
 function visit(i,left,ways){
  if(i<7){for(let x=0;x<=Math.min(left,n[i]);x++){h[i]=x;visit(i+1,left-x,ways*C(n[i],x));}return;}
  if(left||!h[0])return;
  const w=ways*BigInt(h[0]>1?8:7);valid+=w*C(52,6);
  const d=!h[1],t=!h[2];
  if(!d&&!t){direct+=w*C(52,6);return;}
  if((!h[3]&&!h[4])||(d&&h[5]<2))return;
  const req=[...(d?[1]:[]),...(t?[2]:[]),...(!h[3]?[3]:[])];
  let available=0n;
  for(let bits=0;bits<1<<req.length;bits++){
   let removed=0,sign=1n;
   for(let j=0;j<req.length;j++)if(bits&(1<<j)){removed+=n[req[j]]-h[req[j]];sign=-sign;}
   available+=sign*C(52-removed,6-removed);
  }
  if(h[3])gh+=w*available;else tag+=w*available;
 }
 visit(0,8,1n);
 return {valid,direct,gh,tag,success:direct+gh+tag,
  rate:Number(direct+gh+tag)/Number(valid),qualified:false};
}
if(require.main===module)console.log(JSON.stringify(count(),(_,v)=>typeof v==='bigint'?v.toString():v,2));
module.exports={count};
