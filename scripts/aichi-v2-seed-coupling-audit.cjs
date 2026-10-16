'use strict';
const {createHash}=require('node:crypto');
const {seededRandom,deckPermutation}=require('../simulation/twinleaf/headless.cjs');
const {loadDefaultCampaign}=require('./aichi-comparison-campaign.cjs');

/** @param {number} seed */
function mixSeed(seed){
  return createHash('sha256').update('aichi-seed-v3:'+seed)
    .digest().readUInt32LE(0);
}
/** @param {()=>number} rng */
const word=rng=>Math.floor(rng()*4294967296)>>>0;
/** @param {number[]} a @param {number[]} b */
const samePositions=(a,b)=>a.filter((x,i)=>x===b[i]).length;
/** @param {number[]} a @param {number[]} b */
const openingOverlap=(a,b)=>{
  const first=new Set(a.slice(0,7));
  return b.slice(0,7).filter(x=>first.has(x)).length;
};
/**
 * Exact first-output XOR masks and a deterministic sample of 60-position
 * Fisher-Yates permutations for adjacent v2 physical-seat seeds.
 * @param {number} count Number of distinct even/odd seed pairs.
 */
function auditSeedCoupling(count=10000){
  if(!Number.isInteger(count)||count<1||count>100000)
    throw new RangeError('Expected 1..100000 pairs');
  const plan=loadDefaultCampaign('independent-slots-v2');
  const first=plan.trials.find(t=>t.phase==='pilot'&&t.rank===6&&
    t.repeat===0&&t.candidateEngineSlot==='A').seed;
  if(first%2!==0)throw new Error('Expected even seat-A seed');
  const masks=[];
  const unit=seededRandom(1);
  for(let j=0;j<20;j++)masks.push(word(unit));
  const sum={rawCoin:0,mixedCoin:0,rawPosition:0,mixedPosition:0,
    rawOpening:0,mixedOpening:0};
  for(let i=0;i<count;i++){
    const a=first+2*i,b=a+1;
    const x=seededRandom(a),y=seededRandom(b);
    const z=seededRandom(mixSeed(a)),w=seededRandom(mixSeed(b));
    for(let j=0;j<20;j++){
      const v=word(x),u=word(y);
      if((v^u)!==(masks[j]|0))throw new Error('Xorshift XOR mismatch');
      if(j===0){
        sum.rawCoin+=(v>>>31)===(u>>>31)?1:0;
        sum.mixedCoin+=(word(z)>>>31)===(word(w)>>>31)?1:0;
      }
    }
    const p=deckPermutation(60,seededRandom(a));
    const q=deckPermutation(60,seededRandom(b));
    const r=deckPermutation(60,seededRandom(mixSeed(a)));
    const s=deckPermutation(60,seededRandom(mixSeed(b)));
    sum.rawPosition+=samePositions(p,q);
    sum.mixedPosition+=samePositions(r,s);
    sum.rawOpening+=openingOverlap(p,q);
    sum.mixedOpening+=openingOverlap(r,s);
  }
  return {kind:'aichi-adjacent-seed-coupling-v1',
    protocol:plan.seedProtocol,firstPair:[first,first+1],pairs:count,
    firstXorMask:masks[0].toString(16).padStart(8,'0'),
    thirdXorMask:masks[2].toString(16).padStart(8,'0'),
    exactHighBitRelation:masks.map(mask=>(mask>>>31)===0?'same':'opposite'),
    rawCoinAgreement:sum.rawCoin/count,
    mixedCoinAgreement:sum.mixedCoin/count,
    rawSamePositions:sum.rawPosition/count,
    mixedSamePositions:sum.mixedPosition/count,
    rawOpeningOverlap:sum.rawOpening/count,
    mixedOpeningOverlap:sum.mixedOpening/count,
    iidSamePositions:1,iidOpeningOverlap:49/60,
    scope:'Seed and deck-permutation diagnostic only. Whole-game RNG call counts can differ. Do not infer matchup outcomes or replace archived seed protocols.'};
}
if(require.main===module)console.log(JSON.stringify(
  auditSeedCoupling(process.argv[2]===undefined?10000:Number(process.argv[2])),null,2));
module.exports={mixSeed,openingOverlap,samePositions,auditSeedCoupling};
