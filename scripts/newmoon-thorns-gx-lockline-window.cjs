'use strict';

const assert = require('node:assert/strict');
const manifest = require('../results/als/new-moon-lockbreak-english-proxy-60.json');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if(k<0 || k>n) return 0n;
  let value=1n;
  for(let i=1;i<=Math.min(k,n-k);i++){
    value=value*BigInt(n-Math.min(k,n-k)+i)/BigInt(i);
  }
  return value;
}

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a,b) {
  while(b!==0n) [a,b]=[b,a%b];
  return a;
}

/**
 * @typedef {object} DirectResources
 * @property {number} mewtwo Basic Mewtwo & Mew-GX copies
 * @property {number} gengar Gengar & Mimikyu-GX singleton
 * @property {number} compressor Battle Compressor copies
 * @property {number} cologne Canceling Cologne copies
 * @property {number} psychicEnergy Printed Psychic-providing Energy copies
 * @property {number} basics Total ordinary Basic Pokémon copies in the 60
 */

/** @param {DirectResources} c */
function validate(c){
  const sizes=[c.mewtwo,c.gengar,c.compressor,c.cologne,
    c.psychicEnergy,c.basics];
  assert.ok(sizes.every(n=>Number.isSafeInteger(n)&&n>=0));
  assert.equal(c.gengar,1,'One Gengar payload is modeled');
  assert.ok(c.mewtwo<=c.basics-1);
  assert.ok(c.basics+c.compressor+c.cologne+c.psychicEnergy<=60);
}

/**
 * Exact first-eight co-visibility, conditional on a legal starting seven.
 * Desired event: a Mewtwo in the first seven; Compressor, Cologne, and any
 * Psychic-providing Energy in the first seven plus the first normal draw;
 * singleton Gengar absent from all eight and the six face-down Prizes.
 *
 * The deck-to-discard Compressor route is only a potential resource channel.
 * Item legality, attack resolution, both sides' play, and other access paths
 * are outside this probability calculation.
 *
 * @param {DirectResources} c
 * @returns {{numerator:string,denominator:string,probability:number}}
 */
function inclusionExclusion(c){
  validate(c);
  const groups=[c.compressor,c.cologne,c.psychicEnergy];
  let favorable=0n;
  for(let mask=0;mask<8;mask++){
    let excluded=0,bits=0;
    for(let j=0;j<3;j++){
      if(mask & (1<<j)){excluded+=groups[j];bits++;}
    }
    // The payload Gengar is absent from the initial seven and first draw.
    // Every first-seven subset includes at least one initial Mewtwo.
    const available=59-excluded;
    const firstSevens=choose(available,7)-
      choose(available-c.mewtwo,7);
    const nextCards=BigInt(available-7);
    const term=firstSevens*nextCards;
    favorable+=bits%2===0?term:-term;
  }
  // With Gengar still among the 52 unseen cards after the eighth, its
  // survival of six uniformly chosen Prize positions is exactly 46/52.
  const validInitialSevens=choose(60,7)-choose(60-c.basics,7);
  const numerator=favorable*46n;
  const denominator=validInitialSevens*53n*52n;
  const divisor=gcd(numerator,denominator);
  return {
    numerator:String(numerator/divisor),
    denominator:String(denominator/divisor),
    probability:Number(numerator)/Number(denominator)
  };
}

/**
 * Independent multivariate initial-seven enumeration. For each physical
 * seven-card composition, explicitly count qualifying eighth-card choices.
 * @param {DirectResources} c
 * @returns {bigint} Number of initial-seven/eighth pairs before Prize check
 */
function physicalSubsetCount(c){
  validate(c);
  const counts=[
    c.mewtwo,c.compressor,c.cologne,c.psychicEnergy,
    c.basics-c.mewtwo-c.gengar,
    60-c.basics-c.compressor-c.cologne-c.psychicEnergy
  ];
  let favorable=0n;
  for(let m=1;m<=Math.min(7,counts[0]);m++){
    for(let b=0;b<=Math.min(7-m,counts[1]);b++){
      for(let x=0;x<=Math.min(7-m-b,counts[2]);x++){
        for(let e=0;e<=Math.min(7-m-b-x,counts[3]);e++){
          for(let o=0;o<=Math.min(7-m-b-x-e,counts[4]);o++){
            const rest=7-m-b-x-e-o;
            if(rest>counts[5])continue;
            const selected=[m,b,x,e,o,rest];
            let arrangements=1n;
            for(let k=0;k<counts.length;k++){
              arrangements*=choose(counts[k],selected[k]);
            }
            let possibleNext=0n;
            for(let k=0;k<counts.length;k++){
              const next=selected.slice();
              next[k]++;
              if(next[1]>0&&next[2]>0&&next[3]>0){
                possibleNext+=BigInt(counts[k]-selected[k]);
              }
            }
            favorable+=arrangements*possibleNext;
          }
        }
      }
    }
  }
  return favorable;
}

/** Fixed source-manifest counts with deliberately explicit printing roles. */
function sourceCounts(){
  const count=name=>manifest.entries
    .filter(x=>x.name_en===name)
    .reduce((s,x)=>s+x.count,0);
  const c={
    mewtwo:count('Mewtwo & Mew-GX'),
    gengar:count('Gengar & Mimikyu-GX'),
    compressor:count('Battle Compressor'),
    cologne:count('Canceling Cologne'),
    psychicEnergy:manifest.entries.filter(x=>x.type==='Energy')
      .reduce((s,x)=>s+x.count,0),
    basics:17
  };
  assert.equal(manifest.counts.total,60);
  assert.equal(manifest.counts['Pokémon'],19);
  assert.equal(count('Dusclops'),2);
  assert.equal(c.basics,manifest.counts['Pokémon']-count('Dusclops'));
  return c;
}

function main(){
  const source=sourceCounts();
  const variants={
    original:source,
    extraTwoPsychicEnergy:{...source,psychicEnergy:source.psychicEnergy+2},
    extraTwoCologne:{...source,cologne:source.cologne+2},
    extraTwoCompressor:{...source,compressor:source.compressor+2},
    oneExtraCologneAndCompressor:{...source,
      cologne:source.cologne+1,compressor:source.compressor+1}
  };
  return {
    schema:'newmoon-rank6-direct-gx-lockline-resource-window-v1',
    fixedSourcePrintingHash:manifest.canonical_id_count_sha256,
    sourceCounts:source,
    conditioning:'Legal initial seven; no mulligan bonus; first normal draw; six hidden Prizes',
    route:'Mewtwo initial, Compressor and Cologne and Psychic Energy in first eight, Gengar still in deck',
    outcomes:Object.fromEntries(Object.entries(variants)
      .map(([name,c])=>[name,inclusionExclusion(c)])),
    qualification:'Resource opportunities only. No paper-legal attack, matchup win or deck replacement established.'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={choose,gcd,inclusionExclusion,physicalSubsetCount,sourceCounts,main};
