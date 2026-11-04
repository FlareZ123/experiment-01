'use strict';

const assert=require('node:assert/strict');

const KEYS=Object.freeze(['adp','otherBasic','switch','tagCall','quickBall',
  'ultraBall','guzmaHala','doubleDragon','other']);
const INDICES=Object.freeze(Object.fromEntries(KEYS.map((key,i)=>[key,i])));
const SOURCE_IDS=Object.freeze({
  adp:'sm12-156',
  otherBasics:['swsh12-135','sm2-60','swsh3-104'],
  switch:'sv1-194',tagCall:'sm12-206',quickBall:'swsh1-179',
  ultraBall:'swsh9-150',guzmaHala:'sm12-193',doubleDragon:'xy6-97'
});

/** @param {{cards:Array<{id:string,count:number}>}} deck @returns {number[]} */
function categorizeFixedDeck(deck){
  const counts=new Array(KEYS.length).fill(0);
  const mapped=new Map([
    [SOURCE_IDS.adp,'adp'],
    ...SOURCE_IDS.otherBasics.map(id=>[id,'otherBasic']),
    ...['switch','tagCall','quickBall','ultraBall','guzmaHala',
      'doubleDragon'].map(key=>[SOURCE_IDS[key],key])
  ]);
  for(const card of deck.cards){
    assert.ok(Number.isSafeInteger(card.count)&&card.count>=1);
    counts[INDICES[mapped.get(card.id)??'other']]+=card.count;
  }
  assert.equal(counts.reduce((a,b)=>a+b,0),60);
  assert.deepEqual(counts,[2,5,2,4,3,4,3,4,33],
    'Refuse silently changing the registered v2 candidate');
  return counts;
}

const chooseCache=new Map();
/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(k<0||k>n)return 0n;
  const index=n+':'+Math.min(k,n-k);
  const cached=chooseCache.get(index);
  if(cached!==undefined)return cached;
  let value=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    value=value*BigInt(n-i+1)/BigInt(i);
  chooseCache.set(index,value);
  return value;
}

/**
 * Choose a physical initial hand, then the named first-turn draw. Prize
 * membership is uniform among all physical cards outside those eight by
 * exchangeability. The actual rule still places six Prizes before the draw.
 *
 * @param {number[]} counts Nine disjoint registered categories.
 * @param {{openingHandSize?:number,prizeCount?:number}} [options]
 * @returns {{denominator:bigint,numerators:Record<string,bigint>,
 *   validOpeningHandCount:bigint,handCategoriesVisited:number}}
 */
function countFirstTurnAccess(counts,options={}){
  assert.ok(Array.isArray(counts)&&counts.length===KEYS.length);
  assert.ok(counts.every(n=>Number.isSafeInteger(n)&&n>=0));
  const openingHandSize=options.openingHandSize??7;
  const prizeCount=options.prizeCount??6;
  const n=counts.reduce((a,b)=>a+b,0);
  assert.ok(Number.isSafeInteger(openingHandSize)&&openingHandSize>=1);
  assert.ok(Number.isSafeInteger(prizeCount)&&prizeCount>=0&&
    n>=openingHandSize+prizeCount+1);
  const {adp:A,otherBasic:B,switch:S,tagCall:T,quickBall:Q,
    ultraBall:U,guzmaHala:G,doubleDragon:D}=INDICES;
  const hand=new Array(KEYS.length).fill(0);
  const keys=['startingAdp','switchAdpDrawn','switchTagOnly',
    'switchPlusQuick','switchPlusUltra'];
  const numerators=Object.fromEntries(keys.map(key=>[key,0n]));
  let validOpeningHandCount=0n,handCategoriesVisited=0;
  const totalPrizeAfterDraw=n-openingHandSize-1;
  const totalDrawBeforePrize=n-openingHandSize;

  function evaluateHand(handWeight){
    if(hand[A]+hand[B]===0)return;
    handCategoriesVisited++;
    validOpeningHandCount+=handWeight;
    const afterHand=counts.map((count,i)=>count-hand[i]);
    for(let drawn=0;drawn<counts.length;drawn++){
      const possibilities=afterHand[drawn];
      if(possibilities===0)continue;
      const seen=[...hand];
      seen[drawn]++;
      const remaining=[...afterHand];
      remaining[drawn]--;
      const firstEightWeight=handWeight*BigInt(possibilities);
      const adpStarted=hand[A]>0;
      const otherStarted=hand[A]===0&&hand[B]>0&&seen[S]>0;
      if(!adpStarted&&!otherStarted)continue;
      const otherPrizePool=totalPrizeAfterDraw-
        remaining[A]-remaining[G]-remaining[D];
      for(let pa=0;pa<=Math.min(remaining[A],prizeCount);pa++){
        for(let pg=0;pg<=Math.min(remaining[G],prizeCount-pa);pg++){
          for(let pd=0;pd<=Math.min(remaining[D],prizeCount-pa-pg);pd++){
            const po=prizeCount-pa-pg-pd;
            if(po>otherPrizePool)continue;
            const weight=firstEightWeight*choose(remaining[A],pa)*
              choose(remaining[G],pg)*choose(remaining[D],pd)*
              choose(otherPrizePool,po);
            const adpDeckAvailable=remaining[A]>pa;
            const ghDeckAvailable=remaining[G]>pg;
            const ddeDeckAvailable=remaining[D]>pd;
            const energyAvailable=seen[D]>0||(
              ddeDeckAvailable&&(seen[G]>0||
                (seen[T]>0&&ghDeckAvailable)));
            if(!energyAvailable)continue;
            if(adpStarted)numerators.startingAdp+=weight;
            if(!otherStarted)continue;
            const drewAdp=seen[A]>0;
            const tagAvailable=seen[T]>0;
            const searchFromDeck=adpDeckAvailable;
            if(drewAdp)numerators.switchAdpDrawn+=weight;
            if(drewAdp||(searchFromDeck&&tagAvailable))
              numerators.switchTagOnly+=weight;
            if(drewAdp||(searchFromDeck&&
                (tagAvailable||seen[Q]>0)))
              numerators.switchPlusQuick+=weight;
            if(drewAdp||(searchFromDeck&&
                (tagAvailable||seen[Q]>0||seen[U]>0)))
              numerators.switchPlusUltra+=weight;
          }
        }
      }
    }
  }
  function visitHand(index,available,weight){
    if(index===counts.length){
      if(available===0)evaluateHand(weight);
      return;
    }
    for(let take=0;take<=Math.min(counts[index],available);take++){
      hand[index]=take;
      visitHand(index+1,available-take,
        weight*choose(counts[index],take));
    }
  }
  visitHand(0,openingHandSize,1n);
  const acceptedOpeningHands=choose(n,openingHandSize)-
    choose(n-counts[A]-counts[B],openingHandSize);
  assert.equal(validOpeningHandCount,acceptedOpeningHands);
  const denominator=validOpeningHandCount*BigInt(totalDrawBeforePrize)*
    choose(totalPrizeAfterDraw,prizeCount);
  return {denominator,numerators,validOpeningHandCount,
    handCategoriesVisited};
}

/** @param {bigint} numerator @param {bigint} denominator @returns {number} */
function ratio(numerator,denominator){
  assert.ok(denominator>0n&&numerator>=0n&&numerator<=denominator);
  return Number(numerator)/Number(denominator);
}

module.exports={KEYS,INDICES,SOURCE_IDS,categorizeFixedDeck,
  choose,countFirstTurnAccess,ratio};
