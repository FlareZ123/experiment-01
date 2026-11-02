'use strict';
const assert=require('node:assert/strict');
const {sourceArtazonCounts}=require('./agent32-gh-artazon-prize-window.cjs');
const {choose,prizeSurvivalCount,fraction}=
  require('./agent32-gh-prize-search-window.cjs');

const VERSION='agent32-exeggutor-gh-artazon-optional-bonus-exact-v1';
const CATEGORIES=Object.freeze([
  'Bunnelby','Exeggcute','Oddish','Guzma & Hala','Tag Call','Jet Energy',
  'TM Evolution','Exeggutor','Gloom','Vileplume','Artazon',
  'Other Basic','Other nonbasic'
]);

/**
 * Distinguish the anonymous Other Basics from nonbasics because the paper
 * Basic-valid initial seven precedes any optional mulligan bonus draws.
 * @returns {{counts:number[],totalBasics:number}}
 */
function sourceBonusCounts(){
  const {counts,totalBasics}=sourceArtazonCounts();
  const otherBasics=totalBasics-counts[0]-counts[1]-counts[2];
  assert.equal(otherBasics,8);
  assert.equal(counts[11]-otherBasics,25);
  return {counts:[...counts.slice(0,11),otherBasics,
    counts[11]-otherBasics],totalBasics};
}

/**
 * Count first-eight-plus-m optional bonus cards, and jointly sampled six
 * Prizes, conditioning on the original first seven being Basic-valid.
 * Permutation symmetry makes (unordered H, unordered P) uniform; for H with
 * b Basic cards, the number of legal initial sevens equals
 * C(8+m,7)-C(8+m-b,7), which is the exact reweighting. This avoids the
 * incorrect assumption that qualifying enlarged H implies valid first seven.
 *
 * m is a fixed observed number of bonus cards voluntarily drawn after
 * placing Prizes; no probability model of opponent mulligans is assumed.
 * @param {number[]} groups Thirteen disjoint group counts.
 * @param {number} originalBasics Physical source Basic count.
 * @param {number} bonuses Number of optional extra opening draws.
 * @param {number} [opening=7] Original initial hand size.
 * @param {number} [prizes=6] Initial Prize count.
 * @returns {object} BigInt rational and exact grouped counts.
 */
function countBonusSearchWindow(groups,originalBasics,bonuses,
  opening=7,prizes=6){
  assert.equal(groups.length,CATEGORIES.length);
  assert.ok(groups.every(x=>Number.isSafeInteger(x)&&x>=0));
  const total=groups.reduce((a,b)=>a+b,0);
  assert.equal(groups[0]+groups[1]+groups[2]+groups[11],originalBasics);
  assert.ok(Number.isSafeInteger(bonuses)&&bonuses>=0&&bonuses<=5);
  assert.ok(Number.isSafeInteger(opening)&&opening>=2);
  const seen=opening+bonuses+1;
  assert.ok(seen+prizes<total);
  const left=total-seen,picks=new Array(groups.length).fill(0);
  const combCache=new Map(),prizeCache=new Map();
  /** @param {number} n @param {number} k */
  const comb=(n,k)=>{
    const key=n+':'+k;
    if(!combCache.has(key))combCache.set(key,choose(n,k));
    return combCache.get(key);
  };
  /** @param {number[]} required */
  const prize=(required)=>{
    const key=required.join(':');
    if(!prizeCache.has(key)){
      prizeCache.set(key,prizeSurvivalCount(left,prizes,required));
    }
    return prizeCache.get(key);
  };
  let weighted=0n,three=0n,two=0n,eligibleStates=0;
  /** @param {number} i @param {number} remaining */
  function recurse(i,remaining){
    if(i===groups.length){
      if(remaining!==0)return;
      const [b,e,o,gh,tag,jet,tm,egg,gloom,vile,artazon,otherBasic]=picks;
      const species=[b,e,o].filter(x=>x>0).length;
      if(species<2||jet<1||(gh===0&&tag===0))return;
      const basicInH=b+e+o+otherBasic;
      const legalInitialSevens=comb(seen,opening)-
        comb(seen-basicInH,opening);
      if(legalInitialSevens===0n)return;
      const targets=[groups[5]-jet,groups[6]-tm,
        groups[7]-egg,groups[8]-gloom,groups[9]-vile];
      if(gh===0)targets.push(groups[3]);
      if(species===2){
        const absent=[b,e,o].findIndex(x=>x===0);
        targets.push(groups[absent]);
        if(artazon===0)targets.push(groups[10]);
      }
      if(targets.some(x=>x<=0))return;
      let ways=1n;
      for(let j=0;j<groups.length;j++)ways*=comb(groups[j],picks[j]);
      const mass=ways*prize(targets)*legalInitialSevens;
      weighted+=mass;
      if(species===3)three+=mass;
      else two+=mass;
      eligibleStates++;
      return;
    }
    for(let k=0;k<=Math.min(groups[i],remaining);k++){
      picks[i]=k;
      recurse(i+1,remaining-k);
    }
  }
  recurse(0,seen);
  const allSeven=comb(total,opening),validSeven=allSeven-
    comb(total-originalBasics,opening);
  const denominator=comb(total,seen)*comb(left,prizes)*
    comb(seen,opening)*validSeven;
  const numerator=weighted*allSeven;
  assert.equal(three+two,weighted);
  return {weighted,three,two,eligibleStates,
    numerator,denominator,bonuses,originalBasics};
}

/** @returns {object} */
function main(){
  const {counts,totalBasics}=sourceBonusCounts();
  const rows=[];
  for(let m=0;m<=3;m++){
    const x=countBonusSearchWindow(counts,totalBasics,m);
    rows.push({optionalOpeningBonusCards:m,
      conditionalValidInitialSeven:fraction(x.numerator,x.denominator),
      threeBasicHeld:fraction(x.three*choose(60,7),x.denominator),
      twoBasicArtazon:fraction(x.two*choose(60,7),x.denominator),
      eligibleGroupedHandStates:x.eligibleStates});
  }
  assert.equal(rows[0].conditionalValidInitialSeven.numerator,
    '89772393489231');
  assert.equal(rows[0].conditionalValidInitialSeven.denominator,
    '3739215166086400');
  return {schema:VERSION,counts,totalBasics,rows,
    scope:'Exactly m voluntary bonus cards drawn after six Prizes and before '+
      'the owner first normal draw. Conditioning is on the INITIAL seven '+
      'containing a Basic. This is an access screen only. Opposing mulligan '+
      'counts and optional draw decisions are deliberately not modeled.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,CATEGORIES,sourceBonusCounts,countBonusSearchWindow,main};
