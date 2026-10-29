'use strict';

const assert = require('node:assert/strict');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if(k<0||k>n)return 0n;
  let answer=1n;
  for(let i=1;i<=k;i++)answer=answer*BigInt(n-k+i)/BigInt(i);
  return answer;
}

/**
 * Exact source partition:
 * Trubbish, Garbodor, Boost Shake, eligible Tool,
 * Quick Ball, Battle VIP Pass, other Basic, Darkness Energy, other.
 * @param {{cards:{name:string,count:number,category:string}[]}} deck
 * @returns {number[]}
 */
function sourcePartition(deck) {
  /** @param {string} name @returns {number} */
  const n=name=>deck.cards.filter(row=>row.name===name)
    .reduce((count,row)=>count+row.count,0);
  const tools=['Float Stone','Muscle Band','Forest Seal Stone']
    .reduce((count,name)=>count+n(name),0);
  const basics=deck.cards.filter(row=>row.category==='Pokémon'&&
    row.name!=='Garbodor').reduce((count,row)=>count+row.count,0);
  const vector=[n('Trubbish'),n('Garbodor'),n('Boost Shake'),tools,
    n('Quick Ball'),n('Battle VIP Pass'),basics-n('Trubbish'),
    n('Darkness Energy')];
  vector.push(60-vector.reduce((count,qty)=>count+qty,0));
  assert.deepEqual(vector,[2,2,2,6,4,4,9,8,23]);
  assert.equal(deck.cards.reduce((total,row)=>total+row.count,0),60);
  return vector;
}

/**
 * Among the 52 cards outside the first eight, exactly six are Prized.
 * Require at least one searchable Garbodor and, if Trubbish is not already
 * held, one searchable Trubbish. All unsuccessful Prize configurations
 * remain in the total denominator.
 * @param {number} tLeft
 * @param {number} gLeft
 * @param {boolean} needTrubbishSearch
 * @returns {bigint}
 */
function searchablePrizeWays(tLeft,gLeft,needTrubbishSearch) {
  if(gLeft===0||(needTrubbishSearch&&tLeft===0))return 0n;
  const total=choose(52,6);
  /** @param {number} c @returns {bigint} */
  const allLost=c=>choose(52-c,6-c);
  return total-allLost(gLeft)-
    (needTrubbishSearch?allLost(tLeft)-allLost(tLeft+gLeft):0n);
}

/**
 * Enumerate opening-seven multisets and one subsequent ordinary draw,
 * conditioning on Basic-valid original seven. Uniform Prize-six placement
 * can exchange order with the subsequent draw without changing card
 * location probabilities; actual play must retain real temporal order.
 * No card-effect draw/search, discard acceptability, Bench choice, locks,
 * information-set decision or native game result is modeled.
 *
 * @param {{cards:{name:string,count:number,category:string}[]}} deck
 * @returns {{
 *  denominator:bigint,direct:bigint,quickOnly:bigint,
 *  quickEnergy:bigint,quickTwoEnergy:bigint,quickOnlyBeforePrizes:bigint
 * }}
 */
function enumerate(deck) {
  const pool=sourcePartition(deck);
  const result={direct:0n,quickOnly:0n,quickEnergy:0n,
    quickTwoEnergy:0n,quickOnlyBeforePrizes:0n};
  const starting=new Array(pool.length).fill(0);
  /** @param {number} index @param {number} cardsLeft @param {bigint} ways */
  function explore(index,cardsLeft,ways) {
    if(index===pool.length-1) {
      if(cardsLeft>pool[index])return;
      starting[index]=cardsLeft;
      calculate(ways*choose(pool[index],cardsLeft));
      return;
    }
    for(let amount=0;amount<=Math.min(cardsLeft,pool[index]);amount++){
      starting[index]=amount;
      explore(index+1,cardsLeft-amount,ways*choose(pool[index],amount));
    }
  }
  /** @param {bigint} startingWays */
  function calculate(startingWays) {
    if(starting[0]+starting[6]===0)return;
    for(let drawIndex=0;drawIndex<pool.length;drawIndex++){
      const remaining=pool[drawIndex]-starting[drawIndex];
      if(remaining===0)continue;
      const hand=starting.map((n,idx)=>n+Number(idx===drawIndex));
      const [trubbish,garbodor,boost,tools,quick,vip,,energy]=hand;
      if(boost===0||tools===0)continue;
      const direct=trubbish>0||vip>0;
      const quickOnly=!direct&&quick>0;
      if(!direct&&!quickOnly)continue;
      const handWays=startingWays*BigInt(remaining);
      const prizeWays=searchablePrizeWays(
        2-trubbish,2-garbodor,trubbish===0);
      if(direct)result.direct+=handWays*prizeWays;
      if(quickOnly){
        result.quickOnlyBeforePrizes+=handWays*choose(52,6);
        const accessible=handWays*prizeWays;
        result.quickOnly+=accessible;
        if(energy>0)result.quickEnergy+=accessible;
        if(energy>1)result.quickTwoEnergy+=accessible;
      }
    }
  }
  explore(0,7,1n);
  return {denominator:
    (choose(60,7)-choose(49,7))*53n*choose(52,6),...result};
}

/** @param {bigint} part @param {bigint} whole @returns {number} */
const probability=(part,whole)=>Number(part)/Number(whole);

if(require.main===module){
  const source=require('../results/aichi-2026/full-decklists.json');
  const deck=source.decks.find(record=>record.rank===11);
  assert.ok(deck,'The original rank-11 60 must be present');
  const count=enumerate(deck);
  process.stdout.write(JSON.stringify({
    ...Object.fromEntries(Object.entries(count).map(([k,v])=>[k,String(v)])),
    directProbability:probability(count.direct,count.denominator),
    quickOnlyProbability:probability(count.quickOnly,count.denominator),
    quickWithDarknessProbability:probability(count.quickEnergy,count.denominator),
    combinedProbability:probability(count.direct+count.quickOnly,count.denominator),
    competitiveQualified:false
  },null,2)+'\n');
}
module.exports={choose,sourcePartition,searchablePrizeWays,enumerate,probability};
