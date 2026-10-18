'use strict';

const assert = require('node:assert/strict');
const {choose} = require('./new-moon-lockbreak-access.cjs');
const variant = require('../results/als/new-moon-lockbreak-english-proxy-60.json');

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b) {
  while (b) [a,b]=[b,a%b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator @returns {object} */
function ratio(numerator,denominator) {
  const d=gcd(numerator,denominator);
  return {
    numerator:String(numerator/d),
    denominator:String(denominator/d),
    probability:Number(numerator)/Number(denominator)
  };
}

/**
 * Conditional on a legal seven, count the specific conjunction:
 *  - at least one Mewtwo & Mew-GX in the initial seven;
 *  - at least one Battle Compressor in the opening seven or next draw;
 *  - Gengar & Mimikyu-GX still in the unprized deck;
 *  - a direct Field Blower in the first eight, or otherwise a held Secret
 *    Box with at least one unprized Field Blower search target.
 *
 * All "routes" are physical resource positions only; actual Item usability,
 * three other Secret Box discards and game decision policies are omitted.
 * Other starting Basics are exchangeable with non-basics once Mewtwo is
 * required in the opening seven. The 17-Basic conditional denominator still
 * matters because initial hands with no Basic mulligan.
 *
 * @param {object} inventory
 * @param {number} inventory.mewtwo
 * @param {number} inventory.gengar
 * @param {number} inventory.compressor
 * @param {number} inventory.blower
 * @param {number} inventory.box
 * @param {number} inventory.basics
 * @returns {object}
 */
function calculate({mewtwo,gengar,compressor,blower,box,basics}) {
  for(const n of [mewtwo,gengar,compressor,blower,box,basics]) {
    assert.ok(Number.isInteger(n)&&n>=0);
  }
  assert.equal(gengar,1,'A single Gengar is required for the Prize model');
  assert.ok(mewtwo>0 && basics>=mewtwo+gengar);
  const fixed=mewtwo+gengar+compressor+blower+box;
  assert.ok(fixed<=60 && basics<=60);
  const other=60-fixed;
  const counts=[mewtwo,gengar,compressor,blower,box,other];
  const selections=new Array(counts.length).fill(0);
  let resourceWeight=0n;
  let directWeight=0n;
  let boxWeight=0n;
  /** @param {number} i @param {number} left @param {bigint} ways */
  function recurse(i,left,ways) {
    if(i===counts.length) {
      if(left!==0||selections[0]===0||selections[1]!==0) return;
      for(let next=0;next<counts.length;next++) {
        const remaining=counts[next]-selections[next];
        if(remaining===0||next===1) continue;
        const current=selections.slice();
        current[next]++;
        if(current[2]===0) continue;
        const weighted=ways*BigInt(remaining);
        resourceWeight+=weighted;
        if(current[3]>0)directWeight+=weighted;
        else if(current[4]>0)boxWeight+=weighted;
      }
      return;
    }
    for(let n=0;n<=Math.min(counts[i],left);n++) {
      selections[i]=n;
      recurse(i+1,left-n,ways*choose(counts[i],n));
    }
  }
  recurse(0,7,1n);
  const validSeven=choose(60,7)-choose(60-basics,7);
  const prizeChoices=choose(52,6);
  const unprizedGengar=choose(51,6);
  const unprizedGengarAndSearchBlower=
    unprizedGengar-choose(52-1-blower,6-blower);
  const denominator=validSeven*53n*prizeChoices;
  const sourceNum=resourceWeight*unprizedGengar;
  const directNum=directWeight*unprizedGengar;
  const boxNum=boxWeight*unprizedGengarAndSearchBlower;
  return {
    candidateCompressorGengar:ratio(sourceNum,denominator),
    directBlowerAndCompressorGengar:ratio(directNum,denominator),
    exclusiveBoxAndCompressorGengar:ratio(boxNum,denominator),
    union:ratio(directNum+boxNum,denominator),
    rawEightDrawWeights:{
      compressorGengar:String(resourceWeight),
      directBlower:String(directWeight),
      exclusiveSecretBox:String(boxWeight)
    }
  };
}

/** @returns {object} */
function main() {
  assert.equal(variant.canonical_id_count_sha256,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  /** @param {string} name */
  const get=name=>variant.entries.filter(e=>e.name_en===name)
    .reduce((n,row)=>n+row.count,0);
  const basics=variant.counts['Pokémon']-get('Dusclops');
  assert.equal(basics,17);
  const inventory={
    mewtwo:get('Mewtwo & Mew-GX'),gengar:get('Gengar & Mimikyu-GX'),
    compressor:get('Battle Compressor'),blower:get('Field Blower'),
    box:get('Secret Box'),basics
  };
  assert.deepEqual(inventory,{
    mewtwo:2,gengar:1,compressor:2,blower:2,box:1,basics:17
  });
  return {
    schema:'newmoon-first-eight-blower-compressor-gengar-joint-resources-v1',
    fixedCandidateHash:variant.canonical_id_count_sha256,
    inventory,
    preciseScope:'Legal seven, six uniformly unknown Prizes, first mandatory draw. Mewtwo initial seven, Compressor observed, Gengar unprized in deck, Field Blower observed or Secret Box observed with unprized Blower.',
    result:calculate(inventory),
    limitations:'Excludes alternative Gengar Bench/draw routes, connectors, timing, Item lock, Secret Box discard cost, Energie, attack legality, opponent retooling and all win-rate inference.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={calculate,main};
