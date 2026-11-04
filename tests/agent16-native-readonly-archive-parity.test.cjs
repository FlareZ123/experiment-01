'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {compareNativeReplayArchives,REPLAY_PARITY_FIELDS}=
  require('../simulation/evaluation/agent16-native-readonly-archive-parity.cjs');

function archive(){
  const rows=['A','B'].map((candidateId,i)=>{
    const row={
      trial:{id:'16:0:'+candidateId,rank:16,seed:100,
        candidateId,sourceSlot:0},
      sourceDealFingerprint:'deal',
      fullPhysicalDealFingerprint:'full'+i,
      rootActionLedgerSha256:'root'+i,
      actionCount:99+i,
      turns:11,
      finished:i===0,
      endReason:i===0?'engine-game-end':'action-limit',
      winner:i===0?1:null,
      actualStarterSeat:0,
      sourceActuallyFirst:true,
      sourceFirstOwnedAffordances:{status:'observed',firstRootOrdinal:7},
      sourceAttackSettlement:{attackCount:i},
      candidateAttackSettlement:{attackCount:i}
    };
    return row;
  });
  return {attempted:rows.length,allNativeDevelopmentRows:rows};
}
test('read-only fields and metadata may grow without modifying game invariants',()=>{
  const before=archive();
  const after=structuredClone(before);
  for(const row of after.allNativeDevelopmentRows){
    row.sourceLegacyFirstObservedHandSha256='setup';
    row.sourceFirstOwnHandSha256='real-first-owner';
    row.sourceFirstOwnHandMultisetSha256='unordered';
    row.actorOnlyDecisionCoverage={newMetadata:true};
  }
  const report=compareNativeReplayArchives(before,after);
  assert.equal(report.allNativeInvariantFieldsEqual,true);
  assert.equal(report.comparableTrials,2);
  assert.deepEqual(report.missingTrials,[]);
  assert.deepEqual(report.differences,[]);
  assert.equal(report.requiredFields.length,REPLAY_PARITY_FIELDS.length);
});
test('root action deviation fails even if all high level outcomes agree',()=>{
  const before=archive(),after=structuredClone(before);
  after.allNativeDevelopmentRows[0].rootActionLedgerSha256='new root';
  const report=compareNativeReplayArchives(before,after);
  assert.equal(report.allNativeInvariantFieldsEqual,false);
  assert.deepEqual(report.differences,[{id:'16:0:A',field:'rootActionLedgerSha256'}]);
});
test('a missing candidate arm cannot be discarded from the denominator',()=>{
  const before=archive(),after=structuredClone(before);
  after.allNativeDevelopmentRows.pop();
  after.attempted=1;
  const report=compareNativeReplayArchives(before,after);
  assert.deepEqual(report.missingTrials,['16:0:B']);
  assert.equal(report.allNativeInvariantFieldsEqual,false);
});
test('a missing source deal fingerprint is explicitly unverifiable',()=>{
  const before=archive(),after=structuredClone(before);
  delete after.allNativeDevelopmentRows[0].sourceDealFingerprint;
  const report=compareNativeReplayArchives(before,after);
  assert.deepEqual(report.unverifiable,[{id:'16:0:A',field:'sourceDealFingerprint'}]);
  assert.equal(report.allNativeInvariantFieldsEqual,false);
});
test('duplicate ids and truncated attempted archives fail closed',()=>{
  const broken=archive();
  broken.allNativeDevelopmentRows[1].trial.id=broken.allNativeDevelopmentRows[0].trial.id;
  assert.throws(()=>compareNativeReplayArchives(broken,archive()),/Duplicate trial id/);
  const truncated=archive();
  truncated.attempted=3;
  assert.throws(()=>compareNativeReplayArchives(truncated,archive()),/All attempts/);
});
