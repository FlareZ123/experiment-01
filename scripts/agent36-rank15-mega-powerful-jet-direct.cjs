'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./agent36-rank15-hood-horror-direct-model.cjs');

/**
 * A deliberately restricted original rank-15 Powerful/Jet Mega reply window.
 * Source starts with a non-Buneary Basic Active. By its first normal draw,
 * it has Buneary to Bench and Powerful Colorless to attach to Buneary.
 * By its second normal draw, it has Mega Lopunny ex and Jet Energy, allowing
 * normal evolution and Jet promotion on source turn two if hand-play is legal.
 * The six initial Prizes are marginalized exactly because this route performs
 * no searches before either ordinary draw.
 *
 * @returns {object} Exact weighted counts and conditional probabilities.
 */
function directMegaJetOpportunity(){
  // Original rank15: 2 Buneary, 12 other Basics, 2 Mega Lopunny ex,
  // 1 Powerful Colorless, 2 Jet, and 41 unclassified cards.
  const copies=[2,12,2,1,2,41];
  assert.equal(copies.reduce((n,x)=>n+x,0),60);
  const legal=choose(60,7)-choose(46,7);
  const denominator=legal*53n*52n;
  let readyToAttach=0n,allRequired=0n;
  const hand=Array(copies.length).fill(0);
  /** @param {number} i @param {number} left @param {bigint} weight */
  function visit(i,left,weight){
    if(i===hand.length){
      if(left!==0||hand[1]===0)return;
      for(let draw1=0;draw1<copies.length;draw1++){
        const n1=copies[draw1]-hand[draw1];
        if(n1===0)continue;
        const after1=hand.slice();
        after1[draw1]++;
        if(after1[0]===0||after1[3]===0)continue;
        const w=weight*BigInt(n1);
        readyToAttach+=w*52n;
        for(let draw2=0;draw2<copies.length;draw2++){
          const n2=copies[draw2]-after1[draw2];
          if(n2===0)continue;
          const after2=after1.slice();
          after2[draw2]++;
          if(after2[2]>0&&after2[4]>0)
            allRequired+=w*BigInt(n2);
        }
      }
      return;
    }
    for(let n=0;n<=Math.min(left,copies[i]);n++){
      hand[i]=n;
      visit(i+1,left-n,weight*choose(copies[i],n));
    }
  }
  visit(0,7,1n);
  return {
    schema:'agent36-rank15-megalopunny-powerful-jet-direct-t2-v1',
    denominator:String(denominator),
    readyToAttach:String(readyToAttach),
    allRequired:String(allRequired),
    openingReadinessProbability:Number(readyToAttach)/Number(denominator),
    completeResourceProbability:Number(allRequired)/Number(denominator),
    validOpeningProbability:Number(legal)/Number(choose(60,7))
  };
}
module.exports={directMegaJetOpportunity};
