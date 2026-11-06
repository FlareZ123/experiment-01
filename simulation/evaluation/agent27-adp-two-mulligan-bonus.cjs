'use strict';
const {C,COUNTS,choose}=require('./agent5-adp-paid-opening.cjs');
const {minimumProtectedPayments:cost}=require('./agent27-adp-protected-payment-cost.cjs');
const PROFILES=['dragons','dragonsEnergy','dragonsEnergyCompressor'];
/** Exact first 7, two accepted opponent bonuses, own first draw, and six Prizes.
 * Three physical draws are aggregated as a set and multiplied by 3! possible orders.
 * @param {number[]} [counts] @param {{handSize?:number,prizeCount?:number}} [opts]
 */
function countTwoMulliganBonuses(counts=COUNTS,opts={}){
 const n=counts.reduce((a,b)=>a+b,0),H=opts.handSize??7,P=opts.prizeCount??6;
 if(counts.length!==12||counts.some(v=>!Number.isSafeInteger(v)||v<0)||
    !Number.isSafeInteger(H)||H<1||!Number.isSafeInteger(P)||P<0||n<H+P+3)
   throw Error('Invalid deck');
 const cache=Array.from({length:n+1},(_,i)=>Array.from({length:P+1},(_,j)=>choose(i,j)));
 const hand=Array(12).fill(0),drawn=Array(12).fill(0);
 const histograms=Object.fromEntries(PROFILES.map(p=>[p,Array(5).fill(0n)]));
 let mechanical=0n,handsVisited=0;
 function scoreHand(w){
   if(!hand[C.adp]&&!hand[C.basic])return;handsVisited++;
   const remain=counts.map((v,i)=>v-hand[i]);
   function visitDraw(i,left,drawWeight){
    if(i<12){
      for(let k=0;k<=Math.min(left,remain[i]);k++){
        drawn[i]=k;visitDraw(i+1,left-k,drawWeight*choose(remain[i],k));
      }
      return;
    }
    if(left)return;
    const seen=hand.map((v,j)=>v+drawn[j]);
    const after=remain.map((v,j)=>v-drawn[j]);
    const other=n-H-3-after[C.adp]-after[C.gh]-after[C.dde];
    for(let x=0;x<=Math.min(P,after[C.adp]);x++)
    for(let y=0;y<=Math.min(P-x,after[C.gh]);y++)
    for(let z=0;z<=Math.min(P-x-y,after[C.dde]);z++){
      const o=P-x-y-z;if(o>other)continue;
      const ways=w*drawWeight*6n*cache[after[C.adp]][x]*
        cache[after[C.gh]][y]*cache[after[C.dde]][z]*cache[other][o];
      const available={adp:after[C.adp]>x,gh:after[C.gh]>y,
        dde:after[C.dde]>z};
      const costs=PROFILES.map(p=>cost(hand,seen,available,p));
      if(costs[0]!==null)mechanical+=ways;
      costs.forEach((k,j)=>{if(k!==null)histograms[PROFILES[j]][k]+=ways;});
    }
   }
   visitDraw(0,3,1n);
 }
 function visitHand(i,left,w){
   if(i===12){if(!left)scoreHand(w);return;}
   for(let k=0;k<=Math.min(left,counts[i]);k++){
     hand[i]=k;visitHand(i+1,left-k,w*choose(counts[i],k));
   }
 }
 visitHand(0,H,1n);
 const denominator=(choose(n,H)-
   choose(n-counts[C.adp]-counts[C.basic],H))*
   BigInt(n-H)*BigInt(n-H-1)*BigInt(n-H-2)*choose(n-H-3,P);
 return {denominator,mechanical,histograms,handsVisited};
}
module.exports={PROFILES,countTwoMulliganBonuses};
if(require.main===module){const r=countTwoMulliganBonuses();console.log(JSON.stringify({
 denominator:String(r.denominator),mechanical:String(r.mechanical),
 mechanicalRate:Number(r.mechanical)/Number(r.denominator),
 zeroProtected:Object.fromEntries(PROFILES.map(p=>
   [p,Number(r.histograms[p][0])/Number(r.denominator)])),qualifiedGames:0
}));}
