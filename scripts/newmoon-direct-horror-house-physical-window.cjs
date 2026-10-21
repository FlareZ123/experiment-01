'use strict';

const assert=require('node:assert/strict');
const {choose,gcd,sourceCounts}=
  require('./newmoon-thorns-gx-lockline-window.cjs');

/**
 * @typedef {object} WindowCounts
 * @property {number} mewtwo Number of initial-Active-eligible Mewtwo & Mew-GX
 * @property {number} gengar Number of native Gengar & Mimikyu-GX attackers
 * @property {number} compressor Battle Compressor
 * @property {number} cologne Canceling Cologne
 * @property {number} psychicEnergy Psychic-producing Energy cards
 * @property {number} basics Total Basic Pokémon in the fixed-60 hypothesis
 */

/**
 * Two disjoint first-turn Horror House-GX direct resource routes:
 * 1. Gengar is among initial seven, can be Active, and Psychic Energy is seen.
 * 2. Mewtwo is among initial seven, and Cologne + Psychic Energy are seen:
 *    either a Gengar is seen by the eighth card and can be Benched, or
 *    Compressor is seen and an unseen Gengar remains outside the Prizes.
 *
 * Each physically distinct first-seven composition, eighth card and six-Prize
 * draw is counted once. This still ignores all additional search/draw routes,
 * attachment and Item sequencing, opponent policy and actual attack legality.
 *
 * @param {WindowCounts} cards
 * @returns {{nativeGengarStarter:object,copyViaDrawnGengar:object,
 *   copyViaCompressor:object,eitherRoute:object,definition:string}}
 */
function countDirectHorrorHouse(cards){
  const v=[cards.mewtwo,cards.gengar,cards.compressor,cards.cologne,
    cards.psychicEnergy,cards.basics];
  assert.ok(v.every(x=>Number.isSafeInteger(x)&&x>=0));
  assert.ok(cards.mewtwo>=1&&cards.gengar>=1);
  assert.ok(cards.basics>=cards.mewtwo+cards.gengar);
  assert.ok(cards.basics+cards.compressor+cards.cologne+
    cards.psychicEnergy<=60);
  const counts=[
    cards.mewtwo,cards.gengar,cards.compressor,cards.cologne,
    cards.psychicEnergy,cards.basics-cards.mewtwo-cards.gengar,
    60-cards.basics-cards.compressor-cards.cologne-cards.psychicEnergy
  ];
  assert.equal(counts.reduce((a,n)=>a+n,0),60);
  const prizeTotal=choose(52,6);
  const eligible=(choose(60,7)-choose(60-cards.basics,7))*53n*prizeTotal;
  const sums=[0n,0n,0n];

  for(let m=0;m<=Math.min(7,counts[0]);m++){
    for(let g=0;g<=Math.min(7-m,counts[1]);g++){
      for(let b=0;b<=Math.min(7-m-g,counts[2]);b++){
        for(let x=0;x<=Math.min(7-m-g-b,counts[3]);x++){
          for(let e=0;e<=Math.min(7-m-g-b-x,counts[4]);e++){
            for(let o=0;o<=Math.min(7-m-g-b-x-e,counts[5]);o++){
              const rest=7-m-g-b-x-e-o;
              if(rest>counts[6]||m+g+o===0)continue;
              const firstSeven=[m,g,b,x,e,o,rest];
              let arrangements=1n;
              for(let j=0;j<counts.length;j++){
                arrangements*=choose(counts[j],firstSeven[j]);
              }
              for(let j=0;j<counts.length;j++){
                const remaining=counts[j]-firstSeven[j];
                if(remaining===0)continue;
                const firstEight=firstSeven.slice();
                firstEight[j]++;
                if(firstEight[4]===0)continue;
                const physicalWays=arrangements*BigInt(remaining);
                // Once Gengar starts Active, no Perfection or Cologne is
                // required for its own printed Horror House-GX attack.
                if(g>0){
                  sums[0]+=physicalWays*prizeTotal;
                  continue;
                }
                if(m===0||firstEight[3]===0)continue;
                // Newly drawn Gengar is playable to the Bench while the
                // Mewtwo from the original seven occupies the Active Spot.
                if(firstEight[1]>0){
                  sums[1]+=physicalWays*prizeTotal;
                }else if(firstEight[2]>0){
                  const unseenGengar=cards.gengar-firstEight[1];
                  const allGengarPrized=choose(52-unseenGengar,6-unseenGengar);
                  sums[2]+=physicalWays*(prizeTotal-allGengarPrized);
                }
              }
            }
          }
        }
      }
    }
  }
  /** @param {bigint} number */
  const asFraction=number=>{
    const divisor=gcd(number,eligible);
    return {
      numerator:String(number/divisor),
      denominator:String(eligible/divisor),
      probability:Number(number)/Number(eligible)
    };
  };
  return {
    nativeGengarStarter:asFraction(sums[0]),
    copyViaDrawnGengar:asFraction(sums[1]),
    copyViaCompressor:asFraction(sums[2]),
    eitherRoute:asFraction(sums.reduce((a,b)=>a+b,0n)),
    definition:'Native Gengar starter plus Energy, or Mewtwo starter plus Cologne/Energy and real Gengar payload access',
    qualification:'Direct physical resource visibility only; no matched game, legal attack or game win'
  };
}

function main(){
  const source=sourceCounts();
  assert.equal(source.gengar,1);
  const cases={};
  for(let copies=1;copies<=4;copies++){
    // Extra Gengar replace unspecified non-Basic Trainers, preserving the
    // other 16 Basic Pokémon and all named setup resources.
    cases['gengar'+copies]=countDirectHorrorHouse({
      ...source,gengar:copies,basics:source.basics+copies-1
    });
  }
  // These are resource-count-only counterfactuals, with unspecified
  // non-Basic cuts; none represents a newly approved complete decklist.
  const alternatives={
    extraOneCologne:countDirectHorrorHouse({
      ...source,cologne:source.cologne+1
    }),
    extraTwoCologne:countDirectHorrorHouse({
      ...source,cologne:source.cologne+2
    }),
    extraTwoCompressor:countDirectHorrorHouse({
      ...source,compressor:source.compressor+2
    }),
    extraTwoPsychicEnergy:countDirectHorrorHouse({
      ...source,psychicEnergy:source.psychicEnergy+2
    }),
    extraOneCologneAndCompressor:countDirectHorrorHouse({
      ...source,cologne:source.cologne+1,compressor:source.compressor+1
    })
  };
  const donorNaive=require('./new-moon-thorns-starter-joint.cjs')
    .main().eitherDirectGXChannel.firstDraw;
  return {
    schema:'newmoon-direct-horror-house-donor-aware-physical-window-v1',
    fixedSourcePrintingHash:require(
      '../results/als/new-moon-lockbreak-english-proxy-60.json'
    ).canonical_id_count_sha256,
    baseline:source,
    sampling:'Legal initial seven, six random Prizes, first mandatory draw; no mulligan bonuses',
    hypotheticalSwap:'One to three unspecified non-Basic slots replaced by additional Gengar & Mimikyu-GX, total 60',
    cases,
    alternatives,
    previousDonorAgnosticVisibilityUnion:donorNaive,
    scope:'Conjunctive resources and intended starting Active only. Search, draw, Item/Ability interaction, Energy attachment, GX rule use and tactics are not simulated.',
    qualifiedCompetitiveGames:0
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={countDirectHorrorHouse,main};
