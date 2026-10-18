'use strict';

const assert = require('node:assert/strict');
const manifest = require('../results/als/new-moon-lockbreak-english-proxy-60.json');
const {choose} = require('./new-moon-lockbreak-access.cjs');

/** @param {bigint} x @param {bigint} y @returns {bigint} */
function gcd(x,y) {
  while(y!==0n)[x,y]=[y,x%y];
  return x;
}
/** @param {bigint} n @param {bigint} d */
function rational(n,d) {
  assert(n>=0n&&d>0n);
  const z=gcd(n,d);
  return {numerator:String(n/z),denominator:String(d/z),
    probability:Number(n)/Number(d)};
}
/** @param {number} n @param {number} k @returns {bigint} */
function C(n,k) {
  return k<0||n<0||k>n?0n:choose(n,k);
}
const POPULATION=Object.freeze([2,1,1,3,3,2,2,14,32]);
// Named buckets: Mewtwo, Gengar, Box, Basic Psychic, Telepathic Psychic,
// Blower, Powerglass, other Basics, remaining other non-Basic cards.

/**
 * Source-fixed first-eight co-visibility. Mewtwo is in the first seven.
 * One Secret Box and its Gengar payload are among the first eight.
 * One Basic Psychic Energy remains to be discarded, plus a *different*
 * Psychic/Telepathic Energy available to attach. A separate designated
 * non-Basic payment is available. No Blower is directly observed.
 * Blower must survive Prize cards, and Powerglass either is observed
 * or survives Prizes for Secret Box's Tool search.
 *
 * This is hypothetical resource co-visibility, not playable policy,
 * actual discard desirability, a source-dealt match, or a win rate.
 *
 * @param {number} D Number of separately designated acceptable physical
 *   card copies within the 32 non-Basic cards excluding Box, Blower and
 *   Powerglass.
 */
function firstEight(D) {
  assert(Number.isInteger(D)&&D>=0&&D<=32);
  const prizes=C(52,6);
  const blowerSurvives=prizes-C(50,4);
  const blowerAndGlassSurvive=prizes-2n*C(50,4)+C(48,2);
  let favorable=0n;
  for(let m=1;m<=2;m++) {
    for(let b=1;b<=3;b++) {
      for(let t=0;t<=3;t++) {
        if(b+t<2)continue;
        for(let p=0;p<=2;p++) {
          for(let d=1;d<=D;d++) {
            for(let otherBasics=0;otherBasics<=14;otherBasics++) {
              const other=8-m-1-1-b-t-p-d-otherBasics;
              if(other<0||other>32-D)continue;
              const ways=C(2,m)*C(3,b)*C(3,t)*C(2,p)*
                C(D,d)*C(14,otherBasics)*C(32-D,other);
              const validSeventhPositions=m===1?7n:8n;
              favorable+=ways*validSeventhPositions*
                (p>0?blowerSurvives:blowerAndGlassSurvive);
            }
          }
        }
      }
    }
  }
  const legalSeven=C(60,7)-C(43,7);
  return rational(favorable*C(60,7),
    8n*C(60,8)*legalSeven*prizes);
}

/**
 * Independent combinatorial representation: draw a complete initial seven
 * before any Prize cards, then sum each of the 53 possible eighth draws.
 * No exchangeable-eight 7/8 weighting shortcut is used.
 * @param {number} D
 */
function firstSevenThenDraw(D) {
  assert(Number.isInteger(D)&&D>=0&&D<=32);
  const capacities=[2,1,1,3,3,2,2,14,D,32-D];
  const seven=Array(capacities.length).fill(0);
  const prizes=C(52,6);
  const blowerSurvives=prizes-C(50,4);
  const blowerAndGlassSurvive=prizes-2n*C(50,4)+C(48,2);
  let ways=0n;
  /** @param {number} depth @param {number} left @param {bigint} weight */
  function enumerate(depth,left,weight) {
    if(depth===capacities.length) {
      if(left!==0 ||seven[0]===0)return;
      for(let drawType=0;drawType<capacities.length;drawType++) {
        const remaining=capacities[drawType]-seven[drawType];
        if(!remaining)continue;
        seven[drawType]++;
        const [m,g,box,b,t,blower,p,otherBasics,d,other]=seven;
        if(g===1&&box===1&&blower===0&&b>=1&&b+t>=2&&d>=1){
          ways+=weight*BigInt(remaining)*
            (p>0?blowerSurvives:blowerAndGlassSurvive);
        }
        seven[drawType]--;
      }
      return;
    }
    for(let n=0;n<=Math.min(capacities[depth],left);n++) {
      seven[depth]=n;
      enumerate(depth+1,left-n,weight*C(capacities[depth],n));
    }
    seven[depth]=0;
  }
  enumerate(0,7,1n);
  return rational(ways,
    (C(60,7)-C(43,7))*53n*prizes);
}

/** @returns {object} */
function main() {
  assert.equal(manifest.canonical_id_count_sha256,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  /** @param {string} name */
  const copies=name=>manifest.entries.filter(x=>x.name_en===name)
    .reduce((n,x)=>n+x.count,0);
  assert.equal(copies('Mewtwo & Mew-GX'),2);
  assert.equal(copies('Gengar & Mimikyu-GX'),1);
  assert.equal(copies('Secret Box'),1);
  assert.equal(copies('Field Blower'),2);
  assert.equal(copies('Powerglass'),2);
  assert.equal(copies('Basic Psychic Energy'),3);
  assert.equal(copies('Telepathic Psychic Energy'),3);
  assert.equal(manifest.counts.total,60);
  assert.equal(POPULATION.reduce((n,x)=>n+x,0),60);
  const tiers=[
    {name:'none',D:0},
    {name:'six potentially expendable trainer copies',D:6},
    {name:'ten potentially expendable trainer copies',D:10},
    {name:'fourteen potentially expendable trainer copies',D:14},
    {name:'sixteen potentially expendable trainer copies',D:16},
    {name:'every otherwise excluded non-Basic copy',D:32}
  ].map(row=>({...row,strictCoVisibility:firstEight(row.D)}));
  return {
    schema:'new-moon-secret-box-discard-payload-energy-conjunction-v1',
    sourceHash:manifest.canonical_id_count_sha256,
    conditions:'Mewtwo Active selected from opening seven; by first normal draw, a Gengar Basic and Secret Box and a Basic Psychic to discard plus a distinct attachable Psychic/Telepathic Energy and one acceptable other non-Basic to discard; no direct Field Blower; unprized Blower; Powerglass visible or unprized.',
    prizeAndMulligans:'Six uniform Prize cards after legal seven, no opponent bonus draws; first ordinary draw included.',
    rows:tiers,
    independentSevenDrawCheck:tiers.map(x=>({
      D:x.D,exact:firstSevenThenDraw(x.D)})),
    limitations:'Specific strict all-at-once co-visibility only. Search/draw chains, sequencing, attached-versus-held resources, alternative attacks, opponent lock timing, genuine payment quality and match outcomes are absent.',
    qualifiedCompetitiveGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={firstEight,firstSevenThenDraw,main};
