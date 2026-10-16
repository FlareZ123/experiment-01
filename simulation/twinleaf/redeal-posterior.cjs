'use strict';

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) || n<0)
    throw new RangeError('Invalid combination arguments');
  if (k<0 || k>n) return 0n;
  const m=Math.min(k,n-k);
  let result=1n;
  for(let i=1;i<=m;i++) result=result*BigInt(n-m+i)/BigInt(i);
  return result;
}

/**
 * Conditional replacement Prize counts given fully known previous deck multiset.
 * The draw order must be uniformly random and unknown. Previously Prized cards
 * join the bottom of the deck and cannot be selected as immediate new Prizes.
 * @param {{deckCardNames:string[],previousPrizeNames:string[],targetName:string,
 *   uniformUnknownOrder:boolean}} input
 */
function prizeRedealPosterior(input) {
  if (input?.uniformUnknownOrder!==true)
    throw new Error('Uniformly unknown deck order must be established');
  const {deckCardNames,previousPrizeNames,targetName}=input;
  if (!Array.isArray(deckCardNames)||!Array.isArray(previousPrizeNames)||
      !deckCardNames.every(x=>typeof x==='string'&&x.length>0)||
      !previousPrizeNames.every(x=>typeof x==='string'&&x.length>0)||
      typeof targetName!=='string'||!targetName)
    throw new TypeError('Expected resolved card-name multisets and target');
  const N=deckCardNames.length;
  const n=previousPrizeNames.length;
  if(n>N) throw new RangeError('Too few deck cards for Prize redeal');
  const k=deckCardNames.filter(name=>name===targetName).length;
  const returned=previousPrizeNames.filter(name=>name===targetName).length;
  const denominator=choose(N,n);
  const distribution=[];
  let zero=0n;
  for(let j=Math.max(0,n-(N-k));j<=Math.min(k,n);j++){
    const numerator=choose(k,j)*choose(N-k,n-j);
    if(j===0)zero=numerator;
    distribution.push({copies:j,numerator:numerator.toString(),
      denominator:denominator.toString(),
      probability:Number(numerator)/Number(denominator)});
  }
  return {deckCount:N,replacementCount:n,previouslyInDeck:k,
    returnedToDeckBottom:returned,distribution,
    anyNewPrizeProbability:Number(denominator-zero)/Number(denominator),
    expectedCopies:N?n*k/N:0};
}

module.exports={choose,prizeRedealPosterior};
