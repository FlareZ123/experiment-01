'use strict';

/**
 * Exact, prize-aware resource opportunity for Aichi rank-2 Bunnelby +
 * Technical Machine: Evolution opening, conditional on a valid initial 7.
 * No gameplay strength or win-rate claims.
 */
const assert = require('node:assert/strict');

const GROUPS = ['b', 'e', 'o', 'h', 't', 'm', 'j', 's', 'g', 'x'];
const EVOLVABLE = new Set(['Pidgey', 'Oddish', 'Lillipup']);
const OTHER_BASICS = new Set([
  'Fan Rotom', 'Relicanth', 'Mr. Mime', 'Girafarig', 'Budew', 'Jirachi'
]);
const OTHER_SPECIAL = new Set(['Capture Energy', 'Memory Energy']);

/** @param {Array<{name:string,count:number}>} cards */
function cardGroups(cards) {
  const n = Object.fromEntries(GROUPS.map(k => [k, 0]));
  for (const card of cards) {
    const name = card.name;
    const key = name === 'Bunnelby' ? 'b'
      : EVOLVABLE.has(name) ? 'e'
      : OTHER_BASICS.has(name) ? 'o'
      : name === 'Guzma & Hala' ? 'h'
      : name === 'Tag Call' ? 't'
      : name === 'Technical Machine: Evolution' ? 'm'
      : name === 'Jet Energy' ? 'j'
      : OTHER_SPECIAL.has(name) ? 's'
      : name === 'Grass Energy' ? 'g' : 'x';
    n[key] += card.count;
  }
  assert.deepEqual(n, {b:2,e:6,o:6,h:4,t:4,m:2,j:2,s:3,g:1,x:30},
    'Published rank-2 input changed; re-audit classification and mechanics');
  return n;
}

/** @param {number} n @param {number} k @returns {number} */
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let result = 1;
  for (let i = 1; i <= Math.min(k, n - k); ++i)
    result = result * (n - Math.min(k, n - k) + i) / i;
  return Math.round(result);
}

/**
 * Probability that every specified search category has a card outside Prizes.
 * Requirement groups are disjoint and drawn from the undrawn 52-card pool.
 * @param {Record<string,number>} remaining
 * @param {string[][]} requirements
 * @param {number} prizeCount
 * @returns {number}
 */
function probabilitySearchable(remaining, requirements, prizeCount) {
  if (!requirements.length) return 1;
  const groupSizes = requirements.map(group =>
    group.reduce((sum,key) => sum + remaining[key],0));
  if (groupSizes.some(n => n === 0)) return 0;
  const pool = Object.values(remaining).reduce((a,b)=>a+b,0);
  const denominator = choose(pool, prizeCount);
  let p = 1;
  for (let mask = 1; mask < (1 << groupSizes.length); ++mask) {
    let total = 0, bits = 0;
    for (let i = 0; i < groupSizes.length; ++i) {
      if (mask & (1 << i)) { total += groupSizes[i]; bits++; }
    }
    const bad = choose(pool-total, prizeCount-total) / denominator;
    p += bits % 2 ? -bad : bad;
  }
  return Math.max(0, Math.min(1, p));
}

/**
 * @param {Record<string,number>} initial
 * @param {Record<string,number>} eight
 * @param {Record<string,number>} remaining
 * @param {number} prizes
 * @returns {{direct:boolean, core:number, withBench:number}}
 */
function route(initial, eight, remaining, prizes) {
  if (eight.b === 0 || initial.b+initial.e+initial.o === 0)
    return {direct:false, core:0, withBench:0};
  const bStarted = initial.b > 0;
  const hasTool = eight.m > 0;
  const hasEnergy = bStarted ? eight.j+eight.s+eight.g > 0 : eight.j > 0;
  const direct = hasTool && hasEnergy;
  let core = direct ? 1 : 0;
  if (!direct && (eight.h > 0 || eight.t > 0)) {
    const missing=[];
    if (eight.h === 0) missing.push(['h']);
    if (!hasTool) missing.push(['m']);
    if (!hasEnergy) missing.push(bStarted ? ['j','s'] : ['j']);
    core = probabilitySearchable(remaining, missing, prizes);
  }
  // A legal Active comes from the original seven. When Bunnelby arrives
  // as the turn draw, another Basic starts Active and Jet Energy pivots.
  // Reserve one of the evolving Basics on Bench for the TM attack.
  // A starting evolving Basic returns to Bench when Jet Energy pivots into
  // newly drawn Bunnelby, so it remains a valid Evolution attack target.
  const target = eight.e >= 1;
  return {direct, core, withBench:target?core:0};
}

/**
 * @param {Record<string,number>} counts
 * @param {{opening?:number, draws?:number, prizes?:number}} [settings]
 */
function exactOpportunity(counts, settings={}) {
  const opening=settings.opening??7, draws=settings.draws??1;
  const prizes=settings.prizes??6;
  assert.equal(draws,1,'model requires exactly one turn draw');
  const total=GROUPS.reduce((sum,key)=>sum+counts[key],0);
  const firstDenom=choose(total,opening);
  const accepted=1-choose(total-counts.b-counts.e-counts.o,opening)/firstDenom;
  const initial=Object.fromEntries(GROUPS.map(k=>[k,0]));
  const eight={...initial};
  const remaining={...initial};
  const numerator={direct:0,core:0,withBench:0};
  const byBunnelby={initial:{probability:0,core:0,withBench:0},
    firstDraw:{probability:0,core:0,withBench:0}};
  let states=0;
  function walk(index,left,weight) {
    if(index===GROUPS.length) {
      if(left!==0 || initial.b+initial.e+initial.o===0) return;
      for(const drawKey of GROUPS) {
        if(counts[drawKey]===initial[drawKey]) continue;
        for(const key of GROUPS) {
          eight[key]=initial[key]+(drawKey===key?1:0);
          remaining[key]=counts[key]-eight[key];
        }
        const p=weight*(counts[drawKey]-initial[drawKey])/(total-opening);
        const r=route(initial,eight,remaining,prizes);
        if (eight.b > 0) {
          const stratum=initial.b>0?byBunnelby.initial:byBunnelby.firstDraw;
          stratum.probability+=p;
          stratum.core+=p*r.core;
          stratum.withBench+=p*r.withBench;
        }
        if(r.direct) numerator.direct+=p;
        numerator.core+=p*r.core;
        numerator.withBench+=p*r.withBench;
        states++;
      }
      return;
    }
    const key=GROUPS[index];
    for(let take=0;take<=Math.min(counts[key],left);take++) {
      initial[key]=take;
      walk(index+1,left-take,weight*choose(counts[key],take));
    }
    initial[key]=0;
  }
  walk(0,opening,1/firstDenom);
  return {validOpeningProbability:accepted,
    directConditional:numerator.direct/accepted,
    resourceConditional:numerator.core/accepted,
    benchTargetConditional:numerator.withBench/accepted,
    byBunnelby:Object.fromEntries(Object.entries(byBunnelby).map(([k,v])=>
      [k,Object.fromEntries(Object.entries(v).map(([measure,value])=>
        [measure,value/accepted]))])),
    initialCompositionsAndDraws:states};
}

function main(){
 const src=require('../results/aichi-2026/full-decklists.json');
 const rank2=src.decks.find(d=>d.rank===2);
 assert.equal(rank2?.archetype,'Vileplume Control');
 console.log(JSON.stringify({source:src.source,rank:2,counts:cardGroups(rank2.cards),
   model:'One seven-card accepted opening, six Prizes, one next draw; turn going second',
   estimate:exactOpportunity(cardGroups(rank2.cards)),
   warning:'Resource accessibility only; no setup of evolution targets, discardability, lock, opponent response, or match win rates'},null,2));
}
if(require.main===module)main();
module.exports={GROUPS,cardGroups,choose,probabilitySearchable,route,exactOpportunity};
