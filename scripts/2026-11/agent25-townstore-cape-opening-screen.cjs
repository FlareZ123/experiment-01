'use strict';

/**
 * Exact draw/Prize-location screen for two distinct first-turn Cape Sentinel
 * routes. Neither route count is a setup probability: game actions, payments,
 * hand sequencing, search restrictions and matchups are outside this model.
 */
const CATEGORIES=Object.freeze([
  'oddish','bunnelby','fanRotom','otherBasic',
  'guzmaHala','tagCall','cape','searchStadium',
  'tmEvolution','jetEnergy','other'
]);
const COUNT=Object.freeze([2,2,1,9,4,4,1,1,2,3,31]);
const TOTAL=60,OPEN=8,PRIZES=6;
const KEY=Object.freeze({
  oddish:0,bunnelby:1,fan:2,otherBasic:3,gh:4,tag:5,
  cape:6,stadium:7,tm:8,jet:9,other:10
});
function choose(n,k){
  if(k<0||k>n)return 0n;
  let out=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    out=out*BigInt(n-Math.min(k,n-k)+i)/BigInt(i);
  return out;
}
/**
 * Good Prize combinations after seeing an exact physical first eight.
 * Every specified category must have at least one of its physical copies
 * somewhere other than the six random Prizes.
 * @param {number[]} drawn Draw counts by category
 * @param {number[]} needed Indices for required non-Prized categories
 */
function prizeSuccessCount(drawn,needed){
  const candidates=needed.filter(i=>drawn[i]===0)
    .map(i=>COUNT[i]-drawn[i]);
  let total=0n;
  for(let mask=0;mask<2**candidates.length;mask++){
    let sum=0,odd=0;
    for(let j=0;j<candidates.length;j++){
      if(mask&(1<<j)){sum+=candidates[j];odd++;}
    }
    const ways=choose(TOTAL-OPEN-sum,PRIZES-sum);
    total+=(odd%2?-ways:ways);
  }
  return total;
}
function screen(){
  const denominator=choose(TOTAL,OPEN)*BigInt(OPEN);
  const prizeDenom=choose(TOTAL-OPEN,PRIZES);
  const drawn=Array(COUNT.length).fill(0);
  let valid=0n,baseline=0n,town=0n;
  let examined=0;
  function visit(i,left,ways){
    if(i===COUNT.length){
      if(left!==0)return;
      examined++;
      const basics=drawn[KEY.oddish]+drawn[KEY.bunnelby]+
        drawn[KEY.fan]+drawn[KEY.otherBasic];
      // Original seven must contain a Basic. Any card in the first eight
      // can be the eighth draw. If it is the sole Basic, the first seven
      // must mulligan and are excluded.
      const legalLast=basics===0?0:basics===1?OPEN-1:OPEN;
      if(!legalLast)return;
      const weighted=ways*BigInt(legalLast);
      valid+=weighted*prizeDenom;
      const hasConnector=drawn[KEY.gh]+drawn[KEY.tag]>0;
      if(drawn[KEY.oddish]===0||!hasConnector)return;
      if(drawn[KEY.cape]>0){
        // Artazon + physically held Cape. Need unprized Bunnelby,
        // at least one G&H for Tag Call, stadium, TM and Jet.
        baseline+=weighted*prizeSuccessCount(drawn,[
          KEY.bunnelby,KEY.gh,KEY.stadium,KEY.tm,KEY.jet
        ]);
      }
      if(drawn[KEY.bunnelby]+drawn[KEY.fan]>0){
        // Town Store can find Cape while G&H finds TM and Jet. This
        // route needs a directly held Bunnelby or held Fan Rotom to
        // find one with Fan Call, plus an unprized Cape/Town.
        town+=weighted*prizeSuccessCount(drawn,[
          KEY.bunnelby,KEY.gh,KEY.cape,KEY.stadium,KEY.tm,KEY.jet
        ]);
      }
      return;
    }
    for(let k=0;k<=Math.min(left,COUNT[i]);k++){
      drawn[i]=k;
      visit(i+1,left-k,ways*choose(COUNT[i],k));
    }
    drawn[i]=0;
  }
  visit(0,OPEN,1n);
  const fullDen=denominator*prizeDenom;
  const toPercent=n=>Number(n)/Number(valid)*100;
  return {
    label:'exact category+six-Prize location screen, not setup/win rate',
    categories:CATEGORIES,categoryCounts:COUNT,
    originalSevenBasicValidCondition:true,originalEightVisibleCards:8,
    sixPrizesDrawnAfterOriginalEight:true,
    reference:{numerator:valid.toString(),denominator:fullDen.toString(),
      fraction:Number(valid)/Number(fullDen)},
    artazonHeldCape:{numerator:baseline.toString(),
      denominator:valid.toString(),conditionalPercent:toPercent(baseline)},
    townFetchedCape:{numerator:town.toString(),
      denominator:valid.toString(),conditionalPercent:toPercent(town)},
    townToArtazonRatio:Number(town)/Number(baseline),
    configurationsExamined:examined,
    limitations:[
      'Conditional first-eight and six-Prize card-location only',
      'Fan Call and Tag Call assumed payable; opponent locks and prompts ignored',
      'Two-card Guzma & Hala discard cost, Bench capacity and sequence ignored',
      'Search requirements relaxed when components already drawn',
      'Model describes restricted feasible location routes, not all legal routes',
      'Symmetric Town Store benefit and Temple of Sinnoh removal not valued',
      'No full-game matches or independently qualified wins'
    ]
  };
}
module.exports={CATEGORIES,COUNT,choose,prizeSuccessCount,screen};
if(require.main===module)process.stdout.write(JSON.stringify(screen(),null,2)+'\n');
