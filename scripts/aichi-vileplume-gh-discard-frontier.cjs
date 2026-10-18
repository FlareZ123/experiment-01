'use strict';
const assert = require('node:assert/strict');
const {choose, probabilitySearchable} =
  require('./aichi-vileplume-tm-opening.cjs');

/**
 * Restricted first-going-second Bunnelby / GH / TM access model.
 * A source-count-exact two-card discard sensitivity analysis, not a game model.
 * This is an intentionally optimistic printed-singleton protection policy:
 * every name occurring once is kept, except the explicitly required
 * Energy/Tool/Basic spent to produce the immediate attack.
 */
const KEYS = ['b','e','o','h','t','m','j','c','y','g','p','u'];
const REPEAT = new Set(['b','e','h','t','m','j','c','u']);
const PROTECTED_SINGLETONS = new Set([
  'Vileplume-GX','Stoutland','Cassius','Karen','Plumeria','Gladion',
  'Faba','Lusamine','Bellelba & Brycen-Man','Peonia',
  "Team Yell's Cheer",'Counter Gain','Grand Tree'
]);
const EVOLVABLE = new Set(['Pidgey','Oddish','Lillipup']);
const OTHER_BASICS = new Set([
  'Fan Rotom','Relicanth','Mr. Mime','Girafarig','Budew','Jirachi'
]);
const EXPECTED = {b:2,e:6,o:6,h:4,t:4,m:2,j:2,c:2,y:1,g:1,p:13,u:17};

/** @param {Array<{name:string,count:number}>} cards */
function classify(cards) {
  const count = Object.fromEntries(KEYS.map(k=>[k,0]));
  for(const card of cards) {
    const n=card.name;
    const k=n==='Bunnelby'?'b':EVOLVABLE.has(n)?'e':OTHER_BASICS.has(n)?'o':
      n==='Guzma & Hala'?'h':n==='Tag Call'?'t':
      n==='Technical Machine: Evolution'?'m':n==='Jet Energy'?'j':
      n==='Capture Energy'?'c':n==='Memory Energy'?'y':
      n==='Grass Energy'?'g':PROTECTED_SINGLETONS.has(n)?'p':'u';
    if(k==='p') assert.equal(card.count,1,
      'Protected printed card '+n+' is no longer a singleton');
    count[k]+=card.count;
  }
  assert.deepEqual(count,EXPECTED,'Published rank-2 source 60 changed');
  return count;
}

/**
 * Source-printed first-eight cards are known. The physical six Prize cards
 * have yet to be observed and are averaged by inclusion/exclusion.
 *
 * @param {Record<string,number>} initial First seven by category
 * @param {Record<string,number>} eight Seven plus one ordinary turn draw
 * @param {Record<string,number>} remaining 52 unobserved physical cards
 * @param {number} prizes Face-down Prize count
 */
function prepared(initial,eight,remaining,prizes) {
  const bStarted=initial.b>0;
  if(eight.b===0||eight.e===0||initial.b+initial.e+initial.o===0)
    return {weight:0,direct:false,available:0,spares:0,repeatSpares:0};
  const directTool=eight.m>0;
  const directEnergy=bStarted?eight.j+eight.c+eight.y+eight.g>0:eight.j>0;
  const direct=directTool&&directEnergy;
  if(!(eight.h>0||eight.t>0))
    return {weight:0,direct,available:0,spares:0,repeatSpares:0};
  const requirements=[];
  if(eight.h===0) requirements.push(['h']);
  if(!directTool) requirements.push(['m']);
  if(!directEnergy) requirements.push(bStarted?['j','c','y']:['j']);
  const weight=probabilitySearchable(remaining,requirements,prizes);

  // Reserve precisely the immediate Bunnelby, evolving Bench Basic and
  // GH or Tag Call connector. Direct Tool/Energy can be attached after GH.
  // Other played Pokemon can be delayed until after the search.
  const kept={b:1,e:1,h:eight.h>0?1:0,t:eight.h===0?1:0,
    m:directTool?1:0,j:0,c:0,y:0,g:0};
  if(directEnergy) {
    const type=bStarted?(['y','g','c','j'].find(k=>eight[k]>0)):'j';
    kept[type]=1;
  }
  const spares=KEYS.reduce((sum,k)=>
    sum+(REPEAT.has(k)?eight[k]-(kept[k]||0):0),0);
  const repeatSpares=['b','h','t'].reduce((sum,k)=>
    sum+eight[k]-(kept[k]||0),0);
  const available=8-Object.values(kept).reduce((sum,n)=>sum+n,0);
  assert.ok(spares>=0&&spares<=available&&repeatSpares<=spares);
  return {weight,direct,available,spares,repeatSpares};
}

/** Exact seven-card multivariate hypergeometric enumeration + turn draw. */
function exact(counts,opening=7,prizes=6) {
  assert.deepEqual(counts,EXPECTED);
  assert.equal(opening,7);
  assert.equal(prizes,6);
  const total=KEYS.reduce((sum,k)=>sum+counts[k],0);
  const firstDenominator=choose(total,opening);
  const legal=1-choose(total-counts.b-counts.e-counts.o,opening)/firstDenominator;
  const initial=Object.fromEntries(KEYS.map(k=>[k,0]));
  const eight={...initial},remaining={...initial};
  const buckets={
    ghNeeded:0,ghAndTwoMechanicallyAvailable:0,
    ghAndTwoNonSingletonOrRepeat:0,ghAndTwoRepeatConnectors:0,
    ghSingleOrZeroNonSingleton:0,directReadyWithGh:0
  };
  let draws=0;
  function walk(pos,left,combinations) {
    if(pos===KEYS.length) {
      if(left!==0||initial.b+initial.e+initial.o===0)return;
      for(const draw of KEYS) {
        if(initial[draw]===counts[draw])continue;
        for(const k of KEYS){
          eight[k]=initial[k]+(k===draw?1:0);
          remaining[k]=counts[k]-eight[k];
        }
        const ready=prepared(initial,eight,remaining,prizes);
        if(ready.weight===0)continue;
        const p=combinations*(counts[draw]-initial[draw])/
          ((total-opening)*firstDenominator)*ready.weight;
        if(ready.direct){buckets.directReadyWithGh+=p;continue;}
        buckets.ghNeeded+=p;
        if(ready.available>=2)buckets.ghAndTwoMechanicallyAvailable+=p;
        if(ready.spares>=2)buckets.ghAndTwoNonSingletonOrRepeat+=p;
        else buckets.ghSingleOrZeroNonSingleton+=p;
        if(ready.repeatSpares>=2)buckets.ghAndTwoRepeatConnectors+=p;
        draws++;
      }
      return;
    }
    const key=KEYS[pos];
    for(let n=0;n<=Math.min(left,counts[key]);n++){
      initial[key]=n;
      walk(pos+1,left-n,combinations*choose(counts[key],n));
    }
    initial[key]=0;
  }
  walk(0,opening,1);
  return {
    legalSevenProbability:legal,
    unconditioned:buckets,
    conditionalOnLegalSeven:Object.fromEntries(Object.entries(buckets)
      .map(([k,v])=>[k,v/legal])),
    conditionalOnGhNeeded:Object.fromEntries(Object.entries(buckets)
      .filter(([k])=>k!=='ghNeeded'&&k!=='directReadyWithGh')
      .map(([k,v])=>[k,v/buckets.ghNeeded])),
    visitedRelevantDrawBranches:draws
  };
}

function main() {
  const data=require('../results/aichi-2026/full-decklists.json');
  const rank2=data.decks.find(d=>d.rank===2);
  assert.equal(rank2?.player,'Takahiro Ando');
  const counts=classify(rank2.cards);
  console.log(JSON.stringify({rank:2,counts,
    result:exact(counts),
    warning:'Restricted first-eight opportunity under assumed singletons and discard categories. No gameplay strength or win rate is inferred.'},null,2));
}
if(require.main===module)main();
module.exports={KEYS,EXPECTED,classify,prepared,exact};
