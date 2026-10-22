'use strict';
const assert=require('node:assert/strict');
const {choose,falling,rank6DirectGuzmaAndEnergy}=
  require('./aichi-rank6-guzma-energy-direct.cjs');
/** @param {bigint} a @param {bigint} b */
function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
/** @param {bigint} n @param {bigint} d */
function portion(n,d){
  const g=gcd(n,d);
  return {numerator:String(n/g),denominator:String(d/g),
    percent:100*Number(n)/Number(d)};
}
/**
 * Two manual attachments with rank6's Speed Lightning-triggered draw two.
 * T1: if Speed is held by first normal draw, attach Speed (draw two);
 * else if DCE held, attach DCE. T2: attach remaining DCE, or attach newly
 * drawn Speed (draw two). Play Guzma only if visible by end of T2 draws.
 * Unobserved Prize subset is uniformly marginalized.
 *
 * @param {{basics:number,speed:number,dce:number,guzma:number,
 *   other:number,hand:number,prizes:number}} x
 */
function directTriggerPacket(x){
  const {basics,speed,dce,guzma,other,hand,prizes}=x;
  const counts=[basics,speed,dce,guzma,other];
  assert.ok([...counts,hand,prizes].every(Number.isSafeInteger));
  assert.ok(basics>0&&hand>0&&prizes>=0&&counts.every(n=>n>=0));
  const n=counts.reduce((a,b)=>a+b,0);
  assert.ok(n-hand-prizes>=4);
  const denominator=(choose(n,hand)-choose(n-basics,hand))*
    falling(n-hand,4);
  assert.ok(denominator>0n);
  let summed=0n,speedFirst=0n,dceFirst=0n;
  /** @param {number[]} seen @param {bigint} ways @param {(seen:number[],ways:bigint,drawn:number)=>void} next */
  function draw(seen,ways,next){
    for(let i=0;i<5;i++){
      const left=counts[i]-seen[i];
      if(left<=0)continue;
      const updated=seen.slice();
      updated[i]++;
      next(updated,ways*BigInt(left),i);
    }
  }
  for(let b=1;b<=Math.min(basics,hand);b++)
    for(let s=0;s<=Math.min(speed,hand-b);s++)
      for(let d=0;d<=Math.min(dce,hand-b-s);d++)
        for(let g=0;g<=Math.min(guzma,hand-b-s-d);g++){
          const o=hand-b-s-d-g;
          if(o>other)continue;
          const seen=[b,s,d,g,o];
          const weight=counts.reduce((ways,m,i)=>
            ways*choose(m,seen[i]),1n);
          draw(seen,weight,(eight,w8)=>{
            const attachment=eight[1]>0?'speed':
              eight[2]>0?'dce':'none';
            draw(eight,w8,(nine,w9,secondDraw)=>{
              draw(nine,w9,(ten,w10)=>{
                draw(ten,w10,(eleven,w11)=>{
                  summed+=w11;
                  if(attachment==='speed'&&eleven[2]>0&&eleven[3]>0)
                    speedFirst+=w11;
                  if(attachment==='dce'&&secondDraw===1&&
                    eleven[3]>0)dceFirst+=w11;
                });
              });
            });
          });
        }
  assert.equal(summed,denominator);
  return {speedFirst:portion(speedFirst,denominator),
    dceFirst:portion(dceFirst,denominator),
    joint:portion(speedFirst+dceFirst,denominator)};
}
/** @returns {object} */
function rank6SpeedTriggeredGuzma(){
  const direct=rank6DirectGuzmaAndEnergy();
  const c=direct.printedSource;
  const value=directTriggerPacket({
    basics:c.basics,speed:c.speedLightning,dce:c.doubleColorless,
    guzma:c.guzma,other:60-c.basics-c.speedLightning-
      c.doubleColorless-c.guzma,hand:7,prizes:6});
  assert.ok(value.joint.percent>=direct.fundedAndGuzma.percent);
  return {schema:'rank6-triggered-t2-guzma-energy-v1',
    sourceRank:6,sourcePrints:c,normalTwoDrawBaseline:direct.fundedAndGuzma,
    speedDrawTwoLine:value,
    sourceAttack:'Volt Cyclone',sourceStagedCounterline:'Guzma to unprotected Bench',
    scope:'Basic-valid seven; two manual attachments; first eligible Speed Lightning attached from hand to Lightning Iron Thorns, immediately draws two; no other cards played/searches/opponent interferences/extra prizes or qualified matches',
    competitiveGamesQualified:0};
}
if(require.main===module)
  console.log(JSON.stringify(rank6SpeedTriggeredGuzma(),null,2));
module.exports={directTriggerPacket,rank6SpeedTriggeredGuzma};
