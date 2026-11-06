'use strict';
const {choose}=require('./agent5-adp-paid-opening.cjs');
const C=Object.freeze({adp:0,basic:1,lele:2,switch:3,tag:4,quick:5,ultra:6,gh:7,dde:8,dragon:9,basicEnergy:10,compressor:11,other:12});
const COUNTS=Object.freeze([2,4,1,2,4,3,4,3,4,6,7,4,16]);
const PROFILES=['mechanical','dragons','dragonsEnergy','dragonsEnergyCompressor'];
function factorial(n){let x=1n;for(let i=2;i<=n;i++)x*=BigInt(i);return x;}
/**
 * Owner-hand source-paid ADP path with optional Tapu Lele-GX Wonder Tag.
 * Source design follows Agent5's original thirteen-category paid resolver.
 * @param {number[]} initial
 * @param {number[]} seen
 * @param {{adp:boolean,gh:boolean,dde:boolean,lele:boolean}} a
 * @param {string} profile
 * @param {boolean} allowWonderTag
 * @returns {null|{adpVia:string,ghVia:string,discards:number}}
 */
function findPaidLine(initial,seen,a,profile,allowWonderTag){
 const adpActive=initial[C.adp]>0;
 if(!adpActive&&!initial[C.basic]&&!initial[C.lele])return null;
 if(!adpActive&&!seen[C.switch])return null;
 const leleActive=!adpActive&&initial[C.basic]===0&&initial[C.lele]>0;
 const leleHeld=seen[C.lele]>0&&!leleActive;
 const ar=adpActive?['active']:seen[C.adp]?['held']:a.adp?['tag','quick','ultra']:[];
 const gr=seen[C.dde]?['none']:a.dde?[
  ...(seen[C.gh]?['held']:[]),...(a.gh&&seen[C.tag]?['tag']:[]),
  ...(allowWonderTag&&a.gh&&leleHeld?['leleHeld']:[]),
  ...(allowWonderTag&&a.gh&&a.lele&&seen[C.quick]>0?['leleQuick']:[]),
  ...(allowWonderTag&&a.gh&&a.lele&&seen[C.ultra]>0?['leleUltra']:[])]:[];
 const size=seen.reduce((x,y)=>x+y,0);
 const safe=seen[C.dragon]+(profile==='dragons'?0:seen[C.basicEnergy])+
  (profile==='dragonsEnergyCompressor'?seen[C.compressor]:0);
 for(const adpVia of ar){
  if(adpVia==='tag'&&!seen[C.tag]||adpVia==='quick'&&!seen[C.quick]||
     adpVia==='ultra'&&!seen[C.ultra])continue;
  for(const ghVia of gr){
   const tagUsed=adpVia==='tag'||ghVia==='tag';
   const quick=Number(adpVia==='quick')+Number(ghVia==='leleQuick');
   const ultra=Number(adpVia==='ultra')+Number(ghVia==='leleUltra');
   if(quick>seen[C.quick]||ultra>seen[C.ultra]||tagUsed&&!seen[C.tag])continue;
   const cost=quick+2*ultra+Number(ghVia!=='none')*2;
   const reserved=1+Number(!adpActive)+Number(adpVia==='held')+
    Number(seen[C.dde]>0)+Number(ghVia==='held')+Number(tagUsed)+
    quick+ultra+Number(ghVia==='leleHeld');
   if((profile==='mechanical'?size-reserved:safe)>=cost)return {adpVia,ghVia,discards:cost};
  }
 }
 return null;
}
/**
 * Exact Basic-valid seven, n accepted optional bonus cards plus first-own-turn
 * draw, and six inaccessible Prizes. No opponent response is modeled.
 * Each unordered D-draw multiset represents D! physical orders.
 * @param {number} bonuses
 * @param {number[]} [counts]
 * @param {{handSize?:number,prizeCount?:number}} [opts]
 */
function countWonderTagBonuses(bonuses,counts=COUNTS,opts={}){
 const H=opts.handSize??7,P=opts.prizeCount??6,n=counts.reduce((a,b)=>a+b,0),D=bonuses+1;
 if(!Number.isSafeInteger(bonuses)||bonuses<0||!Number.isSafeInteger(H)||H<1||
 !Number.isSafeInteger(P)||P<0||counts.length!==13||
 counts.some(x=>!Number.isSafeInteger(x)||x<0)||n<H+D+P)throw Error('Invalid input');
 const cache=Array.from({length:n+1},(_,i)=>Array.from({length:P+D+1},(_,j)=>choose(i,j)));
 const binom=(a,b)=>b<0||b>P+D?choose(a,b):cache[a][b];
 const allPrizes=binom(n-H-D,P),perms=factorial(D),prizeMasks=new Map();
 function masks(a,g,d,l){
  const key=[a,g,d,l].join(',');if(prizeMasks.has(key))return prizeMasks.get(key);
  const rest=n-H-D-a-g-d-l,m=Array(16).fill(0n);
  for(let x=0;x<=Math.min(a,P);x++)for(let y=0;y<=Math.min(g,P-x);y++)
  for(let z=0;z<=Math.min(d,P-x-y);z++)for(let v=0;v<=Math.min(l,P-x-y-z);v++){
   const r=P-x-y-z-v;if(r>rest)continue;
   const bits=Number(a>x)+2*Number(g>y)+4*Number(d>z)+8*Number(l>v);
   m[bits]+=binom(a,x)*binom(g,y)*binom(d,z)*binom(l,v)*binom(rest,r);
  }
  if(m.reduce((s,x)=>s+x,0n)!==allPrizes)throw Error('Bad prize accounting');
  prizeMasks.set(key,m);return m;
 }
 const h=Array(13).fill(0),draw=Array(13).fill(0),seen=Array(13).fill(0);
 const numerators=Object.fromEntries(PROFILES.map(x=>[x,{without:0n,with:0n}]));
 const extraBy=Object.fromEntries(PROFILES.map(x=>[x,{leleHeld:0n,leleQuick:0n,leleUltra:0n}]));
 let handsVisited=0,drawStates=0;
 function handleHand(handWeight){
  if(!h[C.adp]&&!h[C.basic]&&!h[C.lele])return;handsVisited++;
  const remaining=counts.map((x,i)=>x-h[i]);
  function evalDraw(weight){
   drawStates++;for(let i=0;i<13;i++)seen[i]=h[i]+draw[i];
   const m=masks(remaining[C.adp]-draw[C.adp],remaining[C.gh]-draw[C.gh],
    remaining[C.dde]-draw[C.dde],remaining[C.lele]-draw[C.lele]);
   const mul=handWeight*weight*perms;
   for(let bits=0;bits<16;bits++){
    if(!m[bits])continue;
    const a={adp:!!(bits&1),gh:!!(bits&2),dde:!!(bits&4),lele:!!(bits&8)};
    const ways=mul*m[bits];
    for(const profile of PROFILES){
     const no=findPaidLine(h,seen,a,profile,false),yes=findPaidLine(h,seen,a,profile,true);
     if(no)numerators[profile].without+=ways;
     if(yes)numerators[profile].with+=ways;
     if(yes&&!no){if(!(yes.ghVia in extraBy[profile]))throw Error('Unexpected route');
      extraBy[profile][yes.ghVia]+=ways;}
    }
   }
  }
  function visitDraw(i,left,w){
   if(i===13){if(!left)evalDraw(w);return;}
   for(let k=0;k<=Math.min(left,remaining[i]);k++){
    draw[i]=k;visitDraw(i+1,left-k,w*binom(remaining[i],k));
   }
  }
  visitDraw(0,D,1n);
 }
 function visitHand(i,left,w){
  if(i===13){if(!left)handleHand(w);return;}
  for(let k=0;k<=Math.min(left,counts[i]);k++){
   h[i]=k;visitHand(i+1,left-k,w*binom(counts[i],k));
  }
 }
 visitHand(0,H,1n);
 let falling=1n;for(let i=0;i<D;i++)falling*=BigInt(n-H-i);
 const denominator=(binom(n,H)-binom(n-counts[C.adp]-counts[C.basic]-counts[C.lele],H))*
  falling*allPrizes;
 return {denominator,numerators,extraBy,handsVisited,drawStates};
}
module.exports={C,COUNTS,PROFILES,findPaidLine,countWonderTagBonuses};
if(require.main===module){
 const b=Number(process.argv[2]??1),start=Date.now(),x=countWonderTagBonuses(b);
 console.log(JSON.stringify({bonus:b,denominator:String(x.denominator),
  rates:Object.fromEntries(PROFILES.map(p=>[p,{without:Number(x.numerators[p].without)/Number(x.denominator),
   with:Number(x.numerators[p].with)/Number(x.denominator),
   increment:Number(x.numerators[p].with-x.numerators[p].without)/Number(x.denominator),
   withBigInt:String(x.numerators[p].with),
   extraBy:Object.fromEntries(Object.entries(x.extraBy[p]).map(([k,v])=>[k,String(v)]))}])),
  handsVisited:x.handsVisited,drawStates:x.drawStates,elapsedMs:Date.now()-start}));
}
