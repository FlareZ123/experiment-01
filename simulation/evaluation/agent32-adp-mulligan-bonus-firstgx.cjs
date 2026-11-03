'use strict';

const assert=require('node:assert/strict');
const candidate=require('../../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');
const {originalBasicCounts,bonusOffers}=
  require('./agent32-adp-field-mulligan-offers.cjs');

const VERSION='agent32-adp-original-mulligan-bonus-firstgx-v1';
const KEYS=[
  'sm12-156','__other_basic__','sv1-194','sm12-206',
  'swsh1-179','sm12-193','xy6-97','__other__'
];
const BASIC=new Set(['sm12-156','swsh12-135','sm2-60','swsh3-104']);
const PAS=[0n];
for(let n=1;n<=60;n++){
  const prior=PAS[n-1],row=Array(n+1).fill(1n);
  for(let k=1;k<n;k++)row[k]=prior[k-1]+prior[k];
  PAS.push(row);
}

/** @param {number} n @param {number} k @returns {bigint} */
function C(n,k) {
  return Number.isSafeInteger(n)&&Number.isSafeInteger(k)&&
    n>=0&&n<=60&&k>=0&&k<=n ? PAS[n][k]:0n;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){
  while(b){const t=a%b;a=b;b=t;}
  return a;
}

/** @param {bigint} a @param {bigint} b @returns {object} */
function fraction(a,b){
  assert.ok(b>0n);
  const g=gcd(a,b);
  return {
    numerator:String(a/g),
    denominator:String(b/g),
    probability:Number(a)/Number(b),
    percent:100*Number(a)/Number(b)
  };
}

/** @param {number} total @param {number[]} req */
function survives(total,req) {
  if(req.some(n=>!Number.isSafeInteger(n)||n<=0))return 0n;
  if(req.length===0)return C(total,6);
  let totalWays=0n;
  for(let mask=0;mask<1<<req.length;mask++){
    let exhausted=0,parity=0;
    for(let i=0;i<req.length;i++)if(mask&(1<<i)){
      exhausted+=req[i];parity++;
    }
    const term=C(total-exhausted,6-exhausted);
    totalWays+=parity%2?-term:term;
  }
  return totalWays;
}

/**
 * Compute exact first-GX access after m extra optional opening cards taken,
 * plus the ordinary going-second first-turn draw.
 * First seven must be Basic-valid, and only those initial seven can contain
 * the originally selected Active. Later drawn ADP needs held Switch.
 * Physical G&H/Quick Ball discard availability is optimistic, and all
 * Item/Supporter, energy, opponent and GX legality is untested.
 *
 * @param {number} m Source mulligan bonus cards actually taken.
 * @returns {object}
 */
function fixedBonus(m){
  assert.ok(Number.isSafeInteger(m)&&m>=0&&m<=46);
  assert.equal(candidate.canonicalCardsSha256,
    'bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b');
  const get=id=>candidate.cards.find(row=>row.id===id)?.count||0;
  const totalBasics=candidate.cards.reduce((s,c)=>
    s+(BASIC.has(c.id)?c.count:0),0);
  assert.equal(totalBasics,7);
  const counts=[
    get(KEYS[0]),totalBasics-get(KEYS[0]),get(KEYS[2]),get(KEYS[3]),
    get(KEYS[4]),get(KEYS[5]),get(KEYS[6]),
    60-totalBasics-get(KEYS[2])-get(KEYS[3])-get(KEYS[4])-
      get(KEYS[5])-get(KEYS[6])
  ];
  assert.deepEqual(counts,[2,5,2,4,3,3,4,37]);
  const visible=8+m, remaining=60-visible;
  const h=Array(counts.length).fill(0);
  let favorable=0n,direct=0n,switched=0n;
  let viableCompositions=0;
  const prized=C(remaining,6);

  /** @param {number} index @param {number} left @param {bigint} ways */
  function walk(index,left,ways){
    if(index===counts.length-1){
      if(left<0||left>counts[index])return;
      h[index]=left;
      const handWays=ways*C(counts[index],left);
      const adpStart=C(visible,7)-C(visible-h[0],7);
      const otherStart=C(visible-h[0],7)-
        C(visible-h[0]-h[1],7);
      if(adpStart===0n&&otherStart===0n)return;
      viableCompositions++;
      /** Energy in hand or accessible via G&H or Tag. */
      const energyRequirements=h[6]>0?[]:
        (h[5]===0&&h[3]===0 ? null:
          (h[5]>0?[counts[6]]:[counts[6],counts[5]]));
      if(energyRequirements===null)return;
      if(adpStart){
        const waysToPay=handWays*adpStart*
          survives(remaining,energyRequirements);
        direct+=waysToPay;
      }
      if(otherStart&&h[2]>0){
        const requiresADP=h[0]>0?[]:
          (h[3]===0&&h[4]===0?null:[counts[0]]);
        if(requiresADP){
          switched+=handWays*otherStart*survives(remaining,
            [...energyRequirements,...requiresADP]);
        }
      }
      return;
    }
    for(let take=0;take<=Math.min(counts[index],left);take++){
      h[index]=take;
      walk(index+1,left-take,ways*C(counts[index],take));
    }
  }
  walk(0,visible,1n);
  favorable=direct+switched;
  const validSeven=C(60,7)-C(53,7);
  const denominator=validSeven*C(53,m+1)*prized;
  assert.ok(denominator>0n&&favorable<=denominator);
  return {
    bonusCardsTaken:m,
    visibleCardsBeforeFirstGX:visible,
    initialSevenCondition:'Must hold a Basic before bonus draws',
    admissibleCompositions:viableCompositions,
    adpStartingActive:fraction(direct,denominator),
    otherStartingActiveSwitch:fraction(switched,denominator),
    union:fraction(favorable,denominator),
    qualifiedGames:0
  };
}

/**
 * Distribution of candidate's optional bonus cards offered by the opponent.
 * The first seven of BOTH players can fail and require a joint restart.
 * P(M=m>0)=(1-qA)(1-qB)qB^m/(1-qAqB).
 * P(M=0)=1-(1-qA)qB/(1-qAqB).
 *
 * Use all offered cards as an optimistic human decision. The infinite
 * physically impossible tail is bounded without guessing its payoff.
 *
 * @param {number} opponentBasic
 * @param {object[]} byM fixedBonus access states for m=0..maxM
 * @returns {object}
 */
function matchup(opponentBasic,byM){
  const qA=bonusOffers(7,opponentBasic).candidateMulliganProbability.fraction;
  const qB=bonusOffers(7,opponentBasic).opponentMulliganProbability.fraction;
  const common=(1-qA)*(1-qB)/(1-qA*qB);
  const p0=1-(1-qA)*qB/(1-qA*qB);
  let observed=0,totalWeight=0;
  const contributions=[];
  for(let m=0;m<byM.length;m++){
    const weight=m===0?p0:common*qB**m;
    const contribution=weight*byM[m].union.probability;
    observed+=contribution;
    totalWeight+=weight;
    contributions.push({bonusCards:m,weight,accessContribution:contribution});
  }
  const unmodeledTail=(1-qA)*qB**byM.length/(1-qA*qB);
  assert.ok(Math.abs(totalWeight+unmodeledTail-1)<1e-11);
  return {
    opponentBasicCopies:opponentBasic,
    candidateNoBonusAccess:byM[0].union.probability,
    expectedAccessLowerBound:observed,
    expectedAccessUpperBound:observed+unmodeledTail,
    modeledMass:totalWeight,
    unmodeledTailMass:unmodeledTail,
    selectedContributions:contributions.filter(x=>x.bonusCards<=6),
    assumption:'Candidate accepts all opponent-offered bonus draws, going second. Only first-eight-plus-bonuses and specified search/payable routes; ignores opponent actions.'
  };
}

/**
 * Precompute exact per-m access independent of the original opponent,
 * then weight with the actual original's basic-count mulligan distribution.
 * @param {number} [maxBonus=32] Largest enumerated bonus count.
 * @returns {object}
 */
function main(maxBonus=32){
  assert.ok(Number.isSafeInteger(maxBonus)&&maxBonus>=0&&maxBonus<=46);
  const byM=[];
  for(let m=0;m<=maxBonus;m++)byM.push(fixedBonus(m));
  const originals=originalBasicCounts();
  const groups=new Map();
  const rows=originals.map(opponent=>{
    const basic=opponent.basicCopies;
    if(!groups.has(basic))groups.set(basic,matchup(basic,byM));
    return {
      rank:opponent.rank,archetype:opponent.archetype,
      ...groups.get(basic)
    };
  });
  const mean=key=>rows.reduce((sum,row)=>sum+row[key],0)/rows.length;
  return {
    version:VERSION,
    fixedSourceSha:candidate.canonicalCardsSha256,
    modelMaxBonus:maxBonus,
    baseAccess:byM[0].union,
    firstFew:byM.filter((_,i)=>i<=8),
    originalCount:rows.length,
    missingOriginalRanks:[23,25,28],
    equalOriginalMean:{
      lower:mean('expectedAccessLowerBound'),
      upper:mean('expectedAccessUpperBound'),
      noBonus:byM[0].union.probability
    },
    rows,
    qualifiedGames:0,
    caveat:'Conditional physical first-GX location event only, assumes maximum optional bonus draw. Bounding uncomputed bonus tail is conservative. Not an attack, policy comparison, deck strength or paper win rate.'
  };
}

if(require.main===module){
  const max=process.argv[2]===undefined?32:Number(process.argv[2]);
  process.stdout.write(JSON.stringify(main(max),null,2)+'\n');
}
module.exports={VERSION,KEYS,BASIC,C,fraction,survives,fixedBonus,matchup,main};
