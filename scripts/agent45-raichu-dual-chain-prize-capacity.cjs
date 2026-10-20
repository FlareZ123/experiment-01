'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k))throw TypeError('Integral n/k required');
  if(k<0||k>n)return 0n;
  let out=1n;
  for(let i=1;i<=Math.min(k,n-k);i++){
    out=out*BigInt(n-Math.min(k,n-k)+i)/BigInt(i);
  }
  return out;
}
/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
/** @param {bigint} success @param {bigint} total @returns {object} */
function fraction(success,total){
  const d=gcd(success,total);
  return {numerator:(success/d).toString(),
    denominator:(total/d).toString(),
    probability:Number(success)/Number(total)};
}

/**
 * Given a fixed printed 60, count six-card Prize configurations where the
 * player can still access one Raichu and one Electrode evolution chain.
 * The one Ditto Prism Star can replace the Basic for EITHER chain, never both.
 * This is inventory capacity only, independent of turn legality and play.
 *
 * @param {{voltorb:number,electrode:number,pikachu:number,ditto:number,
 *   raichu:number,basicTotal:number}} counts
 */
function jointChainPrizeCapacity(counts){
  assert.deepEqual(
    [counts.voltorb,counts.electrode,counts.pikachu,counts.ditto,counts.raichu],
    [2,3,1,1,2],'Only the exact rank-4/17 source evolution lines are modeled');
  assert.equal(counts.basicTotal,13);
  const base=[counts.voltorb,counts.electrode,counts.pikachu,
    counts.ditto,counts.raichu];
  const otherBasic=counts.basicTotal-counts.voltorb-counts.pikachu-counts.ditto;
  const otherNonbasic=60-base.reduce((sum,n)=>sum+n,0)-otherBasic;
  const cells=[...base,otherBasic,otherNonbasic];
  let uncondSuccess=0n,uncondTotal=0n,condSuccess=0n,condTotal=0n;
  const failures={stageOneUnavailable:0n,raichuUnavailable:0n,
    basicAllocationUnavailable:0n};
  for(let v=0;v<=2;v++)for(let e=0;e<=3;e++)
  for(let p=0;p<=1;p++)for(let d=0;d<=1;d++)
  for(let r=0;r<=2;r++)for(let b=0;b<=6;b++){
    const o=6-v-e-p-d-r-b;
    if(o<0||o>otherNonbasic||b>otherBasic)continue;
    const pris=[v,e,p,d,r,b,o];
    const ways=pris.reduce((acc,k,i)=>acc*choose(cells[i],k),1n);
    const availableBasics=counts.basicTotal-v-p-d-b;
    const legallyDealtSeven=choose(54,7)-choose(54-availableBasics,7);
    uncondTotal+=ways;
    condTotal+=ways*legallyDealtSeven;
    const availableV=2-v,availableE=3-e,availableP=1-p;
    const availableD=1-d,availableR=2-r;
    const twoDistinctCompatibleBasics=availableD>0 ?
      (availableV+availableP>0) : (availableV>0&&availableP>0);
    if(availableE>0&&availableR>0&&twoDistinctCompatibleBasics){
      uncondSuccess+=ways;
      condSuccess+=ways*legallyDealtSeven;
    }else if(availableE===0){failures.stageOneUnavailable+=ways;}
    else if(availableR===0){failures.raichuUnavailable+=ways;}
    else failures.basicAllocationUnavailable+=ways;
  }
  assert.equal(uncondTotal,choose(60,6));
  const sevenValid=choose(60,7)-choose(60-counts.basicTotal,7);
  assert.equal(condTotal,sevenValid*choose(53,6));
  return {
    schema:'rank4-rank17-dual-evolution-prize-capacity-v1',
    sourceCounts:counts,
    unconditional:fraction(uncondSuccess,uncondTotal),
    legalSevenConditioned:fraction(condSuccess,condTotal),
    validSevenProbability:fraction(sevenValid,choose(60,7)),
    unconditionalFailureCounts:Object.fromEntries(
      Object.entries(failures).map(([k,v])=>[k,v.toString()])),
    completePrizeEnumerations:uncondTotal.toString(),
    caveat:'Two accessible printed chains in unprized inventory; no guarantee of setup, evolution legality, attachment, Ability, strategy, or game success.'
  };
}

/** @param {object} deck Published exact rank-4 or rank-17 60. */
function sourceCounts(deck){
  assert.ok([4,17].includes(deck.rank));
  const card=name=>deck.cards.filter(row=>row.name===name)
    .reduce((sum,row)=>sum+row.count,0);
  assert.equal(deck.cards.reduce((sum,row)=>sum+row.count,0),60);
  assert.equal(deck.category_counts['Pokémon'],18);
  const evolutions=new Set(['Electrode-GX','Alolan Raichu']);
  const totalBasics=deck.cards.filter(row=>row.category==='Pokémon'&&
    !evolutions.has(row.name)).reduce((sum,row)=>sum+row.count,0);
  return {voltorb:card('Voltorb'),electrode:card('Electrode-GX'),
    pikachu:card('Pikachu'),ditto:card('Ditto ♢'),
    raichu:card('Alolan Raichu'),basicTotal:totalBasics};
}
if(require.main===module){
  const field=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const report=[4,17].map(rank=>{
    const deck=field.decks.find(d=>d.rank===rank);
    return {rank,player:deck.player,
      ...jointChainPrizeCapacity(sourceCounts(deck))};
  });
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
module.exports={choose,fraction,sourceCounts,jointChainPrizeCapacity};
