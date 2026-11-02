'use strict';
const assert=require('node:assert/strict');
const SOURCE=require('../results/aichi-2026/full-decklists.json');
/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k)||n<0)
    throw new RangeError('Combination arguments must be nonnegative integers');
  if(k<0||k>n)return 0n;
  let total=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    total=total*BigInt(n-i+1)/BigInt(i);
  return total;
}
/**
 * Count six-card Prize subsets with at least `needed` physical copies outside.
 * Groups are disjoint named original-printed card types; others unrestricted.
 * @param {number} deckSize
 * @param {number} prizes
 * @param {{copies:number,needed:number}[]} groups
 */
function countViablePrizeSets(deckSize,prizes,groups){
  const other=deckSize-groups.reduce((sum,g)=>sum+g.copies,0);
  assert.ok(other>=0&&prizes>=0&&prizes<=deckSize);
  let good=0n;
  function recur(i,prized,ways){
    if(i===groups.length){good+=ways*choose(other,prizes-prized);return;}
    const {copies,needed}=groups[i];
    assert.ok(Number.isSafeInteger(copies)&&copies>=0);
    assert.ok(Number.isSafeInteger(needed)&&needed>=0&&needed<=copies);
    for(let k=0;k<=Math.min(prizes-prized,copies-needed);k++)
      recur(i+1,prized+k,ways*choose(copies,k));
  }
  recur(0,0,1n);
  return {good,total:choose(deckSize,prizes)};
}
const rank5=SOURCE.decks.find(d=>d.rank===5);
assert.equal(rank5?.player,'Yamato Nakano');
const identities=[
  ['Mew VMAX','FST','114'],
  ['Mew V','FST','113'],
  ['Genesect V','FST','185'],
  ['Double Colorless Energy','SUM','136'],
  ['Guzma','BUS','115']
];
const counts=identities.map(([name,set,number])=>{
  const rows=rank5.cards.filter(c=>c.name===name&&c.printing.set===set&&c.printing.number===number);
  assert.equal(rows.length,1,'Exact printed source card missing '+name);
  return rows[0].count;
});
assert.equal(rank5.cards.reduce((sum,c)=>sum+c.count,0),60);
const [mewVMAX,mewV,genesect,dce,guzma]=counts;
const doubleFunded=countViablePrizeSets(60,6,[
  {copies:mewVMAX,needed:2},{copies:mewV,needed:2},
  {copies:genesect,needed:1},{copies:dce,needed:2}
]);
const guzmaFunded=countViablePrizeSets(60,6,[
  {copies:mewVMAX,needed:2},{copies:mewV,needed:2},
  {copies:genesect,needed:1},{copies:dce,needed:1},
  {copies:guzma,needed:1}
]);
if(require.main===module) console.log(JSON.stringify({
  originalRank:5,person:rank5.player,originalPhysicalCopies:{mewVMAX,mewV,genesect,dce,guzma},
  prizeCount:6,totalPrizeSets:doubleFunded.total.toString(),
  dualDceNoGuzma:{viableSets:doubleFunded.good.toString(),percent:100*Number(doubleFunded.good)/Number(doubleFunded.total)},
  oneDceWithGuzma:{viableSets:guzmaFunded.good.toString(),percent:100*Number(guzmaFunded.good)/Number(guzmaFunded.total)},
  interpretation:'Initial six Prize card-location only; excludes opening, search, evolution, turn and legality'
},null,2));
module.exports={choose,countViablePrizeSets,rank5,counts,doubleFunded,guzmaFunded};
