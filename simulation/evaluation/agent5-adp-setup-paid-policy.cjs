"use strict";
const {choose,PROFILES}=require('./agent5-adp-paid-opening.cjs');
const {C,COUNTS}=require('./agent5-adp-wondertag-paid-opening.cjs');
const SCALE=420n;

/**
 * Generate equally likely Basic-category orderings conditional on an unordered
 * physical opening. Non-Basics can be interspersed but do not affect Basic order.
 * @param {number[]} opening
 * @returns {Array<{active:string,bench:number,placed:number,adpPlaced:number,lelePlaced:number,adpOnBench:boolean,weight:bigint}>}
 */
function greedySetups(opening){
  const n=opening[C.adp]+opening[C.basic]+opening[C.lele];
  if(n===0)return [];
  const remaining={adp:opening[C.adp],basic:opening[C.basic],lele:opening[C.lele]};
  const order=[];
  const results=[];
  function dfs(){
    if(order.length===n){
      const placed=order.slice(0,6),benched=order.slice(1,6);
      results.push({active:order[0],bench:benched.length,placed:placed.length,
        adpPlaced:placed.filter(x=>x==='adp').length,
        lelePlaced:placed.filter(x=>x==='lele').length,
        adpOnBench:benched.includes('adp'),weight:0n});
      return;
    }
    for(const type of ['adp','basic','lele']){
      if(remaining[type]===0)continue;
      remaining[type]--;order.push(type);dfs();order.pop();remaining[type]++;
    }
  }
  dfs();
  if(420%results.length!==0)throw new Error('Setup order scale not divisible by Basic permutations');
  const weight=SCALE/BigInt(results.length);
  for(const item of results)item.weight=weight;
  return results;
}
/**
 * Deliberate ADP/other-Basic/Lele starting Active priority, retaining all
 * optional other Basics in hand for possible turn actions or discards.
 * @param {number[]} opening
 */
function deliberateSetup(opening){
  if(!opening[C.adp]&&!opening[C.basic]&&!opening[C.lele])return null;
  const active=opening[C.adp]?'adp':opening[C.basic]?'basic':'lele';
  return {active,bench:0,placed:1,
    adpPlaced:Number(active==='adp'),lelePlaced:Number(active==='lele'),
    adpOnBench:false,weight:SCALE};
}

/**
 * Counterfactual first Basic in owner-hand order as Active, retaining all other
 * Basics in hand. This isolates Active-choice impact before auto-Benching.
 * @param {number[]} opening
 * @returns {Array<{active:string,bench:number,placed:number,adpPlaced:number,lelePlaced:number,adpOnBench:boolean,weight:bigint}>}
 */
function firstOnlySetups(opening){
  const n=opening[C.adp]+opening[C.basic]+opening[C.lele];
  if(n===0)return [];
  if(420%n!==0)throw new Error('Basic-order denominator unsupported');
  return ['adp','basic','lele'].filter(type=>
    opening[C[type]]>0).map(type=>({active:type,bench:0,placed:1,
      adpPlaced:Number(type==='adp'),lelePlaced:Number(type==='lele'),
      adpOnBench:false,weight:SCALE*BigInt(opening[C[type]])/BigInt(n)}));
}

/**
 * Resolve a single payable source route with actual setup card custody,
 * remaining free Bench slots, and one turn-time Wonder Tag trigger.
 * @param {number[]} opening
 * @param {number[]} seen Opening+normal first-turn draw
 * @param {{adp:boolean,gh:boolean,dde:boolean,lele:boolean}} avail
 * @param {string} profile
 * @param {boolean} allowWonderTag
 * @param {{active:string,bench:number,placed:number,adpPlaced:number,lelePlaced:number,adpOnBench:boolean}} setup
 * @returns {null|{adpVia:string,ghVia:string,discards:number}}
 */
function payableUnderSetup(opening,seen,avail,profile,allowWonderTag,setup){
  if(!PROFILES.includes(profile))throw new Error('Unknown payment profile');
  const activeAdp=setup.active==='adp';
  if(!activeAdp&&!seen[C.switch])return null;
  const adpInHand=seen[C.adp]-setup.adpPlaced;
  const leleInHand=seen[C.lele]-setup.lelePlaced;
  const openSlots=5-setup.bench;
  const adpRoutes=activeAdp?['active']:setup.adpOnBench?['bench']:
    adpInHand?['held']:(avail.adp?['tag','quick','ultra']:[]);
  const ddeHeld=seen[C.dde]>0;
  const ghRoutes=ddeHeld?['none']:(avail.dde?[
    ...(seen[C.gh]>0?['held']:[]),
    ...(avail.gh&&seen[C.tag]>0?['tag']:[]),
    ...(allowWonderTag&&avail.gh&&leleInHand>0?['leleHeld']:[]),
    ...(allowWonderTag&&avail.gh&&avail.lele&&seen[C.quick]>0?['leleQuick']:[]),
    ...(allowWonderTag&&avail.gh&&avail.lele&&seen[C.ultra]>0?['leleUltra']:[])
  ]:[]);
  const handNow=seen.reduce((a,b)=>a+b,0)-setup.placed;
  const hypotheticallySafe=seen[C.dragon]+
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
      if(numQuick>seen[C.quick]||numUltra>seen[C.ultra]||
        (tagUsed&&!seen[C.tag]))continue;
      const newBench=Number(!activeAdp&&adpVia!=='bench')+
        Number(ghVia.startsWith('lele'));
      if(newBench>openSlots)continue;
      const cost=numQuick+2*numUltra+2*Number(ghVia!=='none');
      const reserved=Number(!activeAdp)+Number(adpVia==='held')+
        Number(ddeHeld)+Number(ghVia==='held')+Number(tagUsed)+
        numQuick+numUltra+Number(ghVia==='leleHeld');
      const eligible=profile==='mechanical'?handNow-reserved:hypotheticallySafe;
      if(eligible>=cost)return {adpVia,ghVia,discards:cost};
    }
  }
  return null;
}

/**
 * Exact first-seven + six-Prizes + first-draw count for two setup policies,
 * using fully weighted physical Basic permutations for first-eligible policy.
 * @param {number[]} [counts] Fixed 60-category source vector
 * @param {{handSize?:number,prizeCount?:number}} [options]
 * @returns {{denominatorScaled:bigint,numerators:object,handsVisited:number,sequenceVisits:number}}
 */
function comparePaidSetupPolicies(counts=COUNTS,options={}){
  if(counts.length!==13||counts.some(x=>!Number.isSafeInteger(x)||x<0))
    throw new Error('Invalid fixed category inventory');
  const n=counts.reduce((a,b)=>a+b,0),handSize=options.handSize??7,
    prizeCount=options.prizeCount??6;
  if(handSize<1||!Number.isSafeInteger(handSize)||prizeCount<0||
    !Number.isSafeInteger(prizeCount)||n<handSize+prizeCount+1)
    throw new Error('Invalid physical setup sizes');
  const numerators=Object.fromEntries(PROFILES.map(p=>[p,{
    deliberateWith:0n,deliberateWithout:0n,greedyWith:0n,greedyWithout:0n,
    firstOnlyWith:0n,firstOnlyWithout:0n}]));
  const opening=Array(13).fill(0);
  let handsVisited=0,sequenceVisits=0;
  function evaluate(handWeight){
    const deliberate=deliberateSetup(opening);
    if(!deliberate)return;
    handsVisited++;
    const greedy=greedySetups(opening);
    const firstOnly=firstOnlySetups(opening);
    sequenceVisits+=greedy.length;
    const afterHand=counts.map((v,i)=>v-opening[i]);
    for(let draw=0;draw<13;draw++){
      if(!afterHand[draw])continue;
      const seen=[...opening];seen[draw]++;
      const after=[...afterHand];after[draw]--;
      const otherN=n-handSize-1-after[C.adp]-after[C.gh]-after[C.dde]-after[C.lele];
      const masks=Array(16).fill(0n);
      for(let pa=0;pa<=Math.min(after[C.adp],prizeCount);pa++)
        for(let pg=0;pg<=Math.min(after[C.gh],prizeCount-pa);pg++)
          for(let pd=0;pd<=Math.min(after[C.dde],prizeCount-pa-pg);pd++)
            for(let pl=0;pl<=Math.min(after[C.lele],prizeCount-pa-pg-pd);pl++){
              const po=prizeCount-pa-pg-pd-pl;
              if(po>otherN)continue;
              const ways=handWeight*BigInt(afterHand[draw])*
                choose(after[C.adp],pa)*choose(after[C.gh],pg)*
                choose(after[C.dde],pd)*choose(after[C.lele],pl)*
                choose(otherN,po);
              const mask=Number(after[C.adp]>pa)+2*Number(after[C.gh]>pg)+
                4*Number(after[C.dde]>pd)+8*Number(after[C.lele]>pl);
              masks[mask]+=ways;
            }
      for(let mask=0;mask<16;mask++){
        const ways=masks[mask];if(!ways)continue;
        const avail={adp:Boolean(mask&1),gh:Boolean(mask&2),dde:Boolean(mask&4),
          lele:Boolean(mask&8)};
        for(const profile of PROFILES){
          const z=numerators[profile];
          if(payableUnderSetup(opening,seen,avail,profile,true,deliberate))
            z.deliberateWith+=ways*SCALE;
          if(payableUnderSetup(opening,seen,avail,profile,false,deliberate))
            z.deliberateWithout+=ways*SCALE;
          for(const setup of greedy){
            if(payableUnderSetup(opening,seen,avail,profile,true,setup))
              z.greedyWith+=ways*setup.weight;
            if(payableUnderSetup(opening,seen,avail,profile,false,setup))
              z.greedyWithout+=ways*setup.weight;
          }
          for(const setup of firstOnly){
            if(payableUnderSetup(opening,seen,avail,profile,true,setup))
              z.firstOnlyWith+=ways*setup.weight;
            if(payableUnderSetup(opening,seen,avail,profile,false,setup))
              z.firstOnlyWithout+=ways*setup.weight;
          }
        }
      }
    }
  }
  function walk(i,left,weight){
    if(i===13){if(!left)evaluate(weight);return;}
    for(let take=0;take<=Math.min(left,counts[i]);take++){
      opening[i]=take;
      walk(i+1,left-take,weight*choose(counts[i],take));
    }
  }
  walk(0,handSize,1n);
  const basics=counts[C.adp]+counts[C.basic]+counts[C.lele];
  const valid=choose(n,handSize)-choose(n-basics,handSize);
  const denominatorScaled=valid*BigInt(n-handSize)*
    choose(n-handSize-1,prizeCount)*SCALE;
  return {denominatorScaled,numerators,handsVisited,sequenceVisits};
}
module.exports={SCALE,greedySetups,deliberateSetup,firstOnlySetups,
  payableUnderSetup,comparePaidSetupPolicies};
if(require.main===module){
  const out=comparePaidSetupPolicies();
  console.log(JSON.stringify({denominatorScaled:String(out.denominatorScaled),
    handsVisited:out.handsVisited,sequenceVisits:out.sequenceVisits,
    probabilities:Object.fromEntries(Object.entries(out.numerators).map(
      ([profile,z])=>[profile,Object.fromEntries(Object.entries(z).map(
        ([key,v])=>[key,{number:String(v),percent:100*Number(v)/Number(out.denominatorScaled)}]))]))},null,2));
}
