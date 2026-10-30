'use strict';

/**
 * Exact original Aichi rank-11 Mega Absol ex source-first Energy availability.
 * The authenticated 60 has 3 Basic Mega Absol ex, 8 other Basics,
 * 4 Professor's Letter, 8 Basic Darkness Energy, 37 other cards.
 * Source opening seven conditioned containing a Basic, then its first
 * ordinary turn draw and six uniform Prize cards. It can play any Letters
 * from hand before a candidate Jellicent Item lock on the next turn.
 * One Letter searches up to 2 Basic Darkness from the still-visible deck.
 *
 * Outcomes concern available Energy card counts, not actual attachments,
 * guaranteed attack, energy movement, selected source actions, clock, or
 * qualified match results. The source must preserve the found Energy and
 * attach it over later turns.
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n)return 0n;
  let a=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)a=a*BigInt(n-i+1)/BigInt(i);
  return a;
}

/** @param {number[]} sizes @param {number} p @param {number} left
 * @param {number[]} current @param {(hand:number[])=>void} visit */
function enumerate(sizes,p,left,current,visit){
  if(p===sizes.length-1){
    if(left<=sizes[p])visit([...current,left]);
    return;
  }
  for(let n=0;n<=Math.min(left,sizes[p]);n++){
    current.push(n);
    enumerate(sizes,p+1,left-n,current,visit);
    current.pop();
  }
}

/**
 * @returns {{denominator:bigint,numerators:Record<string,bigint>,
 * probabilities:Record<string,number>}}
 */
function exactSourcePrelockDark(){
  const sizes=[3,8,4,8,37];
  // valid Basic among 11 Basic source Pokemon, with six Prizes.
  const denominator=(choose(60,7)-choose(49,7))*53n*choose(52,6);
  const keys=['letterSeen','threeDarkAccessible','twoDarkAccessible',
    'threeDarkNaturallyHeld','megaInStartingSeven',
    'megaInStartingSevenAndThreeDarkAccessible','multipleLetters'];
  const numerator=Object.fromEntries(keys.map(k=>[k,0n]));
  enumerate(sizes,0,7,[],hand=>{
    if(hand[0]+hand[1]===0)return;
    const hw=hand.reduce((w,n,i)=>w*choose(sizes[i],n),1n);
    for(let draw=0;draw<sizes.length;draw++){
      const waysDraw=sizes[draw]-hand[draw];
      if(!waysDraw)continue;
      const visible=hand.map((n,i)=>n+Number(draw===i));
      const [, ,letter,dark]=visible;
      const leftDark=8-dark;
      for(let prized=0;prized<=Math.min(6,leftDark);prized++){
        const ways=hw*BigInt(waysDraw)*choose(leftDark,prized)*
          choose(52-leftDark,6-prized);
        if(!ways)continue;
        const accessible=dark+Math.min(letter*2,leftDark-prized);
        const mega=hand[0]>0;
        const hits=[letter>0,accessible>=3,accessible>=2,dark>=3,
          mega,mega&&accessible>=3,letter>=2];
        for(let i=0;i<keys.length;i++)if(hits[i])numerator[keys[i]]+=ways;
      }
    }
  });
  return {denominator,numerators:numerator,
    probabilities:Object.fromEntries(keys.map(k=>
      [k,Number(numerator[k])/Number(denominator)]))};
}

module.exports={choose,exactSourcePrelockDark};
