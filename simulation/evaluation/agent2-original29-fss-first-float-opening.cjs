'use strict';

const assert=require('node:assert/strict');
const {choose,analyzeOriginal29}=
  require('./agent2-original29-fss-first-tool-collision.cjs');

const VERSION='agent2-original29-fss-first-float-specific-no-v-opening-v1';
const SCALE=420n;

/**
 * Original 60-card exact FSS-first target-Float opening opportunity. Choose
 * physical seven without replacement, then average uniform held-card order.
 * A held FSS is the first held Tool with probability heldFss/heldAllTools.
 * The noV condition excludes every Basic Pokémon V from the INITIAL hand;
 * this is an owner-decision opportunity, not Store eligibility or action value.
 *
 * @param {{fss:number,float:number,otherTools:number,basic:number,vBasic:number}} c
 * @param {boolean} excludeOpeningV
 * @returns {{scaledNumerator:string,scale:string,validStarts:string,
 *  probabilityGivenValidStart:number,validStartsPerOccurrence:number|null}}
 */
function exactFssFloatFirst(c,excludeOpeningV){
  const {fss,float,otherTools,basic,vBasic}=c;
  for(const n of [fss,float,otherTools,basic,vBasic])
    assert.ok(Number.isSafeInteger(n)&&n>=0&&n<=60);
  assert.ok(vBasic<=basic&&fss+float+otherTools+basic<=60);
  const nonV=basic-vBasic,other=60-fss-float-otherTools-basic;
  const valid=choose(60,7)-choose(60-basic,7);
  assert.ok(valid>0n,'A legal 60 must have a Basic opening Pokémon');
  let numerator=0n;
  for(let f=1;f<=Math.min(fss,7);f++)
    for(let fl=1;fl<=Math.min(float,7-f);fl++)
      for(let t=0;t<=Math.min(otherTools,7-f-fl);t++){
        const tools=f+fl+t;
        const orderWeight=BigInt(f)*SCALE/BigInt(tools);
        assert.equal(BigInt(f)*SCALE%BigInt(tools),0n);
        const trainerCombinations=choose(fss,f)*choose(float,fl)*
          choose(otherTools,t)*orderWeight;
        for(let non=0;non<=Math.min(nonV,7-f-fl-t);non++)
          for(let v=0;v<=Math.min(vBasic,7-f-fl-t-non);v++){
            if(non+v===0||(excludeOpeningV&&v!==0))continue;
            const otherHeld=7-f-fl-t-non-v;
            numerator+=trainerCombinations*choose(nonV,non)*
              choose(vBasic,v)*choose(other,otherHeld);
          }
      }
  const denom=valid*SCALE;
  return {scaledNumerator:numerator.toString(),scale:SCALE.toString(),
    validStarts:valid.toString(),
    probabilityGivenValidStart:Number(numerator)/Number(denom),
    validStartsPerOccurrence:numerator>0n?
      Number(denom)/Number(numerator):null};
}

/** @returns {object} Target-Tool exact-print opportunity map for all 29. */
function analyzeSource29(){
  const source=analyzeOriginal29();
  assert.equal(source.totalAuthenticatedSourceDecks,29);
  const rows=source.rows.map(row=>{
    const float=row.otherToolNames.find(x=>x[0]==='Float Stone')?.[1]??0;
    const profile={fss:row.fss,float,otherTools:row.otherTool-float,
      basic:row.basic,vBasic:row.vBasic};
    const allValid=exactFssFloatFirst(profile,false);
    const noOpeningV=exactFssFloatFirst(profile,true);
    assert.ok(noOpeningV.probabilityGivenValidStart<=
      allValid.probabilityGivenValidStart);
    return {rank:row.rank,...profile,allValid,noOpeningV};
  });
  rows.sort((a,b)=>a.rank-b.rank);
  return {version:VERSION,
    originalSource:'results/aichi-2026/full-decklists.json',
    printedCatalog:'resources/cards/en',
    originalSourceCount:rows.length,
    fssFloatRanks:rows.filter(row=>row.fss>0&&row.float>0).map(row=>row.rank),
    highestNoOpeningV:rows.filter(row=>row.fss>0&&row.float>0)
      .sort((a,b)=>b.noOpeningV.probabilityGivenValidStart-
        a.noOpeningV.probabilityGivenValidStart)
      .slice(0,8)
      .map(row=>({rank:row.rank,
        probability:row.noOpeningV.probabilityGivenValidStart,
        reciprocal:row.noOpeningV.validStartsPerOccurrence})),
    scope:'opening seven uniform order only; no Prize knowledge, later draws, actual Tool play, Store effects or winning probabilities',
    rows,qualifiedGames:0};
}

if(require.main===module)process.stdout.write(
  JSON.stringify(analyzeSource29(),null,2)+'\n');
module.exports={VERSION,SCALE,exactFssFloatFirst,analyzeSource29};
