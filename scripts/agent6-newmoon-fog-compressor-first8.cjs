'use strict';

const assert=require('node:assert/strict');
const {choose}=require('../simulation/twinleaf/redeal-posterior.cjs');
const candidate=require('../results/als/new-moon-lockbreak-english-proxy-60.json');

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b) {
  while(b!==0n) [a,b]=[b,a%b];
  return a;
}

/**
 * @param {bigint} numerator
 * @param {bigint} denominator
 * @returns {{numerator:string,denominator:string,probability:number}}
 */
function fraction(numerator,denominator) {
  assert.ok(numerator>=0n && denominator>0n);
  const reduced=gcd(numerator,denominator);
  return {
    numerator:String(numerator/reduced),
    denominator:String(denominator/reduced),
    probability:Number(numerator)/Number(denominator)
  };
}

/**
 * Conditional legal-opening-seven event:
 * - Mewtwo & Mew-GX in initial 7;
 * - Gengar & Mimikyu-GX is absent from first 8 and six Prizes;
 * - at least one of the specified donor-search Items is in first 8.
 *
 * Fog Crystal offers in-deck Basic Psychic Gengar to hand (additional Bench
 * play needed); Battle Compressor can put it in discard (effect resolution
 * needed). This is an initial inventory subset, not an executable attack.
 *
 * @param {{basics:number,mewtwo:number,gengar:number,fog:number,
 *   compressor:number}} inventory
 */
function calculate(inventory) {
  const {basics,mewtwo,gengar,fog,compressor}=inventory;
  assert.deepEqual([basics,mewtwo,gengar,fog,compressor].every(
    n=>Number.isSafeInteger(n)&&n>=0),true);
  assert.equal(gengar,1,'Singleton donor assumption');
  assert.ok(mewtwo>0 && basics>=mewtwo+gengar);
  assert.ok(basics<=60 && mewtwo+gengar+fog+compressor<=60);
  const validSeven=choose(60,7)-choose(60-basics,7);
  const totalNextCards=53n;
  const prizeChoices=choose(52,6);
  const favorablePrizeChoices=choose(51,6);
  const denominator=validSeven*totalNextCards*prizeChoices;
  /** @param {number} searchItemCount @returns {bigint} */
  function ways(searchItemCount) {
    const allNoGengar=choose(59,7);
    const noMewtwo=choose(59-mewtwo,7);
    const noSearch=choose(59-searchItemCount,7);
    const neither=choose(59-mewtwo-searchItemCount,7);
    const bothSeven=allNoGengar-noMewtwo-noSearch+neither;
    const mewtwoOnlySeven=noSearch-neither;
    // If both requirements are in the opening seven, any of the 52
    // non-Gengar cards can be the next draw. Otherwise draw one of the
    // remaining searched Items. The hidden six Prizes are assigned last
    // by exchangeability and need not be dealt earlier for this count.
    const firstEight=52n*bothSeven+
      BigInt(searchItemCount)*mewtwoOnlySeven;
    return firstEight*favorablePrizeChoices;
  }
  const fogWays=ways(fog);
  const compressorWays=ways(compressor);
  const unionWays=ways(fog+compressor);
  const overlapWays=fogWays+compressorWays-unionWays;
  assert.ok(overlapWays>=0n);
  return {
    fogSeenChannel:fraction(fogWays,denominator),
    compressorSeenChannel:fraction(compressorWays,denominator),
    eitherChannel:fraction(unionWays,denominator),
    bothChannels:fraction(overlapWays,denominator)
  };
}

/** @returns {object} */
function main() {
  assert.equal(candidate.canonical_id_count_sha256,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  /** @param {string} name @returns {number} */
  const copies=name=>candidate.entries.filter(x=>x.name_en===name)
    .reduce((count,row)=>count+row.count,0);
  const inventory={
    basics:candidate.counts['Pokémon']-copies('Dusclops'),
    mewtwo:copies('Mewtwo & Mew-GX'),
    gengar:copies('Gengar & Mimikyu-GX'),
    fog:copies('Fog Crystal'),
    compressor:copies('Battle Compressor')
  };
  assert.deepEqual(inventory,{basics:17,mewtwo:2,gengar:1,fog:4,compressor:2});
  return {
    schema:'agent6-newmoon-first-eight-fog-or-compressor-donor-v1',
    candidatePrintingHash:candidate.canonical_id_count_sha256,
    inventory,
    assumptions:'Uniform legal opening seven and Prize cards; one mandatory first draw; Mewtwo in initial seven, Gengar in unprized searchable deck; Fog/Compressor held among first eight',
    channels:calculate(inventory),
    restrictions:'Does not model searched Gengar subsequently benched, Compressor settlement, Energy payment, locks, first-player attack restriction, discard cost, Supporter contention, turn clock, alternative donors or win rate',
    competitivelyQualified:false
  };
}

if(require.main===module) process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={calculate,main};
