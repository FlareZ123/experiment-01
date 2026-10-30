'use strict';

/**
 * Rank26 original source access to its only Canceling Cologne before first
 * attack against Ability-based blockers (opponent's Active Iron Thorns ex or
 * Mimikyu). Initial seven source Basic-valid, one ordinary first-turn draw,
 * six Prize cards; no extra cards. Its authentic 60 has 12 Basics,
 * 4 Trainers' Mail, 3 Order Pad and 1 Canceling Cologne.
 *
 * When the Cologne is not already seen, remaining card is in the deck with
 * probability 46/52. Each initially held Mail may view a freshly shuffled
 * 4/46-card sample, hitting the one Cologne with probability 4/46;
 * each held Order Pad is a 1/2 independent heads searchable copy. These
 * are opportunity probes, not a native player policy, and assume each such
 * Item is spent searching for Cologne, excluding Mail-to-Pad chains and all
 * other draw/search. A protected player with a Bench can additionally be
 * gusted by Counter Catcher; that alternative is not modeled here.
 */

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isInteger(n)||!Number.isInteger(k)||k<0||k>n)return 0n;
  let out=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    out=out*BigInt(n-i+1)/BigInt(i);
  return out;
}

/**
 * @param {number} mailCopies
 * @param {number} orderPadCopies
 * @returns {{direct:number,withMail:number,withMailAndOrderPad:number,
 *   validSourceSeven:number,denominator:bigint,
 *   numerators:{direct:bigint,withMail:bigint,withPad:bigint}}}
 */
function exactCologneAccess(mailCopies=4,orderPadCopies=3){
  if(![mailCopies,orderPadCopies].every(Number.isInteger)||
    mailCopies<0||mailCopies>4||orderPadCopies<0||
    orderPadCopies>4)
    throw new RangeError('Mail and Order Pad copies must be 0..4');
  // Source Basic12, held Mail, held Order Pad, target Cologne, others.
  const sizes=[12,mailCopies,orderPadCopies,1,47-mailCopies-orderPadCopies];
  const scale=52n*46n**4n*2n**4n;
  const denom=(choose(60,7)-choose(48,7))*53n*scale;
  let direct=0n,mail=0n,pad=0n;
  for(let b=1;b<=7;b++)for(let m=0;m<=Math.min(mailCopies,7-b);m++)
  for(let o=0;o<=Math.min(orderPadCopies,7-b-m);o++)
  for(let c=0;c<=1;c++){
    const other=7-b-m-o-c;
    if(other<0||other>sizes[4])continue;
    const hand=[b,m,o,c,other];
    const ways=hand.reduce((w,n,i)=>w*choose(sizes[i],n),1n);
    if(!ways)continue;
    for(let draw=0;draw<5;draw++){
      const drawWays=sizes[draw]-hand[draw];
      if(!drawWays)continue;
      const drawnTarget=c+Number(draw===3)>0;
      const seenMail=m+Number(draw===1);
      const seenPad=o+Number(draw===2);
      const full=scale;
      const mailHit=46n*(46n**4n-42n**BigInt(seenMail)*
        46n**BigInt(4-seenMail))*2n**4n;
      const unionHit=46n*(46n**4n*2n**4n-
        42n**BigInt(seenMail)*46n**BigInt(4-seenMail)*
        2n**BigInt(4-seenPad));
      const weight=ways*BigInt(drawWays);
      direct+=weight*(drawnTarget?full:0n);
      mail+=weight*(drawnTarget?full:mailHit);
      pad+=weight*(drawnTarget?full:unionHit);
    }
  }
  return {
    direct:Number(direct)/Number(denom),
    withMail:Number(mail)/Number(denom),
    withMailAndOrderPad:Number(pad)/Number(denom),
    validSourceSeven:Number(choose(60,7)-choose(48,7))/
      Number(choose(60,7)),
    denominator:denom,
    numerators:{direct,withMail:mail,withPad:pad}
  };
}

module.exports={choose,exactCologneAccess};
