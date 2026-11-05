"use strict";

// A fixed first-turn-going-second physical resource screen for ADP–Thorton–Regidrago v2.
// It does not simulate opponents, concealed tactical information, or later turns.
const C = Object.freeze({adp:0,basic:1,switch:2,tag:3,quick:4,ultra:5,
  gh:6,dde:7,dragon:8,basicEnergy:9,compressor:10,other:11});
const COUNTS = Object.freeze([2,5,2,4,3,4,3,4,6,7,4,16]);
const PROFILES = Object.freeze(['mechanical','dragons','dragonsEnergy',
  'dragonsEnergyCompressor']);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(k<0||k>n)return 0n;
  let x=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)x=x*BigInt(n-i+1)/BigInt(i);
  return x;
}

/**
 * Enumerate complete first-turn lines with a deliberately ADP-first initial
 * Active, the once-per-turn Supporter/attachment and all mandatory hand
 * payments. A source-consistent TAG Call may find ADP and Guzma & Hala together.
 * "mechanical" allows discarding any card not essential to the chosen line.
 * Other profiles permit discarding only the named candidate v2 card groups.
 * The latter are sensitivity assumptions, not assertions of actual DCI.
 * @param {number[]} initial Seven-card opening hand by category.
 * @param {number[]} seen Opening hand plus first draw.
 * @param {{adp:boolean,gh:boolean,dde:boolean}} deckAvailability
 * @param {string} profile
 * @returns {null|{adpVia:string,ghVia:string,discards:number}}
 */
function findPaidLine(initial,seen,deckAvailability,profile){
  if(!PROFILES.includes(profile))throw new Error('Unknown profile');
  const adpStarts=initial[C.adp]>0;
  if(!adpStarts&&(!initial[C.basic]||!seen[C.switch]))return null;
  const needSwitch=!adpStarts;
  const adpRoutes=adpStarts?['active']:
    (seen[C.adp]>0?['held']:(deckAvailability.adp?
      ['tag','quick','ultra']:[]));
  const ddeHeld=seen[C.dde]>0;
  const ghRoutes=ddeHeld?['none']:
    (deckAvailability.dde?[
      ...(seen[C.gh]>0?['held']:[]),
      ...(deckAvailability.gh&&seen[C.tag]>0?['tag']:[])
    ]:[]);
  const size=seen.reduce((a,b)=>a+b,0);
  const highDci=seen[C.dragon]+
    (profile==='dragons'?0:seen[C.basicEnergy])+
    (profile==='dragonsEnergyCompressor'?seen[C.compressor]:0);
  for(const adpVia of adpRoutes){
    if(adpVia==='tag'&&seen[C.tag]===0)continue;
    if(adpVia==='quick'&&seen[C.quick]===0)continue;
    if(adpVia==='ultra'&&seen[C.ultra]===0)continue;
    for(const ghVia of ghRoutes){
      const tagUsed=adpVia==='tag'||ghVia==='tag';
      if(tagUsed&&!seen[C.tag])continue;
      const ballUsed=adpVia==='quick'||adpVia==='ultra';
      const costBall=adpVia==='quick'?1:adpVia==='ultra'?2:0;
      const costGh=ghVia==='none'?0:2;
      const cost=costBall+costGh;
      // The Active leaves the initial hand; any newly searched ADP/GH
      // remains reserved until it is benched/played, not a free payment.
      const reserved=1+Number(needSwitch)+Number(adpVia==='held')+
        Number(ddeHeld)+Number(ghVia==='held')+
        Number(tagUsed)+Number(ballUsed);
      const eligible=profile==='mechanical'?size-reserved:highDci;
      if(eligible>=cost)return {adpVia,ghVia,discards:cost};
    }
  }
  return null;
}

/**
 * Exact multivariate hypergeometric first-seven, six-Prize, first-draw
 * enumeration (conditional on a Basic-valid first hand; no mulligan bonus).
 * The first draw is exchangeable with each of the 53 physical non-hand cards
 * before distributing six Prizes from the other 52.
 * @param {number[]} [counts] Fixed v2 count vector (12 categories).
 * @param {{handSize?:number,prizeCount?:number}} [options]
 * @returns {{denominator:bigint,numerators:Record<string,bigint>,handsVisited:number}}
 */
function countPaidOpenings(counts=COUNTS,options={}){
  if(counts.length!==12||counts.some(n=>!Number.isSafeInteger(n)||n<0))
    throw new Error('Invalid category counts');
  const n=counts.reduce((a,b)=>a+b,0);
  const handSize=options.handSize??7;
  const prizeCount=options.prizeCount??6;
  if(!Number.isSafeInteger(handSize)||handSize<1||
    !Number.isSafeInteger(prizeCount)||prizeCount<0||n<handSize+prizeCount+1)
    throw new Error('Invalid hand/prize sizes');
  const hand=new Array(12).fill(0);
  const numerators=Object.fromEntries(PROFILES.map(p=>[p,0n]));
  let handsVisited=0;
  const prizeOtherN=n-handSize-1;
  function evalHand(w){
    if(!hand[C.adp]&&!hand[C.basic])return;
    handsVisited++;
    const afterHand=counts.map((x,i)=>x-hand[i]);
    for(let draw=0;draw<12;draw++){
      if(!afterHand[draw])continue;
      const seen=[...hand];seen[draw]++;
      const after=[...afterHand];after[draw]--;
      const prizeOther=prizeOtherN-after[C.adp]-after[C.gh]-after[C.dde];
      for(let pa=0;pa<=Math.min(prizeCount,after[C.adp]);pa++){
        for(let pg=0;pg<=Math.min(prizeCount-pa,after[C.gh]);pg++){
          for(let pd=0;pd<=Math.min(prizeCount-pa-pg,after[C.dde]);pd++){
            const po=prizeCount-pa-pg-pd;
            if(po>prizeOther)continue;
            const ways=w*BigInt(afterHand[draw])*choose(after[C.adp],pa)*
              choose(after[C.gh],pg)*choose(after[C.dde],pd)*
              choose(prizeOther,po);
            const available={adp:after[C.adp]>pa,
              gh:after[C.gh]>pg,dde:after[C.dde]>pd};
            for(const p of PROFILES)
              if(findPaidLine(hand,seen,available,p))numerators[p]+=ways;
          }
        }
      }
    }
  }
  function visit(i,left,weight){
    if(i===12){if(!left)evalHand(weight);return;}
    for(let take=0;take<=Math.min(counts[i],left);take++){
      hand[i]=take;
      visit(i+1,left-take,weight*choose(counts[i],take));
    }
  }
  visit(0,handSize,1n);
  const validHands=choose(n,handSize)-
    choose(n-counts[C.adp]-counts[C.basic],handSize);
  const denominator=validHands*BigInt(n-handSize)*choose(n-handSize-1,prizeCount);
  return {denominator,numerators,handsVisited};
}
module.exports={C,COUNTS,PROFILES,choose,findPaidLine,countPaidOpenings};
if(require.main===module){
  const x=countPaidOpenings();
  console.log(JSON.stringify({denominator:String(x.denominator),
    handsVisited:x.handsVisited,numerators:Object.fromEntries(
      Object.entries(x.numerators).map(([k,v])=>[k,{count:String(v),
        probability:Number(v)/Number(x.denominator)}]))},null,2));
}
