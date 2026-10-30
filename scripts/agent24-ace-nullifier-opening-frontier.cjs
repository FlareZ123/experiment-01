'use strict';

const assert=require('node:assert/strict');

const DECK=60,OPENING=7,PRIZES=6,DRAW_AFTER_PRIZES=1;
const VERSION='agent24-ace-nullifier-first8-cond-valid-exact-v1';

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&Number.isSafeInteger(k)&&n>=0);
  if(k<0||k>n)return 0n;
  const m=Math.min(k,n-k);
  let v=1n;
  for(let i=1;i<=m;i++)v=v*BigInt(n-m+i)/BigInt(i);
  return v;
}
/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b){
  while(b!==0n)[a,b]=[b,a%b];
  return a;
}

/**
 * Conditional on a nonmulligan opening seven (at least one Basic),
 * exact chance of owning the chosen Basic in the opening seven or first
 * ordinary turn draw, with the Tool also present when required.
 *
 * The six face-down Prizes are dealt between the seven and draw. A single
 * uniform eighth from remaining physical 53 is still an exact marginal.
 * No Item/Supporter search, mulligan bonus, Bench cost, play timing,
 * opponent action, ability suppression, prizes seen or tactical value.
 *
 * @param {{lockCopies:number,totalBasics:number,toolCopies?:number,requiresTool?:boolean}} p
 * @returns {object}
 */
function directFirstEight(p){
  const G=p.lockCopies,B=p.totalBasics-p.lockCopies,
    T=p.toolCopies??0,O=DECK-p.totalBasics-T;
  for(const n of [G,B,T,O,p.totalBasics])
    assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.ok(p.totalBasics>=1&&p.totalBasics<=DECK);
  assert.ok(G+B+T+O===DECK);
  let valid=0n,hit=0n;
  for(let g=0;g<=Math.min(G,OPENING);g++)
    for(let b=0;b<=Math.min(B,OPENING-g);b++)
      for(let t=0;t<=Math.min(T,OPENING-g-b);t++){
        const o=OPENING-g-b-t;
        if(o<0||o>O||g+b===0)continue;
        const count=choose(G,g)*choose(B,b)*choose(T,t)*choose(O,o);
        valid+=count*BigInt(DECK-OPENING);
        let good=0;
        if(p.requiresTool===true){
          if(g>0&&t>0)good=DECK-OPENING;
          else if(g>0)good=T-t;
          else if(t>0)good=G-g;
        }else good=g>0?DECK-OPENING:G-g;
        hit+=count*BigInt(good);
      }
  assert.ok(valid>0n);
  const factor=gcd(hit,valid);
  const reduced={numerator:(hit/factor).toString(),
    denominator:(valid/factor).toString()};
  return {schema:VERSION,deckCards:DECK,openingCards:OPENING,
    prizeCards:PRIZES,firstOrdinaryDraws:DRAW_AFTER_PRIZES,
    lockCopies:G,totalBasics:p.totalBasics,
    toolCopies:T,requiresTool:p.requiresTool===true,
    validSevenProbability:Number(valid)/
      (Number(choose(DECK,OPENING))*(DECK-OPENING)),
    conditionedDirectOpportunity:Number(hit)/Number(valid),
    exactProbability:reduced};
}

/** Equal Basic count; compare single-slot Spiritomb to Tool-dependent Genesect. */
function main(){
  const scenarios=[1,2,3,4].map(lockCopies=>({
    lockCopies,
    spiritomb:directFirstEight({lockCopies,totalBasics:14}),
    genesectFourCompatibleTools:directFirstEight({
      lockCopies,totalBasics:14,toolCopies:4,requiresTool:true
    })
  }));
  return {schema:VERSION,scenarios,competitiveQualifiedGames:0,
    caveat:'Hypothetical 60s with 14 Basics and four other Tools, not nominated decks. All cards are exchangeably shuffled; this is direct access without search or tactical ability exposure.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={VERSION,choose,directFirstEight,main};
