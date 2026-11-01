'use strict';
const assert=require('node:assert/strict');
const {choose,exactOpportunity}=
  require('./agent25-dhelmise-t1-physical-opportunity.cjs');
const {prizeSurvival}=require('./agent25-dhelmise-hns-discard-lock.cjs');

const VERSION='agent25-conditional-hns-discard-lock-opening-v1';

/**
 * Exact strict first-seven + one ordinary draw + six hidden Prizes event.
 * Before selecting donors from deck, assume a named hypothetical lock is
 * already active. Discarded cards with blocked printed HNS Abilities cannot
 * satisfy the attack. No other draw/search or actual effect resolution.
 *
 * Group order: Dhelmise, eligible HNS, blocked HNS, Telepathic Psychic,
 * Arven, Blender, Clefairy, Battle Compressor, all other.
 *
 * @param {{totalDonors:number,eligibleDonors:number,basicCount:number,
 * opening?:number,prizes?:number,requiredDonors?:number}} options
 * @returns {object}
 */
function exactLockedOpening({totalDonors,eligibleDonors,basicCount,
    opening=7,prizes=6,requiredDonors=4}){
  assert.ok([8,10,12].includes(totalDonors));
  assert.ok(Number.isInteger(eligibleDonors)&&eligibleDonors>=0&&
    eligibleDonors<=totalDonors);
  assert.ok(Number.isInteger(basicCount)&&basicCount>=1&&basicCount<=60);
  assert.ok(Number.isInteger(opening)&&opening>=1);
  assert.ok(Number.isInteger(prizes)&&prizes>=0&&prizes<=60-opening-1);
  assert.ok(Number.isInteger(requiredDonors)&&requiredDonors>=1);
  const counts=[4,eligibleDonors,totalDonors-eligibleDonors,4,4,1,2,4,
    41-totalDonors];
  const N=counts.reduce((a,b)=>a+b,0);
  assert.equal(N,60);
  const total=choose(N,opening)*BigInt(N-opening)*
    choose(N-opening-1,prizes);
  let favorable=0n;
  const initial=Array(9).fill(0);
  const remainingBeforePrizes=N-opening-1;
  function openingGroup(i,left,ways){
    if(i===8){
      if(left<0||left>counts[8])return;
      initial[8]=left;
      const handWeight=ways*choose(counts[8],left);
      if(handWeight===0n)return;
      for(let drawn=0;drawn<9;drawn++){
        const drawCount=counts[drawn]-initial[drawn];
        if(drawCount<1)continue;
        const held=initial.slice();
        held[drawn]++;
        if(held[3]===0)continue;
        const blenderHeld=held[5]>0;
        const arvenHeld=held[4]>0;
        const pairCompressors=held[7]>=2;
        if(!blenderHeld&&!arvenHeld&&!pairCompressors)continue;
        const remaining=counts.map((c,j)=>c-held[j]);
        if(remaining[1]<requiredDonors)continue;
        const otherRemaining=remainingBeforePrizes-
          remaining[1]-remaining[5]-remaining[6];
        for(let pd=0;pd<=Math.min(remaining[1]-requiredDonors,prizes);pd++){
          for(let pb=0;pb<=Math.min(remaining[5],prizes-pd);pb++){
            for(let pc=0;pc<=Math.min(remaining[6],prizes-pd-pb);pc++){
              const po=prizes-pd-pb-pc;
              if(po>otherRemaining)continue;
              if(held[6]===0&&pc===remaining[6])continue;
              const blender=blenderHeld||
                (arvenHeld&&pb<remaining[5]);
              if(!blender&&!pairCompressors)continue;
              const arrangement=choose(remaining[1],pd)*
                choose(remaining[5],pb)*choose(remaining[6],pc)*
                choose(otherRemaining,po);
              favorable+=handWeight*BigInt(drawCount)*arrangement;
            }
          }
        }
      }
      return;
    }
    for(let n=i===0?1:0;n<=Math.min(counts[i],left);n++){
      initial[i]=n;
      openingGroup(i+1,left-n,ways*choose(counts[i],n));
    }
  }
  openingGroup(0,opening,1n);
  assert.ok(favorable<=total);
  const basicValid=1-Number(choose(N-basicCount,opening))/
    Number(choose(N,opening));
  const unconditional=Number(favorable)/Number(total);
  return {version:VERSION,totalDonors,eligibleDonors,blockedDonors:
      totalDonors-eligibleDonors,basicCount,opening,prizes,requiredDonors,
    totalWorlds:total.toString(),favorableWorlds:favorable.toString(),
    unconditional,conditionalBasicValid:unconditional/basicValid,
    basicValid,sourceFullGameUnverified:true,
    independentActualLockIncidenceUnverified:true,
    computationallyExactPhysicalOpportunityOnly:true};
}

function study(){
  const scenarios=[2,3,4].map(secondaryCopies=>{
    const total=4+2*secondaryCopies;
    const eligible=4+secondaryCopies;
    const basics=12+secondaryCopies;
    const none=exactLockedOpening({totalDonors:total,
      eligibleDonors:total,basicCount:basics});
    const wobb=exactLockedOpening({totalDonors:total,
      eligibleDonors:eligible,basicCount:basics});
    const lab=exactLockedOpening({totalDonors:total,
      eligibleDonors:eligible,basicCount:basics});
    const garbo=exactLockedOpening({totalDonors:total,
      eligibleDonors:0,basicCount:basics});
    const prior=exactOpportunity({
      counts:[4,total,4,4,1,2,4,41-total],basicCount:basics
    });
    assert.equal(none.favorableWorlds,prior.favorable.toString());
    return {secondaryCopies,
      composition:{banettePsychicStage1:4,
        shuppetPsychicBasic:secondaryCopies,
        sinistchaGrassStage1:secondaryCopies},
      hypotheticalOtherCardCuts:total-8,
      unrestricted: none,
      wobbuffetActive:wobb,silentLabActive:lab,garbotoxinActive:garbo,
      wobbuffetPrizeOnly:prizeSurvival(eligible).unprizedAtLeastNeedProbability,
      silentLabPrizeOnly:prizeSurvival(eligible).unprizedAtLeastNeedProbability,
      fieldLocksCounterfactualNotObserved:true};
  });
  return {version:VERSION,scenarios,
    actualSixtyUnchanged:true,
    theoreticalVariantsUnspecifiedNonDonorCuts:true,
    competitiveQualifiedGames:0};
}
module.exports={VERSION,exactLockedOpening,study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
