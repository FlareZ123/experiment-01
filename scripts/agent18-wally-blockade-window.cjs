'use strict';

const assert = require('node:assert/strict');
const {choose, gcd} = require('./agent18-exeggutor-opener-risk.cjs');

/**
 * Exact paper-setup probability for the deliberately strict, untutored
 * first-turn-going-second Blockade route:
 *   valid Basic initial hand (7) -> draw 1 -> held Exeggcute + Wally +
 *   Jet Energy -> Wally searches an Exeggutor remaining in the deck ->
 *   attach Jet to evolved Exeggutor -> Blockade [C].
 *
 * For a uniformly shuffled physical 60, the first seven precede the six
 * Prizes, which precede the first turn draw. Among any chosen first eight,
 * each of their eight cards is equally likely to be the eighth card; a hand
 * with exactly one Basic has seven valid choices of last card, versus eight
 * with at least two Basics. Uniform six-Prize subsets are then drawn from
 * the 52 cards not in the eight, leaving at least one Stage 1 searchable.
 *
 * Counts are hypothetical sensitivity profiles, not candidate deck swaps.
 * Opponent restrictions, mobility interference and decision policy are
 * excluded. Other legal paths (other Energy or search) are also excluded.
 *
 * @param {{deckSize:number,opening:number,prizes:number,eggs:number,otherBasics:number,wally:number,jet:number,exeggutor:number}} c
 * @returns {{fraction:string,probability:number,percent:number,numerator:string,denominator:string}}
 */
function wallyJetDirectWindow(c) {
  const {deckSize:n,opening:h,prizes:p,eggs:e,otherBasics:b,wally:w,jet:j,exeggutor:x}=c;
  const values=[n,h,p,e,b,w,j,x];
  assert.ok(values.every(v=>Number.isSafeInteger(v)&&v>=0));
  assert.ok(n>h+p+1 && h>=1 && p>=0 && e>0 && b>=0 && w>0 && j>0 && x>0);
  const other=n-e-b-w-j-x;
  assert.ok(other>=0);
  const seen=h+1, left=n-seen;
  const deckSizes=[e,b,w,j,x,other];
  let favorable=0n;
  for(let egg=1;egg<=Math.min(e,seen);egg++)
    for(let wall=1;wall<=Math.min(w,seen-egg);wall++)
      for(let energy=1;energy<=Math.min(j,seen-egg-wall);energy++)
        for(let evo=0;evo<=Math.min(x,seen-egg-wall-energy);evo++)
          for(let basic=0;basic<=Math.min(b,seen-egg-wall-energy-evo);basic++){
            const filler=seen-egg-wall-energy-evo-basic;
            if(filler<0||filler>other)continue;
            const actual=[egg,basic,wall,energy,evo,filler];
            const ways=actual.reduce((a,q,i)=>a*choose(deckSizes[i],q),1n);
            const basicInEight=egg+basic;
            const legalEighthChoices=BigInt(basicInEight===1?h:seen);
            const unobservedEvo=x-evo;
            const prizeWays=choose(left,p);
            const allEvolutionsPrized=unobservedEvo<=p?
              choose(left-unobservedEvo,p-unobservedEvo):0n;
            favorable+=ways*legalEighthChoices*(prizeWays-allEvolutionsPrized);
          }
  // Number of (ordered initial seven, unordered Prizes, eighth-draw)
  // physical allocations with a legal initial seven, after cancelling 7!.
  const validOpeners=choose(n,h)-choose(n-e-b,h);
  const total=validOpeners*BigInt(n-h)*choose(n-h-1,p);
  assert.ok(total>0n && favorable>=0n && favorable<=total);
  const d=gcd(favorable,total);
  return {
    fraction:String(favorable/d)+'/'+String(total/d),
    probability:Number(favorable)/Number(total),
    percent:100*Number(favorable)/Number(total),
    numerator:String(favorable/d),denominator:String(total/d)
  };
}

/** @returns {object} Fixed rank-2-derived v2 physical profile and Wally-slot sensitivities. */
function main() {
  const base={deckSize:60,opening:7,prizes:6,eggs:2,otherBasics:12,jet:3,exeggutor:2};
  return {
    schema:'agent18-first-turn-wally-jet-blockade-direct-window-v1',
    prereq:'going second; Wally legal first-turn Stage1 evolution; one ordinary Energy attachment; no other search',
    table:[1,2,3,4].map(wally=>({wallyCopies:wally,...wallyJetDirectWindow({...base,wally})})),
    meaning:'Exact first-seven-Basic-valid natural-hand + searchable Stage1 physical conjunction only; no candidate 60 constructed, no prediction of actual attacks or wins.',
    competitiveQualifiedGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={wallyJetDirectWindow,main};
