'use strict';

const assert=require('node:assert/strict');
const {run}=require('./agent50-sourcefirst-guzma-energy-staging-pair.cjs');

/** Predeclared 21 October 2026 before game execution. */
const SEEDS=Object.freeze([17984023,1407148205,2612415444,2584586627]);

/** @returns {object} Every original Store development arm, including censors. */
function prospective(){
  const pairs=[];
  for(const seed of SEEDS){
    try{
      const pair=run(seed);
      pairs.push(pair);
    }catch(error){
      pairs.push({sourceSeed:seed,status:'runner-error',
        error:String(error?.stack??error).slice(0,7000),
        competitiveQualifiedGames:0});
    }
  }
  const attemptedArms=pairs.reduce((n,p)=>
    n+(p.control?2:1),0);
  return {
    schema:'agent50-prospective-four-new-seed-guzma-energy-original-store-v1',
    registration:'results/aichi-2026/registrations/agent50-rank11-four-new-seeds-guzma-energy-20261021.md',
    seeds:SEEDS,sourceRank:11,candidateId:'new-moon-lockbreaker-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    attemptedPairs:pairs.length,attemptedArms,
    pairs,competitiveQualifiedGames:0,winRateCertified:false,
    caveat:'Unselected original game seeds, small unqualified source-policy intervention; retain both physical seats and actual first turn; no paper clock'
  };
}
if(require.main===module){
  const result=prospective();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  assert.equal(result.attemptedPairs,4);
  assert.deepEqual(result.seeds,SEEDS);
}
module.exports={SEEDS,prospective};
