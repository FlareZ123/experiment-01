'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {summarizeArchive}=require('../scripts/agent16-rank16-native-archive-summary.cjs');

function fixture(){
  const rows=[];
  for(let i=0;i<8;i++){
    for(let j=0;j<2;j++){
      const candidateId=j===0?'champion-reference':'new-moon-lockbreaker-v1';
      const sha=i===1||i===2?'hand'+i+'-arm'+j:'hand'+i;
      rows.push({
        trial:{rank:16,repeat:i,candidateSlot:i%2===0?'A':'B',
          candidateId,id:'16:'+i+':'+candidateId},
        sourceSeat:i%2===0?1:0,
        candidateSeat:i%2===0?0:1,
        sourceActuallyFirst:i%2===0,
        actualStarterSeat:i%2===0?1:1,
        sourceDealFingerprint:i===1?'deal'+i+'-arm'+j:'deal'+i,
        sourceFirstOwnHandProtocol:i===3&&j===1?null:
          'first-live-owner-hand-prebot-v1',
        sourceFirstOwnHandSha256:i===3&&j===1?null:sha,
        sourceFirstOwnHandFirstActionOrdinal:10+i,
        sourceLegacyFirstObservedHandSha256:'setup'+i,
        sourceLegacyFirstObservedHandTurn:0,
        finished:true,
        endReason:'engine-game-end',
        actionCount:60,
        rootActionLedger:[],
        sourceFirstOwnedAffordances:null
      });
    }
  }
  return {
    version:'agent16-original-rank16-natural-opening-bothseat-v1',
    attempted:16,
    competitivelyQualifiedGames:0,
    allNativeDevelopmentRows:rows
  };
}

test('identical legacy setup SHA cannot substitute for true first-live hand',()=>{
  const summary=summarizeArchive(fixture());
  assert.equal(summary.sourceDealPairsMatching,7);
  assert.deepEqual(summary.mismatchedGroupIds,['16:1:B']);
  assert.equal(summary.liveFirstHandShaAvailableRows,15);
  assert.equal(summary.liveFirstHandPairsMatching,5);
  assert.deepEqual(summary.liveFirstHandPairsMismatched,['16:1:B','16:2:A']);
  assert.deepEqual(summary.liveFirstHandPairsUnavailable,['16:3:B']);
  assert.equal(summary.qualifiedGames,0);
  assert.equal(summary.rows[2].legacyFirstObservedTurn,0);
  assert.notEqual(summary.rows[2].firstLiveHandSha256,
    summary.rows[3].firstLiveHandSha256);
  assert.equal(summary.rows[7].firstLiveHandSha256,null);
});

test('archived rows without first-live protocol are explicitly unavailable',()=>{
  const input=fixture();
  for(const row of input.allNativeDevelopmentRows){
    delete row.sourceFirstOwnHandProtocol;
    row.sourceFirstOwnHandSha256='legacy-same-hand';
  }
  const summary=summarizeArchive(input);
  assert.equal(summary.liveFirstHandShaAvailableRows,0);
  assert.equal(summary.liveFirstHandPairsMatching,0);
  assert.deepEqual(summary.liveFirstHandPairsMismatched,[]);
  assert.equal(summary.liveFirstHandPairsUnavailable.length,8);
  assert.equal(summary.qualifiedGames,0);
});
