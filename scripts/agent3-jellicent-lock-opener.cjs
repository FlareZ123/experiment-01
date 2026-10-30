'use strict';

/**
 * Exact shuffle-without-replacement direct-opening enumeration.
 * Seven initial cards, six Prize cards and one ordinary first-turn draw.
 * A direct Active lock requires opening Frillish, access to Boost Shake by
 * that draw, and at least one searchable Jellicent ex still in the deck.
 * Optional Hood mode also requires Stealthy Hood by that same draw.
 * This models no other draw/search, turn order, counterplay or match wins.
 *
 * @typedef {{frillish?:number,boostShake?:number,jellicent?:number,
 *   stealthyHood?:number,totalBasics?:number,requireHood?:boolean}} Options
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n)return 0n;
  let count=1n;
  for(let i=1;i<=Math.min(k,n-k);i++){
    count=count*BigInt(n-i+1)/BigInt(i);
  }
  return count;
}

/** @param {number[]} entries @param {number} index @param {number} remaining @param {number[]} current @param {function(number[]):void} visit */
function enumerate(entries,index,remaining,current,visit){
  if(index===entries.length-1){
    if(remaining<=entries[index])visit([...current,remaining]);
    return;
  }
  for(let n=0;n<=Math.min(entries[index],remaining);n++){
    current.push(n);
    enumerate(entries,index+1,remaining-n,current,visit);
    current.pop();
  }
}

/**
 * @param {Options} [options]
 * @returns {{unconditional:number,conditionalValidBasic:number,
 *   numerator:bigint,denominator:bigint,validOpenerDenominator:bigint}}
 */
function exactDirectLock(options={}){
  const f=options.frillish??4,b=options.boostShake??4,
    j=options.jellicent??4,h=options.stealthyHood??0,
    basics=options.totalBasics??12,requireHood=options.requireHood===true;
  for(const n of [f,b,j,h]){
    if(!Number.isInteger(n)||n<0||n>4)throw new RangeError('Copy counts must be 0..4');
  }
  if(!Number.isInteger(basics)||basics<f||basics>60-b-j-h)
    throw new RangeError('Total Basics inconsistent with deck construction');
  const sizes=[f,b,j,h,60-f-b-j-h];
  const prizes=choose(52,6),drawAndPrize=53n*prizes;
  const denominator=choose(60,7)*drawAndPrize;
  const validOpenerDenominator=(choose(60,7)-choose(60-basics,7))*drawAndPrize;
  let numerator=0n;
  enumerate(sizes,0,7,[],hand=>{
    if(hand[0]===0)return;
    const handWays=hand.reduce((acc,n,i)=>acc*choose(sizes[i],n),1n);
    for(let drawType=0;drawType<sizes.length;drawType++){
      const remain=sizes[drawType]-hand[drawType];
      if(remain===0)continue;
      const boosted=hand[1]+Number(drawType===1)>0;
      const hooded=hand[3]+Number(drawType===3)>0;
      if(!boosted||(requireHood&&!hooded))continue;
      const jLeft=j-hand[2]-Number(drawType===2);
      if(jLeft===0)continue;
      const prizedAll=choose(52-jLeft,6-jLeft);
      numerator+=handWays*BigInt(remain)*(prizes-prizedAll);
    }
  });
  return {unconditional:Number(numerator)/Number(denominator),
    conditionalValidBasic:Number(numerator)/Number(validOpenerDenominator),
    numerator,denominator,validOpenerDenominator};
}

module.exports={choose,exactDirectLock};


/**
 * Going-second first-turn protected-lock opening. Arven from hand may fetch
 * one Boost Shake Item and one Stealthy Hood Tool from the current deck. Any
 * pieces already in hand need no search. With no held Arven, both pieces must
 * be held directly. Requires a searchable Jellicent ex for Boost Shake.
 * Inclusion-exclusion counts exact six-Prize availability.
 * Ignores opposing first-turn disruption, Supporter lock and other searches.
 *
 * @param {Options & {arven?:number}} [options]
 * @returns {ReturnType<typeof exactDirectLock>}
 */
function exactArvenProtectedLock(options={}){
  const f=options.frillish??4,b=options.boostShake??4,
    j=options.jellicent??4,h=options.stealthyHood??4,
    a=options.arven??4,basics=options.totalBasics??12;
  for(const n of [f,b,j,h,a]){
    if(!Number.isInteger(n)||n<0||n>4)throw new RangeError('Copy counts must be 0..4');
  }
  if(!Number.isInteger(basics)||basics<f||basics>60-b-j-h-a)
    throw new RangeError('Total Basics inconsistent with deck construction');
  const sizes=[f,b,j,h,a,60-f-b-j-h-a];
  const prizes=choose(52,6),drawAndPrize=53n*prizes;
  const denominator=choose(60,7)*drawAndPrize;
  const validOpenerDenominator=(choose(60,7)-choose(60-basics,7))*drawAndPrize;
  let numerator=0n;
  enumerate(sizes,0,7,[],hand=>{
    if(hand[0]===0)return;
    const handWays=hand.reduce((acc,n,i)=>acc*choose(sizes[i],n),1n);
    for(let drawType=0;drawType<sizes.length;drawType++){
      const remain=sizes[drawType]-hand[drawType];
      if(remain===0)continue;
      const visible=index=>hand[index]+Number(drawType===index);
      if(visible(4)===0&&(visible(1)===0||visible(3)===0))continue;
      const left=index=>sizes[index]-visible(index);
      const required=[left(2)];
      if(visible(1)===0)required.push(left(1));
      if(visible(3)===0)required.push(left(3));
      let validPrizes=0n;
      for(let mask=0;mask<(1<<required.length);mask++){
        let taken=0,parity=0;
        for(let k=0;k<required.length;k++){
          if(mask&(1<<k)){taken+=required[k];parity++;}
        }
        const ways=choose(52-taken,6-taken);
        validPrizes+=parity%2===0?ways:-ways;
      }
      numerator+=handWays*BigInt(remain)*validPrizes;
    }
  });
  return {unconditional:Number(numerator)/Number(denominator),
    conditionalValidBasic:Number(numerator)/Number(validOpenerDenominator),
    numerator,denominator,validOpenerDenominator};
}
module.exports.exactArvenProtectedLock=exactArvenProtectedLock;

/**
 * Going-first Carmine redraw route. Hood held before Carmine is attached
 * before discarding the hand. Every held Boost Shake is discarded by Carmine,
 * so a further Shake must be drawn from the remaining deck's five new cards.
 * The resulting Jellicent must still be searchable after Prizes and redraw.
 * Assumes an opening Active Frillish and no other search/draw or counterplay.
 *
 * @param {Options & {carmine?:number}} [options]
 * @returns {ReturnType<typeof exactDirectLock>}
 */
function exactCarmineProtectedLock(options={}){
  const f=options.frillish??4,b=options.boostShake??4,
    j=options.jellicent??4,h=options.stealthyHood??4,
    c=options.carmine??4,basics=options.totalBasics??12;
  for(const n of [f,b,j,h,c]){
    if(!Number.isInteger(n)||n<0||n>4)throw new RangeError('Copy counts must be 0..4');
  }
  if(!Number.isInteger(basics)||basics<f||basics>60-b-j-h-c)
    throw new RangeError('Total Basics inconsistent with deck construction');
  const sizes=[f,b,j,h,c,60-f-b-j-h-c];
  const sixPrizes=choose(52,6),fiveRedraw=choose(52,5),
    sixPrizesAfterFiveRedraw=choose(47,6);
  const resample=fiveRedraw*sixPrizesAfterFiveRedraw;
  const allPrizeAndRedraw=sixPrizes*resample;
  const denominator=choose(60,7)*53n*allPrizeAndRedraw;
  const validOpenerDenominator=(choose(60,7)-choose(60-basics,7))
    *53n*allPrizeAndRedraw;
  let numerator=0n;
  enumerate(sizes,0,7,[],hand=>{
    if(hand[0]===0)return;
    const handWays=hand.reduce((acc,n,i)=>acc*choose(sizes[i],n),1n);
    for(let drawType=0;drawType<sizes.length;drawType++){
      const drawCount=sizes[drawType]-hand[drawType];
      if(drawCount===0)continue;
      const visible=index=>hand[index]+Number(drawType===index);
      const left=sizes.map((n,i)=>n-visible(i));
      const heldHood=visible(3)>0,heldShake=visible(1)>0;
      if(heldHood&&heldShake){
        const jLeft=left[2];
        if(jLeft>0){
          const prizeValid=sixPrizes-choose(52-jLeft,6-jLeft);
          numerator+=handWays*BigInt(drawCount)*prizeValid*resample;
        }
      }else if(visible(4)>0){
        // Exchangeability: sample redraw five before the six Prize cards.
        // It gives the same joint distribution for two disjoint card groups.
        enumerate(left,0,5,[],redrawn=>{
          if(redrawn[1]===0||(!heldHood&&redrawn[3]===0))return;
          const jLeft=left[2]-redrawn[2];
          if(jLeft===0)return;
          const redrawWays=redrawn.reduce((acc,n,i)=>acc*choose(left[i],n),1n);
          const prizeValid=sixPrizesAfterFiveRedraw-
            choose(47-jLeft,6-jLeft);
          numerator+=handWays*BigInt(drawCount)*redrawWays*prizeValid*sixPrizes;
        });
      }
    }
  });
  return {unconditional:Number(numerator)/Number(denominator),
    conditionalValidBasic:Number(numerator)/Number(validOpenerDenominator),
    numerator,denominator,validOpenerDenominator};
}
module.exports.exactCarmineProtectedLock=exactCarmineProtectedLock;
