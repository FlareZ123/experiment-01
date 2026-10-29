'use strict';

const assert=require('node:assert/strict');

/** Exact integer binomial coefficient for a nonnegative population. */
function choose(n,k){
  assert.ok(Number.isSafeInteger(n)&&n>=0&&
    Number.isSafeInteger(k)&&k>=0);
  if(k>n)return 0n;
  let c=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    c=c*BigInt(n-i+1)/BigInt(i);
  return c;
}

/**
 * Uniform opening hand, conditional on at least one Basic Pokémon.
 * Threat describes a card's externally verified category, not a win.
 * @param {{totalCards:number,handCards:number,basics:number,threatBasics:number}} p
 */
function starterBounds({totalCards=60,handCards=7,basics,threatBasics}){
  assert.ok(Number.isSafeInteger(totalCards)&&totalCards>0&&
    Number.isSafeInteger(handCards)&&handCards>0&&handCards<=totalCards&&
    Number.isSafeInteger(basics)&&basics>0&&basics<=totalCards&&
    Number.isSafeInteger(threatBasics)&&threatBasics>=0&&
    threatBasics<=basics);
  const sample=choose(totalCards,handCards);
  const valid=sample-choose(totalCards-basics,handCards);
  assert.ok(valid>0n);
  const anyThreat=sample-choose(totalCards-threatBasics,handCards);
  const forced=choose(totalCards-(basics-threatBasics),handCards)-
    choose(totalCards-basics,handCards);
  const both=anyThreat-forced;
  const safeOnly=valid-anyThreat;
  assert.equal(forced+both+safeOnly,valid);
  const p=x=>Number(x)/Number(valid);
  return {validSevenNumerator:valid.toString(),
    denominator:sample.toString(),
    anyThreat:p(anyThreat),forcedThreat:p(forced),
    optionalThreat:p(both),safeOnly:p(safeOnly)};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(starterBounds({
    totalCards:60,handCards:7,basics:14,threatBasics:8
  }),null,2)+'\n');
module.exports={choose,starterBounds};
