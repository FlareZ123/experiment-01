'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {seededRandom,deckPermutation}=
  require('../simulation/twinleaf/headless.cjs');
const {sourcePokemonIsPrintedBasic}=
  require('./agent26-field-stadium-basic-conditioned-opening.cjs');
const {hashDerivedSetupSeatSeed}=
  require('../simulation/evaluation/agent26-per-seat-setup-shuffle-streams.cjs');

const ROOT=path.resolve(__dirname,'..');
const VERSION='agent26-ranked4-shuffle-opening-calibration-v2';
const PROTOCOLS=Object.freeze({
  'legacy-sequential-shuffle-approximation':null,
  'setup-intercept-perseat-v1':[0x243f6a88,0x85a308d3],
  'headless-builtin-perseat-v1':[0x3c6ef372,0xa54ff53a],
  'setup-sha256-domain-separated-perseat-v2':'sha256-v2'
});

/** Exact collector-based printed Basic positions in the authentic rank4 sixty. */
function rank4Basics(){
  const roster=JSON.parse(fs.readFileSync(path.join(
    ROOT,'results/aichi-2026/full-decklists.json'),'utf8'));
  const rank4=roster.decks.find(d=>d.rank===4);
  assert.ok(rank4,'Missing authenticated rank4 source');
  const sets=JSON.parse(fs.readFileSync(path.join(
    ROOT,'resources/sets/en.json'),'utf8'));
  const cache=new Map();
  const readSet=id=>{
    if(!cache.has(id))cache.set(id,JSON.parse(fs.readFileSync(path.join(
      ROOT,'resources/cards/en',id+'.json'),'utf8')));
    return cache.get(id);
  };
  const positions=[];
  let offset=0;
  for(const card of rank4.cards){
    const isBasic=card.category==='Pokémon'&&
      sourcePokemonIsPrintedBasic(card,sets,readSet);
    if(isBasic)for(let c=0;c<card.count;c++)positions.push(offset+c);
    offset+=card.count;
  }
  assert.equal(offset,60);
  assert.equal(positions.length,13);
  return positions;
}

/**
 * Deterministic sample indexed by SHA-256 rather than adjacent xorshift words.
 * Every pairing keeps the same seed across the three different protocols.
 * @param {number} ordinal 
 * @returns {number}
 */
function sourceSeed(ordinal){
  return createHash('sha256')
    .update('agent26-shuffle-calibration-v1:'+ordinal)
    .digest().readUInt32LE(0);
}

/**
 * Model only the first shuffle for each seat. For the historical shared
 * stream, the actual headless game can also consume randomness before
 * shuffles; the modeled order is explicitly seat0 then seat1 with nothing
 * between. Seat-salted modes reproduce each implementation's seed formula
 * and actual Fisher-Yates permutation for its first shuffle.
 * @param {number} seed
 * @param {string} protocol
 * @returns {[number[],number[]]}
 */
function firstPhysicalShuffles(seed,protocol){
  assert.ok(Object.hasOwn(PROTOCOLS,protocol));
  const salts=PROTOCOLS[protocol];
  if(salts===null){
    const rng=seededRandom(seed);
    return [deckPermutation(60,rng),deckPermutation(60,rng)];
  }
  if(salts==='sha256-v2'){
    return [0,1].map(seat=>deckPermutation(60,
      seededRandom(hashDerivedSetupSeatSeed(seed,seat))));
  }
  return salts.map(salt=>
    deckPermutation(60,seededRandom((seed^salt)>>>0)));
}

/**
 * Inspect only index-level seven-card Basic and overlap events. It never
 * claims to model native mulligan prompts, bonus draws, play, or game results.
 * @param {number} trials
 * @returns {object}
 */
function runCalibration(trials=100000){
  assert.ok(Number.isInteger(trials)&&trials>=1&&trials<=1000000);
  const basicIndices=rank4Basics();
  const basicSet=new Set(basicIndices);
  const pNoBasic=Number((()=>{
    let result=1;
    for(let k=0;k<7;k++)result*=(47-k)/(60-k);
    return result;
  })());
  const expectedJoint=pNoBasic*pNoBasic;
  const expectedIndexOverlap=49/60;
  const counters=Object.fromEntries(
    Object.keys(PROTOCOLS).map(name=>[name,{
      noBasic:[0,0],bothNoBasic:0,overlap:0,
      firstSwapSameHalf:0
    }]));
  for(let i=0;i<trials;i++){
    const seed=sourceSeed(i);
    for(const name of Object.keys(PROTOCOLS)){
      const [a,b]=firstPhysicalShuffles(seed,name);
      const handA=a.slice(0,7),handB=b.slice(0,7);
      const noA=handA.every(k=>!basicSet.has(k));
      const noB=handB.every(k=>!basicSet.has(k));
      const counts=counters[name];
      if((a[59]<30)===(b[59]<30))counts.firstSwapSameHalf++;
      if(noA)counts.noBasic[0]++;
      if(noB)counts.noBasic[1]++;
      if(noA&&noB)counts.bothNoBasic++;
      for(const k of handA)if(handB.includes(k))counts.overlap++;
    }
  }
  const marginSE=Math.sqrt(pNoBasic*(1-pNoBasic)/trials);
  const jointSE=Math.sqrt(expectedJoint*(1-expectedJoint)/trials);
  const overlapSE=Math.sqrt(
    (7*(7/60)*(53/60)*(53/59))/trials);
  const firstSwapHalfSE=Math.sqrt(0.25/trials);
  return {
    version:VERSION,sourceRank:4,
    printedSixtyCards:60,printedBasics:basicIndices.length,
    basicOriginalOrderedCardIndices:basicIndices,
    trials,seedDerivation:'SHA256 index tag, low 32-bit little-endian',
    expected:{
      noBasicPerSeat:pNoBasic,
      bothNoBasicUnderIndependentDeckShuffles:expectedJoint,
      averageIdenticalIndexOverlapSeven:expectedIndexOverlap,
      firstFisherYatesSwapSameHalfUnderIndependentDeckShuffles:0.5
    },
    protocols:Object.fromEntries(Object.entries(counters).map(
      ([name,count])=>{
        const marginals=count.noBasic.map(n=>n/trials);
        const joint=count.bothNoBasic/trials;
        const overlap=count.overlap/trials;
        const sameHalf=count.firstSwapSameHalf/trials;
        return [name,{
          noBasicCounts:count.noBasic,
          noBasicRates:marginals,
          jointNoBasicCount:count.bothNoBasic,
          jointNoBasicRate:joint,
          jointNoBasicCovariance:joint-marginals[0]*marginals[1],
          firstSevenIndexOverlapMean:overlap,
          firstSwapSameHalfCount:count.firstSwapSameHalf,
          firstSwapSameHalfRate:sameHalf,
          firstSwapHalfZAgainstIndependentUniform:
            (sameHalf-0.5)/firstSwapHalfSE,
          marginalZAgainstIndependentUniform:marginals.map(
            p=>(p-pNoBasic)/marginSE),
          jointZAgainstIndependentUniform:(joint-expectedJoint)/jointSE,
          overlapZAgainstIndependentUniform:
            (overlap-expectedIndexOverlap)/overlapSE
        }];
      })),
    calibratedEventsOnly:true,
    simulatorGames:0,competitiveQualifiedGames:0,
    limits:[
      'This is a shuffle-index experiment; neither native setup nor card decisions execute.',
      'Shared-stream approximation omits any native random draws before or between the two modeled shuffles.',
      'XOR-salted xorshift32 seat streams impose fixed cross-seat word XOR masks; first swaps are exactly forced into opposite deck halves absent zero-derived-seed exceptions.',
      'SHA256 domain-separated seat seeds remove this exact affine coupling but remain deterministic from one 32-bit master seed, not an independent source of new entropy.',
      'The paired seat seeds are deterministic, so zero observed covariance does not prove stochastic independence.',
      'One fixed original rank4 deck order and one deterministic SHA-256 seed cohort.',
      'No real-game or opponent-policy inference.'
    ]
  };
}
if(require.main===module){
  const trials=process.env.AGENT26_SHUFFLE_TRIALS?
    Number(process.env.AGENT26_SHUFFLE_TRIALS):100000;
  console.log('AGENT26_SHUFFLE_PROTOCOL_CALIBRATION '+
    JSON.stringify(runCalibration(trials)));
}
module.exports={VERSION,PROTOCOLS,rank4Basics,sourceSeed,
  firstPhysicalShuffles,runCalibration};
