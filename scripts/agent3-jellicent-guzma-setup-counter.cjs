'use strict';

/**
 * Exact first-owner-turn access to Guzma, subject to a Basic-valid initial
 * seven and one ordinary draw, from 60 cards. If a candidate already has
 * Active Jellicent + Item/Tool lock and has a second Benched Pokemon,
 * source can potentially use Guzma as its single Supporter to gust that
 * other Pokemon Active. This models only a source-held card, never a
 * native-played Guzma or successful board repositioning.
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n)return 0n;
  let value=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    value=value*BigInt(n-i+1)/BigInt(i);
  return value;
}

/**
 * @param {{sourceBasics:number,guzmaCopies:number}} args
 * @returns {{numerator:bigint,denominator:bigint,
 *   firstTurnGuzmaProbability:number,validOpeningProbability:number}}
 */
function firstTurnGuzma(args){
  const basics=args.sourceBasics,g=args.guzmaCopies;
  if(!Number.isInteger(basics)||basics<1||basics>60||
     !Number.isInteger(g)||g<0||g>4||g>60-basics)
    throw new RangeError('Invalid source 60 composition');
  const valid=choose(60,7)-choose(60-basics,7);
  const noG=(choose(60-g,7)-choose(60-basics-g,7))*
    BigInt(53-g);
  const denominator=valid*53n;
  const numerator=denominator-noG;
  return {
    numerator,denominator,
    firstTurnGuzmaProbability:Number(numerator)/Number(denominator),
    validOpeningProbability:Number(valid)/Number(choose(60,7))
  };
}

module.exports={choose,firstTurnGuzma};
