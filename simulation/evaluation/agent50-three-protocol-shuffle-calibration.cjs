'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {seededRandom,deckPermutation} = require('../twinleaf/headless.cjs');
const {SALTS,hashDerivedSetupSeatSeed} =
  require('./agent26-per-seat-setup-shuffle-streams.cjs');

const VERSION='agent50-rank4-three-protocol-shuffle-calibration-v1';
const REGISTRATION=
  'results/methodology/registrations/agent50-rank4-setup-rng-three-protocol-200k-calibration-20261107.md';
const SAMPLE_DOMAIN=Buffer.from('pokemon-expanded-agent50-rng-calibration-v1');
const MASTER=Buffer.from('cadbb52dd605505cecab719b44ac22d9','hex');
const BASIC_LOCATIONS=Object.freeze([0,1,5,8,9,10,11,12,13,14,15,16,17]);
const BASIC_MASK=Array.from({length:60},(_,i)=>BASIC_LOCATIONS.includes(i));
const PROTOCOLS=Object.freeze([
  'legacy-shared','legacy-one-word-offset',
  'agent26-xor-v1','agent26-sha256-v2'
]);
const DIRECTIONS=Object.freeze(['leading-seven','trailing-seven']);
assert.equal(BASIC_LOCATIONS.length,13);
assert.equal(MASTER.length,16);
assert.equal(SALTS[0],0x243f6a88);
assert.equal(SALTS[1],0x85a308d3);

/**
 * Domain-separated, prospective, deterministic unsigned 32-bit trial seed.
 * @param {number} index Trial index, inclusive of 0.
 * @returns {number}
 */
function sampleSeed(index){
  assert.ok(Number.isInteger(index)&&index>=0&&index<=0xffffffff);
  const counter=Buffer.alloc(4);
  counter.writeUInt32LE(index);
  return createHash('sha256').update(SAMPLE_DOMAIN).update(MASTER)
    .update(counter).digest().readUInt32LE(0);
}

/**
 * Physical shuffle distributions under one exactly named protocol.
 * @param {number} seed Unsigned 32-bit seed.
 * @param {string} protocol One of the four frozen protocols.
 * @returns {[number[],number[]]} Two seat-order permutations.
 */
function generatePermutations(seed,protocol){
  assert.ok(Number.isInteger(seed)&&seed>=0&&seed<=0xffffffff);
  if(protocol==='legacy-shared'||protocol==='legacy-one-word-offset'){
    const random=seededRandom(seed);
    if(protocol==='legacy-one-word-offset')random();
    return [deckPermutation(60,random),deckPermutation(60,random)];
  }
  if(protocol==='agent26-xor-v1'){
    return [0,1].map(seat=>
      deckPermutation(60,seededRandom((seed^SALTS[seat])>>>0)));
  }
  if(protocol==='agent26-sha256-v2'){
    return [0,1].map(seat=>
      deckPermutation(60,seededRandom(hashDerivedSetupSeatSeed(seed,seat))));
  }
  throw new Error('Unknown registered setup protocol: '+String(protocol));
}

/**
 * Whether seven deck indices contain no printed Basic Pokémon.
 * This tests an explicitly chosen direction; it does not claim the
 * standalone permutation models Twinleaf's entire setup reducer.
 * @param {number[]} permutation Length-60 index permutation.
 * @param {'leading-seven'|'trailing-seven'} direction
 * @returns {boolean}
 */
function openingMulligan(permutation,direction){
  assert.equal(permutation.length,60);
  const start=direction==='leading-seven'?0:
    direction==='trailing-seven'?53:null;
  assert.ok(start!==null);
  for(let i=start;i<start+7;i++){
    if(BASIC_MASK[permutation[i]])return false;
  }
  return true;
}

/** @returns {{n:number,n00:number,n01:number,n10:number,n11:number}} */
function newCounts(){return {n:0,n00:0,n01:0,n10:0,n11:0};}

/**
 * Update a paired binary 2x2 table, row=seat0 fail, col=seat1 fail.
 * @param {{n:number,n00:number,n01:number,n10:number,n11:number}} c
 * @param {boolean} a
 * @param {boolean} b
 */
function count(c,a,b){
  c.n++;
  c[a?(b?'n11':'n10'):(b?'n01':'n00')]++;
}

/**
 * Summarize a paired opening-failure table.
 * @param {{n:number,n00:number,n01:number,n10:number,n11:number}} c
 * @param {number} paperNull
 * @returns {object}
 */
function summary(c,paperNull){
  const n=c.n,n0=c.n10+c.n11,n1=c.n01+c.n11;
  const phiNumer=c.n11*c.n00-c.n10*c.n01;
  const phiDenom=Math.sqrt((c.n11+c.n10)*(c.n11+c.n01)*
    (c.n00+c.n10)*(c.n00+c.n01));
  return {
    ...c,
    seat0Failures:n0,seat1Failures:n1,
    seat0Rate:n0/n,seat1Rate:n1/n,
    bothFailRate:c.n11/n,
    independentBothFailBaseline:paperNull**2,
    bothFailMinusIndependentBaseline:c.n11/n-paperNull**2,
    phi:phiDenom===0?null:phiNumer/phiDenom,
    conditionalSeat1FailGivenSeat0Fail:n0>0?c.n11/n0:null,
    discordantSeat0Only:c.n10,discordantSeat1Only:c.n01,
    pairedSeatRateDifference:(n0-n1)/n
  };
}

/**
 * Registered prospective computational cohort: one fixed seed stream
 * and four protocol labels × two explicitly preserved draw directions.
 * @param {number} sampleCount Defaults to the registered 200000.
 * @returns {object} Reproducible aggregate receipt.
 */
function runCalibration(sampleCount=200000){
  assert.ok(Number.isInteger(sampleCount)&&
    sampleCount>=1&&sampleCount<=200000);
  const counts=Object.fromEntries(PROTOCOLS.map(p=>
    [p,Object.fromEntries(DIRECTIONS.map(d=>[d,newCounts()]))]));
  const uniques=new Set();
  for(let i=0;i<sampleCount;i++){
    const seed=sampleSeed(i);
    uniques.add(seed);
    for(const protocol of PROTOCOLS){
      const [a,b]=generatePermutations(seed,protocol);
      for(const direction of DIRECTIONS){
        count(counts[protocol][direction],
          openingMulligan(a,direction),openingMulligan(b,direction));
      }
    }
  }
  let q=1;
  for(let i=0;i<7;i++)q*=(47-i)/(60-i);
  return {
    schema:VERSION,
    registration:REGISTRATION,
    masterHex:MASTER.toString('hex'),
    derivation:'sha256(domain || master16 || uint32le(index)).readUInt32LE(0)',
    sampleCount,
    uniqueMasterSeeds:uniques.size,
    repeatedSeedIndices:sampleCount-uniques.size,
    basicLocations:BASIC_LOCATIONS,
    exactUniformPaperSingleHandFailure:q,
    protocols:Object.fromEntries(PROTOCOLS.map(protocol=>[
      protocol,Object.fromEntries(DIRECTIONS.map(direction=>
        [direction,summary(counts[protocol][direction],q)]))
    ])),
    qualification:{
      physicalPaperShuffleCertified:false,
      nativeGameplayExecuted:false,
      competitiveGamesQualified:0,
      winRateEstimated:false
    }
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(runCalibration(),null,2)+'\n');
module.exports={VERSION,REGISTRATION,PROTOCOLS,DIRECTIONS,
  sampleSeed,generatePermutations,openingMulligan,summary,runCalibration};
