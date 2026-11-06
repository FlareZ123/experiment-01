/**
 * Exact physical-opening/Prize subset model for a fixed 60-card owner.
 * Counts hands whose only opening Basics are from an explicitly identified
 * group, jointly with a singleton non-Basic escape card in the six Prizes.
 * All copies are individually physical. This is no game-outcome estimator.
 */
'use strict';
const assert = require('node:assert/strict');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.ok(Number.isSafeInteger(k));
  if(k < 0 || k > n) return 0n;
  k=Math.min(k,n-k);
  let result=1n;
  for(let i=1;i<=k;i++) result=result*BigInt(n-k+i)/BigInt(i);
  return result;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b) {
  while(b!==0n) [a,b]=[b,a%b];
  return a;
}

/** @param {bigint} a @param {bigint} b */
function rational(a,b) {
  assert.ok(a>=0n && b>0n);
  const divisor=gcd(a,b);
  return {numerator:(a/divisor).toString(),denominator:(b/divisor).toString()};
}

/**
 * @param {{deckSize:number,basicCount:number,restrictedBasicCount:number,
 *  openingSize:number,prizeCount:number}} spec
 * @returns {{schema:string,validHandCount:string,forcedHandCount:string,
 *  forcedAndEscapePrizedNumerator:string,
 *  forcedAndEscapePrizedDenominator:string,
 *  forcedAmongValid:object,jointAmongValid:object,
 *  singletonEscapePrizedGivenForced:object}}
 */
function forcedStarterEscapePrize(spec) {
  const {deckSize:N,basicCount:B,restrictedBasicCount:T,
    openingSize:H,prizeCount:P}=spec;
  assert.ok([N,B,T,H,P].every(Number.isSafeInteger));
  assert.ok(N>0&&B>=T&&T>0&&B<N&&H>0&&H+P<=N&&P>0);
  assert.ok(N-B>=1,'one distinct non-Basic escape copy is required');
  // The single escape copy is non-Basic. Original physical card is known
  // in deck construction; it can be in hand, deck, or the six Prizes.
  const valid=choose(N,H)-choose(N-B,H);
  let forced=0n,forcedWithEscapeNotHeld=0n;
  for(let k=1;k<=Math.min(T,H);k++) {
    forced+=choose(T,k)*choose(N-B,H-k);
    forcedWithEscapeNotHeld+=choose(T,k)*choose(N-B-1,H-k);
  }
  // If escape is outside the retained starting hand, conditional probability
  // to appear in P random Prize slots among N-H remaining slots is P/(N-H).
  const jointNumerator=forcedWithEscapeNotHeld*BigInt(P);
  const jointDenominator=valid*BigInt(N-H);
  return {
    schema:'agent35-forced-unfundable-basic-singleton-prize-v1',
    validHandCount:valid.toString(),forcedHandCount:forced.toString(),
    forcedAndEscapePrizedNumerator:jointNumerator.toString(),
    forcedAndEscapePrizedDenominator:jointDenominator.toString(),
    forcedAmongValid:rational(forced,valid),
    jointAmongValid:rational(jointNumerator,jointDenominator),
    singletonEscapePrizedGivenForced:
      rational(jointNumerator,forced*BigInt(N-H))
  };
}

const CHAMPION_SPEC=Object.freeze({
  deckSize:60,basicCount:14,restrictedBasicCount:2,
  openingSize:7,prizeCount:6
});

if(require.main===module) {
  const result=forcedStarterEscapePrize(CHAMPION_SPEC);
  process.stdout.write(JSON.stringify({
    ...result,specifiedRestrictedBasics:['Radiant Eternatus','Dialga-GX'],
    singletonEscape:'Guzma',
    scope:'Initial physical deal conditioned on Basic-valid seven only; no opponent behavior or games'
  },null,2)+'\n');
}
module.exports={choose,gcd,rational,forcedStarterEscapePrize,CHAMPION_SPEC};
