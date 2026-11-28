'use strict';

/*
 * Exact combinatorial opening Prize geometry, not a win-rate simulation.
 *
 * Draw 7 opening cards from a 60-card deck. An opening hand with no Basic
 * Pokémon mulligans; conditioning on an eventually valid starting hand
 * changes the Prize distribution when target cards are themselves Basics.
 * From the 53-card post-hand deck, six face-down Prize cards are selected.
 *
 * This computes the necessary Prize-only recoverability condition for
 * 'criticalBasics' singleton Basic Pokémon, with 'heavyBalls' singleton
 * items that can each rescue one Prized Basic by swapping themselves into
 * the Prizes. All remaining cards are treated symmetrically.
 *
 * It does NOT model having drawn/searched a Heavy Ball in time, discarded
 * payloads, normal Prize-taking, opportunity cost, bench availability,
 * opponent interaction, mulligan bonus cards, or any game performance.
 */

function choose(n,k){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k)||
     n<0||k<0||k>n)return 0n;
  k=Math.min(k,n-k);
  let val=1n;
  for(let i=1;i<=k;i++){
    val=val*BigInt(n-k+i)/BigInt(i);
  }
  return val;
}

function openingPrizeAccessibility({
  deckSize=60,handSize=7,prizeCount=6,
  basicCount,criticalBasics,heavyBalls=0
}){
  for(const value of [deckSize,handSize,prizeCount,basicCount,
    criticalBasics,heavyBalls]){
    if(!Number.isSafeInteger(value)||value<0)
      throw Error('PARAMETER_OUT_OF_RANGE');
  }
  if(deckSize<handSize+prizeCount||basicCount>deckSize||
     criticalBasics>basicCount||heavyBalls>deckSize-basicCount)
    throw Error('DECK_COMPOSITION_INVALID');
  const otherBasics=basicCount-criticalBasics;
  const otherNonBasics=deckSize-basicCount-heavyBalls;
  const afterHand=deckSize-handSize;
  const validHands=choose(deckSize,handSize)-
    choose(deckSize-basicCount,handSize);
  if(validHands===0n)throw Error('NO_VALID_BASIC_OPENING');
  const prizeWays=choose(afterHand,prizeCount);
  const denominator=validHands*prizeWays;
  let compatible=0n;
  let insufficient=0n;
  let anyCriticalPrized=0n;
  let atLeastTwoCriticalPrized=0n;
  const exactByCriticalCount=Array.from(
    {length:criticalBasics+1},()=>0n
  );

  for(let hCore=0;hCore<=criticalBasics;hCore++){
    for(let hBall=0;hBall<=heavyBalls;hBall++){
      for(let hOtherBasic=0;hOtherBasic<=otherBasics;hOtherBasic++){
        const hOtherNonBasic=handSize-hCore-hBall-hOtherBasic;
        if(hCore+hOtherBasic===0)continue; // reject mulligan hands
        const handWays=
          choose(criticalBasics,hCore)*
          choose(heavyBalls,hBall)*
          choose(otherBasics,hOtherBasic)*
          choose(otherNonBasics,hOtherNonBasic);
        if(handWays===0n)continue;
        const cLeft=criticalBasics-hCore;
        const bLeft=heavyBalls-hBall;
        const otherLeft=afterHand-cLeft-bLeft;
        for(let pCore=0;pCore<=cLeft;pCore++){
          for(let pBall=0;pBall<=bLeft;pBall++){
            const pOther=prizeCount-pCore-pBall;
            const eventWays=handWays*
              choose(cLeft,pCore)*
              choose(bLeft,pBall)*
              choose(otherLeft,pOther);
            if(eventWays===0n)continue;
            compatible+=eventWays;
            exactByCriticalCount[pCore]+=eventWays;
            if(pCore>0)anyCriticalPrized+=eventWays;
            if(pCore>=2)atLeastTwoCriticalPrized+=eventWays;
            if(pCore>heavyBalls-pBall)insufficient+=eventWays;
          }
        }
      }
    }
  }
  if(compatible!==denominator)
    throw Error('INCOMPLETE_PARTITION');
  const ratio=number=>Number(number)/Number(denominator);
  return Object.freeze({
    deckSize,handSize,prizeCount,basicCount,criticalBasics,
    heavyBalls,validOpeningRate:Number(validHands)/
      Number(choose(deckSize,handSize)),
    prizeOnlyUnrecoverable:ratio(insufficient),
    prizeOnlyPotentiallyRecoverable:1-ratio(insufficient),
    atLeastOneCriticalPrized:ratio(anyCriticalPrized),
    atLeastTwoCriticalPrized:ratio(atLeastTwoCriticalPrized),
    exactCriticalPrized:Object.freeze(
      exactByCriticalCount.map(ratio)),
    exactCounts:Object.freeze({unrecoverable:insufficient.toString(),
      denominator:denominator.toString()})
  });
}

module.exports={choose,openingPrizeAccessibility};
