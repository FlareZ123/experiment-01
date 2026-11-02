'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {choose}=require('./agent33-rank29-beach-camping-prize-access.cjs');

const VERSION='agent33-rank29-gear-fixed-fallback-incidence-v1';

/**
 * Condition on legal opening Basic, co-held Gear + Beach + DCE in seven,
 * Thunder absent both in seven and in compulsory T1 draw, and Thunder
 * actually in deck (not in six Prizes). Count the fraction of these states
 * whose owner deck still has a fixed-selector G&H or Speed fallback.
 *
 * Exact seven-card category choices, mandatory next top draw, and six
 * unknown Prize positions are modeled without replacement.
 */
function evaluate(source){
  const deck=source.decks.find(d=>d.rank===29);
  assert.ok(deck);
  const count=name=>deck.cards.find(c=>c.name===name)?.count??0;
  const categories={
    basic:deck.cards.filter(c=>c.category==='Pokémon')
      .reduce((a,b)=>a+b.count,0),
    gear:count('Camping Gear'),
    beach:count('Tropical Beach'),
    dce:count('Double Colorless Energy'),
    thunder:count('Thunder Mountain ♢'),
    fallback:count('Guzma & Hala')+count('Speed Lightning Energy')
  };
  const total=deck.cards.reduce((a,b)=>a+b.count,0);
  assert.deepEqual({total,...categories},
    {total:60,basic:4,gear:2,beach:2,dce:1,thunder:1,
      fallback:6});
  const other=total-Object.values(categories).reduce((a,b)=>a+b,0);
  assert.equal(other,44);
  let eventDrawWays=0n,allFallbackPrizedPrizeChoices=0n;
  const prizeWays=choose(51,6);
  for(let b=1;b<=4;b++)for(let g=1;g<=2;g++)
    for(let t=1;t<=2;t++)for(let f=0;f<=6;f++){
      const o=7-b-g-t-1-f;
      if(o<0||o>other)continue;
      const openerWays=choose(4,b)*choose(2,g)*choose(2,t)*
        choose(6,f)*choose(other,o);
      const remaining=[4-b,2-g,2-t,6-f,other-o];
      assert.equal(remaining.reduce((a,c)=>a+c,0),52);
      for(let which=0;which<remaining.length;which++){
        const drawCount=remaining[which];
        if(drawCount===0)continue;
        const ways=openerWays*BigInt(drawCount);
        const fallbackAfterDraw=remaining[3]-(which===3?1:0);
        eventDrawWays+=ways;
        // After the first turn draw, one Thunder + 51 other unknown
        // cards remain. Condition Thunder belongs to the 46-card deck.
        // Six Prizes are thus chosen from the other 51 cards. The
        // legacy selector's G&H/Speed fallback is unavailable iff all
        // remaining fallback copies are Prized.
        allFallbackPrizedPrizeChoices+=ways*
          choose(51-fallbackAfterDraw,6-fallbackAfterDraw);
      }
    }
  const chance=(n,d)=>Number(n)/Number(d);
  const denominator=eventDrawWays*prizeWays;
  const mismatchNumerator=denominator-allFallbackPrizedPrizeChoices;
  const validBasicHands=choose(60,7)-choose(56,7);
  const eligibleNumerator=eventDrawWays*46n;
  const eligibleDenominator=validBasicHands*53n*52n;
  return {
    version:VERSION,rank:29,originalSourceCounts:categories,
    event: 'Basic+Camping+Beach+DCE opening seven; Thunder absent opening and T1 compulsory draw, present in remaining deck',
    ownerPromptEligibilityNotVerified:true,
    eventProbabilityGivenLegalBasic:
      chance(eligibleNumerator,eligibleDenominator),
    fixedFallbackAvailableGivenEvent:
      chance(mismatchNumerator,denominator),
    conditionalNoFixedFallback:chance(allFallbackPrizedPrizeChoices,
      denominator),
    jointEventAndFixedFallbackGivenLegalBasic:
      chance(eligibleNumerator*mismatchNumerator,
        eligibleDenominator*denominator),
    eventDrawWays:String(eventDrawWays),
    prizeWays:String(prizeWays),
    fallbackPrizedNumerator:String(allFallbackPrizedPrizeChoices),
    fixedFallbackNumerator:String(mismatchNumerator),
    denominator:String(denominator),
    limitations:'Opening location event only; no actual owner prompt or source policy encounter, no opponent, no matchup strength',
    competitiveQualifiedGames:0
  };
}
function run(){
  const filename=path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  return evaluate(JSON.parse(fs.readFileSync(filename,'utf8')));
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={VERSION,evaluate,run};
