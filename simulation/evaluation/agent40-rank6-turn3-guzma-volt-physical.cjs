'use strict';
const assert=require('node:assert/strict');
const {binomial}=require('../twinleaf/agent6-owner-tagcall-hala-offer.cjs');
const VERSION='agent40-rank6-original-turn3-speed-dce-guzma-direct-v1';

// In the authenticated rank6 60: 4 Iron Thorns ex Basics, 4 Speed
// Lightning Energy, 1 Double Colorless Energy, 3 Guzma, and 48 others.
// The categories are disjoint and sum to 60 physical copies.
const COUNTS=Object.freeze([4,4,1,3,48]);
const LABELS=Object.freeze([
  'Iron Thorns ex TWM','Speed Lightning Energy RCL',
  'Double Colorless Energy SUM','Guzma BUS','Other original rank6'
]);

/** @param {bigint} a @param {bigint} b */
function gcd(a,b){
  while(b!==0n){const t=a%b;a=b;b=t;}
  return a;
}

/**
 * Exact first-seven + ordered first-turn and second-turn draws, marginalizing
 * six unknown Prizes without looking at them. Condition the seven on >=1
 * eligible Basic. Rank6 goes first, must have >=2 Thorns and >=1 Speed
 * Lightning by its first turn after its FIRST draw, then >=1 DCE and >=1
 * Guzma by its SECOND ordinary draw (turn3 after rank2 TM).
 *
 * This is a narrow source-card-location sufficient resource conjunction
 * for T1 Speed to Benched Thorns + T3 DCE/Guzma/Volt Cyclone. It ignores
 * the 2 additional cards actually DRAWN by attaching Speed Lightning,
 * all other tutor/draw channels, Bench decisions, and opponent actions.
 * Actual move still requires the native Store and a real target.
 *
 * @returns {object} Exact conditional physical access; no game wins.
 */
function exactOriginalRank6PoweredGuzma(){
  assert.equal(COUNTS.reduce((a,b)=>a+b,0),60);
  let favorable=0n;
  const denominator=(binomial(60,7)-binomial(56,7))*53n*52n;
  for(let b=1;b<=4;b++)
    for(let s=0;s<=4;s++)
      for(let d=0;d<=1;d++)
        for(let g=0;g<=3;g++){
          const other=7-b-s-d-g;
          if(other<0||other>48)continue;
          const hand=[b,s,d,g,other];
          const handWays=hand.reduce((v,count,index)=>
            v*binomial(COUNTS[index],count),1n);
          if(!handWays)continue;
          for(let draw1=0;draw1<5;draw1++){
            const choices1=COUNTS[draw1]-hand[draw1];
            if(choices1<=0)continue;
            const after1=hand.slice();
            after1[draw1]++;
            if(after1[0]<2||after1[1]<1)continue;
            for(let draw2=0;draw2<5;draw2++){
              const choices2=COUNTS[draw2]-hand[draw2]-
                (draw1===draw2?1:0);
              if(choices2<=0)continue;
              const after2=after1.slice();
              after2[draw2]++;
              if(after2[2]<1||after2[3]<1)continue;
              favorable+=handWays*BigInt(choices1)*BigInt(choices2);
            }
          }
        }
  const divisor=gcd(favorable,denominator);
  return {version:VERSION,originalRank:6,sourcePrintings:LABELS,
    groupCounts:COUNTS,
    favorable:String(favorable),denominator:String(denominator),
    reducedNumerator:String(favorable/divisor),
    reducedDenominator:String(denominator/divisor),
    conditionalOriginalSevenLegal: Number(favorable)/Number(denominator),
    requires:'Rank6 first T1 Thorns Bench and Speed Lightning, T3 held DCE + Guzma',
    omits:'Speed Lightning draw-two, tutor/draw, source rank2 turn, Store plays, opponent choice and actual game',
    competitiveQualifiedGames:0};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(exactOriginalRank6PoweredGuzma())+'\n');
module.exports={VERSION,COUNTS,LABELS,exactOriginalRank6PoweredGuzma};
