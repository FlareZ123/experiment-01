'use strict';

const assert = require('node:assert/strict');
const {choose, WITNESS_GROUPS} =
  require('./agent3-rank26-donk-prize-witness-upper.cjs');
const {run: starterUnion} =
  require('./agent3-rank26-alternative-basic-starter.cjs');

const groups = [...WITNESS_GROUPS, {name:'Dowsing Machine',copies:1,needed:0}];
groups.push({name:'other',
  copies:60-groups.reduce((sum,group)=>sum+group.copies,0),needed:0});
const branches = ['three-pumps', 'two-pumps-dowsing', 'one-egg-dowsing'];
const starters = ['Bunnelby','Unown'];
const denominator = (choose(60,7)-choose(48,7))*choose(53,6);

/**
 * Count distinct opening-seven + six-Prize physical card configurations.
 * Source's original twelve Basics define the valid-opening denominator.
 * @param {string} starter
 * @param {string} branch
 * @param {number|null} lightningHand
 * @param {number|null} dceHand
 * @returns {bigint}
 */
function count(starter, branch, lightningHand=null, dceHand=null) {
  assert.ok(starters.includes(starter));
  assert.ok(branches.includes(branch));
  let dp = Array.from({length:8},()=>Array(7).fill(0n));
  dp[0][0]=1n;
  for(const group of groups){
    const next=Array.from({length:8},()=>Array(7).fill(0n));
    const {name,copies:n,needed}=group;
    for(let h=0;h<=Math.min(n,7);h++){
      if(name==='Bunnelby' && h!==(starter==='Bunnelby'?1:0))continue;
      if(name==='Unown' && starter==='Unown' && h<1)continue;
      if(name==='Lightning Energy' && lightningHand!==null &&
        h!==lightningHand)continue;
      if(name==='Double Colorless Energy' && dceHand!==null &&
        h!==dceHand)continue;
      for(let p=0;p<=Math.min(n-h,6);p++){
        const unprized=n-p;
        const required=name==='Bunnelby'?0:
          name==='Unown'?(starter==='Bunnelby'?1:2):
          name==='Damage Pump'?(branch==='three-pumps'?3:
            branch==='two-pumps-dowsing'?2:4):
          name==='Exeggcute'?(branch==='one-egg-dowsing'?1:2):
          name==='Dowsing Machine'?(branch==='three-pumps'?0:1):needed;
        if(unprized<required)continue;
        if(name==='Damage Pump' && branch!=='three-pumps' &&
          unprized!==required)continue;
        if(name==='Exeggcute' && branch==='one-egg-dowsing' &&
          unprized!==1)continue;
        if(name==='Lightning Energy' && p!==0)continue;
        const ways=choose(n,h)*choose(n-h,p);
        for(let H=0;H+h<=7;H++){
          for(let P=0;P+p<=6;P++){
            if(dp[H][P])next[H+h][P+p]+=dp[H][P]*ways;
          }
        }
      }
    }
    dp=next;
  }
  return dp[7][6];
}

/** @param {number|null} lights @param {number|null} dce */
function union(lights=null,dce=null){
  return starters.reduce((sum,starter)=>sum+branches.reduce(
    (subtotal,branch)=>subtotal+count(starter,branch,lights,dce),0n),0n);
}

/**
 * Conditional on an original Basic-valid seven, six actual face-down Prizes,
 * and one ordinary source first-turn draw. Root means *before* any other
 * search, discard or draw action, not the end of the turn.
 */
function evaluate(){
  const byInitialLightning=[0,1,2].map(i=>union(i));
  const total=byInitialLightning.reduce((a,b)=>a+b,0n);
  const original=starterUnion().combinedProbability;
  assert.ok(Math.abs(Number(total)/Number(denominator)-original)<1e-14);
  const dceInSeven=union(0,1);
  const dceNotInSeven=union(0,0);
  assert.equal(dceInSeven+dceNotInSeven,byInitialLightning[0]);
  // Forty-seven remaining deck cards after seven in hand and six Prizes.
  // Two Basic Lightning are in that deck. If DCE is in the opening seven,
  // 45 of 47 normal draws preserve both Lightning in deck. Otherwise
  // precisely one of 47 draws acquires the singleton DCE.
  const favorableRootWeights=45n*dceInSeven+dceNotInSeven;
  const rootDenominator=47n*denominator;
  return {
    schema:'rank26-direct-root-DCE-held-both-Lightning-deck-v1',
    sourceRank:26,
    sourceBasics:12,
    denominators:{basicValidSevenAndSixPrizes:denominator.toString(),
      ordinaryDrawWeighted:rootDenominator.toString()},
    sixDisjointStarterPumpBranches:true,
    byOpeningLightningInHand:byInitialLightning.map((x,i)=>({
      initialLightning:i,physicalFavorable:x.toString(),
      conditionalProbability:Number(x)/Number(denominator)})),
    originalUnionProbability:Number(total)/Number(denominator),
    noOpeningLightningDceInSeven:dceInSeven.toString(),
    noOpeningLightningDceNotInSeven:dceNotInSeven.toString(),
    favorableRootWeights:favorableRootWeights.toString(),
    conditionalDirectRootProbability:Number(favorableRootWeights)/
      Number(rootDenominator),
    caveat:'Necessary card-location event for exact conditional Unown/Bunnelby Pump lines, a held DCE, and both Basic Lightning still in deck on initial turn root. Not actual playable acquisition, turn-one donk frequency, win rate, or upper bound across alternative discard lines.'
  };
}

module.exports={count,union,evaluate};
if(require.main===module)
  process.stdout.write(JSON.stringify(evaluate(),null,2)+'\n');
