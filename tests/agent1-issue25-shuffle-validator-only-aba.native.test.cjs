'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const test=require('node:test');
const {runShuffleOnlyAba}=require(
  '../simulation/evaluation/agent1-issue25-shuffle-validator-only-aba.cjs'
);

/**
 * Atomic, locked sanitized diagnostic receipt. No hand order, Prize faces or
 * process-private HMAC secrets are serialized by the upstream comparator.
 * @param {object} report
 * @param {string} dir
 */
function archive(report,dir){
  fs.mkdirSync(dir,{recursive:true});
  const basename='issue25-shuffle-only-aba.json';
  const file=path.join(dir,basename);
  const digestFile=file+'.sha256';
  const lock=path.join(dir,'.shuffle-only-aba.lock');
  const fd=fs.openSync(lock,'wx');
  const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');
  const digest=createHash('sha256').update(bytes).digest('hex');
  const temp=file+'.'+process.pid+'.tmp';
  const tempHash=digestFile+'.'+process.pid+'.tmp';
  try{
    fs.writeFileSync(temp,bytes,{flag:'wx'});
    fs.renameSync(temp,file);
    fs.writeFileSync(tempHash,digest+'  '+basename+'\n',{flag:'wx'});
    fs.renameSync(tempHash,digestFile);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    if(fs.existsSync(tempHash))fs.unlinkSync(tempHash);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return {path:file,sha256:digest,bytes:bytes.length};
}

test('native original eight-source A/B/A numeric-shuffle-only causal negative control',()=>{
  const report=runShuffleOnlyAba();
  const output=process.env.AGENT1_SHUFFLE_ABA_DIR;
  const file=output?archive(report,output):null;
  console.log('AGENT1_ISSUE25_NUMERIC_ONLY_ABA',JSON.stringify({
    schema:report.schema,
    nativeAttempts:report.totalRegisteredNativeAttempts,
    baselineReplayVerdict:report.baselineReplayVerdict,
    matchingNativeOwnerPrechoice:report.matchingNativeOwnerPrechoice,
    matchingNativeRequests:report.matchingNativeRequests,
    matchingNativeFirstPlayer:report.matchingNativeFirstPlayer,
    sameSourceDeals:report.equalAllThreePhysicalSourceDealRows,
    sameControlRootLedgers:report.equalControlPublicRootAndStatusRows,
    rootDifferences:report.rootChanges.map(r=>({
      id:r.id,sourceRank:r.sourceRank,
      firstPublicRootDifference:r.firstPublicRootDifference,
      changedDisposition:r.nativeDispositionChanged
    })),
    changedDispositionCount:report.dispositionChanges.length,
    originalStatusByTrial:report.rows.map(r=>({
      id:r.id,
      control:r.rawShuffleControl.status,
      numericOnly:r.numericShuffleOnlyTreatment.status,
      controlRepeat:r.repeatedRawShuffleControl.status
    })),
    competitiveGamesQualified:report.certifiedPaperGames,
    archive:file
  }));
  assert.equal(report.totalRegisteredNativeAttempts,24);
  assert.equal(report.sourceTrialIds.length,8);
  assert.equal(report.matchingNativeOwnerPrechoice,32);
  assert.equal(report.matchingNativeRequests,32);
  assert.equal(report.matchingNativeFirstPlayer,32);
  assert.equal(report.equalControlPublicRootAndStatusRows,8);
  assert.equal(report.equalAllThreePhysicalSourceDealRows,8);
  assert.equal(report.baselineReplayVerdict,
    'PASS-bounded-protected-opening-A-A-control');
  assert.equal(report.certifiedPaperGames,0);
  assert.equal(report.establishedFieldWinRate,null);
});
