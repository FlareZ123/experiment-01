'use strict';

const fs = require('node:fs');
const path = require('node:path');

const R = 0, S = 1, H = 2, M = 3, V = 4, B = 5, W = 6;

/** @param {number} n */
function binom(n) {
  const c = Array.from({length:n+1},()=>Array(n+1).fill(0n));
  for(let i=0;i<=n;i++) {
    c[i][0]=1n;c[i][i]=1n;
    for(let k=1;k<i;k++) c[i][k]=c[i-1][k-1]+c[i-1][k];
  }
  return c;
}

/**
 * Enumerate category submultisets without replacement.
 * @param {number[]} available
 * @param {number} count
 * @param {bigint[][]} choose
 * @param {(xs:number[],weight:bigint)=>void} visit
 */
function select(available,count,choose,visit) {
  const selected=Array(available.length).fill(0);
  function walk(i,remaining,weight) {
    if(i===available.length-1) {
      if(remaining<=available[i]) {
        selected[i]=remaining;
        visit(selected.slice(),weight*choose[available[i]][remaining]);
      }
      return;
    }
    for(let v=0;v<=Math.min(available[i],remaining);v++) {
      selected[i]=v;
      walk(i+1,remaining-v,weight*choose[available[i]][v]);
    }
  }
  walk(0,count,1n);
}

/**
 * Exact conditional chances for the restricted Radiant Gate and natural
 * turn-two Shadow Rider evolution resource routes and their overlap.
 * Groups: [Radiant,search Items,Heavy Ball,VMAX,Rider V,safe Basics,
 *          Wobbuffet PHF,other nonbasics].
 * @param {{groups:number[],openingSize?:number,prizeCount?:number}} config
 */
function exactGateNaturalUnion(config) {
  const {groups,openingSize=7,prizeCount=6}=config;
  if(!Array.isArray(groups)||groups.length!==8||
     groups.some(n=>!Number.isInteger(n)||n<0)||groups[R]!==1||
     !Number.isInteger(openingSize)||openingSize<1||
     !Number.isInteger(prizeCount)||prizeCount<0) {
    throw new RangeError('Invalid category counts or setup');
  }
  const n=groups.reduce((x,y)=>x+y,0);
  if(n<openingSize+prizeCount+2||groups[M]<2||
     groups[V]+groups[B]+groups[W]<1) {
    throw new RangeError('Insufficient cards or starter candidates');
  }
  const choose=binom(n);
  const t2pool=n-openingSize-prizeCount-1;
  const full=choose[n][openingSize]*choose[n-openingSize][prizeCount]*
    BigInt(t2pool+1)*BigInt(t2pool);
  const count={valid:0n,gate:0n,natural:0n,overlap:0n};
  select(groups,openingSize,choose,(opening,openingWeight)=>{
    if(!opening[R]&&!opening[V]&&!opening[B]&&!opening[W]) return;
    const afterOpen=groups.map((g,i)=>g-opening[i]);
    const safeStart=opening[V]+opening[B]>0;
    select(afterOpen,prizeCount,choose,(prizes,prizeWeight)=>{
      const beforeDraw=afterOpen.map((g,i)=>g-prizes[i]);
      for(let drawn=0;drawn<groups.length;drawn++) {
        if(!beforeDraw[drawn]) continue;
        const hand=opening.slice();
        hand[drawn]++;
        const remaining=beforeDraw.slice();
        remaining[drawn]--;
        const weight=openingWeight*prizeWeight*BigInt(beforeDraw[drawn]);
        const natural=hand[V]===0?0n:
          BigInt(hand[M]>0?t2pool:remaining[M]);
        const access=hand[R]>0||(remaining[R]>0&&hand[S]>0)||
          (prizes[R]>0&&hand[H]>0);
        const gate=safeStart&&access&&remaining[M]>=2;
        count.valid+=weight*BigInt(t2pool);
        count.natural+=weight*natural;
        if(gate) {
          count.gate+=weight*BigInt(t2pool);
          count.overlap+=weight*natural;
        }
      }
    });
  });
  const union=count.gate+count.natural-count.overlap;
  return {
    counts:Object.fromEntries(Object.entries({...count,union,denominator:full})
      .map(([k,v])=>[k,v.toString()])),
    probabilities:Object.fromEntries(Object.entries({
      gate:count.gate,natural:count.natural,overlap:count.overlap,union
    }).map(([k,v])=>[k,Number(v)/Number(count.valid)])),
    validOpening:Number(count.valid)/Number(full)
  };
}

/**
 * @param {object} deck
 * @param {Map<string,boolean|null>} index
 * @returns {number[]}
 */
function groupsFromDeck(deck,index) {
  const {countsFromDeck}=require('./first-evolution-natural.cjs');
  const {basicCount,targetBasicCount,stageOneCount}=countsFromDeck(deck,index);
  const copies=name=>deck.cards.filter(card=>card.name===name)
    .reduce((sum,card)=>sum+card.count,0);
  const radiant=copies('Radiant Eternatus');
  const search=copies('Mysterious Treasure')+copies('Quick Ball');
  const heavy=copies('Hisuian Heavy Ball');
  const wobbuffet=copies('Wobbuffet');
  const safe=basicCount-radiant-targetBasicCount-wobbuffet;
  const other=60-radiant-search-heavy-stageOneCount-targetBasicCount-safe-wobbuffet;
  return [radiant,search,heavy,stageOneCount,targetBasicCount,safe,wobbuffet,other];
}

/** @returns {Array<{name:string,groups:number[]}>} */
function sourceScenarios() {
  const root=path.resolve(__dirname,'..');
  const {loadBasicIndex}=require('./aichi_opening_audit.cjs');
  const index=loadBasicIndex(path.join(root,'resources/cards/en'));
  const dir=path.join(root,'results/aichi-2026');
  const source=JSON.parse(fs.readFileSync(path.join(dir,'full-decklists.json'),'utf8'));
  const decks=[
    ['champion-reference',source.decks.find(d=>d.rank===1)],
    ['hood-shield-v1',JSON.parse(fs.readFileSync(path.join(dir,'candidate-hood-shadow-rider.json'),'utf8'))],
    ['temple-v1',JSON.parse(fs.readFileSync(path.join(dir,'candidate-temple-shadow-rider.json'),'utf8'))]
  ];
  return decks.map(([name,deck])=>({name,groups:groupsFromDeck(deck,index)}));
}

if(require.main===module) {
  for(const {name,groups} of sourceScenarios()) {
    process.stdout.write(JSON.stringify({name,groups,...exactGateNaturalUnion({groups})})+'\n');
  }
}
module.exports={exactGateNaturalUnion,groupsFromDeck,sourceScenarios};
