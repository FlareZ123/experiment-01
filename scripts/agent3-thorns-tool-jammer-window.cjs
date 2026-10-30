'use strict';
const {choose}=require('./agent3-jellicent-lock-opener.cjs');

/**
 * First-turn Tool Jammer hand/Trainers' Mail opportunity against a four-Basic
 * Iron Thorns source. Each held Trainers' Mail can look at a shuffled top four
 * for the single remaining Tool Jammer. The source may play all held Mail.
 * Opponent acts only after the source's ordinary first turn draw, no other
 * draw/search/mulligan bonus. This is a search opportunity, not a policy.
 * @param {number} mailCopies Number of Trainers' Mail copies in the source 60
 * @returns {{unconditional:number,conditionalValidBasic:number}}
 */
function exactJammerFirstTurn(mailCopies){
  if(!Number.isInteger(mailCopies)||mailCopies<0||mailCopies>4)
    throw new RangeError('Mail count must be 0..4');
  const sizes=[4,mailCopies,1,55-mailCopies];
  const pow46=46n**BigInt(mailCopies);
  const outcomeDen=52n*pow46;
  let hits=0n;
  for(let basic=1;basic<=4;basic++){
    for(let mail=0;mail<=mailCopies;mail++){
      for(let jammer=0;jammer<=1;jammer++){
        const other=7-basic-mail-jammer;
        if(other<0||other>sizes[3])continue;
        const hand=[basic,mail,jammer,other];
        const ways=hand.reduce((acc,n,i)=>acc*choose(sizes[i],n),1n);
        for(let d=0;d<4;d++){
          const remain=sizes[d]-hand[d];
          if(remain===0)continue;
          const hasJammer=jammer+Number(d===2)>0;
          const heldMail=mail+Number(d===1);
          let window;
          if(hasJammer)window=outcomeDen;
          else{
            const k=BigInt(heldMail);
            window=46n*(46n**k-42n**k)*(46n**BigInt(mailCopies-heldMail));
          }
          hits+=ways*BigInt(remain)*window;
        }
      }
    }
  }
  const all=choose(60,7)*53n*outcomeDen;
  const valid=(choose(60,7)-choose(56,7))*53n*outcomeDen;
  return {unconditional:Number(hits)/Number(all),
    conditionalValidBasic:Number(hits)/Number(valid)};
}

module.exports={exactJammerFirstTurn};
