'use strict';
const {C,COUNTS,choose}=require('./agent5-adp-paid-opening.cjs');
const PROFILES=['dragons','dragonsEnergy','dragonsEnergyCompressor'];
/** @param {number} n @returns {bigint} */
function factorial(n){let x=1n;for(let i=2;i<=n;i++)x*=BigInt(i);return x;}
/** @param {number[]} initial @param {number[]} seen
 * @param {{adp:boolean,gh:boolean,dde:boolean}} available @returns {number|null} */
function minimumCost(initial,seen,available){
 const starts=initial[C.adp]>0;
 if(!starts&&(!initial[C.basic]||!seen[C.switch]))return null;
 const ar=starts?['active']:seen[C.adp]?['held']:available.adp?['tag','quick','ultra']:[];
 const gr=seen[C.dde]?['none']:available.dde?[
  ...(seen[C.gh]?['held']:[]),...(available.gh&&seen[C.tag]?['tag']:[])]:[];
 const size=seen.reduce((a,b)=>a+b,0);let min=null;
 for(const adp of ar)for(const gh of gr){
  if(adp==='tag'&&!seen[C.tag]||adp==='quick'&&!seen[C.quick]||
     adp==='ultra'&&!seen[C.ultra])continue;
  const tag=adp==='tag'||gh==='tag';if(tag&&!seen[C.tag])continue;
  const ball=adp==='quick'||adp==='ultra';
  const cost=(adp==='ultra'?2:adp==='quick'?1:0)+(gh==='none'?0:2);
  const reserved=1+Number(!starts)+Number(adp==='held')+
   Number(seen[C.dde]>0)+Number(gh==='held')+Number(tag)+Number(ball);
  if(size-reserved>=cost&&(min===null||cost<min))min=cost;
 }
 return min;
}
/** Exact weighted opening resource analysis conditional on Basic-valid first seven.
 * Six Prizes and bonus draws are exchangeable zones. A multiset of D bonus-plus-
 * natural draws is multiplied by D! physical permutations.
 * @param {number} bonuses @param {number[]} [counts]
 * @param {{handSize?:number,prizeCount?:number}} [options] */
function countMulliganBonuses(bonuses,counts=COUNTS,options={}){
 const H=options.handSize??7,P=options.prizeCount??6,n=counts.reduce((a,b)=>a+b,0),D=bonuses+1;
 if(!Number.isSafeInteger(bonuses)||bonuses<0||!Number.isSafeInteger(H)||H<1||
   !Number.isSafeInteger(P)||P<0||counts.length!==12||
   counts.some(x=>!Number.isSafeInteger(x)||x<0)||n<H+D+P)throw Error('Invalid input');
 const combinations=Array.from({length:n+1},(_,i)=>Array.from({length:P+D+1},(_,j)=>choose(i,j)));
 const binom=(a,b)=>b<0||b>P+D?choose(a,b):combinations[a][b];
 const allPrizes=binom(n-H-D,P),perms=factorial(D),prizePatterns=new Map();
 function patterns(a,g,d){
  const key=a+','+g+','+d;
  if(prizePatterns.has(key))return prizePatterns.get(key);
  const rest=n-H-D-a-g-d,masses=Array(8).fill(0n);
  for(let x=0;x<=Math.min(a,P);x++)for(let y=0;y<=Math.min(g,P-x);y++)
   for(let z=0;z<=Math.min(d,P-x-y);z++){
    const o=P-x-y-z;if(o>rest)continue;
    const flags=Number(a>x)+2*Number(g>y)+4*Number(d>z);
    masses[flags]+=binom(a,x)*binom(g,y)*binom(d,z)*binom(rest,o);
   }
  if(masses.reduce((s,v)=>s+v,0n)!==allPrizes)throw Error('Prize accounting');
  prizePatterns.set(key,masses);return masses;
 }
 const hand=Array(12).fill(0),draw=Array(12).fill(0),seen=Array(12).fill(0);
 const histograms=Object.fromEntries(PROFILES.map(p=>[p,Array(5).fill(0n)]));
 let mechanical=0n,handsVisited=0,drawStates=0,drawScored=0;
 function evaluateHand(handWeight){
  if(!hand[C.adp]&&!hand[C.basic])return;
  handsVisited++;
  const remain=counts.map((v,i)=>v-hand[i]);
  function evaluateDraw(weight){
   drawStates++;
   for(let i=0;i<12;i++)seen[i]=hand[i]+draw[i];
   const prizes=patterns(remain[C.adp]-draw[C.adp],remain[C.gh]-draw[C.gh],
     remain[C.dde]-draw[C.dde]);
   const safe=[seen[C.dragon],seen[C.dragon]+seen[C.basicEnergy],
     seen[C.dragon]+seen[C.basicEnergy]+seen[C.compressor]];
   const scale=handWeight*weight*perms;
   for(let mask=0;mask<8;mask++){
    if(!prizes[mask])continue;
    const cost=minimumCost(hand,seen,{adp:!!(mask&1),gh:!!(mask&2),dde:!!(mask&4)});
    if(cost===null)continue;
    const ways=scale*prizes[mask];mechanical+=ways;drawScored++;
    for(let j=0;j<3;j++)histograms[PROFILES[j]][Math.max(0,cost-safe[j])]+=ways;
   }
  }
  function visitDraw(i,left,w){
   if(i===12){if(!left)evaluateDraw(w);return;}
   for(let k=0;k<=Math.min(left,remain[i]);k++){
    draw[i]=k;visitDraw(i+1,left-k,w*binom(remain[i],k));
   }
  }
  visitDraw(0,D,1n);
 }
 function visitHand(i,left,w){
  if(i===12){if(!left)evaluateHand(w);return;}
  for(let k=0;k<=Math.min(left,counts[i]);k++){
   hand[i]=k;visitHand(i+1,left-k,w*binom(counts[i],k));
  }
 }
 visitHand(0,H,1n);
 let orderedDraws=1n;for(let i=0;i<D;i++)orderedDraws*=BigInt(n-H-i);
 const denominator=(binom(n,H)-binom(n-counts[C.adp]-counts[C.basic],H))*
   orderedDraws*allPrizes;
 return {denominator,mechanical,histograms,handsVisited,drawStates,drawScored};
}
module.exports={C,COUNTS,PROFILES,minimumCost,countMulliganBonuses};
if(require.main===module){
 const bonuses=Number(process.argv[2]??4),started=Date.now();
 const r=countMulliganBonuses(bonuses);
 console.log(JSON.stringify({bonuses,denominator:String(r.denominator),
  numerator:String(r.mechanical),mechanicalRate:Number(r.mechanical)/Number(r.denominator),
  zeroProtected:Object.fromEntries(PROFILES.map(p=>[
   p,Number(r.histograms[p][0])/Number(r.denominator)])),
  handsVisited:r.handsVisited,drawStates:r.drawStates,
  drawScored:r.drawScored,elapsedMs:Date.now()-started}));
}
