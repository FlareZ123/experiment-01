'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {choose}=require('./agent33-rank29-beach-camping-prize-access.cjs');

const VERSION='agent33-rank29-guzma-hala-dual-axis-prize-reachability-v1';

/**
 * Exact source-location reachability for a hypothetical first-turn
 * Camping Gear -> Guzma & Hala, next-turn G&H -> Stadium Thunder and paid
 * Special Energy DCE line. This is a SUFFICIENT access event under strong
 * no-lock, two-discardable-card and Supporter-availability assumptions,
 * never a competitive attack/win statistic.
 */
function evaluate(source){
  const deck=source.decks.find(d=>d.rank===29);
  assert.ok(deck);
  const count=name=>deck.cards.find(c=>c.name===name)?.count??0;
  const counts={
    basic:deck.cards.filter(c=>c.category==='Pokémon')
      .reduce((a,c)=>a+c.count,0),
    gear:count('Camping Gear'),beach:count('Tropical Beach'),
    dce:count('Double Colorless Energy'),
    thunder:count('Thunder Mountain ♢'),
    bridge:count('Guzma & Hala')
  };
  const total=deck.cards.reduce((a,c)=>a+c.count,0);
  assert.deepEqual({total,...counts},
    {total:60,basic:4,gear:2,beach:2,dce:1,thunder:1,bridge:2});
  const other=total-Object.values(counts).reduce((a,b)=>a+b,0);
  assert.equal(other,48);

  let openerWays=0n,sufficientPrizeWays=0n,resourceUnprizedWays=0n;
  const prizeWays=choose(53,6);
  for(let b=1;b<=4;b++)for(let g=1;g<=2;g++)
    for(let t=1;t<=2;t++)for(let d=0;d<=1;d++)
      for(let h=0;h<=1;h++)for(let a=0;a<=2;a++){
        const o=7-b-g-t-d-h-a;
        if(o<0||o>other)continue;
        const ways=choose(4,b)*choose(2,g)*choose(2,t)*
          choose(1,d)*choose(1,h)*choose(2,a)*choose(other,o);
        const protectedResourceCount=2-d-h;
        const accessibleResourcesPrizeSets=
          choose(53-protectedResourceCount,6);
        // If no G&H was initially held, both copies could be Prized;
        // remove those prize sets even though DCE/Thunder are unprized.
        const allBridgeCopiesPrizedPrizeSets=a===0?
          choose(53-protectedResourceCount-2,4):0n;
        openerWays+=ways;
        resourceUnprizedWays+=ways*accessibleResourcesPrizeSets;
        sufficientPrizeWays+=ways*(accessibleResourcesPrizeSets-
          allBridgeCopiesPrizedPrizeSets);
      }
  const denom=openerWays*prizeWays;
  const asNumber=(a,b)=>Number(a)/Number(b);
  return {
    version:VERSION,rank:29,exactSource60:true,counts,
    openingCondition:'At least one Basic, one Camping Gear and one Tropical Beach in first seven',
    hypotheticalLine:'Gear searches G&H on T1 when needed; G&H on T2 obtains Thunder and, if two other cards are discarded, Special Energy DCE',
    allThreeResourceCategoriesReachable:
      asNumber(sufficientPrizeWays,denom),
    bothAttackResourcesNotPrizedUpperEnvelope:
      asNumber(resourceUnprizedWays,denom),
    additionalAccessRequiresAlternativeLine:
      asNumber(resourceUnprizedWays-sufficientPrizeWays,denom),
    openerWays:String(openerWays),prizeChoices:String(prizeWays),
    sufficientCount:String(sufficientPrizeWays),
    resourceUnprizedCount:String(resourceUnprizedWays),
    denominator:String(denom),
    requirements:'T2 G&H Supporter legally usable; Gear search succeeds; two other hand cards are actually discardable; native print effects and Stadium/Special Energy playable; owner survives',
    scope:'Idealized resource-location reachability only; no owner-policy execution, DCI/AMR, opponent continuation, Paper clock, or games',
    competitiveQualifiedGames:0
  };
}
function run(){
  const f=path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  return evaluate(JSON.parse(fs.readFileSync(f,'utf8')));
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={VERSION,evaluate,run};
