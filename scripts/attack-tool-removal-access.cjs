'use strict';

/** @typedef {{numerator: bigint, denominator: bigint}} Fraction */
/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b) {
  while(b!==0n) [a,b]=[b,a%b];
  return a;
}
/** @param {bigint|number} n @param {bigint|number} d @returns {Fraction} */
function fraction(n,d=1n) {
  n=BigInt(n); d=BigInt(d);
  if(d===0n) throw new RangeError('zero denominator');
  if(d<0n) [n,d]=[-n,-d];
  const g=gcd(n<0n?-n:n,d);
  return {numerator:n/g,denominator:d/g};
}
/** @param {Fraction} a @param {Fraction} b @returns {Fraction} */
function plus(a,b) {
  return fraction(a.numerator*b.denominator+b.numerator*a.denominator,a.denominator*b.denominator);
}
/** @param {Fraction} a @param {Fraction} b @returns {Fraction} */
function minus(a,b) {
  return fraction(a.numerator*b.denominator-b.numerator*a.denominator,a.denominator*b.denominator);
}
/** @param {Fraction} a @param {Fraction} b @returns {Fraction} */
function times(a,b) {
  return fraction(a.numerator*b.numerator,a.denominator*b.denominator);
}
/** @param {Fraction} a @param {Fraction} b @returns {Fraction} */
function over(a,b) {
  return fraction(a.numerator*b.denominator,a.denominator*b.numerator);
}
/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if(k<0||k>n) return 0n;
  let result=1n;
  for(let i=1;i<=Math.min(k,n-k);i++) result=result*BigInt(n+1-i)/BigInt(i);
  return result;
}
/** @param {number} basics @returns {Fraction} */
function validSeven(basics) {
  return minus(fraction(1),fraction(choose(60-basics,7),choose(60,7)));
}
/**
 * Direct physical eight-card opportunity for a hypothetical 60 with 18 Basics
 * (one Rotom), six Energy, one Field Blower, and 35 other cards.
 * A valid first seven must contain at least one Basic.
 * Does not model search, Prized identity, bench/active, retreat or attack.
 * @returns {{rotomEnergy:Fraction,blower:Fraction,intersection:Fraction,
 *   either:Fraction,originalTwoBlower:Fraction}}
 */
function firstReplyOpportunities() {
  const one=fraction(1);
  const r7=times(fraction(7,60),minus(one,fraction(choose(53,7),choose(59,7))));
  const r8=times(fraction(1,60),fraction(
    choose(59,7)-choose(53,7)-choose(42,7)+choose(36,7),choose(59,7)));
  const rotom=plus(r7,r8);
  const b7=times(fraction(7,60),minus(one,fraction(choose(41,6),choose(59,6))));
  const b8=times(fraction(1,60),minus(one,fraction(choose(41,7),choose(59,7))));
  const blower=plus(b7,b8);
  const i7=times(fraction(49,60*59),
    minus(one,fraction(choose(52,6),choose(58,6))));
  const i8=times(fraction(7,60*59),fraction(
    choose(58,6)-choose(52,6)-choose(41,6)+choose(35,6),choose(58,6)));
  const intersection=plus(i7,i8);
  const validNew=validSeven(18);
  const validOriginal=validSeven(17);
  const noBlower8=fraction(choose(58,8),choose(60,8));
  const legalNoBlower=minus(one,fraction(choose(41,7),choose(58,7)));
  const original=over(minus(validOriginal,
    times(noBlower8,legalNoBlower)),validOriginal);
  return {
    rotomEnergy:over(rotom,validNew),
    blower:over(blower,validNew),
    intersection:over(intersection,validNew),
    either:over(minus(plus(rotom,blower),intersection),validNew),
    originalTwoBlower:original
  };
}
/** @param {Fraction} x @returns {string} */
function format(x) {
  return String(x.numerator)+'/'+String(x.denominator)+' ('+
    (100*Number(x.numerator)/Number(x.denominator)).toFixed(9)+'%)';
}
if(require.main===module) {
  for(const [k,v] of Object.entries(firstReplyOpportunities())) {
    process.stdout.write(k+': '+format(v)+'\n');
  }
}
module.exports={choose,fraction,plus,minus,times,over,validSeven,
  firstReplyOpportunities,format};
