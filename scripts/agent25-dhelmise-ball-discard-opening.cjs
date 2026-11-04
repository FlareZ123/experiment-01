'use strict';

const assert = require('node:assert/strict');
const {choose} = require('./agent25-dhelmise-t1-physical-opportunity.cjs');

const VERSION = 'agent25-dhelmise-ball-discard-opening-v3';

/**
 * Exact first-seven, one ordinary draw, six Prizes card-location census for
 * the fixed Dhelmise v2 60, with card-costed Ball discard added to the old
 * Blender / double-Compressor route. It cannot measure a real game's chance
 * to complete the attack; turn order, effects, Item lock, sequencing, prizes,
 * actual card searches, and opponent agency are not simulated.
 *
 * Categories: Dhelmise, eligible Hide 'n' Sneak donors, Psychic-providing
 * Energy, Arven, Brilliant Blender, Battle Compressor, discard-cost Balls
 * (4 Mysterious Treasure + 3 Quick Ball), and everything else. Blocked
 * donors, if any, stay in everything else. In the no-lock case all eight
 * donors count; in the Wobbuffet/Silent Lab counterfactual only six count.
 *
 * A physical way to discard up to min(3*heldCompressors + 5*Blender, deck
 * donors) HNS Pokémon from the deck is present, while Balls can discard up
 * to min(heldBalls, heldDonors) donor cards from hand. Blender is reachable
 * when held or via held Arven with Blender not Prized. This is a max-capacity
 * resource screen, assuming other Trainer requirements can be satisfied.
 *
 * @param {6|8} eligibleDonors
 * @param {{allowArven?:boolean,energyCount?:number,basicCount?:number,
 *   totalDonors?:number}} [options]
 * @returns {object}
 */
function exactOpening(eligibleDonors, {
  allowArven=true,energyCount=10,basicCount=14,totalDonors=8
}={}) {
  assert.equal(typeof allowArven,'boolean');
  const original=totalDonors===8&&energyCount===10&&basicCount===14;
  const swap=totalDonors===10&&energyCount===8&&basicCount===16;
  assert.ok(original||swap,'Only the original printed 60 or the explicitly defined two-card swap');
  assert.ok((original?[6,8]:[6,8,10]).includes(eligibleDonors));
  const counts = [4, eligibleDonors, energyCount, 4, 1, 4, 7,
    40-eligibleDonors-energyCount];
  assert.equal(counts.reduce((a,b)=>a+b,0),60);
  const total = choose(60,7)*53n*choose(52,6);
  const seven = Array(8).fill(0);
  let strict=0n, expanded=0n, oneCompressorBall=0n;
  let initialStates=0;

  /** @param {number} group @param {number} left @param {bigint} ways */
  function opening(group,left,ways) {
    if (group===7) {
      if(left>counts[group])return;
      seven[group]=left;
      const initialWays=ways*choose(counts[group],left);
      if(initialWays===0n)return;
      initialStates++;
      for(let drawn=0;drawn<8;drawn++){
        const drawWays=counts[drawn]-seven[drawn];
        if(drawWays<=0)continue;
        const held=seven.slice();held[drawn]++;
        if(held[2]===0)continue;
        const remaining=counts.map((n,i)=>n-held[i]);
        const others=52-remaining[1]-remaining[4];
        for(let prizedDonors=0;prizedDonors<=Math.min(6,remaining[1]);prizedDonors++){
          for(let prizedBlender=0;prizedBlender<=Math.min(6-prizedDonors,remaining[4]);prizedBlender++){
            const prizedOthers=6-prizedDonors-prizedBlender;
            const prizeWays=choose(remaining[1],prizedDonors)*
              choose(remaining[4],prizedBlender)*choose(others,prizedOthers);
            if(prizeWays===0n)continue;
            const weight=initialWays*BigInt(drawWays)*prizeWays;
            const inDeck=remaining[1]-prizedDonors;
            const inHand=held[1];
            const balls=held[6],compressors=held[5];
            const blenderAvailable=held[4]>0||
              (allowArven&&held[3]>0&&remaining[4]>prizedBlender);
            const oldEvent=inDeck>=4&&
              (blenderAvailable||compressors>=2);
            const deckCapacity=Math.min(inDeck,
              (blenderAvailable?5:0)+3*compressors);
            const handCapacity=Math.min(inHand,balls);
            const newEvent=deckCapacity+handCapacity>=4;
            if(oldEvent)strict+=weight;
            if(newEvent)expanded+=weight;
            if(!oldEvent&&newEvent&&compressors>0&&handCapacity>0)
              oneCompressorBall+=weight;
          }
        }
      }
      return;
    }
    for(let n=group===0?1:0;n<=Math.min(left,counts[group]);n++){
      seven[group]=n;
      opening(group+1,left-n,ways*choose(counts[group],n));
    }
  }
  opening(0,7,1n);
  assert.ok(strict<=expanded&&expanded<=total);
  const basicValid=1-Number(choose(60-basicCount,7))/Number(choose(60,7));
  const probability=x=>Number(x)/Number(total);
  return {
    version:VERSION,eligibleDonors,totalDonors,energyCount,basicCount,
    originalFixedSixty:original,counterfactualTwoEnergyForTwoShuppet:swap,
    allowArven,counts,initialStates,
    denominator:total.toString(),
    strictWorlds:strict.toString(),expandedWorlds:expanded.toString(),
    additionallyReachableWorlds:(expanded-strict).toString(),
    newCompressorBallWorlds:oneCompressorBall.toString(),
    strictProbability:probability(strict),
    expandedProbability:probability(expanded),
    addedProbability:probability(expanded-strict),
    conditionalBasicValid:probability(expanded)/basicValid,
    basicValidProbability:basicValid,
    sourceFixed60:'results/als/agent25-dhelmise-mixed-lock-answers-v2.json',
    modelOnly:true,paperActionAndOpponentUnverified:true,
    competitiveQualifiedGames:0
  };
}

function study(){
  const swap={totalDonors:10,energyCount:8,basicCount:16};
  return {version:VERSION,unrestricted:exactOpening(8),
    partialLock:exactOpening(6),
    unrestrictedNoArven:exactOpening(8,{allowArven:false}),
    partialLockNoArven:exactOpening(6,{allowArven:false}),
    hypotheticalTwoBasicEnergyToTwoShuppet:{
      explicitlyDefinedCounterfactualOnly:true,
      alteredCopies:[{'id':'sve-5',delta:-2},{id:'me5-33',delta:2}],
      unlocked:exactOpening(10,swap),
      wobbuffetActive:exactOpening(8,swap),
      silentLabActive:exactOpening(6,swap),
      unlockedNoArven:exactOpening(10,{...swap,allowArven:false}),
      wobbuffetActiveNoArven:exactOpening(8,{...swap,allowArven:false}),
      silentLabActiveNoArven:exactOpening(6,{...swap,allowArven:false})
    }
  };
}

module.exports={VERSION,exactOpening,study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
