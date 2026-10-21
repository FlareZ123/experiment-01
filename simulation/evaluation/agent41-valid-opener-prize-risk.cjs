'use strict';

/**
 * Exact prize-hit probability for a named set of physical cards, conditioned
 * on a legal opening hand (at least one Basic Pokemon). This faithfully
 * models repeated mulligan shuffles as independent rejected 7-card hands.
 * Prize cards are the next six shuffled positions after an accepted hand.
 *
 * Card-type counts are caller inputs: in particular, a Basic Energy card is
 * NOT a Basic Pokemon for opening-hand legality.
 *
 * @param {number} n
 * @param {number} k
 * @returns {bigint}
 */
function choose(n,k){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k)||
     n<0||k<0)throw new RangeError('choose expects nonnegative integers');
  if(k>n)return 0n;
  k=Math.min(k,n-k);
  let x=1n;
  for(let i=1;i<=k;i++)x=x*BigInt(n-k+i)/BigInt(i);
  return x;
}

/** @param {bigint} numerator @param {bigint} denominator */
function fraction(numerator,denominator){
  if(denominator<=0n)throw new RangeError('Zero or negative denominator');
  return Object.freeze({numerator:numerator.toString(),
    denominator:denominator.toString(),
    decimal:Number(numerator)/Number(denominator)});
}

/**
 * @typedef {object} PrizeProblem
 * @property {number} deckSize
 * @property {number} openingSize
 * @property {number} prizeSize
 * @property {number} basicPokemonCount
 * @property {number} targetCopies Exact physical card copies that all must be Prized.
 * @property {number} targetBasicPokemonCopies How many target copies are Basic Pokemon.
 */

/**
 * Event E: every target physical card lands in the initial face-down Prizes.
 * Event A: opening 7 contains at least one Basic Pokemon.
 *
 * P(E|A) = P(E) P(A|E) / P(A)
 * P(E) = C(prizeSize,targetCopies)/C(deckSize,targetCopies)
 * P(A|E) = 1-C(nonBasicRemaining,openingSize)/C(remaining,openingSize)
 *
 * Keep the rational exact with BigInts until display; never replace this
 * conditioning with unconditional 6/60 heuristics.
 *
 * @param {PrizeProblem} problem
 * @returns {object}
 */
function allTargetCardsPrizedGivenLegalOpening(problem){
  const {
    deckSize:N,openingSize:h,prizeSize:p,basicPokemonCount:B,
    targetCopies:m,targetBasicPokemonCopies:b
  }=problem;
  for(const x of [N,h,p,B,m,b]){
    if(!Number.isSafeInteger(x)||x<0)
      throw new RangeError('Every count must be a nonnegative integer');
  }
  if(N===0||h>=N||p>N-h||B>N||m>N||m>p||b>m||b>B||
     m-b>N-B||N-m<h)
    throw new RangeError('Counts do not describe a possible legal deck');
  const allOpening=choose(N,h);
  const legalOpening=allOpening-choose(N-B,h);
  if(legalOpening===0n)
    throw new RangeError('No legal opening hand exists');
  const remaining=N-m;
  const remainingBasic=B-b;
  const remainingNonbasic=remaining-remainingBasic;
  const conditionalLegalOpening=
    choose(remaining,h)-choose(remainingNonbasic,h);
  const eventCount=choose(p,m);
  const allEventCount=choose(N,m);
  const raw=fraction(eventCount,allEventCount);
  const conditioned=fraction(
    eventCount*conditionalLegalOpening*allOpening,
    allEventCount*choose(remaining,h)*legalOpening
  );
  return Object.freeze({
    schema:'agent41-legal-opening-prize-condition-v1',
    input:Object.freeze({...problem}),
    unconditionalAllPrized:raw,
    allPrizedGivenLegalOpening:conditioned,
    conditionedLineUnavailableProbability:conditioned.decimal,
    modelingLimit:'Only initial positions and legal-opening mulligan conditioning; neither Prize recovery nor alternative wins modeled'
  });
}

module.exports={choose,allTargetCardsPrizedGivenLegalOpening};
