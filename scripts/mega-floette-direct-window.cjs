'use strict';

/**
 * Exact, attachment-tempo-aware direct resource window for a hypothetical
 * one-Mega Floette ex swap into the published champion Shadow Rider 60.
 *
 * No trainers, search, draw abilities, Energy recovery, mulligan bonus draws,
 * attacks or game-state counterplay are credited. The new Basic replaces one
 * non-Basic, yielding 1 Floette, 14 other Basics, 11 Psychic Energy and
 * 34 remaining non-Basic / non-Energy cards.
 *
 * Initial seven cards must contain any Basic Pokémon. Six Prize cards are
 * then placed before three normal turn draws. Marginally, conditional on the
 * seven, those three draws are uniformly ordered distinct cards among the
 * remaining 53, independently of the hidden Prize composition.
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if (!Number.isInteger(n) || !Number.isInteger(k)) throw new TypeError('integer');
  if(k<0||k>n) return 0n;
  let out=1n;
  for(let i=1;i<=k;i++)out=out*BigInt(n-i+1)/BigInt(i);
  return out;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b) {
  while(b!==0n)[a,b]=[b,a%b];
  return a;
}

/** @param {bigint} a @param {bigint} b @returns {string} */
function fraction(a,b) {
  const d=gcd(a,b);
  return String(a/d)+'/'+String(b/d);
}

/**
 * A valid-opener-conditional count of direct cards seen by turn three.
 * Requirement for the stricter event: Floette and >=1 Energy available
 * by first ordinary draw; >=2 Energy by second; >=3 Energy by third.
 * This is necessary, though insufficient, for three manual attachments to
 * Floette without another Energy accelerator or card search.
 * @returns {{strictFraction:string,looseFraction:string,strictProbability:number,
 * looseProbability:number,validOpenerProbability:number,
 * numeratorStrict:string,numeratorLoose:string,denominator:string}}
 */
function countFloetteDirectWindow() {
  const base=[1,14,11,34]; // Floette, other Basics, Psychic Energy, other
  const denominator=(choose(60,7)-choose(45,7))*53n*52n*51n;
  let strict=0n, loose=0n;
  for(let f=0;f<=1;f++)for(let b=0;b<=7;b++)for(let e=0;e<=7;e++) {
    const o=7-f-b-e;
    if(f+b<1||o<0||o>34)continue;
    const waysOpening=choose(1,f)*choose(14,b)*choose(11,e)*choose(34,o);
    const remaining=[base[0]-f,base[1]-b,base[2]-e,base[3]-o];
    for(let a=0;a<4;a++)for(let c=0;c<4;c++)for(let g=0;g<4;g++) {
      const left=remaining.slice();
      let ways=waysOpening;
      for(const category of [a,c,g]) {
        if(left[category]===0) {ways=0n;break;}
        ways*=BigInt(left[category]--);
      }
      if(ways===0n)continue;
      const f8=f+Number(a===0),e8=e+Number(a===2);
      const e9=e8+Number(c===2);
      const f10=f8+Number(c===0)+Number(g===0);
      const e10=e9+Number(g===2);
      if(f10>=1&&e10>=3)loose+=ways;
      if(f8>=1&&e8>=1&&e9>=2&&e10>=3)strict+=ways;
    }
  }
  return {
    strictFraction:fraction(strict,denominator),
    looseFraction:fraction(loose,denominator),
    strictProbability:Number(strict)/Number(denominator),
    looseProbability:Number(loose)/Number(denominator),
    validOpenerProbability:1-Number(choose(45,7))/Number(choose(60,7)),
    numeratorStrict:String(strict),
    numeratorLoose:String(loose),
    denominator:String(denominator)
  };
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(countFloetteDirectWindow(),null,2)+'\n');
}
module.exports={choose,gcd,fraction,countFloetteDirectWindow};
