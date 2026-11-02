'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const BASIC_EXCEPT_REGIDRAGO=new Set([
  'Dialga-GX','Kyurem','Latias ex','Tapu Lele-GX',
  'Dedenne-GX','Squawkabilly ex','Budew'
]);
const EVOLVED_DONOR=new Set([
  'Salamence ex','Dragapult ex','Noivern ex'
]);
const MASK={QUICK_BALL:1,DONOR:2,OTHER_BASIC:4,VSTAR:8};

/** Exact small integer combinatorial coefficient. @param {number} n @param {number} k */
function choose(n,k){
  if(k<0||k>n)return 0n;
  let x=1n;
  for(let i=1;i<=k;i++)x=x*BigInt(n-i+1)/BigInt(i);
  return x;
}

/**
 * Opening seven event with a singleton Dragon donor paying Quick Ball,
 * no initial Regidrago V, a second Basic starter, and no duplicate
 * printing outside Quick Ball. Count VSTAR-held and VSTAR-absent strata.
 * Source list is the exact published Aichi rank13 sixty, not a legal
 * format-wide claim.
 * @param {{cards:Array<{name:string,count:number}>}} deck
 * @returns {{withoutHeldVstar:bigint,withHeldVstar:bigint,
 *  entireEvent:bigint,basicValid:bigint}}
 */
function source13DonorVstarCounts(deck){
  assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(deck.cards.find(c=>c.name==='Regidrago V')?.count,4);
  assert.equal(deck.cards.find(c=>c.name==='Regidrago VSTAR')?.count,3);
  const dp=Array.from({length:8},()=>Array(16).fill(0n));
  dp[0][0]=1n;
  for(const card of deck.cards){
    if(card.name==='Regidrago V')continue;
    const bit=(card.name==='Quick Ball'?MASK.QUICK_BALL:0)|
      (EVOLVED_DONOR.has(card.name)?MASK.DONOR:0)|
      (BASIC_EXCEPT_REGIDRAGO.has(card.name)?MASK.OTHER_BASIC:0)|
      (card.name==='Regidrago VSTAR'?MASK.VSTAR:0);
    const next=Array.from({length:8},()=>Array(16).fill(0n));
    const maxTake=card.name==='Quick Ball'?card.count:1;
    for(let count=0;count<=7;count++)
      for(let seen=0;seen<16;seen++)
        for(let take=0;take<=maxTake&&count+take<=7;take++)
          next[count+take][seen|(take?bit:0)]+=
            dp[count][seen]*choose(card.count,take);
    for(let count=0;count<=7;count++)
      for(let seen=0;seen<16;seen++)dp[count][seen]=next[count][seen];
  }
  const withoutHeldVstar=dp[7][7],withHeldVstar=dp[7][15];
  return {withoutHeldVstar,withHeldVstar,
    entireEvent:withoutHeldVstar+withHeldVstar,
    basicValid:choose(60,7)-choose(49,7)};
}

/** Read unchanged exact rank13 source registration from published field. */
function originalSource(){
  const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const source=manifest.decks.find(d=>d.rank===13);
  assert.ok(source?.cards?.length>0);
  return source;
}

if(require.main===module){
  const r=source13DonorVstarCounts(originalSource());
  const chanceGivenEvent=Number(r.withHeldVstar)/Number(r.entireEvent);
  const chanceNextThreeGivenAbsent=1-Number(choose(50,3))/
    Number(choose(53,3));
  console.log(JSON.stringify({
    schema:'agent8-source13-quickball-donor-vstar-joint-opening-v1',
    eventCount:r.entireEvent.toString(),
    withoutHeldVstar:r.withoutHeldVstar.toString(),
    withHeldVstar:r.withHeldVstar.toString(),
    basicValidHands:r.basicValid.toString(),
    conditionalAlreadyHeldVstar:chanceGivenEvent,
    conditionalVstarSeenByThreeUnassistedDraws:
      chanceGivenEvent+(1-chanceGivenEvent)*chanceNextThreeGivenAbsent,
    allFourRegidragoVPrizedGivenNoneInInitialSeven:
      Number(choose(49,2))/Number(choose(53,6)),
    caveat:'No opponent, Prize recovery, Trainer draws, search, tactical resource loss, or 25-minute clock.'
  },null,2));
}
module.exports={choose,originalSource,source13DonorVstarCounts,
  BASIC_EXCEPT_REGIDRAGO,EVOLVED_DONOR};
