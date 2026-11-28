'use strict';

/**
 * Exact opening-hand-conditioned, group-specific Prize-only Basic access.
 *
 * Generalizes the singleton analysis for a fixed sixty. A "critical group"
 * represents interchangeable copies of one required Basic Pokémon. The line
 * is Prize-blocked via Heavy Ball alone if more critical *groups* are fully
 * Prized than there are unprized one-for-one Hisuian Heavy Ball cards.
 *
 * This is an opening-Prize *necessary card-access* condition, NOT proof that
 * Heavy Ball is playable/accessible in a turn, or of wins. The returned
 * unrecoverable rate conditions on seven-card hands containing >=1 Basic.
 */
const {choose}=require('./agent47-three-basic-heavyball-prize-model.cjs');

function assertInteger(n,name){
  if(!Number.isSafeInteger(n)||n<0)
    throw Error('INVALID_'+name);
}

function allocations(limits,maxCards,visit){
  function walk(i,used,counts,weight){
    if(i===limits.length){
      visit(counts.slice(),used,weight);
      return;
    }
    const lim=Math.min(limits[i],maxCards-used);
    for(let count=0;count<=lim;count++){
      counts.push(count);
      walk(i+1,used+count,counts,
        weight*choose(limits[i],count));
      counts.pop();
    }
  }
  walk(0,0,[],1n);
}

function groupedOpeningPrizeAccess({
  coreCopies,otherBasicCount,heavyBalls,
  deckSize=60,openingHand=7,prizeCount=6
}){
  if(!Array.isArray(coreCopies)||coreCopies.length===0)
    throw Error('CORE_GROUPS_REQUIRED');
  coreCopies.forEach((n,i)=>{
    assertInteger(n,'CORE_'+i);
    if(n===0)throw Error('CORE_GROUP_EMPTY');
  });
  for(const [name,n] of Object.entries({
    otherBasicCount,heavyBalls,deckSize,openingHand,prizeCount
  }))assertInteger(n,name);
  const criticalCards=coreCopies.reduce((a,b)=>a+b,0);
  const basicCount=criticalCards+otherBasicCount;
  const otherNonbasicCount=deckSize-basicCount-heavyBalls;
  if(deckSize<openingHand+prizeCount||
     otherNonbasicCount<0||basicCount===0)
    throw Error('DECK_COMPOSITION_INVALID');
  const remaining=deckSize-openingHand;
  const totalAll=choose(deckSize,openingHand);
  const validHands=totalAll-choose(deckSize-basicCount,openingHand);
  if(validHands===0n)throw Error('NO_VALID_OPENING');
  const denominator=validHands*choose(remaining,prizeCount);
  let partition=0n,blocked=0n, anyCoreFullyPrized=0n;
  const unreachableGroups=Array.from(
    {length:coreCopies.length+1},()=>0n);

  allocations(coreCopies,openingHand,(handCore,hCoreSum,handCoreWays)=>{
    for(let hHeavy=0;hHeavy<=Math.min(heavyBalls,openingHand-hCoreSum);hHeavy++){
      for(let hOtherBasic=0;
          hOtherBasic<=Math.min(otherBasicCount,openingHand-hCoreSum-hHeavy);
          hOtherBasic++){
        if(hCoreSum+hOtherBasic===0)continue; // mulligan hand
        const hOther=openingHand-hCoreSum-hHeavy-hOtherBasic;
        const handWays=handCoreWays*
          choose(heavyBalls,hHeavy)*
          choose(otherBasicCount,hOtherBasic)*
          choose(otherNonbasicCount,hOther);
        if(handWays===0n)continue;
        const availableCore=coreCopies.map((n,i)=>n-handCore[i]);
        const availableHeavy=heavyBalls-hHeavy;
        const otherLeft=remaining-availableCore.reduce((a,b)=>a+b,0)-
          availableHeavy;
        allocations(availableCore,prizeCount,(prizeCore,pCoreSum,prizeCoreWays)=>{
          for(let pHeavy=0;
              pHeavy<=Math.min(availableHeavy,prizeCount-pCoreSum);
              pHeavy++){
            const pOther=prizeCount-pCoreSum-pHeavy;
            const weight=handWays*prizeCoreWays*
              choose(availableHeavy,pHeavy)*choose(otherLeft,pOther);
            if(weight===0n)continue;
            partition+=weight;
            const missingGroups=prizeCore.reduce((count,prized,i)=>
              count+(prized===coreCopies[i]?1:0),0);
            unreachableGroups[missingGroups]+=weight;
            if(missingGroups>0)anyCoreFullyPrized+=weight;
            if(missingGroups>heavyBalls-pHeavy)blocked+=weight;
          }
        });
      }
    }
  });
  if(partition!==denominator)throw Error('INCOMPLETE_OPENING_PRIZE_PARTITION');
  const ratio=v=>Number(v)/Number(denominator);
  return Object.freeze({
    coreCopies:Object.freeze(coreCopies.slice()),otherBasicCount,basicCount,
    heavyBalls,deckSize,openingHand,prizeCount,
    validOpeningRate:Number(validHands)/Number(totalAll),
    unrecoverablePrizeOnly:ratio(blocked),
    potentiallyRecoverablePrizeOnly:1-ratio(blocked),
    anyCoreGroupFullyPrized:ratio(anyCoreFullyPrized),
    exactMissingGroupCounts:Object.freeze(unreachableGroups.map(ratio)),
    numerator:blocked.toString(),denominator:denominator.toString()
  });
}

module.exports={groupedOpeningPrizeAccess};
