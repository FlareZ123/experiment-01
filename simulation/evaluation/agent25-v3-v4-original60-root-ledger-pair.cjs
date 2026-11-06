'use strict';

const assert=require('node:assert/strict');
const registration=require('../../results/als/registrations/agent25-v3-v4-paired-native-root-ledger-20261106.json');
const {run}=require('./agent25-dhelmise-v2-native-three-lock-smoke.cjs');

function study(){
  assert.equal(registration.version,
    'agent25-v3-v4-native-root-ledger-pair-v1-precommit');
  const pairs=[];
  for(const {rank,candidateSeat} of registration.pairedRankSeat){
    const attempts={};
    for(const policy of ['v3','v4']){
      const native=run({
        donorCompressor:true,
        ...(policy==='v3'?{ballDonorCostV3:true}:{ballDonorCostV4:true}),
        sourceRankOnly:rank,candidateSeatOnly:candidateSeat,
        captureOriginalRootLedger:true
      });
      assert.equal(native.attempts.length,1);
      assert.equal(native.competitivelyQualifiedGames,0);
      attempts[policy]=native.attempts[0];
    }
    const v3=attempts.v3, v4=attempts.v4;
    const hash3=v3.initialFullPhysicalDealFingerprint?.digestSha256??null;
    const hash4=v4.initialFullPhysicalDealFingerprint?.digestSha256??null;
    pairs.push({rank,candidateSeat,
      completeOriginalPhysicalDealPaired:hash3!==null&&hash3===hash4,
      initialPhysicalDealSha256:{v3:hash3,v4:hash4},
      initialPublicBoardMatches:
        JSON.stringify(v3.startingBoard??null)===
        JSON.stringify(v4.startingBoard??null),
      attempts,
      competentlyPlayedTwoPlayerPaperGame:false});
  }
  return {registration:registration.version,
    pinnedEngine:registration.nativePin,
    sameCandidateAndSource60AllArms:true,
    pairs,
    qualifiedGames:0,
    source60OriginalRankIds:registration.pairedRankSeat.map(a=>a.rank),
    decisionTraceReadOnly:true,
    noOfficialPaperClock:true,
    comparisonRequiresReviewOfFirstDivergingRoot:true};
}
module.exports={study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
