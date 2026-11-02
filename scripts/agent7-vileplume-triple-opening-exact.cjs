'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {ID,choose,loadSource,makePool}=
  require('./agent7-vileplume-artazon-capture-opening.cjs');

const GROUPS=['B','O','P','TC','GH','A','C','TM',
  'Gloom','Pidgeotto','VileplumeAOR','Pidgeot','OTHER'];
const NOT_ALL_PRIZED=new Set(['O','P','A','C','TM']);
const MUST_REMAIN_IN_DECK=new Set([
  'Gloom','Pidgeotto','VileplumeAOR','Pidgeot'
]);
const TAG_SEEN=1,GH_SEEN=2,GH_IN_DECK=4;

/**
 * Exact multivariate hypergeometric count of the named 3-channel opportunity.
 * Each card is a distinct physical copy. Positions are unordered opening
 * hand (size h), unordered Prizes (size p), then one first-turn draw.
 *
 * Iterate each card category's allocation to H, P, D, remaining deck;
 * product of binomial counts assigns concrete physical copies to zones.
 * The three-bit mask remembers only the two connector visibility events and
 * whether a Guzma & Hala remains searchable in deck.
 *
 * @param {Record<string,number>} groups Counts for all 13 categories.
 * @param {number} h Opening-hand size.
 * @param {number} p Prize count.
 * @returns {{favorable:bigint,denominator:bigint,groupCount:number}}
 */
function exactThreeChannel(groups,h,p){
  const values=GROUPS.map(g=>groups[g]);
  assert.ok(values.every(n=>Number.isSafeInteger(n)&&n>=0));
  assert.ok(values.slice(0,-1).every(n=>n>0));
  const total=values.reduce((a,b)=>a+b,0);
  assert.ok(Number.isSafeInteger(h)&&Number.isSafeInteger(p));
  assert.ok(h>=1&&p>=0&&total-h-p>=1);
  const initialKey='0,0,0,0';
  let dp=new Map([[initialKey,1n]]);
  for(const name of GROUPS){
    const count=groups[name];
    const next=new Map();
    for(const [key,weight] of dp){
      const [hand,prize,draw,flags]=key.split(',').map(Number);
      for(let hh=0;hh<=Math.min(count,h-hand);hh++){
        if(name==='B'&&hh===0)continue;
        for(let pp=0;pp<=Math.min(count-hh,p-prize);pp++){
          if(NOT_ALL_PRIZED.has(name)&&pp===count)continue;
          for(let dd=0;dd<=Math.min(count-hh-pp,1-draw);dd++){
            const deck=count-hh-pp-dd;
            if(MUST_REMAIN_IN_DECK.has(name)&&deck===0)continue;
            let nextFlags=flags;
            if(name==='TC'&&hh+dd>0)nextFlags|=TAG_SEEN;
            if(name==='GH'){
              if(hh+dd>0)nextFlags|=GH_SEEN;
              if(deck>0)nextFlags|=GH_IN_DECK;
            }
            const ways=choose(count,hh)*choose(count-hh,pp)*
              choose(count-hh-pp,dd);
            const id=[hand+hh,prize+pp,draw+dd,nextFlags].join(',');
            next.set(id,(next.get(id)??0n)+weight*ways);
          }
        }
      }
    }
    dp=next;
  }
  let favorable=0n;
  for(const [key,weight] of dp){
    const [hand,prize,draw,flags]=key.split(',').map(Number);
    if(hand!==h||prize!==p||draw!==1)continue;
    if((flags&GH_SEEN)!==0||
      (flags&TAG_SEEN)!==0&&(flags&GH_IN_DECK)!==0){
      favorable+=weight;
    }
  }
  const denominator=choose(total,h)*choose(total-h,p)*BigInt(total-h-p);
  return {favorable,denominator,groupCount:total};
}

/**
 * Source-validated inventory of the published Aichi rank 2 or 15 physical 60.
 * @param {object} source Original source deck
 * @returns {Record<string,number>}
 */
function sourceCounts(source){
  const pool=makePool(source);
  return Object.fromEntries(GROUPS.map(k=>[
    k,Array.from(pool).filter(id=>id===ID[k]).length
  ]));
}

/**
 * Exact unconditional and valid-opening-conditional fractions for the original
 * 60; Bunnelby is in opening seven, so it implies a valid Basic opening.
 * @param {object} source Original source deck
 */
function analyzeOriginal(source){
  const counts=sourceCounts(source);
  const {favorable,denominator}=exactThreeChannel(counts,7,6);
  const basicCount=14;
  const openers=choose(60,7);
  const valid=openers-choose(60-basicCount,7);
  const conditionalDenominator=denominator*valid/openers;
  assert.equal(denominator%openers,0n);
  return {
    rank:source.rank,
    printedOriginalCards:60,
    groupCounts:counts,
    favorablePhysicalZoneAssignments:favorable.toString(),
    unconditionalDenominator:denominator.toString(),
    validOpenersNumerator:valid.toString(),
    validOpenersDenominator:openers.toString(),
    conditionalDenominator:conditionalDenominator.toString(),
    unconditionalProbability:Number(favorable)/Number(denominator),
    conditionalProbability:Number(favorable)/
      Number(conditionalDenominator)
  };
}

if(require.main===module){
  const source=loadSource(path.resolve(__dirname,'..'));
  for(const rank of [2,15]){
    const original=source.decks.find(d=>d.rank===rank);
    process.stdout.write(JSON.stringify(analyzeOriginal(original))+'\n');
  }
}
module.exports={GROUPS,exactThreeChannel,sourceCounts,analyzeOriginal};
