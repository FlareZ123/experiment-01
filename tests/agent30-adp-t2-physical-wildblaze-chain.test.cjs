'use strict';

/**
 * Agent30 exact ADP -> Thorton -> Regidrago VSTAR -> Wild Blaze DIRECT
 * two-own-turn necessary opportunity on the unchanged Agent5 60.
 * No turn-one Supporter, no extra draw or tutors except one Battle
 * Compressor (two printed-card deck-discard targets), and one natural
 * draw on each turn. Excludes all opponent actions and game-win inference.
 */
const assert=require('node:assert/strict');
const deck=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');

/** @param {number} n @param {number} k @returns {number} */
function C(n,k) {
  if(k<0 || k>n) return 0;
  let v=1;
  for(let i=1;i<=Math.min(k,n-k);i++)v=v*(n-i+1)/i;
  return Math.round(v);
}
/**
 * @returns {{unconditional:{firstTurnReady:number,allEight:number,
 * turnTwoReady:number,drawVSTAR:number,drawThorton:number,drawBasic:number},
 * conditional:object,basicValid:number}}
 */
function physicalWildBlazeOpportunity() {
  assert.equal(deck.canonicalCardsSha256,
    'bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b');
  const m=new Map(deck.cards.map(x=>[x.id,x.count]));
  const get=id=>m.get(id)??0;
  assert.equal([...m.values()].reduce((s,x)=>s+x,0),60);
  const n=[get('sm12-156'),get('xy6-97'),get('xy4-92'),get('xy2-69'),
    get('swsh12-135'),get('swsh12-136'),get('swsh11-167'),
    get('swsh12pt5-152')+get('swsh12pt5-153')];
  assert.deepEqual(n,[2,4,4,1,3,3,4,7]);
  n.push(60-n.reduce((a,b)=>a+b,0));
  const counts=Array(8).fill(0),d8=C(60,8),dPrize=C(52,6);
  const out={firstTurnReady:0,allEight:0,turnTwoReady:0,
    drawVSTAR:0,drawThorton:0,drawBasic:0};
  /**
   * @param {number} i @param {number} remain @param {number} ways
   */
  function enumerate(i,remain,ways) {
    if(i<8) {
      for(let v=0;v<=Math.min(n[i],remain);v++) {
        counts[i]=v;
        enumerate(i+1,remain-v,ways*C(n[i],v));
      }
      return;
    }
    if(remain<0 || remain>n[8])return;
    const [adp,dde,compressor,megachar,regi,vstar,thorton,basic]=counts;
    // Charizard needs to be searched from DECK (not held). One Regidrago V
    // also must remain in deck after the six Prizes to enter discard with
    // Compressor and become the Basic retrieved by Thorton on turn two.
    if(!adp || !dde || !compressor || megachar || regi===n[4])return;
    const mass=ways*C(n[8],remain)/d8*(adp===1?7/8:1);
    const r=n[4]-regi;
    const bothDeckSurvive=1-
      C(51,5)/dPrize-C(52-r,6-r)/dPrize+C(51-r,5-r)/dPrize;
    out.firstTurnReady+=mass*bothDeckSurvive;
    const missing=[5,6,7].filter(idx=>counts[idx]===0);
    if(!missing.length) {
      out.allEight+=mass*bothDeckSurvive;
      out.turnTwoReady+=mass*bothDeckSurvive;
      return;
    }
    if(missing.length!==1)return;
    const idx=missing[0];
    // Given a particular missing VSTAR, Thorton or Basic Energy remains
    // outside Prizes, there are 51 other unseen cards, from which the six
    // Prizes are dealt. Both Mega Charizard and some Regidrago must survive.
    const d51=C(51,6);
    const bothIfTargetUnprized=1-
      C(50,5)/d51-C(51-r,6-r)/d51+C(50-r,5-r)/d51;
    // Eight seen, six Prized => 46 in deck. Compressor takes 2 printed
    // cards to discard, SHUFFLES the remaining 44 before turn-two draw.
    const drawJoint=n[idx]*(46/(52*44))*bothIfTargetUnprized;
    const contribution=mass*drawJoint;
    out.turnTwoReady+=contribution;
    out[idx===5?'drawVSTAR':idx===6?'drawThorton':'drawBasic']+=contribution;
  }
  enumerate(0,8,1);
  const basicValid=1-C(53,7)/C(60,7);
  return {unconditional:out,basicValid,conditional:Object.fromEntries(
    Object.entries(out).map(([key,p])=>[key,p/basicValid]))};
}

const result=physicalWildBlazeOpportunity();
const expected={
  firstTurnReady:0.02674574080417234,
  allEight:0.0007732054629597796,
  turnTwoReady:0.0013496020547070582,
  drawVSTAR:0.00020412587476923696,
  drawThorton:0.00019678781874917848,
  drawBasic:0.00017548289822886444
};
for(const [name,p] of Object.entries(expected)){
  assert.ok(Math.abs(result.unconditional[name]-p)<1e-12,name);
  console.log(name,'unconditional '+(100*result.unconditional[name]).toFixed(9)+'%',
    'valid-opener '+(100*result.conditional[name]).toFixed(9)+'%');
}
assert.ok(result.unconditional.turnTwoReady<result.unconditional.firstTurnReady);
assert.ok(result.unconditional.allEight<result.unconditional.turnTwoReady);
console.log('PASS: source-physical Compressor discard, two Energy attachments,',
  'GX, Thorton, VSTAR and Wild Blaze direct opportunity; no game certified.');
module.exports={C,physicalWildBlazeOpportunity};
