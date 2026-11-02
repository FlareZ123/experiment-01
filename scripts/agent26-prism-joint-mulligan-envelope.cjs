'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./aichi-opening-basics.cjs');

const VERSION='agent26-prism-joint-mulligan-envelope-v1';
const DECK_SIZE=60, OPENING_SIZE=7;
const DENOMINATOR=choose(DECK_SIZE,OPENING_SIZE);
const ACE_SPEC_NAMES=new Set([
  "Amulet of Hope",
  "Awakening Drum",
  "Brilliant Blender",
  "Computer Search",
  "Crystal Edge",
  "Crystal Wall",
  "Dangerous Laser",
  "Deluxe Bomb",
  "Dowsing Machine",
  "Energy Search Pro",
  "Enriching Energy",
  "G Booster",
  "G Scope",
  "Gold Potion",
  "Grand Tree",
  "Hero's Cape",
  "Hyper Aroma",
  "Legacy Energy",
  "Life Dew",
  "Master Ball",
  "Max Rod",
  "Maximum Belt",
  "Megaton Blower",
  "Miracle Headset",
  "Neo Upper Energy",
  "Neutralization Zone",
  "Poké Vital A",
  "Precious Trolley",
  "Prime Catcher",
  "Reboot Pod",
  "Rock Guard",
  "Scoop Up Cyclone",
  "Scramble Switch",
  "Secret Box",
  "Sparkling Crystal",
  "Survival Brace",
  "Treasure Tracker",
  "Unfair Stamp",
  "Victory Piece"
]);
const BASIC_ENERGY=new Set([
  'Grass Energy','Fire Energy','Water Energy','Lightning Energy',
  'Psychic Energy','Fighting Energy','Darkness Energy',
  'Metal Energy','Fairy Energy'
]);

/** @param {bigint} n @returns {number} */
function logBigInt(n){
  assert.ok(n>0n);
  const s=n.toString();
  return Math.log(Number(s.slice(0,15)))+(s.length-Math.min(15,s.length))*Math.LN10;
}

/**
 * Upper likelihood, exact for the stated permissive class of hypothetical
 * 60-card decks: each observed card has its legal copy cap, while all
 * otherwise unobserved slots may be filled with distinct Basic Pokémon.
 * The event is the ordered full sequence of observed invalid sevens,
 * with each failed hand reshuffled, then an unobserved legal seven.
 * This deliberately does not require hypothetical decks to follow the
 * announced archetypes of the three missing Aichi source inventories.
 *
 * maxActiveCopies=4 additionally requires the final legal seven to
 * contain a specified Basic, which an adversarial player always chooses
 * Active; this mode is an upper bound on a visible-Active event.
 *
 * copyCaps can supply independently verified exceptional card limits
 * (e.g. ACE SPEC = 1). Prism Star names ending ♢ or ◇ are capped at 1.
 * Basic Energy names remain unrestricted unless a stricter cap is given.
 *
 * @param {string[][]} failedSevens
 * @param {{copyCaps?:Record<string,number>,maxActiveCopies?:number}} [options]
 * @returns {{version:string, probabilityUpper:number, numerator:string,
 *   denominator:string, observedCounts:Record<string,number>,
 *   residualBasicCount:number, activeCopies:number, totalFailedHands:number}}
 */
function maximumLegalHistoryLikelihood(failedSevens,options={}){
  assert.ok(Array.isArray(failedSevens));
  const {copyCaps={},maxActiveCopies=0}=options;
  assert.ok(Number.isInteger(maxActiveCopies)&&
    maxActiveCopies>=0&&maxActiveCopies<=4);
  const records=new Map();
  for(const seven of failedSevens){
    assert.ok(Array.isArray(seven)&&seven.length===OPENING_SIZE);
    const one=new Map();
    for(const name of seven){
      assert.ok(typeof name==='string'&&name.length>0);
      one.set(name,(one.get(name)??0)+1);
    }
    for(const [name,copies] of one){
      if(!records.has(name))records.set(name,[]);
      records.get(name).push(copies);
    }
  }
  const countedByName=new Map();
  for(const [name] of records)countedByName.set(name,
    failedSevens.map(seven=>seven.filter(x=>x===name).length));

  const knownAceNames=[...countedByName.keys()].filter(n=>ACE_SPEC_NAMES.has(n));
  if(knownAceNames.length>1)return {
    version:VERSION,probabilityUpper:0,numerator:'0',denominator:'1',
    observedCounts:{},residualBasicCount:0,
    activeCopies:maxActiveCopies,totalFailedHands:failedSevens.length};

  /** @type {Map<number,{weight:bigint,counts:Record<string,number>}>} */
  let dp=new Map([[0,{weight:1n,counts:{}}]]);
  for(const [name,multiplicities] of countedByName){
    const defaultCap=ACE_SPEC_NAMES.has(name)||/[♢◇]$/u.test(name)?1:
      BASIC_ENERGY.has(name)?DECK_SIZE:4;
    const cap=Object.hasOwn(copyCaps,name)?copyCaps[name]:defaultCap;
    assert.ok(Number.isSafeInteger(cap)&&cap>=0&&cap<=DECK_SIZE);
    const minimum=Math.max(...multiplicities);
    if(minimum>cap)return {
      version:VERSION,probabilityUpper:0,numerator:'0',
      denominator:'1',observedCounts:{},residualBasicCount:0,
      activeCopies:maxActiveCopies,totalFailedHands:failedSevens.length};
    const next=new Map();
    for(const [used,prior] of dp){
      for(let copies=minimum;copies<=cap&&
        used+copies+maxActiveCopies<=DECK_SIZE;copies++){
        const score=multiplicities.reduce((v,m)=>
          v*choose(copies,m),prior.weight);
        const spent=used+copies;
        const previous=next.get(spent);
        if(!previous||score>previous.weight){
          next.set(spent,{weight:score,counts:{...prior.counts,[name]:copies}});
        }
      }
    }
    dp=next;
  }
  if(dp.size===0)return {
    version:VERSION,probabilityUpper:0,numerator:'0',
    denominator:'1',observedCounts:{},residualBasicCount:0,
    activeCopies:maxActiveCopies,totalFailedHands:failedSevens.length};
  let best=null;
  for(const [spent,row] of dp){
    if(DECK_SIZE-spent-maxActiveCopies<0)continue;
    const finalNumerator=maxActiveCopies?
      DENOMINATOR-choose(DECK_SIZE-maxActiveCopies,OPENING_SIZE):
      DENOMINATOR-choose(spent,OPENING_SIZE);
    const numerator=row.weight*finalNumerator;
    if(best===null||numerator>best.numerator){
      best={numerator,counts:row.counts,spent};
    }
  }
  assert.ok(best!==null);
  const denominator=DENOMINATOR**BigInt(failedSevens.length+1);
  return {version:VERSION,
    probabilityUpper:best.numerator===0n?0:
      Math.exp(logBigInt(best.numerator)-logBigInt(denominator)),
    numerator:best.numerator.toString(),denominator:denominator.toString(),
    observedCounts:best.counts,
    residualBasicCount:DECK_SIZE-best.spent,
    activeCopies:maxActiveCopies,totalFailedHands:failedSevens.length};
}
module.exports={VERSION,ACE_SPEC_NAMES,maximumLegalHistoryLikelihood};
