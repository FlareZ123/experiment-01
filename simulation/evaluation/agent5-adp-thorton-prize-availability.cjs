'use strict';

const source=require('../../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v1.json');
const VERSION='agent5-adp-thorton-valid-opening-prize-availability-v1';
const CORE=[
  ['ADP','sm12-156',true],
  ['Regidrago V','swsh12-135',true],
  ['Double Dragon Energy','xy6-97',false],
  ['Thorton','swsh11-167',false],
  ['Regidrago VSTAR','swsh12-136',false],
  ['Wild Blaze M Charizard-EX','xy2-69',false]
];
const CAPE=['Hero Cape','sv5-152',false];
const BASIC=new Set(['sm12-156','swsh12-135','sm2-60','swsh3-104']);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k)||
     n<0||k<0)throw new RangeError('Nonnegative integer n,k required');
  if(k>n)return 0n;
  let acc=1n;
  for(let i=1;i<=Math.min(k,n-k);i++){
    acc=acc*BigInt(n-i+1)/BigInt(i);
  }
  return acc;
}

/**
 * Enumerate every 6-Prize multivariate hypergeometric category. Starting
 * hand is a subsequent uniform 7-card draw from the remaining 54, conditioned
 * on it containing at least one Basic Pokémon. Counts are exact BigInt.
 *
 * @param {{id:string,name:string,count:number}[]} rows Fixed printed 60.
 * @returns {object}
 */
function availability(rows=source.cards){
  if(rows.reduce((n,c)=>n+c.count,0)!==60)
    throw new Error('Prize model requires a true 60-card fixed list');
  const ids=new Map(rows.map(x=>[x.id,x.count]));
  const used=new Set([...CORE.map(x=>x[1]),CAPE[1]]);
  const category=CORE.map(([name,id,basic])=>
    ({name,count:ids.get(id)??0,basic}));
  category.push({name:CAPE[0],count:ids.get(CAPE[1])??0,basic:false});
  const otherBasic=rows.reduce((n,c)=>
    n+(BASIC.has(c.id)&&!used.has(c.id)?c.count:0),0);
  category.push({name:'Other Basic Pokémon',count:otherBasic,basic:true});
  category.push({name:'Other cards',count:60-category.reduce(
    (n,c)=>n+c.count,0)-otherBasic,basic:false});
  if(category.some(c=>c.count<0)||category.reduce((n,c)=>n+c.count,0)!==60)
    throw new Error('Invalid partition of the 60 physical cards');
  const basicTotal=category.filter(c=>c.basic)
    .reduce((n,c)=>n+c.count,0);
  const required=CORE.map(c=>c[0]),withCape=[...required,CAPE[0]];
  let validPairs=0n,allCorePairs=0n,allCoreAndCapePairs=0n;
  const picks=Array(category.length).fill(0);
  /** @param {number} i @param {number} remaining @param {bigint} ways */
  function enumerate(i,remaining,ways){
    if(i===category.length){
      if(remaining!==0)return;
      const basicPrized=picks.reduce((n,p,j)=>
        n+(category[j].basic?p:0),0);
      const remainingBasic=basicTotal-basicPrized;
      const validHands=choose(54,7)-choose(54-remainingBasic,7);
      const weight=ways*validHands;
      validPairs+=weight;
      const available=new Set(category.filter((x,j)=>
        picks[j]<x.count).map(x=>x.name));
      if(required.every(x=>available.has(x)))allCorePairs+=weight;
      if(withCape.every(x=>available.has(x)))allCoreAndCapePairs+=weight;
      return;
    }
    const entry=category[i];
    for(let p=0;p<=Math.min(remaining,entry.count);p++){
      picks[i]=p;
      enumerate(i+1,remaining-p,ways*choose(entry.count,p));
    }
  }
  enumerate(0,6,1n);
  if(validPairs<=0n)throw new Error('No legal seven-card Basic opener');
  return {
    version:VERSION,deckCopies:60,prizeCards:6,startingHandCards:7,
    startingBasicCount:basicTotal,
    conditioning:'uniform physical shuffled 7-card starting hand with at least one Basic; six uniformly drawn Prize cards from the other 53',
    coreRequired:required,unprizedHeroCapeAdditional:true,
    validDealPairs:validPairs.toString(),
    allCorePairs:allCorePairs.toString(),
    coreUnprizedFraction:Number(allCorePairs)/Number(validPairs),
    coreAndCapeUnprizedFraction:
      Number(allCoreAndCapePairs)/Number(validPairs),
    claimsGameWin:false,
    note:'Only one card from every required identity must remain outside Prizes. Ignores draw/search/payment, player-turn and GX legality, actual access, lock and attacks. Thus an optimistic necessary access condition, never a setup or win probability.'
  };
}
if(require.main===module){
  process.stdout.write(JSON.stringify(availability(),null,2)+'\n');
}
module.exports={VERSION,CORE,CAPE,BASIC,choose,availability};
