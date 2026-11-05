'use strict';

const assert=require('node:assert/strict');
const ROSTER=require('../../results/aichi-2026/full-decklists.json');

const VERSION='agent18-original-rank6-tagcall-ghala-direct-access-exact-v1';
const KEY=Object.freeze([
  'Iron Thorns ex','Guzma & Hala','Tag Call',
  'Thunder Mountain ♢','Double Colorless Energy'
]);
const SIZE=60;
const HAND=7,PRIZES=6,DRAW=1;
const cache=new Map();

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k)||
    n<0||k<0||k>n)return 0n;
  const q=Math.min(k,n-k);
  const id=n+':'+q;
  if(cache.has(id))return cache.get(id);
  let value=1n;
  for(let j=1;j<=q;j++)
    value=value*BigInt(n-q+j)/BigInt(j);
  cache.set(id,value);
  return value;
}

/** @param {bigint} a @param {bigint} b */
function gcd(a,b){
  while(b!==0n){const t=b;b=a%b;a=t;}
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function rational(numerator,denominator){
  assert.ok(denominator>0n);
  const divisor=gcd(numerator,denominator);
  const p=numerator/divisor,q=denominator/divisor;
  return {numerator:p.toString(),denominator:q.toString(),
    probability:Number(p)/Number(q)};
}

/**
 * Collapse exact printed source deck into the five relevant card names and
 * all others. Card counts remain source-authenticated; there are no newly
 * invented cards and no opponent-deck assumptions.
 * @param {object} [roster] Saved Aichi original human-verified source rows.
 * @returns {number[]} B,H,Tag,Thunder,DCE,Other counts.
 */
function sourceCounts(roster=ROSTER){
  const source=roster.decks.find(x=>x.rank===6);
  assert.ok(source&&Array.isArray(source.cards));
  const sixty=source.cards.reduce((s,x)=>s+x.count,0);
  assert.equal(sixty,SIZE);
  const names=KEY.map(name=>{
    const found=source.cards.find(x=>x.name===name);
    assert.ok(found,'missing original rank6 printing '+name);
    return found.count;
  });
  assert.deepEqual(names,[4,2,2,1,1]);
  return [...names,SIZE-names.reduce((a,b)=>a+b,0)];
}

/**
 * Exact unordered seven-card Basic-conditional opening, six concealed
 * Prizes from the remaining 53, one turn draw from the remaining 47.
 * This is a narrow no-interference first-own-turn source resource route:
 *
 * - Initial 7 include >=1 Iron Thorns ex, with every held Basic played.
 * - Owner begins second, takes one normal turn draw, no extra draw/mulligan.
 * - One held G&H or held Tag Call with >=1 G&H still in deck.
 * - Thunder Mountain and DCE are not Prized; each can be held or searched
 *   from the owner's deck using paid G&H.
 * - Payment physically preserves held Thunder and DCE and all Basics.
 * - One Supporter, one Stadium, one hand Energy attachment remain unused.
 *
 * The resulting probability is resource-availability only, not attack
 * legality under opposing card effects, an actual Stadium/attack action,
 * two-card discard strategic desirability, or a competitive win chance.
 *
 * @param {number[]} [cardCounts] Five source categories plus "Other".
 */
function exactOpeningAccess(cardCounts=sourceCounts()){
  assert.deepEqual(cardCounts,[4,2,2,1,1,50]);
  const c=cardCounts;
  const events={
    ghHeld:0n,tagSearchNoGhHeld:0n,ghOrTagRoute:0n,
    thunderAndDceNotPrized:0n,secondBasicForBench:0n,
    routePlusBothResources:0n,physicallyPayableDirectRoute:0n,
    payableDirectRouteWithBench:0n
  };
  const overallValidOpeningCount=
    choose(60,7)-choose(60-c[0],7);
  const conditionedSpace=overallValidOpeningCount*choose(53,6)*47n;
  let enumerated=0n;
  const weights=arr=>arr.reduce((v,x,i)=>v*choose(c[i],x),1n);

  for(let b=1;b<=c[0];b++)
  for(let h=0;h<=c[1];h++)
  for(let tag=0;tag<=c[2];tag++)
  for(let mountain=0;mountain<=c[3];mountain++)
  for(let dce=0;dce<=c[4];dce++){
    const other=7-b-h-tag-mountain-dce;
    if(other<0||other>c[5])continue;
    const opening=[b,h,tag,mountain,dce,other];
    const wx=weights(opening);
    const remaining=c.map((v,i)=>v-opening[i]);
    for(let pb=0;pb<=Math.min(remaining[0],6);pb++)
    for(let ph=0;ph<=Math.min(remaining[1],6-pb);ph++)
    for(let pt=0;pt<=Math.min(remaining[2],6-pb-ph);pt++)
    for(let pm=0;pm<=Math.min(remaining[3],6-pb-ph-pt);pm++)
    for(let pd=0;pd<=Math.min(remaining[4],6-pb-ph-pt-pm);pd++){
      const po=6-pb-ph-pt-pm-pd;
      if(po<0||po>remaining[5])continue;
      const prized=[pb,ph,pt,pm,pd,po];
      let wy=1n;
      for(let i=0;i<c.length;i++)
        wy*=choose(remaining[i],prized[i]);
      if(wy===0n)continue;
      const leftover=remaining.map((v,i)=>v-prized[i]);
      for(let drawn=0;drawn<c.length;drawn++){
        const multiplicity=leftover[drawn];
        if(multiplicity<=0)continue;
        const weight=wx*wy*BigInt(multiplicity);
        enumerated+=weight;
        const hb=b+(drawn===0?1:0);
        const hh=h+(drawn===1?1:0);
        const ht=tag+(drawn===2?1:0);
        const hm=mountain+(drawn===3?1:0);
        const hd=dce+(drawn===4?1:0);
        const ghDeck=remaining[1]-ph-(drawn===1?1:0);
        const ghHeld=hh>=1;
        const tagRoute=hh===0&&ht>=1&&ghDeck>=1;
        const route=ghHeld||tagRoute;
        const bothResources=pm===0&&pd===0;
        const bench=hb>=2;
        // One in-hand Supporter, or one Tag Call exchanged for G&H and
        // then spent, leaves seven of the eight hand cards. Remove all
        // Basic board placements and protect any held DCE/Thunder.
        const paidTwoOthers=7-hb-hm-hd>=2;
        if(ghHeld)events.ghHeld+=weight;
        if(tagRoute)events.tagSearchNoGhHeld+=weight;
        if(route)events.ghOrTagRoute+=weight;
        if(bothResources)events.thunderAndDceNotPrized+=weight;
        if(bench)events.secondBasicForBench+=weight;
        if(route&&bothResources){
          events.routePlusBothResources+=weight;
          if(paidTwoOthers){
            events.physicallyPayableDirectRoute+=weight;
            if(bench)
              events.payableDirectRouteWithBench+=weight;
          }
        }
      }
    }
  }
  assert.equal(enumerated,conditionedSpace,
    'Exact 7 / 6 / 1 without-replacement census was incomplete');
  const probabilities={};
  for(const [name,numerator] of Object.entries(events))
    probabilities[name]=rational(numerator,conditionedSpace);
  return {
    schema:VERSION,sourceRank:6,printedOriginalSixty:true,
    sourceCategoryCounts:cardCounts,
    sampleSpace:{startingHand:7,prizeCards:6,turnDraw:1,
      openingRequiresInitialBasic:true,
      startingBasicSuccess:rational(overallValidOpeningCount,
        choose(60,7)),
      conditionedDealCount:conditionedSpace.toString(),
      exactlyEnumeratedAllConditionedDeals:true},
    probabilities,
    assumptions:[
      'Going second, one normal turn draw, no extra draws or opposing mulligan cards',
      'Basic-only original source: all held Iron Thorns ex put into Active or Bench',
      'One held G&H or held Tag Call plus another physically deck-resident G&H',
      'Actual held and deck-resident singleton Thunder Mountain/DCE available iff not Prized',
      'Mandatory paid G&H discards two other physical hand cards, preserving Basic, Thunder and DCE; all other cards physically count even if strategically precious',
      'No Item/Stadium/Supporter/Energy quota was previously spent and no opponent restrictions',
      'Direct route only; excludes Trainers Mail, other draw or Prize recovery',
      'No attack, damage, Energy move, opponent response or win probability certified'
    ],
    evidenceKind:'exact-combinatorial-resource-access-upper-model',
    qualifiesCompetitiveGames:0
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(exactOpeningAccess(),null,2)+'\n');

module.exports={VERSION,KEY,choose,gcd,rational,sourceCounts,exactOpeningAccess};
