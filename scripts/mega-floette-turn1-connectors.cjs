'use strict';

const {choose,gcd} = require('./mega-floette-direct-window.cjs');

/**
 * Optimistic source-champion turn-one Floette plus first Psychic Energy
 * *availability*, conditional on a legal seven-card Basic opening.
 * This is a category/hypergeometric upper bound, not a playable policy.
 *
 * Adds one Basic Mega Floette ex to rank 1 by replacing a non-Basic,
 * non-Energy card. Keeps 11 Psychic Energy, 14 other Basics, four each
 * Fog Crystal/Mysterious Treasure, one Quick Ball, one Hisuian Heavy Ball.
 *
 * All Mysterious Treasure / Quick Ball discard costs are assumed payable at
 * no opportunity cost. No Item or search locks, Prize-choice contention,
 * hand sequencing, Bench limits, evolution/attachment limits, or opponent
 * actions are modeled. No Forest Seal Stone, further card draw, or other
 * line is credited.
 *
 * @returns {object} Exact rational event counts split by physical location.
 */
function countFloetteTurn1Routes() {
  const sizes=[1,14,11,4,4,1,1,24];
  const denominator=(choose(60,7)-choose(45,7))*53n*52n;
  const counts={inHand:0n,deckSearch:0n,prizeRescue:0n};
  for(let f=0;f<=1;f++)for(let b=0;b<=7;b++)
    for(let e=0;e<=7;e++)for(let g=0;g<=4;g++)
      for(let m=0;m<=4;m++)for(let q=0;q<=1;q++)
        for(let h=0;h<=1;h++) {
          const o=7-f-b-e-g-m-q-h;
          if(f+b<1||o<0||o>24)continue;
          const opening=[f,b,e,g,m,q,h,o];
          let combinations=1n;
          for(let i=0;i<sizes.length;i++)
            combinations*=choose(sizes[i],opening[i]);
          for(let next=0;next<sizes.length;next++) {
            const remaining=sizes[next]-opening[next];
            if(remaining===0)continue;
            const eight=opening.slice();
            eight[next]++;
            const [f8,,e8,g8,m8,q8,h8]=eight;
            const physicalWays=combinations*BigInt(remaining);
            if(f8===1) {
              if(e8>=1||g8>=1) counts.inHand+=physicalWays*52n;
              continue;
            }
            // Floette is not in first eight; conditional on that, it
            // is among six Prizes in 6/52 outcomes and in deck in 46/52.
            const anyPokemonSearcher=g8>=1||m8>=1||q8>=1;
            const directEnergy=e8>=1;
            const dualSearchEnergy=g8>=2||(g8>=1&&(m8+q8)>=1);
            if(anyPokemonSearcher&&(directEnergy||dualSearchEnergy))
              counts.deckSearch+=physicalWays*46n;
            if(h8>=1&&(directEnergy||g8>=1))
              counts.prizeRescue+=physicalWays*6n;
          }
        }
  const total=counts.inHand+counts.deckSearch+counts.prizeRescue;
  /** @param {bigint} amount */
  const result=amount=>{
    const d=gcd(amount,denominator);
    return {fraction:String(amount/d)+'/'+String(denominator/d),
      probability:Number(amount)/Number(denominator)};
  };
  return {
    kind:'hypothetical-singleton-Floette-ideal-turn1-access',
    openingCategories:{floette:1,otherBasics:14,psychicEnergy:11,
      fogCrystal:4,mysteriousTreasure:4,quickBall:1,hisuianHeavyBall:1,other:24},
    directInHand:result(counts.inHand),
    floetteInDeckViaSearch:result(counts.deckSearch),
    prizedFloetteViaHeavyBall:result(counts.prizeRescue),
    total:result(total),
    denominator:String(denominator),
    limit:'This is an idealized no-discard-cost, no-item-lock first-turn access event; not a qualified attack-ready rate or real source-game simulation.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(countFloetteTurn1Routes(),null,2)+'\n');
module.exports={countFloetteTurn1Routes};
