'use strict';
const {choose}=require('./agent43-choose-exact.cjs');

/**
 * Exact direct Wally/Garbotoxin window. Opening seven Basic-valid, six
 * uniformly random Prizes, one mandatory draw, no other card effects.
 * @param {{wally:number,trubbish:number,tools:number,garbodor:number,otherBasics:number,otherCards:number}} x
 * @returns {{conditional:number,numerator:bigint,denominator:bigint}}
 */
function naturalWindow(x){
  const n=[x.wally,x.trubbish,x.tools,x.garbodor,x.otherBasics,x.otherCards];
  if(n.some(v=>!Number.isInteger(v)||v<0)||n.reduce((a,b)=>a+b,0)!==60)
    throw new RangeError('Complete valid 60-card partition required');
  const valid=choose(60,7)-choose(60-n[1]-n[4],7);
  const prize=choose(52,6);
  let numerator=0n;
  for(let w=0;w<=n[0];w++)
  for(let t=0;t<=Math.min(2,n[1]);t++)
  for(let u=0;u<=Math.min(6,n[2]);u++)
  for(let g=0;g<=Math.min(2,n[3]);g++)
  for(let b=0;b<=Math.min(7,n[4]);b++){
    const o=7-w-t-u-g-b, hand=[w,t,u,g,b,o];
    if(o<0||o>n[5]||t+b===0)continue;
    const ways=hand.reduce((a,k,i)=>a*choose(n[i],k),1n);
    for(let i=0;i<6;i++){
      const remaining=n[i]-hand[i];
      if(remaining<=0)continue;
      const h=hand.slice();h[i]++;
      const garbLeft=n[3]-h[3];
      if(h[0]===0||h[1]===0||h[2]===0||garbLeft===0)continue;
      numerator+=ways*BigInt(remaining)*
        (prize-choose(52-garbLeft,6-garbLeft));
    }
  }
  const denominator=valid*53n*prize;
  return {conditional:Number(numerator)/Number(denominator),numerator,denominator};
}
module.exports={naturalWindow};
