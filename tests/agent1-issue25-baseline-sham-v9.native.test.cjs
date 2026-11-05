'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {
  runPrechoiceCustodyV8
}=require('../simulation/evaluation/agent1-issue25-prechoice-input-custody-v8.cjs');

const expectedIds=[
  '6:100:A:champion-reference',
  '6:100:A:new-moon-lockbreaker-v1',
  '6:101:B:champion-reference',
  '6:101:B:new-moon-lockbreaker-v1',
  '11:102:A:champion-reference',
  '11:102:A:new-moon-lockbreaker-v1',
  '11:103:B:champion-reference',
  '11:103:B:new-moon-lockbreaker-v1'
];

/**
 * Identical baseline policy twice. Same policy is a negative control for
 * stochastic drift; it is not an opening-treatment comparison.
 * @param {object} a
 * @param {object} b
 * @returns {object}
 */
function summarizeSham(a,b){
  assert.equal(a.manifest.prechoiceMode,'baseline');
  assert.equal(b.manifest.prechoiceMode,'baseline');
  assert.deepEqual(a.diagnostic.registered,expectedIds);
  assert.deepEqual(b.diagnostic.registered,expectedIds);
  const x=a.diagnostic.actualNativePrechoicePhysicalInputs;
  const y=b.diagnostic.actualNativePrechoicePhysicalInputs;
  assert.equal(x.privateFingerprintSessionId,y.privateFingerprintSessionId);
  const items=audit=>{
    const out=new Map();
    for(const event of audit.events){
      const key=event.registeredNativeTrialId+':'+event.physicalOwnerSeat;
      assert.ok(!out.has(key),'duplicate native trial owner');
      out.set(key,event);
    }
    return out;
  };
  const left=items(x),right=items(y);
  const events=expectedIds.flatMap(id=>[0,1].map(seat=>{
    const key=id+':'+seat;
    const first=left.get(key),second=right.get(key);
    assert.ok(first&&second,'missing native owner prechoice input: '+key);
    const physicalInputEqual=first.opaquePhysicalPrechoiceInputHmacSha256===
      second.opaquePhysicalPrechoiceInputHmacSha256;
    const requestEqual=first.opaquePreRunRequestHmacSha256===
      second.opaquePreRunRequestHmacSha256;
    const physicalSixtyCorrect=first.exactPhysicalSixtyPrintedCountMatched&&
      second.exactPhysicalSixtyPrintedCountMatched;
    const firstPlayerEqual=first.nativeFirstPlayerSeat===
      second.nativeFirstPlayerSeat;
    return {id,seat,physicalInputEqual,requestEqual,
      physicalSixtyCorrect,firstPlayerEqual};
  }));
  const pairs=expectedIds.map((id,index)=>{
    const first=a.diagnostic.attemptedRows[index];
    const second=b.diagnostic.attemptedRows[index];
    assert.equal(first.id,id);
    assert.equal(second.id,id);
    return {
      id,baselineAStatus:first.status,baselineBStatus:second.status,
      sameStatus:first.status===second.status,
      sameRootActionCount:first.nativeRootActionCount===
        second.nativeRootActionCount,
      samePostChoiceSourceDigest:
        typeof first.sourceDealFingerprint==='string'&&
        typeof second.sourceDealFingerprint==='string'?
          first.sourceDealFingerprint===second.sourceDealFingerprint:null
    };
  });
  return {
    schema:'agent1-issue25-native-baseline-sham-v9',
    intent:'same-actor same-trial repeated negative-control',
    matchingPinnedEngine:a.manifest.observedTwinleafGitCommit===
      b.manifest.observedTwinleafGitCommit,
    registeredIds:expectedIds,
    prechoiceOwnerRecords:events.length,
    privatePrechoiceInputPairsMatched:
      events.filter(event=>event.physicalInputEqual).length,
    preRunRequestPairsMatched:
      events.filter(event=>event.requestEqual).length,
    bothActualPhysicalSixtiesCorrect:
      events.filter(event=>event.physicalSixtyCorrect).length,
    sameNativeFirstPlayer:
      events.filter(event=>event.firstPlayerEqual).length,
    samePostChoiceSourceDigests:
      pairs.filter(pair=>pair.samePostChoiceSourceDigest===true).length,
    changedPostChoiceSourceDigests:
      pairs.filter(pair=>pair.samePostChoiceSourceDigest===false).length,
    statusMatched:pairs.filter(pair=>pair.sameStatus).length,
    rootActionCountsMatched:pairs.filter(pair=>pair.sameRootActionCount).length,
    individualTrials:pairs,
    sourceConcealedNamesOrDigestsPublished:false,
    samePolicyOnly:true,
    treatmentDifferenceTested:false,
    nonTreatmentExecutingClosureVerified:false,
    competitiveGamesQualified:0,
    inferredWinRate:null
  };
}

/**
 * Atomically store the sanitized comparison, never private raw inputs.
 * @param {object} report
 * @param {string} directory
 */
function archive(report,directory){
  fs.mkdirSync(directory,{recursive:true});
  const filename='issue25-baseline-sham-v9.json';
  const full=path.join(directory,filename);
  const lock=path.join(directory,'.agent1-v9-sham.lock');
  const fd=fs.openSync(lock,'wx');
  const tmp=full+'.'+process.pid+'.tmp';
  const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');
  const digest=createHash('sha256').update(bytes).digest('hex');
  try{
    fs.writeFileSync(tmp,bytes,{flag:'wx'});
    fs.renameSync(tmp,full);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return {file:full,sha256:digest};
}

test('native paired A/A baseline sham identifies any post-choice nondeterminism',()=>{
  const first=runPrechoiceCustodyV8('baseline');
  const repeated=runPrechoiceCustodyV8('baseline');
  const summary=summarizeSham(first,repeated);
  const directory=process.env.ISSUE25_SHAM_RECEIPT_DIR;
  const saved=directory?archive(summary,directory):null;
  console.log('AGENT1_ISSUE25_BASELINE_SHAM_V9',
    JSON.stringify({summary,archive:saved}));
  assert.equal(summary.registeredIds.length,8);
  assert.equal(summary.prechoiceOwnerRecords,16);
  assert.equal(summary.privatePrechoiceInputPairsMatched,16);
  assert.equal(summary.preRunRequestPairsMatched,16);
  assert.equal(summary.bothActualPhysicalSixtiesCorrect,16);
  assert.equal(summary.sameNativeFirstPlayer,16);
  assert.equal(summary.competitiveGamesQualified,0);
});
