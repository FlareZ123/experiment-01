'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {TOOLS}=require('../twinleaf/rank11-direct-opportunity.cjs');

const root=path.resolve(__dirname,'../..');
const GROUP_NAMES=Object.freeze({
  boost:Object.freeze(['Boost Shake']),
  tool:TOOLS,
  bench:Object.freeze(['Trubbish','Battle VIP Pass']),
  protected:Object.freeze(['Garbodor'])
});

/**
 * Exact Original Aichi rank-11 physical source inventory, before engine mapping.
 * @returns {Map<string,number>}
 */
function rank11Inventory(){
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const list=roster.decks.find(deck=>deck.rank===11);
  assert.equal(list?.cards?.length,26);
  const counts=new Map();
  for(const card of list.cards){
    assert.ok(Number.isSafeInteger(card.count)&&card.count>0);
    assert.ok(!counts.has(card.name));
    counts.set(card.name,card.count);
  }
  assert.equal([...counts.values()].reduce((n,x)=>n+x,0),60);
  return counts;
}

/** @param {Map<string,number>} inventory @returns {object} */
function directPredicateGroups(inventory){
  const group=Object.fromEntries(Object.entries(GROUP_NAMES).map(
    ([name,names])=>[name,names.reduce((n,key)=>n+(inventory.get(key)??0),0)]));
  assert.deepEqual(group,{boost:2,tool:6,bench:6,protected:2},
    'The frozen original rank11 inventory changed');
  const seen=new Set();
  for(const names of Object.values(GROUP_NAMES))for(const name of names){
    assert.ok(!seen.has(name),'Overlapping group '+name);
    seen.add(name);
  }
  group.other=60-group.boost-group.tool-group.bench-group.protected;
  assert.equal(group.other,44);
  return group;
}

/**
 * Exact binomial coefficient over nonnegative integers.
 * @param {number} n
 * @param {number} k
 * @returns {bigint}
 */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(Number.isSafeInteger(k));
  if(k<0||k>n)return 0n;
  k=Math.min(k,n-k);
  let out=1n;
  for(let i=1;i<=k;i++)out=out*BigInt(n-k+i)/BigInt(i);
  return out;
}

/**
 * Exact unconstrained n-card subset probability for the existing first-own-
 * turn K0 directBoostShakeOpportunity predicate. This is a raw card-availability
 * result, before game setup, Basics, mulligans, draws, sequencing, legality and
 * actor decisions. It must not be called a live setup or win probability.
 * @param {number} handSize
 * @param {object} [groups]
 * @returns {{handSize:number,favorableSubsets:string,totalSubsets:string,probability:number,groups:object}}
 */
function directTripleProbability(handSize,
  groups=directPredicateGroups(rank11Inventory())){
  assert.ok(Number.isSafeInteger(handSize)&&handSize>=0&&handSize<=60);
  const {boost,tool,bench,protected:garbodor,other}=groups;
  let favorable=0n;
  for(let b=1;b<=Math.min(boost,handSize);b++)
    for(let t=1;t<=Math.min(tool,handSize-b);t++)
      for(let s=1;s<=Math.min(bench,handSize-b-t);s++)
        for(let g=0;g<=Math.min(1,garbodor,handSize-b-t-s);g++){
          const o=handSize-b-t-s-g;
          if(o<0||o>other)continue;
          favorable+=choose(boost,b)*choose(tool,t)*choose(bench,s)*
            choose(garbodor,g)*choose(other,o);
        }
  const total=choose(60,handSize);
  return {handSize,favorableSubsets:favorable.toString(),
    totalSubsets:total.toString(),
    probability:Number(favorable)/Number(total),groups};
}

/** @returns {object} */
function report(){
  const groups=directPredicateGroups(rank11Inventory());
  return {schema:'agent41-rank11-first-hand-direct-boostshake-combinatoric-v1',
    sourceRank:11,groups,
    results:[7,8].map(n=>directTripleProbability(n,groups)),
    interpretation:'Exact unconditional subset probabilities for direct K0 hand route only. No claim about real game setup probability, whose first turn, conditional mulligans, subsequent Supporters/Items, live Ability availability, or tournament wins.'};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(report(),null,2)+'\n');

module.exports={GROUP_NAMES,rank11Inventory,directPredicateGroups,choose,
  directTripleProbability,report};
