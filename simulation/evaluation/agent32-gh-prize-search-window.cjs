'use strict';

const assert = require('node:assert/strict');
const candidate = require('../../results/als/agent18-exeggutor-vileplume-native-v2.json');

const VERSION = 'agent32-rank2-exeggutor-firstturn-gh-prize-access-v1';
const CATEGORIES = Object.freeze([
  'Bunnelby', 'Exeggcute', 'Oddish', 'Guzma & Hala', 'Tag Call',
  'Jet Energy', 'Technical Machine: Evolution', 'Exeggutor',
  'Gloom', 'Vileplume', 'Other'
]);
const BASIC_NAMES = new Set([
  'Pidgey','Oddish','Bunnelby','Exeggcute','Fan Rotom',
  'Relicanth','Mr. Mime','Girafarig','Budew','Jirachi'
]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) || k<0 || k>n) return 0n;
  let result=1n;
  for(let i=1; i<=Math.min(k,n-k); i++) {
    result=result*BigInt(n-i+1)/BigInt(i);
  }
  return result;
}

/** @returns {{counts:number[],totalBasics:number}} */
function sourceCounts() {
  const rows=candidate.cards;
  const count=name=>rows.reduce((n,row)=>n+(row.name===name?row.count:0),0);
  const counts=CATEGORIES.slice(0,-1).map(count);
  const total=rows.reduce((n,row)=>n+row.count,0);
  const totalBasics=rows.reduce((n,row)=>n+(
    row.category==='Pokémon' && BASIC_NAMES.has(row.name)?row.count:0),0);
  counts.push(total-counts.reduce((a,b)=>a+b,0));
  assert.equal(total,60);
  assert.equal(totalBasics,14);
  assert.deepEqual(counts,[2,2,2,4,4,3,2,2,2,2,35],
    'Fixed experimental sixty changed; re-audit the combinatorial model');
  return {counts,totalBasics};
}

/**
 * Number of six-Prize allocations leaving at least one copy of each
 * required search target in the post-draw source deck. Groups are disjoint.
 * Inclusion-exclusion removes Prize sets exhausting any required group.
 * @param {number} remain Count of cards after the first eight owner cards.
 * @param {number} prizes Number of initially face-down Prize cards.
 * @param {number[]} required Copies left outside the first-eight hand.
 * @returns {bigint}
 */
function prizeSurvivalCount(remain,prizes,required){
  let ways=0n;
  for(let mask=0;mask<(1<<required.length);mask++){
    let exhausted=0,selected=0;
    for(let i=0;i<required.length;i++){
      if(mask&(1<<i)){exhausted+=required[i];selected++;}
    }
    const term=choose(remain-exhausted,prizes-exhausted);
    ways+=selected%2 ? -term : term;
  }
  return ways;
}

/**
 * Exact first-eight opening/first-own-draw resource screen, including all
 * six hidden Prize cards. Requires Bunnelby, Exeggcute, Oddish, a held Jet,
 * and G&H or Tag Call in the first eight. G&H fetched by Tag Call must remain
 * in the deck. A second Jet, TM Evolution, Exeggutor, Gloom and Vileplume
 * must also remain deck-searchable. The held Jet is conserved for the next
 * turn; G&H fetches the first Jet and TM on the first attacking turn.
 *
 * This counts card locations and a mechanically payable two-card discard,
 * without asserting any native turn, opponent compliance or real-game win.
 * @param {number[]} groups The eleven fixed disjoint categories.
 * @param {number} totalBasics Physical Basic count (14 in the source sixty).
 * @param {number} [opening=7] Initial hand size.
 * @param {number} [prizes=6] Initial Prize count.
 * @returns {object} Exact BigInt resource numerators and denominators.
 */
function countSearchWindow(groups,totalBasics,opening=7,prizes=6){
  assert.equal(groups.length,CATEGORIES.length);
  assert.ok(groups.every(x=>Number.isSafeInteger(x)&&x>=0));
  const total=groups.reduce((a,b)=>a+b,0);
  assert.ok(opening>=1&&prizes>=0&&opening+prizes+1<total);
  assert.ok(totalBasics>=groups[0]+groups[1]+groups[2]);
  const seen=opening+1;
  const picked=new Array(groups.length).fill(0);
  let totalFavorable=0n,heldGuzma=0n,tagOnly=0n,eligibleStates=0;
  const remaining=total-seen;
  /** @param {number} index @param {number} left */
  function enumerate(index,left){
    if(index===groups.length){
      if(left!==0)return;
      const [b,e,o,gh,tag,jet,tm,egg,gloom,vile]=picked;
      if(b<1||e<1||o<1||jet<1||(gh===0&&tag===0))return;
      const required=[groups[5]-jet,groups[6]-tm,
        groups[7]-egg,groups[8]-gloom,groups[9]-vile];
      if(gh===0)required.push(groups[3]);
      if(required.some(x=>x<=0))return;
      let handWays=1n;
      for(let i=0;i<groups.length;i++)handWays*=choose(groups[i],picked[i]);
      const validPrizeWays=prizeSurvivalCount(remaining,prizes,required);
      const mass=handWays*validPrizeWays;
      totalFavorable+=mass;
      if(gh>0)heldGuzma+=mass;
      else tagOnly+=mass;
      eligibleStates++;
      return;
    }
    for(let n=0;n<=Math.min(groups[index],left);n++){
      picked[index]=n;
      enumerate(index+1,left-n);
    }
  }
  enumerate(0,seen);
  const allDeals=choose(total,seen)*choose(remaining,prizes);
  const legalSeven=choose(total,opening)-choose(total-totalBasics,opening);
  const allSeven=choose(total,opening);
  assert.equal(totalFavorable,heldGuzma+tagOnly);
  // Any eight-card hit has at least three Basics, so no single last card
  // can make its initial seven Basic-invalid. The conditional fraction
  // divides the unconditional favorable mass by P(valid initial seven).
  return {totalFavorable,heldGuzma,tagOnly,allDeals,
    conditionalNumerator:totalFavorable*allSeven,
    conditionalDenominator:allDeals*legalSeven,
    eligibleStates,totalBasics,opening,prizes};
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){while(b!==0n)[a,b]=[b,a%b];return a;}

/** @param {bigint} a @param {bigint} b @returns {object} */
function fraction(a,b){
  assert.ok(b>0n);
  const d=gcd(a,b);
  return {numerator:(a/d).toString(),denominator:(b/d).toString(),
    percent:Number(a)*100/Number(b)};
}

/** @returns {object} */
function main(){
  const {counts,totalBasics}=sourceCounts();
  const result=countSearchWindow(counts,totalBasics);
  const openingHands=choose(60,7);
  const legalHands=openingHands-choose(46,7);
  return {
    schema:VERSION,
    roster:'results/als/agent18-exeggutor-vileplume-native-v2.json',
    categoryNames:CATEGORIES,counts,totalBasics,
    eligibleFirstEightGroupedStates:result.eligibleStates,
    unconditional:fraction(result.totalFavorable,result.allDeals),
    conditionalBasicValidSeven:
      fraction(result.conditionalNumerator,result.conditionalDenominator),
    partitions:{
      heldGuzmaHala:fraction(result.heldGuzma*openingHands,
        result.allDeals*legalHands),
      tagOnlyNeedsGuzmaHalaInDeck:fraction(result.tagOnly*openingHands,
        result.allDeals*legalHands)
    },
    limits:'Specific first-eight card-location conjunction in a going-second '+
      'Bunnelby/TM/Guzma & Hala engine. Excludes all other tutors, '+
      'extra draws, opponent interference, actual player decisions, '+
      'G&H discard-value costs, paper-match clock and game outcomes.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,CATEGORIES,choose,prizeSurvivalCount,
  sourceCounts,countSearchWindow,fraction,main};
