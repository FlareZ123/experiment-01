'use strict';

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n<0 || k<0 || k>n) return 0n;
  let v=1n;
  for(let i=1;i<=k;i++) v=v*BigInt(n-i+1)/BigInt(i);
  return v;
}

/** @typedef {{numerator: bigint, denominator: bigint}} Fraction */
/** @param {bigint} numerator @param {bigint} denominator @returns {Fraction} */
function fraction(numerator,denominator) {return {numerator,denominator};}
/** @param {Fraction} x @returns {number} */
function approximate(x) {return Number(x.numerator)/Number(x.denominator);}

/**
 * Exact sample space: uniformly shuffle the unchanged source 60, deal seven
 * opening cards, then six Prize cards, all without replacement.
 * Counts: Klefki 1, Telepath Psychic Energy 3, Mewtwo & Mew-GX 2,
 * Duskull 2, other cards 52. These are card-availability events only.
 */
function calculateOpeningBridge() {
  const hands=choose(60,7), prizes=choose(53,6);
  const directKlefkiTelepath=choose(59,6)-choose(56,6);
  const directKlefkiAnyEnergy=choose(59,6)-choose(53,6);
  const validOpening=hands-choose(43,7); // 17 starting-eligible Basics
  let bothAvailable=0n;
  let checkedTelepathHands=0n;
  for(let t=1;t<=3;t++)for(let m=0;m<=2;m++)for(let d=0;d<=2;d++) {
    const other=6-t-m-d;
    const handWays=choose(3,t)*choose(2,m)*choose(2,d)*choose(52,other);
    if(!handWays)continue;
    for(let pm=0;pm<=2-m;pm++)for(let pd=0;pd<=2-d;pd++) {
      const prizeWays=choose(2-m,pm)*choose(2-d,pd)*choose(49+m+d,6-pm-pd);
      checkedTelepathHands+=handWays*prizeWays;
      if(m+2-pm>0 && d+2-pd>0)bothAvailable+=handWays*prizeWays;
    }
  }
  if(checkedTelepathHands!==directKlefkiTelepath*prizes) {
    throw new Error('Hand/prize partition disagrees with opening marginal');
  }
  return {
    validOpening:fraction(validOpening,hands),
    klefkiAndTelepath:fraction(directKlefkiTelepath,hands),
    klefkiAndAnyEnergy:fraction(directKlefkiAnyEnergy,hands),
    telepathMewtwoAndDuskullAvailable:fraction(bothAvailable,hands*prizes),
    availabilityGivenKlefkiTelepath:fraction(bothAvailable,directKlefkiTelepath*prizes),
    bridgeGivenValidOpening:fraction(bothAvailable,validOpening*prizes)
  };
}
if(require.main===module) {
  const result=calculateOpeningBridge();
  for(const [key,value] of Object.entries(result))
    console.log(`${key}: ${(100*approximate(value)).toFixed(8)}% (${value.numerator}/${value.denominator})`);
}
module.exports={choose,approximate,calculateOpeningBridge};
