'use strict';
const {C,COUNTS,choose}=require('./agent5-adp-paid-opening.cjs');
const {minimumProtectedPayments:cost}=require('./agent27-adp-protected-payment-cost.cjs');
const PROFILES=['dragons','dragonsEnergy','dragonsEnergyCompressor'];
/** @param {number[]} [counts] @param {{handSize?:number,prizeCount?:number}} [options] */
function countOneMulliganBonus(counts=COUNTS,options={}){
  const n=counts.reduce((a,b)=>a+b,0),H=options.handSize??7,P=options.prizeCount??6;
  if(counts.length!==12||counts.some(x=>!Number.isSafeInteger(x)||x<0)||
     n<H+P+2||H<1||P<0)throw Error('Bad setup');
  const h=Array(12).fill(0),histograms=Object.fromEntries(
    PROFILES.map(p=>[p,Array(5).fill(0n)]));
  let mechanical=0n,handsVisited=0;
  function score(w){
    if(!h[C.adp]&&!h[C.basic])return;handsVisited++;
    const a=counts.map((v,i)=>v-h[i]);
    for(let b=0;b<12;b++){if(!a[b])continue;
      const ab=[...a];ab[b]--;
      for(let d=0;d<12;d++){if(!ab[d])continue;
        const s=[...h];s[b]++;s[d]++;
        const r=[...ab];r[d]--;
        const o=n-H-2-r[C.adp]-r[C.gh]-r[C.dde];
        for(let x=0;x<=Math.min(P,r[C.adp]);x++)
        for(let y=0;y<=Math.min(P-x,r[C.gh]);y++)
        for(let z=0;z<=Math.min(P-x-y,r[C.dde]);z++){
          const rest=P-x-y-z;if(rest>o)continue;
          const v=w*BigInt(a[b]*ab[d])*choose(r[C.adp],x)*
            choose(r[C.gh],y)*choose(r[C.dde],z)*choose(o,rest);
          const can={adp:r[C.adp]>x,gh:r[C.gh]>y,dde:r[C.dde]>z};
          if(cost(h,s,can,'dragons')!==null)mechanical+=v;
          for(const p of PROFILES){const k=cost(h,s,can,p);
            if(k!==null)histograms[p][k]+=v;}
        }
      }
    }
  }
  function visit(i,left,w){
    if(i===12){if(!left)score(w);return;}
    for(let k=0;k<=Math.min(left,counts[i]);k++){
      h[i]=k;visit(i+1,left-k,w*choose(counts[i],k));}
  }
  visit(0,H,1n);
  const denominator=(choose(n,H)-choose(n-counts[C.adp]-counts[C.basic],H))*
    BigInt(n-H)*BigInt(n-H-1)*choose(n-H-2,P);
  return {denominator,mechanical,histograms,handsVisited};
}
module.exports={PROFILES,countOneMulliganBonus};
