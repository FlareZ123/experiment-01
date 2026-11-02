'use strict';

const assert=require('node:assert/strict');
const field=require('../results/aichi-2026/full-decklists.json');

/** Exact binomial coefficient, including impossible choices. */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  let out=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    out=out*BigInt(n-i+1)/BigInt(i);
  return out;
}

/**
 * Exact, physical-printing-sensitive early-hand location census.
 *
 * Each possible observed unordered n-card subset is weighted by the number
 * of choices of the initial openingSize-card hand from it that contain a Basic.
 * This is exactly the sample space for a Basic-valid opening followed by
 * observedSize-openingSize ordinary random draws without intervening effects.
 * Prize cards can be marginalized because they are randomly allocated from
 * the deck, but deck searches, other draws, mulligans and player choices are
 * not simulated.
 *
 * The conservative payment condition assumes the existing actor47 chooser
 * preserves every final hand-held printing: after playing one Supporter,
 * at least two discardable extra physical copies must remain in hand.
 * The result is an opportunity count, not Plumeria legality or win rate.
 *
 * @param {{cards:{name:string,count:number,printing?:object}[],
 *   observedSize:number,openingSize:number,
 *   basicName:string,supporterName:string}} input
 * @returns {object} Exact counts as decimal strings plus conditional rate
 */
function countEarlyHands(input){
  const {cards,observedSize,openingSize,basicName,supporterName}=input;
  assert.ok(Array.isArray(cards)&&cards.length>0);
  assert.ok(Number.isSafeInteger(observedSize)&&observedSize>=0);
  assert.ok(Number.isSafeInteger(openingSize)&&openingSize>=1);
  assert.ok(observedSize>=openingSize);
  const deckSize=cards.reduce((n,row)=>{
    assert.ok(typeof row.name==='string'&&row.name.length>0);
    assert.ok(Number.isSafeInteger(row.count)&&row.count>=1);
    return n+row.count;
  },0);
  assert.ok(observedSize<=deckSize);
  assert.ok(cards.some(row=>row.name===basicName));
  assert.ok(cards.some(row=>row.name===supporterName));
  assert.equal(cards.filter(row=>row.name===supporterName).length,1,
    'single physical Supporter printing required for this payment screen');
  // A distinct physical printing is a distinct discard-conservation class.
  const seen=new Set();
  for(const row of cards){
    const key=JSON.stringify([row.name,row.printing?.set??'',
      row.printing?.number??'',row.printing?.language??'']);
    assert.ok(!seen.has(key),'duplicate physical printing inventory row');
    seen.add(key);
  }
  // Key = [observed physical cards, Basics, Supporter held, safe-discard
  // capacity capped at two]. All combinatorial weights are BigInt.
  let states=new Map([['0,0,0,0,0,0,0,0',1n]]);
  for(const row of cards){
    const next=new Map();
    for(const [key,multiplicity] of states){
      const [observed,basics,hasSupporter,capacity,
        trainerSafe,trainerDuplicated,
        highMultiplicityGroups,nonBasicSafe]=key.split(',').map(Number);
      for(let copies=0;copies<=Math.min(row.count,observedSize-observed);copies++){
        const nextKey=[
          observed+copies,
          basics+(row.name===basicName?copies:0),
          +(hasSupporter>0||(row.name===supporterName&&copies>0)),
          Math.min(2,capacity+Math.max(0,copies-
            (row.name===supporterName?2:1))),
          Math.min(2,trainerSafe+(row.category==='Trainer'?
            Math.max(0,copies-(row.name===supporterName?2:1)):0)),
          Math.min(2,trainerDuplicated+(
            row.category==='Trainer'&&row.count>=2?
              Math.max(0,copies-(row.name===supporterName?1:0)):0)),
          Math.min(2,highMultiplicityGroups+(
            row.category==='Trainer'&&row.count>=3&&
            copies>(row.name===supporterName?1:0)?1:0)),
          Math.min(2,nonBasicSafe+(row.name===basicName?0:
            Math.max(0,copies-(row.name===supporterName?2:1))))
        ].join(',');
        next.set(nextKey,(next.get(nextKey)??0n)+
          multiplicity*choose(row.count,copies));
      }
    }
    states=next;
  }

  const total=choose(deckSize,observedSize)*
    choose(observedSize,openingSize);
  let valid=0n,held=0n,allowed=0n;
  const byCapacity=[0n,0n,0n];
  let strictTrainerOnly=0n,globallyDuplicatedTrainer=0n;
  let distinctHighMultiplicityTrainer=0n;
  let benchAllBasicsAllowed=0n;
  for(const [key,weight] of states){
    const [observed,basics,hasSupporter,capacity,
      trainerSafe,trainerDuplicated,
      highMultiplicityGroups]=key.split(',').map(Number);
    if(observed!==observedSize)continue;
    const legalOpeners=choose(observedSize,openingSize)-
      choose(observedSize-basics,openingSize);
    const weighed=weight*legalOpeners;
    valid+=weighed;
    if(hasSupporter){
      held+=weighed;
      byCapacity[capacity]+=weighed;
      if(capacity>=2)allowed+=weighed;
      if(trainerSafe>=2)strictTrainerOnly+=weighed;
      if(trainerDuplicated>=2)globallyDuplicatedTrainer+=weighed;
      if(highMultiplicityGroups>=2)distinctHighMultiplicityTrainer+=weighed;
      if(nonBasicSafe>=2)benchAllBasicsAllowed+=weighed;
    }
  }
  assert.equal(byCapacity[0]+byCapacity[1]+byCapacity[2],held);
  assert.ok(allowed<=held&&held<=valid&&valid<=total);
  return {
    deckSize,observedSize,openingSize,
    totalWeighted:String(total),
    validOpeningWeighted:String(valid),
    supporterHeldWeighted:String(held),
    capacityZeroWeighted:String(byCapacity[0]),
    capacityOneWeighted:String(byCapacity[1]),
    paymentAllowedWeighted:String(allowed),
    strictTrainerOnlyWeighted:String(strictTrainerOnly),
    globallyDuplicatedTrainerWeighted:String(globallyDuplicatedTrainer),
    distinctHighMultiplicityTrainerWeighted:
      String(distinctHighMultiplicityTrainer),
    benchAllBasicsWeighted:String(benchAllBasicsAllowed),
    conditionalPaymentRate:held>0n?Number(allowed)/Number(held):null,
    strictTrainerOnlyRate:held>0n?Number(strictTrainerOnly)/Number(held):null,
    globallyDuplicatedTrainerRate:held>0n?
      Number(globallyDuplicatedTrainer)/Number(held):null,
    distinctHighMultiplicityTrainerRate:held>0n?
      Number(distinctHighMultiplicityTrainer)/Number(held):null,
    benchAllBasicsRate:held>0n?
      Number(benchAllBasicsAllowed)/Number(held):null,
    interpretation:'valid opening Basic and Supporter held among observed cards; payment preserves every remaining hand printing'
  };
}

/** Authenticated rank-6 original Iron Thorns printed-60 source. */
function rank6EarlyHands(observedSize){
  const source=field.decks.find(deck=>deck.rank===6);
  assert.ok(source&&source.cards.reduce((n,row)=>n+row.count,0)===60);
  assert.equal(source.player,'Kazuma Kashi');
  return countEarlyHands({
    cards:source.cards,observedSize,openingSize:7,
    basicName:'Iron Thorns ex',supporterName:'Plumeria'
  });
}
module.exports={choose,countEarlyHands,rank6EarlyHands};

if(require.main===module){
  for(const n of [7,8])
    process.stdout.write(JSON.stringify(rank6EarlyHands(n))+'\n');
}
