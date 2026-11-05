'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./agent32-source-special-energy-exposure.cjs');
const {SOURCE,allocations,bilateralRank6Gate}=
  require('./agent32-rank6-thunder-dce-resource-gate.cjs');

const VERSION='agent32-rank6-original-route-partition-v1';
const MODES=Object.freeze(['direct','heldGuzmaHala','viaTagCall']);

/**
 * Disjoint first-turn source route types, given held cards and unknown Prizes.
 * @param {number[]} h Held Basic/G&H/Tag/Thunder/DCE/Other category counts.
 * @param {number} n Number of unheld source cards, including Prizes.
 * @param {number} prizes Number of random Prize cards among n.
 * @param {number} totalGH Printed source G&H copies.
 * @returns {{direct:number,heldGuzmaHala:number,viaTagCall:number}}
 */
function pathGivenHand(h,n,prizes,totalGH=2){
  const path={direct:0,heldGuzmaHala:0,viaTagCall:0};
  if(h[3]>0&&h[4]>0){path.direct=1;return path;}
  if(h[1]===0&&h[2]===0)return path;
  const nMissing=Number(h[3]===0)+Number(h[4]===0);
  const divisor=choose(n,prizes);
  const bothUnprized=choose(n-nMissing,prizes)/divisor;
  if(h[1]>0){path.heldGuzmaHala=bothUnprized;return path;}
  const remainingGH=totalGH-h[1];
  const allGHPrized=choose(n-nMissing-remainingGH,
    prizes-remainingGH)/divisor;
  path.viaTagCall=bothUnprized-allGHPrized;
  return path;
}

/**
 * Hand+Prize exact partitions after fixed optional bonus count.
 * @param {number} bonus Number of source-elected bonus draws.
 * @returns {{direct:number,heldGuzmaHala:number,viaTagCall:number}}
 */
function partitionGivenBonus(bonus){
  assert.ok(Number.isSafeInteger(bonus)&&bonus>=0&&bonus<=46);
  const counts=[SOURCE.basic,SOURCE.guzmaHala,SOURCE.tagCall,
    SOURCE.thunderMountain,SOURCE.doubleColorless,SOURCE.other];
  const draw=bonus+1;
  assert.ok(draw+7+6<=60);
  const validSeven=choose(60,7)-choose(60-SOURCE.basic,7);
  const denominator=validSeven*choose(53,draw);
  const totals={direct:0,heldGuzmaHala:0,viaTagCall:0};
  for(const a of allocations(counts,7)){
    if(a.cards[0]===0)continue;
    const remaining=counts.map((n,i)=>n-a.cards[i]);
    for(const b of allocations(remaining,draw)){
      const held=a.cards.map((v,i)=>v+b.cards[i]);
      const gate=pathGivenHand(held,53-draw,6,SOURCE.guzmaHala);
      const mass=a.ways*b.ways;
      for(const mode of MODES)totals[mode]+=mass*gate[mode];
    }
  }
  for(const mode of MODES)totals[mode]/=denominator;
  return totals;
}

/**
 * Partition the same mathematically defined original-source exposure as
 * bilateralRank6Gate, preserving all optional mulligans and untruncated
 * probability bounds. Summing modes recovers the existing exact gate.
 * @param {number} contenderBasics Exact printed contender Basic count.
 * @param {number} [maxBonus=30] Maximum enumerated optional bonus cards.
 * @returns {object}
 */
function mixRoutePartition(contenderBasics,maxBonus=30){
  const baseline=bilateralRank6Gate(contenderBasics,0);
  assert.ok(Number.isSafeInteger(maxBonus)&&maxBonus>=0&&maxBonus<=46);
  const qs=choose(56,7)/choose(60,7);
  const qc=choose(60-contenderBasics,7)/choose(60,7);
  const p=qc*(1-qs)/(1-qs*qc);
  const partitions=Object.fromEntries(MODES.map(s=>[s,0]));
  const add=(w,v)=>MODES.forEach(mode=>partitions[mode]+=w*v[mode]);
  add(1-p,partitionGivenBonus(0));
  for(let m=1;m<=maxBonus;m++)
    add(p*(1-qc)*qc**(m-1),partitionGivenBonus(m));
  const tail=p*qc**maxBonus;
  const sum=MODES.reduce((s,mode)=>s+partitions[mode],0);
  const recomposed=bilateralRank6Gate(contenderBasics,maxBonus);
  assert.ok(Math.abs(sum-recomposed.routeProbabilityLower)<3e-12);
  return {version:VERSION,sourceRank:6,contenderBasics,maxBonus,
    partitions,lowerSum:sum,tailUpper:tail,
    anyRouteUpper:sum+tail,
    routeFromExistingModel:recomposed.routeProbabilityLower,
    zeroBonus:partitionGivenBonus(0),paperGamesQualified:0,
    noBonusMass:1-p,confirmOriginalSource:baseline.sourceRank===6};
}

function main(){
  const x=require('../../results/aichi-2026/full-decklists.json');
  const r=x.decks.find(d=>d.rank===6);
  const count=n=>r.cards.find(c=>c.name===n)?.count??0;
  assert.deepEqual(['Iron Thorns ex','Guzma & Hala','Tag Call',
    'Thunder Mountain ♢','Double Colorless Energy'].map(count),[4,2,2,1,1]);
  const seven=mixRoutePartition(7);
  const fourteen=mixRoutePartition(14);
  const difference=Object.fromEntries(MODES.map(mode=>
    [mode,seven.partitions[mode]-fourteen.partitions[mode]]));
  return {version:VERSION,source:'results/aichi-2026/full-decklists.json',
    vsSeven:seven,vsFourteen:fourteen,sevenMinusFourteen:difference,
    qualifiedGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,MODES,pathGivenHand,partitionGivenBonus,mixRoutePartition,main};
