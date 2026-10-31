'use strict';
const assert=require('node:assert/strict');
const VERSION='agent25-dhelmise-t1-physical-opportunity-v1';
const GROUPS=Object.freeze(['dhelmise','donor','telepathic','arven',
  'blender','clefairy','compressor','other']);
const DEFAULT_COUNTS=Object.freeze([4,8,4,4,1,2,4,33]);
const cache=new Map();

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k)||
     n<0||k<0||k>n)return 0n;
  const kk=Math.min(k,n-k),key=n+':'+kk;
  if(cache.has(key))return cache.get(key);
  let out=1n;
  for(let i=1;i<=kk;i++)out=out*BigInt(n-i+1)/BigInt(i);
  cache.set(key,out);
  return out;
}
function gcd(a,b){while(b!==0n)[a,b]=[b,a%b];return a;}
function fraction(n,d){
  assert.ok(d>0n);
  const g=gcd(n,d);
  return (n/g).toString()+'/'+(d/g).toString();
}

/**
 * Strict physical-location-only event, no Trainer sequencing or game claims.
 * Categories in GROUPS are disjoint. Owner starts Dhelmise from initial 7,
 * physically holds Telepathic Psychic Energy by one ordinary draw, has a
 * possible discard route (Blender held, Arven held with Blender in deck,
 * or two held Battle Compressors), >=4 HNS donors still in deck, and
 * at least one Clefairy in known hand or deck after six random Prizes.
 * @param {{counts?:number[],opening?:number,draws?:number,prizes?:number,
 *   requiredDonors?:number,basicCount?:number,
 *   allowCompressorPair?:boolean}} [options]
 * @returns {object}
 */
function exactOpportunity(options={}){
  const counts=options.counts??DEFAULT_COUNTS;
  const opening=options.opening??7,draws=options.draws??1;
  const prizes=options.prizes??6,requiredDonors=options.requiredDonors??4;
  const basicCount=options.basicCount??12;
  const allowCompressorPair=options.allowCompressorPair??true;
  assert.ok(Array.isArray(counts)&&counts.length===8&&
    counts.every(n=>Number.isSafeInteger(n)&&n>=0));
  for(const n of [opening,prizes,requiredDonors,basicCount])
    assert.ok(Number.isSafeInteger(n)&&n>=0);
  assert.equal(draws,1,'only first-seven plus exactly one ordinary draw supported');
  const N=counts.reduce((a,b)=>a+b,0);
  assert.ok(opening>=1&&prizes<=N-opening-1&&basicCount<=N);
  assert.ok(basicCount>=counts[0]+counts[5]);
  assert.ok(requiredDonors<=counts[1]);
  const initial=[0,0,0,0,0,0,0,0];
  let favorable=0n,blenderLine=0n,compressorOnlyLine=0n;
  let initialStates=0;
  const remainingStart=N-opening-1;
  function chooseOpeningCategory(i,left,ways){
    if(i===7){
      if(left<0||left>counts[7])return;
      initial[7]=left;
      const weight=ways*choose(counts[7],left);
      if(weight===0n)return;
      initialStates++;
      for(let drawn=0;drawn<8;drawn++){
        const waysDraw=counts[drawn]-initial[drawn];
        if(waysDraw<=0)continue;
        const held=initial.slice();held[drawn]++;
        if(held[2]===0)continue;
        const blenderHeld=held[4]>0,arvenHeld=held[3]>0;
        const twoCompressors=allowCompressorPair&&held[6]>=2;
        if(!blenderHeld&&!arvenHeld&&!twoCompressors)continue;
        const remaining=counts.map((n,j)=>n-held[j]);
        if(remaining[1]<requiredDonors)continue;
        const otherRemain=remainingStart-
          remaining[1]-remaining[4]-remaining[5];
        let success=0n,viaBlender=0n,viaCompressor=0n;
        for(let pd=0;pd<=Math.min(remaining[1]-requiredDonors,prizes);pd++){
          for(let pb=0;pb<=Math.min(remaining[4],prizes-pd);pb++){
            for(let pc=0;pc<=Math.min(remaining[5],prizes-pd-pb);pc++){
              const po=prizes-pd-pb-pc;
              const ways=choose(remaining[1],pd)*
                choose(remaining[4],pb)*choose(remaining[5],pc)*
                choose(otherRemain,po);
              if(ways===0n)continue;
              if(held[5]===0&&pc===remaining[5])continue;
              const blender=blenderHeld||(arvenHeld&&
                pb<remaining[4]);
              if(blender||twoCompressors){
                success+=ways;
                if(blender)viaBlender+=ways;
                else viaCompressor+=ways;
              }
            }
          }
        }
        const firstWeight=weight*BigInt(waysDraw);
        favorable+=firstWeight*success;
        blenderLine+=firstWeight*viaBlender;
        compressorOnlyLine+=firstWeight*viaCompressor;
      }
      return;
    }
    for(let n=i===0?1:0;n<=Math.min(counts[i],left);n++){
      initial[i]=n;
      chooseOpeningCategory(i+1,left-n,ways*choose(counts[i],n));
    }
  }
  chooseOpeningCategory(0,opening,1n);
  const total=choose(N,opening)*BigInt(N-opening)*
    choose(N-opening-1,prizes);
  assert.ok(total>0n&&favorable<=total);
  const basics=choose(N,opening)-choose(N-basicCount,opening);
  assert.ok(basics>0n);
  const basicValidOpeningProbability=
    Number(basics)/Number(choose(N,opening));
  const unconditionalProbability=Number(favorable)/Number(total);
  return Object.freeze({
    version:VERSION,groups:GROUPS,counts:[...counts],opening,draws,prizes,
    basicCount,requiredDonors,allowCompressorPair,initialStates,
    favorable,favorableViaBlender:blenderLine,
    favorableViaCompressorOnly:compressorOnlyLine,
    denominator:total,fraction:fraction(favorable,total),
    unconditionalProbability,
    conditionalBasicValidProbability:
      unconditionalProbability/basicValidOpeningProbability,
    basicValidOpeningProbability,
    conditionalIsPhysicalLocationOnly:true,
    opponentEffectsAndNativePlayabilityUnverified:true,
    postAichiNewPrinting:true,competitiveGameQualified:false
  });
}
module.exports={VERSION,GROUPS,DEFAULT_COUNTS,choose,exactOpportunity};
if(require.main===module){
  for(const basicCount of [12,16,20]){
    const r=exactOpportunity({basicCount});
    process.stdout.write(JSON.stringify({
      basicCount,fraction:r.fraction,
      unconditionalPct:r.unconditionalProbability*100,
      basicValidPct:r.basicValidOpeningProbability*100,
      conditionalBasicValidPct:r.conditionalBasicValidProbability*100,
      blenderOnlyPct:Number(r.favorableViaBlender)/
        Number(r.denominator)*100,
      compressorOnlyPct:Number(r.favorableViaCompressorOnly)/
        Number(r.denominator)*100
    },null,2)+'\n');
  }
}
