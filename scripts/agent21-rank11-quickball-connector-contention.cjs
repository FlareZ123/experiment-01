'use strict';
const assert=require('node:assert/strict');
const {choose,probability}=
  require('./agent21-rank11-quickball-prize-frontier.cjs');

/**
 * Trubbish, Garbodor, Boost Shake, eligible Tool, Quick Ball, VIP Pass,
 * Dark Patch, Darkness Energy, Mega Absol ex, other Basic, other.
 * @param {{cards:{name:string,count:number,category:string}[]}} deck
 * @returns {number[]}
 */
function sourcePartition(deck){
  /** @param {string} name @returns {number} */
  const count=name=>deck.cards.filter(row=>row.name===name)
    .reduce((sum,row)=>sum+row.count,0);
  const tools=['Float Stone','Muscle Band','Forest Seal Stone']
    .reduce((sum,name)=>sum+count(name),0);
  const basics=deck.cards.filter(row=>row.category==='Pokémon'&&
    row.name!=='Garbodor').reduce((sum,row)=>sum+row.count,0);
  const categories=[count('Trubbish'),count('Garbodor'),
    count('Boost Shake'),tools,count('Quick Ball'),
    count('Battle VIP Pass'),count('Dark Patch'),
    count('Darkness Energy'),count('Mega Absol ex'),
    basics-count('Trubbish')-count('Mega Absol ex')];
  categories.push(60-categories.reduce((sum,n)=>sum+n,0));
  assert.deepEqual(categories,[2,2,2,6,4,4,3,8,3,6,20]);
  assert.equal(deck.cards.reduce((sum,row)=>sum+row.count,0),60);
  return categories;
}

/**
 * Six Prize choices from the 52 cards outside the first eight, preserving
 * at least one live-deck card in every required *disjoint* category.
 * @param {number[]} remainingCounts
 * @returns {bigint}
 */
function prizeWays(remainingCounts) {
  if(remainingCounts.some(count=>count===0))return 0n;
  let total=choose(52,6);
  for(let subset=1;subset<1<<remainingCounts.length;subset++){
    let lost=0,names=0;
    for(let i=0;i<remainingCounts.length;i++){
      if((subset&(1<<i))!==0){
        lost+=remainingCounts[i];
        names++;
      }
    }
    const ways=choose(52-lost,6-lost);
    total+=names%2?-ways:ways;
  }
  return total;
}

/**
 * Two possible first-turn uses for Quick Ball in the exact source 60:
 * (i) fetch Trubbish for a Tool and Boost Shake, or
 * (ii) discard Darkness and fetch a Bench-eligible Mega Absol for Dark Patch.
 * Classifies where the named physical resources coexist or Quick Ball is
 * contested. Other connectors, safe discards, game decisions, legality,
 * tactical superiority and native game outcomes remain unmodeled.
 * @param {{cards:{name:string,count:number,category:string}[]}} deck
 * @returns {object}
 */
function enumerate(deck){
  const pool=sourcePartition(deck);
  const starting=new Array(pool.length).fill(0);
  const out={quickPrize:0n,quickPatchEnergy:0n,
    quickPatchEnergyHeldBenchMega:0n,
    oneQuickCompetesMegaFetch:0n,
    twoQuickCanFetchBoth:0n,
    noSearchableMegaAmongOverlap:0n};
  /** @param {number} i @param {number} left @param {bigint} ways */
  function recurse(i,left,ways) {
    if(i===pool.length-1){
      if(left>pool[i])return;
      starting[i]=left;
      evaluate(ways*choose(pool[i],left));
      return;
    }
    for(let x=0;x<=Math.min(left,pool[i]);x++){
      starting[i]=x;
      recurse(i+1,left-x,ways*choose(pool[i],x));
    }
  }
  /** @param {bigint} sevenWays */
  function evaluate(sevenWays) {
    if(starting[0]+starting[8]+starting[9]===0)return;
    for(let i=0;i<pool.length;i++){
      const left=pool[i]-starting[i];
      if(left===0)continue;
      const h=starting.map((n,j)=>n+Number(i===j));
      const [t,g,boost,tool,quick,vip,patch,dark,mega]=h;
      if(!boost||!tool||!quick||t||vip)continue;
      const joint=sevenWays*BigInt(left);
      const firstTargets=prizeWays([2-t,2-g]);
      out.quickPrize+=joint*firstTargets;
      if(!patch||!dark)continue;
      out.quickPatchEnergy+=joint*firstTargets;
      const heldBenchMega=mega>0&&
        (starting[9]>0||starting[8]>=2||mega>=2);
      if(heldBenchMega){
        out.quickPatchEnergyHeldBenchMega+=joint*firstTargets;
        continue;
      }
      const bothSearchable=prizeWays([2-t,2-g,3-mega]);
      if(quick===1)out.oneQuickCompetesMegaFetch+=joint*bothSearchable;
      else out.twoQuickCanFetchBoth+=joint*bothSearchable;
      out.noSearchableMegaAmongOverlap+=joint*
        (firstTargets-bothSearchable);
    }
  }
  recurse(0,7,1n);
  const denominator=(choose(60,7)-choose(49,7))*53n*choose(52,6);
  return {denominator,...out};
}

if(require.main===module){
  const source=require('../results/aichi-2026/full-decklists.json');
  const rank11=source.decks.find(deck=>deck.rank===11);
  assert.ok(rank11);
  const result=enumerate(rank11);
  process.stdout.write(JSON.stringify(Object.fromEntries(
    Object.entries(result).map(([k,v])=>[k,{
      configurations:String(v),
      probability:k==='denominator'?1:probability(v,result.denominator)
    }])
  ),null,2)+'\n');
}
module.exports={sourcePartition,prizeWays,enumerate};
