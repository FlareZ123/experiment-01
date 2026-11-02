'use strict';
const assert=require('node:assert/strict');
const {CATEGORIES,sourceArtazonCounts,countArtazonSearchWindow}=
  require('./agent32-gh-artazon-prize-window.cjs');
const {fraction}=require('./agent32-gh-prize-search-window.cjs');

const VERSION='agent32-exeggutor-gh-artazon-exact-slot-sensitivity-v1';
const OTHER=CATEGORIES.indexOf('Other');

/**
 * A fixed-60 one-copy perturbation from the anonymous Other pool.
 * An Other card may be a Basic or a nonbasic; the two physically different
 * substitution classes must not be silently combined. No opponent games,
 * actual swap recommendation or hand-discard value is modeled.
 * @param {{name:string,target:string,delta:number,
 *  otherRemovedIsBasic:boolean}} config
 * @param {number[]} counts
 * @param {number} basics
 * @returns {object}
 */
function oneSlotScenario(config,counts,basics){
  assert.equal(counts.length,CATEGORIES.length);
  assert.ok(Number.isSafeInteger(basics)&&basics>=0);
  const target=CATEGORIES.indexOf(config.target);
  assert.ok(target>=0&&target!==OTHER);
  assert.ok(config.delta===1||config.delta===-1);
  const targetIsBasic=target<=2;
  const otherBasics=basics-counts[0]-counts[1]-counts[2];
  const otherNonbasic=counts[OTHER]-otherBasics;
  assert.ok(otherBasics>=0&&otherNonbasic>=0);
  if(config.delta===1){
    assert.ok(config.otherRemovedIsBasic?otherBasics>=1:otherNonbasic>=1);
    assert.ok(counts[target]<4,'This source card is already at the four-copy ceiling');
  }
  assert.ok(counts[target]+config.delta>=0);
  const changed=[...counts];
  changed[target]+=config.delta;
  changed[OTHER]-=config.delta;
  const basicChange=config.delta*(Number(targetIsBasic)-
    Number(config.otherRemovedIsBasic));
  const changedBasics=basics+basicChange;
  assert.equal(changed.reduce((a,b)=>a+b,0),60);
  assert.ok(changedBasics>=1&&changedBasics<=60);
  const exact=countArtazonSearchWindow(changed,changedBasics);
  const ratio=fraction(exact.totalFavorable*exact.allSeven,
    exact.allDeals*exact.validSeven);
  return {...config,basicCount:changedBasics,probability:ratio};
}

/** @returns {object} */
function main(){
  const {counts,totalBasics}=sourceArtazonCounts();
  const base=countArtazonSearchWindow(counts,totalBasics);
  const reference=fraction(base.totalFavorable*base.allSeven,
    base.allDeals*base.validSeven);
  const scenarios=[
    {name:'Jet 3 to 4, one unrelated nonbasic removed',
      target:'Jet Energy',delta:1,otherRemovedIsBasic:false},
    {name:'Bunnelby 2 to 3, one unrelated Basic removed',
      target:'Bunnelby',delta:1,otherRemovedIsBasic:true},
    {name:'Exeggcute 2 to 3, one unrelated Basic removed',
      target:'Exeggcute',delta:1,otherRemovedIsBasic:true},
    {name:'Oddish 2 to 3, one unrelated Basic removed',
      target:'Oddish',delta:1,otherRemovedIsBasic:true},
    {name:'Bunnelby 2 to 3, one unrelated nonbasic removed',
      target:'Bunnelby',delta:1,otherRemovedIsBasic:false},
    {name:'TM Evolution 2 to 3, one unrelated nonbasic removed',
      target:'Technical Machine: Evolution',delta:1,
      otherRemovedIsBasic:false},
    {name:'Exeggutor 2 to 3, one unrelated nonbasic removed',
      target:'Exeggutor',delta:1,otherRemovedIsBasic:false},
    {name:'Gloom 2 to 3, one unrelated nonbasic removed',
      target:'Gloom',delta:1,otherRemovedIsBasic:false},
    {name:'Vileplume 2 to 3, one unrelated nonbasic removed',
      target:'Vileplume',delta:1,otherRemovedIsBasic:false},
    {name:'Artazon 2 to 3, one unrelated nonbasic removed',
      target:'Artazon',delta:1,otherRemovedIsBasic:false},
    {name:'Jet 3 to 2, one unrelated nonbasic added',
      target:'Jet Energy',delta:-1,otherRemovedIsBasic:false}
  ];
  const variants=scenarios.map(s=>{
    const row=oneSlotScenario(s,counts,totalBasics);
    return {...row,deltaPercentagePoints:row.probability.percent-
      reference.percent};
  });
  return {schema:VERSION,sourceCounts:counts,baseBasicCount:totalBasics,
    baseline:reference,variants,
    limits:'Each scenario substitutes exactly one named card and an unnamed Other '+
      'slot of the stated Basic status. Only this particular eight-card, six-Prize '+
      'G&H/Artazon access event is recomputed; no actual new 60 is nominated, '+
      'no opponent policy or gameplay modeled and no competitive wins measured.'};
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,oneSlotScenario,main};
