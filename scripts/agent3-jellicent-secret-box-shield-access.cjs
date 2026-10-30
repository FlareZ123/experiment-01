'use strict';

/**
 * Exact first-turn availability of Active Frillish -> Stage 1 Jellicent ex
 * with attached Stealthy Hood and Silent Lab in play. Adds Secret Box ACE
 * SPEC and Arven as legitimate printed search channels.
 *
 * Exact initial seven, six uniform Prize cards, one ordinary turn draw,
 * 12 Basic Pokemon including 4 Frillish; original seven must have Frillish.
 * The player may leave other Basics unbenched in order to retain physical
 * cards for Secret Box's three-card discard. Box can search one Item
 * (Boost Shake), one Tool (Hood), and one Stadium (Silent Lab). Arven can
 * search one Item (Secret Box or Boost) and a Tool (Hood), and can only be
 * played on the first player-owned turn if going second.
 *
 * A player always preserves one of each needed hand-held resource through
 * the search and discards; availability means at least three physical
 * payment cards, without assessing their DCI or future strategic cost.
 * No additional Items, Supporters, bonus mulligan draws, lock response,
 * Energy, Bench development, Prizes taken or wins are modeled.
 *
 * @typedef {{
 *   frillish?:number,jellicent?:number,boostShake?:number,
 *   stealthyHood?:number,silentLab?:number,arven?:number,
 *   secretBox?:number,totalBasics?:number,goingSecond?:boolean
 * }} Options
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n)return 0n;
  let x=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)x=x*BigInt(n-i+1)/BigInt(i);
  return x;
}

/** @param {number[]} sizes @param {number} offset @param {number} left
 * @param {number[]} held @param {(counts:number[])=>void} visit */
function enumerate(sizes,offset,left,held,visit){
  if(offset===sizes.length-1){
    if(left<=sizes[offset])visit([...held,left]);
    return;
  }
  for(let n=0;n<=Math.min(left,sizes[offset]);n++){
    held.push(n);
    enumerate(sizes,offset+1,left-n,held,visit);
    held.pop();
  }
}

/** @param {number[]} remaining @param {number} mask @returns {bigint} */
function validPrizes(remaining,mask){
  for(let i=0;i<5;i++)if((mask&(1<<i))&&remaining[i]===0)return 0n;
  let total=0n;
  let subset=mask;
  for(;;){
    let removed=0,count=0;
    for(let i=0;i<5;i++)if(subset&(1<<i)){
      removed+=remaining[i];count++;
    }
    const ways=choose(52-removed,6-removed);
    total+=(count%2?-ways:ways);
    if(subset===0)break;
    subset=(subset-1)&mask;
  }
  return total;
}

/**
 * @param {Options} [options]
 * @returns {{numerator:bigint,denominator:bigint,unconditional:number,
 *   conditionalValidBasic:number,individualPathProbabilities:Record<string,number>}}
 */
function exactSecretBoxShield(options={}){
  const f=options.frillish??4,j=options.jellicent??4,
    b=options.boostShake??4,h=options.stealthyHood??4,
    l=options.silentLab??4,a=options.arven??0,
    s=options.secretBox??1,basics=options.totalBasics??12,
    second=options.goingSecond===true;
  if([f,j,b,h,l,a].some(n=>!Number.isInteger(n)||n<0||n>4))
    throw new RangeError('Ordinary card count must be 0..4');
  if(!Number.isInteger(s)||s<0||s>1)
    throw new RangeError('ACE SPEC Secret Box copy count must be 0 or 1');
  if(!Number.isInteger(basics)||basics<f||
    basics>60-j-b-h-l-a-s)
    throw new RangeError('totalBasics conflicts with card slots');
  // Frillish, Boost, Hood, Lab, Jellicent, Arven, Box, other.
  const sizes=[f,b,h,l,j,a,s,60-f-j-b-h-l-a-s];
  const denominator=(choose(60,7)-choose(60-basics,7))*53n*choose(52,6);
  const unrestricted=choose(60,7)*53n*choose(52,6);
  let numerator=0n;
  const individually={direct:0n,heldBox:0n,arvenBox:0n,arvenDirect:0n};
  enumerate(sizes,0,7,[],hand=>{
    if(!hand[0])return;
    const handWays=hand.reduce((w,n,i)=>w*choose(sizes[i],n),1n);
    for(let draw=0;draw<sizes.length;draw++){
      const drawWays=sizes[draw]-hand[draw];
      if(!drawWays)continue;
      const held=hand.map((n,i)=>n+Number(draw===i));
      const [,hb,hh,hl,hj,ha,hs]=held;
      // Bitmasks in remaining order: Jellicent, Boost, Hood, Lab, Box.
      const remaining=[j-hj,b-hb,h-hh,l-hl,s-hs];
      const requireJ=1;
      const requireBox=16;
      const requireB=hb?0:2,requireH=hh?0:4,requireL=hl?0:8;
      const fullMask=requireJ|requireB|requireH|requireL;
      const possibilities=[];
      if(hb&&hh&&hl)possibilities.push([requireJ,'direct']);
      if(hs)possibilities.push([fullMask,'heldBox']);
      if(second&&ha&&remaining[4]>0)
        possibilities.push([fullMask|requireBox,'arvenBox']);
      if(second&&ha&&hl)
        possibilities.push([requireJ|requireB|requireH,'arvenDirect']);
      if(possibilities.length===0)continue;
      const weight=handWays*BigInt(drawWays);
      for(const [mask,name] of possibilities)
        individually[name]+=weight*validPrizes(remaining,mask);
      // Reduce redundant sufficient-event masks; smaller masks dominate.
      const minimal=[];
      for(const [mask] of possibilities.sort((x,y)=>
        x[0].toString(2).replace(/0/g,'').length-
        y[0].toString(2).replace(/0/g,'').length)){
        if(!minimal.some(other=>(mask&other)===other))minimal.push(mask);
      }
      let prizeWays=0n;
      for(let combo=1;combo<(1<<minimal.length);combo++){
        let mask=0,terms=0;
        for(let i=0;i<minimal.length;i++)if(combo&(1<<i)){
          mask|=minimal[i];terms++;
        }
        const count=validPrizes(remaining,mask);
        prizeWays+=terms%2?count:-count;
      }
      numerator+=weight*prizeWays;
    }
  });
  return {
    numerator,denominator,
    unconditional:Number(numerator)/Number(unrestricted),
    conditionalValidBasic:Number(numerator)/Number(denominator),
    individualPathProbabilities:Object.fromEntries(
      Object.entries(individually).map(([k,v])=>
        [k,Number(v)/Number(denominator)])
    )
  };
}

module.exports={choose,validPrizes,exactSecretBoxShield};
