'use strict';

/**
 * Exact first-owner-turn availability for two simultaneously protective
 * pieces: Active Stage-1 Jellicent ex, attached Stealthy Hood, Silent Lab.
 *
 * Counts initial 7, single ordinary turn draw, six uniformly random Prizes,
 * and 12 initial Basic Pokémon including four Frillish. Frillish must be
 * held in opening 7 and chosen Active. Jellicent ex must remain searchable
 * in deck. The model permits first-turn Boost Shake or, when going second,
 * Wally, Arven or Guzma & Hala; it permits only one Supporter per turn.
 * Boost Shake always ends the turn. Arven can search Boost (Item) and Hood
 * (Tool), with Lab directly in hand. Guzma & Hala can search Lab (Stadium)
 * and Hood (Tool), with Boost directly in hand and two cards presumed
 * disposable. Wally evolves Frillish while Hood and Lab must be directly
 * available. Future turns, counterplay, actual Supporter payment, opponent
 * mulligans and further search are excluded. These are opening opportunities,
 * never game results.
 *
 * @typedef {{frillish?:number,boostShake?:number,jellicent?:number,
 * silentLab?:number,stealthyHood?:number,arven?:number,
 * wally?:number,guzmaHala?:number,totalBasics?:number,
 * goingSecond?:boolean}} Options
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if(!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n)return 0n;
  let count=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)count=count*BigInt(n-i+1)/BigInt(i);
  return count;
}

/** @param {number[]} sizes @param {number} index @param {number} left
 * @param {number[]} current @param {(hand:number[])=>void} visit */
function enumerate(sizes,index,left,current,visit) {
  if(index===sizes.length-1) {
    if(left<=sizes[index])visit([...current,left]);
    return;
  }
  for(let n=0;n<=Math.min(sizes[index],left);n++) {
    current.push(n);
    enumerate(sizes,index+1,left-n,current,visit);
    current.pop();
  }
}

/**
 * @param {Options} [options]
 * @returns {{numerator:bigint,denominator:bigint,
 *   conditionalValidBasic:number,unconditional:number}}
 */
function exactDoubleShield(options={}) {
  const f=options.frillish??4,b=options.boostShake??4,
    j=options.jellicent??4,l=options.silentLab??4,
    h=options.stealthyHood??4,a=options.arven??0,
    w=options.wally??0,g=options.guzmaHala??0;
  const basics=options.totalBasics??12,second=options.goingSecond===true;
  const categories=[f,b,j,l,h,a,w,g];
  if(categories.some(n=>!Number.isInteger(n)||n<0||n>4))
    throw new RangeError('Each card count must be between 0 and 4');
  if(!Number.isInteger(basics)||basics<f||
     basics>60-b-j-l-h-a-w-g)
    throw new RangeError('totalBasics conflicts with deck slots');
  const sizes=[...categories,60-categories.reduce((x,y)=>x+y,0)];
  const fullDenominator=choose(60,7)*53n*choose(52,6);
  const denominator=(choose(60,7)-choose(60-basics,7))*
    53n*choose(52,6);
  let numerator=0n;
  enumerate(sizes,0,7,[],hand=>{
    if(hand[0]===0)return;
    const handWays=hand.reduce((ways,n,i)=>ways*choose(sizes[i],n),1n);
    for(let draw=0;draw<sizes.length;draw++) {
      const drawWays=sizes[draw]-hand[draw];
      if(drawWays===0)continue;
      const held=hand.map((n,i)=>n+Number(i===draw));
      const [,hb,hj,hl,hh,ha,hw,hg]=held;
      const rb=b-hb,rj=j-hj,rl=l-hl,rh=h-hh;
      if(rj===0)continue;
      for(let pj=0;pj<=Math.min(6,rj);pj++) {
        if(pj===rj)continue;
        for(let pb=0;pb<=Math.min(6-pj,rb);pb++) {
          for(let pl=0;pl<=Math.min(6-pj-pb,rl);pl++) {
            for(let ph=0;ph<=Math.min(6-pj-pb-pl,rh);ph++) {
              const po=6-pj-pb-pl-ph;
              const ways=choose(rj,pj)*choose(rb,pb)*
                choose(rl,pl)*choose(rh,ph)*
                choose(52-rj-rb-rl-rh,po);
              if(ways===0n)continue;
              const boostAccess=hb>0||rb>pb;
              const hoodAccess=hh>0||rh>ph;
              const labAccess=hl>0||rl>pl;
              const direct=hb>0&&hl>0&&hh>0;
              const arven=second&&ha>0&&hl>0&&boostAccess&&hoodAccess;
              const wally=second&&hw>0&&hl>0&&hh>0;
              const guzmaHala=second&&hg>0&&hb>0&&
                labAccess&&hoodAccess;
              if(direct||arven||wally||guzmaHala)
                numerator+=handWays*BigInt(drawWays)*ways;
            }
          }
        }
      }
    }
  });
  return {
    numerator,denominator,
    conditionalValidBasic:Number(numerator)/Number(denominator),
    unconditional:Number(numerator)/Number(fullDenominator)
  };
}

module.exports={choose,exactDoubleShield};
