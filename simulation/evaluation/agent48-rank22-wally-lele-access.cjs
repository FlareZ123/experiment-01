'use strict';

const assert=require('node:assert/strict');
const {exactWallyWindow}=require('./agent48-rank22-wally-direct.cjs');

const VERSION='agent48-wally-lele-first-turn-union-v1';

/** Exact physical combinations for feasible deck sizes. */
function choose(n,k){
  if(k<0||k>n)return 0;
  let x=1;
  for(let i=1,m=Math.min(k,n-k);i<=m;i++)x=x*(n-m+i)/i;
  return Math.round(x);
}

/**
 * Union of two mutually exclusive first-personal-turn physical routes:
 * (1) directly drawn Wally; (2) Wally still in deck with playable
 * hand/turn-drawn Tapu Lele-GX Wonder Tag. Going second is assumed.
 * The Lele route requires another Basic in initial seven so Lele can
 * stay in hand until played to Bench. Opposing Ability locks, actual
 * search effects, and tactical quality are deliberately unmodeled.
 *
 * @param {{wally:1,leleGX:1,trubbish:number,floatStone:number,
 *   garbodor:number,otherBasics:number,other:number}} c
 * @param {{opening?:number,prizes?:number}} [options]
 */
function exactWallyOrLeleWindow(c,options={}){
  assert.equal(c?.wally,1);
  assert.equal(c.leleGX,1);
  for(const key of ['trubbish','floatStone','garbodor',
    'otherBasics','other'])
    assert.ok(Number.isSafeInteger(c[key])&&c[key]>=0);
  const {trubbish:T,floatStone:F,garbodor:G,otherBasics:B,other:O}=c;
  const N=2+T+F+G+B+O;
  const h=options.opening??7,p=options.prizes??6;
  assert.ok(Number.isSafeInteger(h)&&Number.isSafeInteger(p)&&
    h>0&&p>=0&&h+p<N);
  const first=exactWallyWindow({wally:1,trubbish:T,floatStone:F,
    garbodor:G,otherBasics:B+1,other:O},options);
  const handDen=choose(N,h),prizeDen=choose(N-h,p);
  const R=N-h,D=R-p;
  let extra=0;
  // Wally is absent from initial hand by construction for this disjoint arm.
  for(let l=0;l<=1;l++)
  for(let t=0;t<=Math.min(T,h-l);t++)
  for(let f=0;f<=Math.min(F,h-l-t);f++)
  for(let g=0;g<=Math.min(G,h-l-t-f);g++)
  for(let b=0;b<=Math.min(B,h-l-t-f-g);b++){
    const o=h-l-t-f-g-b;
    if(o<0||o>O||t+b===0)continue;
    const missing=Number(l===0)+Number(t===0)+Number(f===0);
    if(missing>1)continue;
    const handProb=choose(1,l)*choose(T,t)*choose(F,f)*
      choose(G,g)*choose(B,b)*choose(O,o)/handDen;
    const remainingG=G-g,others=R-1-remainingG;
    if(others<=0)continue;
    for(let pg=0;pg<=Math.min(remainingG,p);pg++){
      const otherPrize=p-pg,deckG=remainingG-pg;
      if(otherPrize<0||otherPrize>others||deckG<1)continue;
      // Neither of the original single Wally copies is in hand/Prizes.
      const prizeProb=choose(remainingG,pg)*
        choose(others,otherPrize)/prizeDen;
      let drawProb;
      if(missing===0){
        // Do not draw the one remaining Wally or the final Garbodor.
        drawProb=(D-1-Number(deckG===1))/D;
      }else{
        const target=l===0?1:t===0?T-t:F-f;
        // Uniform prize distribution conditional on zero Wally prizes
        // and exactly pg Garbodor prizes.
        drawProb=target*(others-otherPrize)/others/D;
      }
      extra+=handProb*prizeProb*drawProb;
    }
  }
  return {version:VERSION,deckSize:N,opening:h,prizes:p,
    validOpeningProbability:first.validOpeningProbability,
    directProbability:first.directEventProbability,
    leleOnlyAdditionalProbability:extra,
    unionProbability:first.directEventProbability+extra,
    directGivenValidOpening:first.eventGivenValidOpening,
    leleOnlyAdditionalGivenValidOpening:extra/first.validOpeningProbability,
    unionGivenValidOpening:
      (first.directEventProbability+extra)/first.validOpeningProbability};
}

const rank22WithLele=Object.freeze({wally:1,leleGX:1,
  trubbish:2,floatStone:4,garbodor:2,otherBasics:9,other:41});
module.exports={VERSION,exactWallyOrLeleWindow,rank22WithLele};
