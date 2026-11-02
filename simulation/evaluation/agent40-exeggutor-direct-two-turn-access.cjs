'use strict';

const assert=require('node:assert/strict');
const challenge=require('../../results/als/agent18-exeggutor-vileplume-native-v2.json');

const BASIC_NAMES=new Set([
  'Pidgey','Oddish','Bunnelby','Exeggcute','Fan Rotom',
  'Relicanth','Mr. Mime','Girafarig','Budew','Jirachi'
]);

/**
 * Count physical cards in a fixed 60 without replacing per-printing quantities
 * with archetype guesses. Distinguish two Exeggcute Basics from other Basics.
 * @returns {number[]} [Bunnelby, Exeggcute, other Basics, TM Evolution,
 * Jet Energy, all other cards].
 */
function sourceCategoryCounts(){
  const basicName=name=>BASIC_NAMES.has(name);
  const count=fn=>challenge.cards.reduce((sum,row)=>
    sum+(fn(row)?row.count:0),0);
  const b=count(row=>row.category==='Pokémon'&&row.name==='Bunnelby');
  const e=count(row=>row.category==='Pokémon'&&row.name==='Exeggcute');
  const allBasic=count(row=>row.category==='Pokémon'&&basicName(row.name));
  const tm=count(row=>row.name==='Technical Machine: Evolution'&&
    row.printing.set==='PAR');
  const jet=count(row=>row.name==='Jet Energy'&&row.printing.set==='PAL');
  const total=count(()=>true);
  assert.equal(total,60,'Candidate v2 must have exactly 60 cards');
  assert.deepEqual([b,e,allBasic,tm,jet],[2,2,14,2,3],
    'Recheck source definitions if the experimental 60 changes');
  return [b,e,allBasic-b-e,tm,jet,total-allBasic-tm-jet];
}

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k)||
    n<0||k<0||k>n)return 0n;
  let result=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    result=result*BigInt(n-i+1)/BigInt(i);
  return result;
}

/**
 * Enumerate seven unordered opener cards and two ORDERED natural draws,
 * marginalizing over the six hidden uniformly distributed Prize cards.
 * Under random shuffle, after an opener the next two draws are uniformly
 * ordered from the remaining 53 irrespective of the six unobserved Prizes.
 *
 * First-turn required through opener plus first draw:
 *   Bunnelby, Exeggcute, TM Evolution, and at least one Jet.
 * Second-turn required through the second natural draw:
 *   at least two Jet total.
 * The opener must contain at least one Basic (the first 3 groups).
 *
 * These are necessary physical-hand conditions for one very narrow
 * no-tutoring, no-extra-draw double-Jet line, and remain insufficient for
 * actually executing TM Evolution or Blockade. They do not bound other
 * lines using Guzma & Hala, Tag Call, special retrieval, or other effects.
 *
 * @param {number[]} groups Six disjoint copy counts in the documented order.
 * @param {number} openerSize Starting hand size, normally 7.
 * @returns {{favorable:bigint,validOpenersDenominator:bigint,
 * favorableWithoutBasicCondition:bigint,allOpenersDenominator:bigint}}
 */
function countDirectSequence(groups,openerSize=7){
  assert.equal(groups.length,6);
  assert.ok(groups.every(n=>Number.isSafeInteger(n)&&n>=0));
  const n=groups.reduce((a,b)=>a+b,0);
  assert.ok(Number.isSafeInteger(openerSize)&&openerSize>=1&&
    openerSize+2<=n);
  const k=new Array(6).fill(0);
  let favorable=0n,favorableWithoutBasicCondition=0n;
  let computedValidDenominator=0n;
  /** @param {number} index @param {number} remaining */
  function walk(index,remaining){
    if(index===6){
      if(remaining!==0)return;
      let openerWays=1n;
      for(let j=0;j<6;j++)openerWays*=choose(groups[j],k[j]);
      const basicValid=k[0]+k[1]+k[2]>=1;
      for(let firstIndex=0;firstIndex<6;firstIndex++){
        if(k[firstIndex]===groups[firstIndex])continue;
        const first=[...k];
        first[firstIndex]++;
        const firstReady=first[0]>=1&&first[1]>=1&&
          first[3]>=1&&first[4]>=1;
        for(let secondIndex=0;secondIndex<6;secondIndex++){
          if(first[secondIndex]===groups[secondIndex])continue;
          const mass=openerWays*
            BigInt(groups[firstIndex]-k[firstIndex])*
            BigInt(groups[secondIndex]-first[secondIndex]);
          if(basicValid)computedValidDenominator+=mass;
          if(firstReady&&first[4]+(secondIndex===4?1:0)>=2){
            favorableWithoutBasicCondition+=mass;
            if(basicValid)favorable+=mass;
          }
        }
      }
      return;
    }
    for(let picked=0;picked<=Math.min(groups[index],remaining);picked++){
      k[index]=picked;
      walk(index+1,remaining-picked);
    }
  }
  walk(0,openerSize);
  const orderedDraws=BigInt(n-openerSize)*BigInt(n-openerSize-1);
  const allOpenersDenominator=choose(n,openerSize)*orderedDraws;
  const validOpenersDenominator=(choose(n,openerSize)-
    choose(n-groups[0]-groups[1]-groups[2],openerSize))*orderedDraws;
  assert.equal(computedValidDenominator,validOpenersDenominator,
    'Exact opening-composition enumeration must match independent Basic complement');
  return {favorable,validOpenersDenominator,
    favorableWithoutBasicCondition,allOpenersDenominator};
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){
  while(b!==0n)[a,b]=[b,a%b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function describeFraction(numerator,denominator){
  assert.ok(denominator>0n);
  const factor=gcd(numerator,denominator);
  return {numerator:numerator.toString(),
    denominator:denominator.toString(),
    reducedNumerator:(numerator/factor).toString(),
    reducedDenominator:(denominator/factor).toString(),
    percent:100*Number(numerator)/Number(denominator)};
}

/** @returns {object} */
function main(){
  const counts=sourceCategoryCounts();
  const found=countDirectSequence(counts,7);
  return {
    schema:'agent40-exeggutor-double-jet-direct-first-nine-v1',
    exactChallenger:'results/als/agent18-exeggutor-vileplume-native-v2.json',
    categories:['Bunnelby','Exeggcute','other Basic',
      'Technical Machine: Evolution','Jet Energy','other'],
    counts,openerSize:7,ordinaryDrawsBeforeSecondSourceTurn:2,
    directResourceConjunction:{
      firstEight:'at least one Bunnelby, Exeggcute, TM Evolution, and Jet',
      firstNine:'at least two Jet Energy total',
      noSearchOrExtraDraw:true,
      conditionalOnLegalBasicOpening:
        describeFraction(found.favorable,found.validOpenersDenominator),
      unconditional:
        describeFraction(found.favorableWithoutBasicCondition,
          found.allOpenersDenominator)
    },
    limits:'Overinclusive necessary-card event for one strict no-search line. '+
      'Prizes, turn sequencing, discards, Bench, Stage targets and opponent responses '+
      'can make counted hands fail. Tutoring, draw and alternative acceleration '+
      'can create legal lines without this event. No game or win rate was simulated.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={BASIC_NAMES,sourceCategoryCounts,choose,countDirectSequence,main};
