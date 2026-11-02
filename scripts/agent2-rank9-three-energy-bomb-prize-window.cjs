'use strict';

const assert=require('node:assert/strict');
const {choose,fraction}=require('./aichi-rank15-dual-lock-prize-ceiling.cjs');
const {ROLES}=require('./agent29-rank9-electrode-mega-prize-window.cjs');
const VERSION='agent2-rank9-three-discard-energy-partial-bomb-prize-ceiling-v1';

/**
 * Exact rank9 original five-role Prize/Basic-open conditioning, with a
 * PAPER-LEGAL THREE-ENERGY minimum sufficient for Mega Absol's D,D,C cost.
 * Counts accessible physical cards only, not actual discard preparation,
 * paper-legal actions, bot competence, timing, or game wins.
 *
 * @param {number} minUnprizedEnergy
 * @returns {object}
 */
function partialBombPrizeWindow(minUnprizedEnergy=3){
  assert.ok(Number.isSafeInteger(minUnprizedEnergy)&&minUnprizedEnergy>=1&&
    minUnprizedEnergy<=7);
  const counts=[ROLES.voltorb,ROLES.megaAbsol,ROLES.electrode,
    ROLES.energy,ROLES.otherBasics,ROLES.otherNonBasics];
  assert.equal(counts.reduce((a,b)=>a+b,0),60);
  assert.equal(ROLES.voltorb+ROLES.megaAbsol+ROLES.otherBasics,11);
  const sevenWays=choose(54,7);
  let allPrizes=0n,openingValid=0n,eligible=0n;
  function visit(index,chosen,picked,ways){
    if(index===counts.length){
      if(picked!==6)return;
      allPrizes+=ways;
      const basics=11-chosen[0]-chosen[1]-chosen[4];
      const validSeven=sevenWays-choose(54-basics,7);
      const weight=ways*validSeven;
      openingValid+=weight;
      if(chosen[0]===0&&chosen[1]===0&&chosen[2]<=1&&
        counts[3]-chosen[3]>=minUnprizedEnergy)eligible+=weight;
      return;
    }
    for(let q=0;q<=Math.min(counts[index],6-picked);q++){
      visit(index+1,[...chosen,q],picked+q,ways*choose(counts[index],q));
    }
  }
  visit(0,[],0,1n);
  assert.equal(allPrizes,choose(60,6));
  assert.ok(openingValid>0n);
  return {
    version:VERSION,minUnprizedEnergy,sourceRank:9,
    sourceOriginalPrintedCards:60,sourcePhysicalEnergy:7,
    printedBasicCount:11,
    availabilityConditionalBasicValidOpening:fraction(eligible,openingValid),
    countsOnlyUnprizedPhysicalPrerequisites:true,
    assumesAttacksAccessibleAndNoLock:false,
    preparationAttackAndWinProbabilityCertified:false
  };
}

/**
 * All three-card physical subsets of rank9's 4 Prism, 2 Darkness and 1
 * Telepathic card contain at least two Darkness-capable cards. On a Basic
 * Mega Absol without interfering effects, any subset can pay [D,D,C].
 */
function allThreePhysicalSubsetsCanFundClaw(){
  let physicalSubsets=0;
  const compositions=[];
  for(let p=0;p<=4;p++)for(let d=0;d<=2;d++)for(let t=0;t<=1;t++){
    if(p+d+t!==3)continue;
    const ways=Number(choose(4,p)*choose(2,d)*choose(1,t));
    const payable=p+d>=2;
    compositions.push({prism:p,darkness:d,telepathic:t,ways,payable});
    physicalSubsets+=ways;
  }
  assert.equal(physicalSubsets,Number(choose(7,3)));
  assert.equal(physicalSubsets,35);
  assert.ok(compositions.every(c=>c.payable));
  return {physicalSubsets,compositions,allPayableAbsentModifiers:true};
}

if(require.main===module)process.stdout.write(JSON.stringify({
  three:partialBombPrizeWindow(3),five:partialBombPrizeWindow(5),
  threeCardPayability:allThreePhysicalSubsetsCanFundClaw()
},null,2)+'\n');
module.exports={VERSION,partialBombPrizeWindow,allThreePhysicalSubsetsCanFundClaw};
