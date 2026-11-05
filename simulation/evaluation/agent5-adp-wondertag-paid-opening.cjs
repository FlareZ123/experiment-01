"use strict";
const {choose,PROFILES}=require('./agent5-adp-paid-opening.cjs');
const C=Object.freeze({adp:0,basic:1,lele:2,switch:3,tag:4,quick:5,
  ultra:6,gh:7,dde:8,dragon:9,basicEnergy:10,compressor:11,other:12});
const COUNTS=Object.freeze([2,4,1,2,4,3,4,3,4,6,7,4,16]);

/**
 * Inspect a concrete owner-visible first eight, with physical deck availability
 * after six Prizes, for the cheapest payable allowed route. Wonder Tag runs
 * only when Lele is played from hand onto Bench during the turn, optionally
 * reached by Quick/Ultra Ball. Other setup Basics are selected before Lele,
 * preserving Wonder Tag where possible. Opponent Ability lock is not modeled.
 * @param {number[]} initial Seven-card hand by category
 * @param {number[]} seen Initial seven plus turn draw
 * @param {{adp:boolean,gh:boolean,dde:boolean,lele:boolean}} available
 * @param {string} profile Discard-value sensitivity scenario
 * @param {boolean} allowWonderTag Enable printed Lele paths
 * @returns {null|{adpVia:string,ghVia:string,discards:number}}
 */
function findPaidLine(initial,seen,available,profile,allowWonderTag){
  if(!PROFILES.includes(profile))throw new Error('Unknown profile');
  const adpActive=initial[C.adp]>0;
  if(!adpActive&&!initial[C.basic]&&!initial[C.lele])return null;
  if(!adpActive&&!seen[C.switch])return null;
  const leleActive=!adpActive&&initial[C.basic]===0&&initial[C.lele]>0;
  const leleHeld=seen[C.lele]>0&&!leleActive;
  const adpRoutes=adpActive?['active']:
    (seen[C.adp]>0?['held']:(available.adp?['tag','quick','ultra']:[]));
  const ddeHeld=seen[C.dde]>0;
  const ghRoutes=ddeHeld?['none']:(available.dde?[
    ...(seen[C.gh]>0?['held']:[]),
    ...(available.gh&&seen[C.tag]>0?['tag']:[]),
    ...(allowWonderTag&&available.gh&&leleHeld?['leleHeld']:[]),
    ...(allowWonderTag&&available.gh&&available.lele&&seen[C.quick]>0?
      ['leleQuick']:[]),
    ...(allowWonderTag&&available.gh&&available.lele&&seen[C.ultra]>0?
      ['leleUltra']:[]
  ]:[]);
  const size=seen.reduce((a,b)=>a+b,0);
  const highDci=seen[C.dragon]+
    (profile==='dragons'?0:seen[C.basicEnergy])+
    (profile==='dragonsEnergyCompressor'?seen[C.compressor]:0);
  for(const adpVia of adpRoutes){
    if(adpVia==='tag'&&!seen[C.tag])continue;
    if(adpVia==='quick'&&!seen[C.quick])continue;
    if(adpVia==='ultra'&&!seen[C.ultra])continue;
    for(const ghVia of ghRoutes){
      const tagUsed=adpVia==='tag'||ghVia==='tag';
      const numQuick=Number(adpVia==='quick')+Number(ghVia==='leleQuick');
      const numUltra=Number(adpVia==='ultra')+Number(ghVia==='leleUltra');
      if(numQuick>seen[C.quick]||numUltra>seen[C.ultra])continue;
      if(tagUsed&&!seen[C.tag])continue;
      const cost=numQuick+2*numUltra+Number(ghVia!=='none')*2;
      const reserved=1+Number(!adpActive)+Number(adpVia==='held')+
        Number(ddeHeld)+Number(ghVia==='held')+Number(tagUsed)+
        numQuick+numUltra+Number(ghVia==='leleHeld');
      const eligible=profile==='mechanical'?size-reserved:highDci;
      if(eligible>=cost)return {adpVia,ghVia,discards:cost};
    }
  }
  return null;
}

/**
 * Exact first-seven, first-draw and six-Prize multivariate count for the same
 * frozen v2 list under four discardability profiles, with and without the
 * single printed Wonder Tag, including Quick/Ultra -> Lele options.
 * @param {number[]} [counts] Candidate v2 counts
 * @param {{handSize?:number,prizeCount?:number}} [options]
 * @returns {{denominator:bigint,numerators:Record<string,{without:bigint,with:bigint}>,handsVisited:number}}
 */
function countWonderTagBridge(counts=COUNTS,options={}){
  if(counts.length!==13||counts.some(n=>!Number.isSafeInteger(n)||n<0))
    throw new Error('Invalid categories');
  const n=counts.reduce((a,b)=>a+b,0);
  const handSize=options.handSize??7,prizeCount=options.prizeCount??6;
  if(!Number.isSafeInteger(handSize)||handSize<1||
     !Number.isSafeInteger(prizeCount)||prizeCount<0||n<handSize+prizeCount+1)
    throw new Error('Invalid hand/prize parameters');
  const numerators=Object.fromEntries(PROFILES.map(p=>[p,{without:0n,with:0n}]));
  const hand=Array(13).fill(0);
  let handsVisited=0;
  const postDraw=n-handSize-1;
  function evaluate(weight){
    if(!hand[C.adp]&&!hand[C.basic]&&!hand[C.lele])return;
    handsVisited++;
    const rest=counts.map((c,i)=>c-hand[i]);
    for(let draw=0;draw<13;draw++){
      if(rest[draw]===0)continue;
      const seen=[...hand];seen[draw]++;
      const after=[...rest];after[draw]--;
      const otherN=postDraw-after[C.adp]-after[C.gh]-
        after[C.dde]-after[C.lele];
      const masks=Array(16).fill(0n);
      for(let pa=0;pa<=Math.min(after[C.adp],prizeCount);pa++)
        for(let pg=0;pg<=Math.min(after[C.gh],prizeCount-pa);pg++)
          for(let pd=0;pd<=Math.min(after[C.dde],prizeCount-pa-pg);pd++)
            for(let pl=0;pl<=Math.min(after[C.lele],prizeCount-pa-pg-pd);pl++){
              const po=prizeCount-pa-pg-pd-pl;
              if(po>otherN)continue;
              const ways=weight*BigInt(rest[draw])*
                choose(after[C.adp],pa)*choose(after[C.gh],pg)*
                choose(after[C.dde],pd)*choose(after[C.lele],pl)*
                choose(otherN,po);
              const mask=Number(after[C.adp]>pa)+
                2*Number(after[C.gh]>pg)+4*Number(after[C.dde]>pd)+
                8*Number(after[C.lele]>pl);
              masks[mask]+=ways;
            }
      for(let mask=0;mask<16;mask++){
        const ways=masks[mask];if(!ways)continue;
        const available={adp:Boolean(mask&1),gh:Boolean(mask&2),
          dde:Boolean(mask&4),lele:Boolean(mask&8)};
        for(const p of PROFILES){
          if(findPaidLine(hand,seen,available,p,false))
            numerators[p].without+=ways;
          if(findPaidLine(hand,seen,available,p,true))
            numerators[p].with+=ways;
        }
      }
    }
  }
  function visit(i,left,weight){
    if(i===13){if(left===0)evaluate(weight);return;}
    for(let take=0;take<=Math.min(left,counts[i]);take++){
      hand[i]=take;
      visit(i+1,left-take,weight*choose(counts[i],take));
    }
  }
  visit(0,handSize,1n);
  const valid=choose(n,handSize)-
    choose(n-counts[C.adp]-counts[C.basic]-counts[C.lele],handSize);
  return {denominator:valid*BigInt(n-handSize)*choose(n-handSize-1,prizeCount),
    numerators,handsVisited};
}
module.exports={C,COUNTS,findPaidLine,countWonderTagBridge};
if(require.main===module){
  const o=countWonderTagBridge();
  console.log(JSON.stringify({denominator:String(o.denominator),
    handsVisited:o.handsVisited,percent:Object.fromEntries(Object.entries(o.numerators)
      .map(([p,z])=>[p,{without:100*Number(z.without)/Number(o.denominator),
        with:100*Number(z.with)/Number(o.denominator),
        increment:100*Number(z.with-z.without)/Number(o.denominator),
        extraCount:String(z.with-z.without)}]))},null,2));
}
