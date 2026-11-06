'use strict';
const {C,COUNTS,choose}=require('./agent5-adp-paid-opening.cjs');
const {minimumProtectedPayments}=require('./agent27-adp-protected-payment-cost.cjs');
const PROFILES=['dragons','dragonsEnergy','dragonsEnergyCompressor'];
/** @param {number[]} [counts] @param {{handSize?:number,prizeCount?:number}} [opts] */
function countProtectedPaymentFrontier(counts=COUNTS,opts={}){
  const n=counts.reduce((a,b)=>a+b,0),H=opts.handSize??7,P=opts.prizeCount??6;
  if(counts.length!==12||counts.some(x=>!Number.isSafeInteger(x)||x<0)||
     !Number.isSafeInteger(H)||H<1||!Number.isSafeInteger(P)||P<0||n<H+P+1)
    throw Error('Invalid deck');
  const h=Array(12).fill(0),histograms=Object.fromEntries(
    PROFILES.map(p=>[p,Array(5).fill(0n)]));let handsVisited=0;
  function visit(i,left,w){
    if(i<12){for(let k=0;k<=Math.min(left,counts[i]);k++){
      h[i]=k;visit(i+1,left-k,w*choose(counts[i],k));}return;}
    if(left||!h[C.adp]&&!h[C.basic])return;handsVisited++;
    const remain=counts.map((v,j)=>v-h[j]);
    for(let d=0;d<12;d++){
      if(!remain[d])continue;
      const seen=[...h];seen[d]++;
      const pool=[...remain];pool[d]--;
      const other=n-H-1-pool[C.adp]-pool[C.gh]-pool[C.dde];
      for(let x=0;x<=Math.min(P,pool[C.adp]);x++)
      for(let y=0;y<=Math.min(P-x,pool[C.gh]);y++)
      for(let z=0;z<=Math.min(P-x-y,pool[C.dde]);z++){
        const rest=P-x-y-z;if(rest>other)continue;
        const ways=w*BigInt(remain[d])*choose(pool[C.adp],x)*
          choose(pool[C.gh],y)*choose(pool[C.dde],z)*choose(other,rest);
        const a={adp:pool[C.adp]>x,gh:pool[C.gh]>y,dde:pool[C.dde]>z};
        for(const p of PROFILES){
          const k=minimumProtectedPayments(h,seen,a,p);
          if(k!==null)histograms[p][k]+=ways;
        }
      }
    }
  }
  visit(0,H,1n);
  const denominator=(choose(n,H)-choose(n-counts[C.adp]-counts[C.basic],H))*
    BigInt(n-H)*choose(n-H-1,P);
  return {denominator,histograms,handsVisited};
}
module.exports={PROFILES,countProtectedPaymentFrontier};
