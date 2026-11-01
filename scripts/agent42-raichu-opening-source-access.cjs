'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const field=require('../results/aichi-2026/full-decklists.json');
const {originalPrintedPokemon}=
  require('../simulation/twinleaf/agent10-original-printing-energy-flags.cjs');
const root=path.resolve(__dirname,'..');

/** @param {number} n @param {number} k @returns {number} */
function combinations(n,k){
  assert.ok(Number.isInteger(n)&&Number.isInteger(k));
  if(k<0||k>n)return 0;
  let ans=1;
  for(let i=1;i<=Math.min(k,n-k);i++)
    ans=ans*(n-i+1)/i;
  return ans;
}

/**
 * The event requires at least one Basic in the initial seven, before the
 * first normal turn. A subsequent one-card normal turn draw (going second)
 * is exchangeable with any of the remaining 53 cards despite six random
 * Prizes having been set. Counts of outs and Basics are disjoint.
 *
 * @param {number} basics Number of Basic Pokemon in fixed 60
 * @param {number} outs Copies of a particular eligible card or union
 * @param {7|8} k Initial seven, or initial seven plus first normal draw
 * @returns {number}
 */
function accessGivenBasicOpening(basics,outs,k){
  assert.ok(basics>=1&&basics<=60&&outs>=0&&
    basics+outs<=60&&Number.isInteger(basics)&&
    Number.isInteger(outs)&&[7,8].includes(k));
  const hasBasic=1-combinations(60-basics,7)/combinations(60,7);
  const noOutAndHasBasic=
    combinations(60-outs,k)/combinations(60,k)*
    (1-combinations(60-outs-basics,7)/
      combinations(60-outs,7));
  return 1-noOutAndHasBasic/hasBasic;
}

function run(){
  const results=[];
  for(const rank of [4,17]){
    const d=field.decks.find(x=>x.rank===rank);
    const cache={};
    const basics=d.cards.filter(c=>c.category==='Pokémon').reduce(
      (s,c)=>s+(originalPrintedPokemon(root,c,cache).isEvolution?
        0:c.count),0);
    const count=name=>d.cards.filter(c=>c.name===name).reduce(
      (s,c)=>s+c.count,0);
    const vip=count('Battle VIP Pass'),quick=count('Quick Ball');
    results.push({
      rank,basics,openingValid:1-combinations(60-basics,7)/
        combinations(60,7),
      vipCopies:vip,quickCopies:quick,
      vipFirst7:accessGivenBasicOpening(basics,vip,7),
      vipFirst8:accessGivenBasicOpening(basics,vip,8),
      quickFirst8:accessGivenBasicOpening(basics,quick,8),
      eitherVipOrQuickFirst8:accessGivenBasicOpening(
        basics,vip+quick,8)
    });
  }
  assert.equal(results[0].basics,13);
  assert.equal(results[1].basics,13);
  return {
    schema:'agent42-raichu-opening-source-card-availability-v1',
    assumptions:'Random decks, Basic-valid opening 7; optional one first-turn normal draw; no opponent mulligan bonus, draw abilities, search, or playing costs.',
    results,
    caution:'Quick Ball access is not use without a discard; VIP may need open Bench slots. This models access, not successful setup.',
    competitiveQualifiedGames:0
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={combinations,accessGivenBasicOpening,run};
