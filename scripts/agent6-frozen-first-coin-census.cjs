'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const planPath=path.resolve(__dirname,
  '../results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json');

/** First game-random draw of pinned headless seededRandom (xorshift32). */
function firstCoinValue(seed){
  assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff);
  let state=seed>>>0;
  if(state===0)state=0x9e3779b9;
  state^=state<<13;
  state^=state>>>17;
  state^=state<<5;
  return (state>>>0)/0x100000000;
}

/** Pinned setup: heads means physical seat0 wins; generic winner chooses second. */
function sourceFirstFromSeed(candidateSlot,seed){
  assert.ok(['A','B'].includes(candidateSlot));
  const coinWinner=firstCoinValue(seed)<0.5?0:1;
  const sourceSeat=candidateSlot==='A'?1:0;
  return {coinWinner,sourceSeat,firstSeat:1-coinWinner,
    sourceFirst:sourceSeat===1-coinWinner};
}

/** Pure pre-game derivation, no played games or hidden information. */
function frozenStartCensus(plan){
  assert.deepEqual(plan.ranks,[6,11]);
  assert.deepEqual(plan.candidateSlots,['A','B']);
  const cells=[];
  for(const rank of plan.ranks)for(const slot of plan.candidateSlots){
    const seeds=plan.seeds[String(rank)][slot];
    assert.equal(seeds.length,4);
    cells.push({rank,slot,sourceFirstSeeds:seeds.filter(seed=>
      sourceFirstFromSeed(slot,seed).sourceFirst).length,
      seeds:seeds.map(seed=>({seed,...sourceFirstFromSeed(slot,seed)}))});
  }
  return {schema:'agent6-first-coin-frozen-seed-census-v1',
    enginePin:plan.enginePin,cells,
    sourceFirstArms:cells.reduce((n,x)=>n+2*x.sourceFirstSeeds,0),
    competitiveQualifiedGames:0};
}

if(require.main===module)process.stdout.write(
  JSON.stringify(frozenStartCensus(JSON.parse(fs.readFileSync(planPath,'utf8'))),
    null,2)+'\n');
module.exports={firstCoinValue,sourceFirstFromSeed,frozenStartCensus};
