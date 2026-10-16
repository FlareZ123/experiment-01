'use strict';

const assert = require('node:assert/strict');
const { choose, probabilitySearchable } = require('./aichi-vileplume-tm-opening.cjs');

const KEYS = ['b','q','e','o','h','t','m','j','s','g','u','v','x'];
const EVOLVABLE_OTHER = new Set(['Pidgey','Lillipup']);
const OTHER_BASICS = new Set([
  'Fan Rotom','Relicanth','Mr. Mime','Girafarig','Budew','Jirachi'
]);
const OTHER_SPECIAL = new Set(['Capture Energy','Memory Energy']);

/**
 * Cards relevant to the published rank-2 Oddish -> Gloom -> Item-lock
 * Vileplume line. Stage 1 and Stage 2 must remain in deck at attack time.
 * @param {Array<{name:string,count:number,printing:{set:string}}>} cards
 * @returns {Record<string,number>}
 */
function classify(cards) {
  const counts=Object.fromEntries(KEYS.map(key=>[key,0]));
  for(const row of cards) {
    let key='x';
    if(row.name==='Bunnelby') key='b';
    else if(row.name==='Oddish') key='q';
    else if(EVOLVABLE_OTHER.has(row.name)) key='e';
    else if(OTHER_BASICS.has(row.name)) key='o';
    else if(row.name==='Guzma & Hala') key='h';
    else if(row.name==='Tag Call') key='t';
    else if(row.name==='Technical Machine: Evolution') key='m';
    else if(row.name==='Jet Energy') key='j';
    else if(OTHER_SPECIAL.has(row.name)) key='s';
    else if(row.name==='Grass Energy') key='g';
    else if(row.name==='Gloom'&&row.printing.set==='UNB') key='u';
    else if(row.name==='Vileplume'&&row.printing.set==='AOR') key='v';
    counts[key]+=row.count;
  }
  assert.deepEqual(counts,{
    b:2,q:2,e:4,o:6,h:4,t:4,m:2,j:2,s:3,g:1,u:2,v:2,x:26
  },'Rank-2 source counts or printing classification changed');
  return counts;
}

/**
 * Enumerate accepted initial sevens and eighth-card draw, integrate six
 * uniform Prizes via inclusion-exclusion for all needed searched cards.
 * @param {Record<string,number>} counts
 * @param {{opening?:number,prizes?:number}} [opts]
 */
function exactItemLockOpportunity(counts,opts={}) {
  const opening=opts.opening??7,prizes=opts.prizes??6;
  const total=KEYS.reduce((n,k)=>n+counts[k],0);
  assert.equal(total,KEYS.reduce((n,k)=>n+counts[k],0));
  assert.ok(opening+prizes+1<=total);
  const denominator=choose(total,opening);
  const valid=1-choose(total-counts.b-counts.q-counts.e-counts.o,opening)/denominator;
  const init=Object.fromEntries(KEYS.map(k=>[k,0]));
  const hand=Object.fromEntries(KEYS.map(k=>[k,0]));
  const remain=Object.fromEntries(KEYS.map(k=>[k,0]));
  let stageReady=0, directlyReady=0, drawCases=0;
  const strata={
    initial:{stageReady:0,directlyReady:0},
    firstDraw:{stageReady:0,directlyReady:0}
  };

  /** @param {number} index @param {number} left @param {number} weight */
  function recurse(index,left,weight) {
    if(index===KEYS.length) {
      if(left!==0||!init.b&&!init.q&&!init.e&&!init.o) return;
      for(const next of KEYS) {
        if(init[next]===counts[next]) continue;
        for(const k of KEYS) {
          hand[k]=init[k]+(next===k?1:0);
          remain[k]=counts[k]-hand[k];
        }
        if(!hand.b||!hand.q) continue;
        const probability=weight*(counts[next]-init[next])/(total-opening);
        const bStarted=init.b>0;
        const tool=hand.m>0;
        const energy=bStarted?hand.j+hand.s+hand.g>0:hand.j>0;
        const direct=tool&&energy;
        const requirements=[['u'],['v']];
        if(!direct) {
          if(hand.h===0&&hand.t===0) continue;
          if(hand.h===0) requirements.push(['h']);
          if(!tool) requirements.push(['m']);
          if(!energy) requirements.push(bStarted?['j','s']:['j']);
        }
        const available=probabilitySearchable(remain,requirements,prizes);
        const stratum=bStarted?strata.initial:strata.firstDraw;
        stageReady+=probability*available;
        stratum.stageReady+=probability*available;
        if(direct) {
          directlyReady+=probability*available;
          stratum.directlyReady+=probability*available;
        }
        drawCases++;
      }
      return;
    }
    const key=KEYS[index];
    for(let take=0;take<=Math.min(counts[key],left);take++) {
      init[key]=take;
      recurse(index+1,left-take,weight*choose(counts[key],take));
    }
    init[key]=0;
  }
  recurse(0,opening,1/denominator);
  const normalize=p=>p/valid;
  return {
    validOpeningProbability:valid,
    directStageChainConditional:normalize(directlyReady),
    stageChainResourceConditional:normalize(stageReady),
    stageChainByBunnelby:Object.fromEntries(Object.entries(strata)
      .map(([key,v])=>[key,Object.fromEntries(Object.entries(v)
        .map(([field,val])=>[field,normalize(val)]))])),
    qualifyingCompositionDrawCases:drawCases
  };
}

function main() {
  const manifest=require('../results/aichi-2026/full-decklists.json');
  const source=manifest.decks.find(deck=>deck.rank===2);
  assert.equal(source?.archetype,'Vileplume Control');
  const counts=classify(source.cards);
  console.log(JSON.stringify({
    source:manifest.source,rank:2,counts,
    result:exactItemLockOpportunity(counts),
    scope:'Optimistic restricted one-turn resources + unprized, undrawn Stage 1/Stage 2; no actual lock/attack-game validation'
  },null,2));
}
if(require.main===module)main();
module.exports={KEYS,classify,exactItemLockOpportunity};
