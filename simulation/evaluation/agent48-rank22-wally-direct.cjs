'use strict';
const assert=require('node:assert/strict');
const VERSION='agent48-wally-first-personal-turn-direct-v1';

/** Binomial coefficient; all supported physical deck counts fit safe integers. */
function choose(n,k){
  if(k<0||k>n)return 0;
  let x=1;
  for(let i=1;i<=Math.min(k,n-k);i++)x=x*(n-Math.min(k,n-k)+i)/i;
  return Math.round(x);
}

/**
 * Exact direct first-personal-turn-going-second hand/Prize/draw window for
 * Wally + Trubbish + Float Stone, with a Garbodor still in deck.
 * Initial hand must have at least one Basic (Trubbish or otherBasics).
 * Counts are physical copy counts, not draw or engine policy estimates.
 * @param {{wally:number,trubbish:number,floatStone:number,garbodor:number,
 *   otherBasics:number,other:number}} counts
 * @param {{opening?:number,prizes?:number}} [options]
 */
function exactWallyWindow(counts,options={}){
  const keys=['wally','trubbish','floatStone','garbodor','otherBasics','other'];
  for(const k of keys)assert.ok(Number.isSafeInteger(counts[k])&&counts[k]>=0);
  const size=keys.reduce((s,k)=>s+counts[k],0);
  const h=options.opening??7,p=options.prizes??6;
  assert.ok(Number.isSafeInteger(h)&&Number.isSafeInteger(p)&&
    h>0&&p>=0&&h+p<size);
  const [W,T,F,G,B,O]=keys.map(k=>counts[k]);
  const handDen=choose(size,h),prizeDen=choose(size-h,p);
  let valid=0,event=0;
  for(let w=0;w<=Math.min(W,h);w++)
  for(let t=0;t<=Math.min(T,h-w);t++)
  for(let f=0;f<=Math.min(F,h-w-t);f++)
  for(let g=0;g<=Math.min(G,h-w-t-f);g++)
  for(let b=0;b<=Math.min(B,h-w-t-f-g);b++){
    const o=h-w-t-f-g-b;
    if(o>O||t+b===0)continue;
    const handProbability=choose(W,w)*choose(T,t)*choose(F,f)*
      choose(G,g)*choose(B,b)*choose(O,o)/handDen;
    valid+=handProbability;
    const missing=(w===0)+(t===0)+(f===0);
    if(missing>1)continue;
    const remainsG=G-g,R=size-h,D=R-p;
    for(let prizeG=0;prizeG<=Math.min(remainsG,p);prizeG++){
      const prizeProbability=choose(remainsG,prizeG)*
        choose(R-remainsG,p-prizeG)/prizeDen;
      const deckG=remainsG-prizeG;
      let drawProbability=0;
      if(missing===0){
        if(deckG>=2)drawProbability=1;
        else if(deckG===1)drawProbability=(D-1)/D;
      }else if(deckG>=1){
        const remainingTarget=w===0?W-w:t===0?T-t:F-f;
        drawProbability=remainingTarget*(R-remainsG-p+prizeG)/
          (R-remainsG)/D;
      }
      event+=handProbability*prizeProbability*drawProbability;
    }
  }
  return {version:VERSION,deckSize:size,opening:h,prizes:p,
    validOpeningProbability:valid,directEventProbability:event,
    eventGivenValidOpening:event/valid};
}

const rank22={wally:1,trubbish:2,floatStone:4,garbodor:2,
  otherBasics:10,other:41};
module.exports={VERSION,exactWallyWindow,rank22};
