'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const {runShuffleHeldWonderTagAba}=
  require('../simulation/evaluation/agent1-issue25-wondertag-shuffle-held-aba.cjs');

/**
 * Atomic/locked publication of the full comparator's sanitized 24 attempts.
 * @param {object} result
 * @param {string} dir
 * @returns {{file:string,sha256:string,bytes:number}}
 */
function archive(result,dir){
  fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,'issue25-wondertag-shuffle-held-aba.json');
  const lock=file+'.lock';
  const temporary=file+'.'+process.pid+'.tmp';
  const shaFile=file+'.sha256';
  const tempSha=shaFile+'.'+process.pid+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try{
    const bytes=Buffer.from(JSON.stringify(result,null,2)+'\n');
    const digest=createHash('sha256').update(bytes).digest('hex');
    fs.writeFileSync(temporary,bytes,{flag:'wx'});
    fs.renameSync(temporary,file);
    fs.writeFileSync(tempSha,digest+'  '+path.basename(file)+'\n',
      {flag:'wx'});
    fs.renameSync(tempSha,shaFile);
    return {file,sha256:digest,bytes:bytes.length};
  }finally{
    if(fs.existsSync(temporary))fs.unlinkSync(temporary);
    if(fs.existsSync(tempSha))fs.unlinkSync(tempSha);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

test('identical numeric shuffle correction, genuine Wonder Tag yes vs no, 24 registered real Store attempts',()=>{
  const report=runShuffleHeldWonderTagAba();
  const where=process.env.AGENT1_WONDERTAG_HELD_DIR;
  const saved=where?archive(report,where):null;
  console.log('AGENT1_ISSUE25_WONDERTAG_SHUFFLE_HELD_ABA',JSON.stringify({
    version:report.schema,
    originalRegisteredIds:report.sourceTrialIds,
    comparisons:report.observedNativeOwnerInputComparisons,
    nativePrechoiceSame:report.matchingNativeOwnerPrechoice,
    nativeRunRequestSame:report.matchingNativeRequests,
    nativeStarterSame:report.matchingNativeFirstPlayer,
    controlsIdentical:report.equalControlPublicRootAndStatusRows,
    tripleSourcePhysicalDealSame:report.equalAllThreePhysicalSourceDealRows,
    baselineReplayVerdict:report.baselineReplayVerdict,
    actualNativeWonderTagAudit:report.nativeWonderTagSourceAudit,
    changedRows:report.rows.filter(row=>row.firstPublicRootDifference!==null)
      .map(row=>({id:row.id,
        original:row.wonderTagDeclineControl?.status??null,
        ownerWonderTagYes:row.wonderTagYesAndSearch?.status??null,
        firstDifference:row.firstPublicRootDifference})),
    nativeOwnerPublicContinuations:report.nativeOwnerPublicContinuations,
    nativeStatusRows:report.rows.map(row=>({
      id:row.id,
      A:row.wonderTagDeclineControl?.status??null,
      B:row.wonderTagYesAndSearch?.status??null,
      Arepeat:row.wonderTagDeclineRepeat?.status??null
    })),
    certifiedPaperGames:report.certifiedPaperGames,
    archive:saved
  }));
  assert.equal(report.totalRegisteredNativeAttempts,24);
  assert.equal(report.matchingNativeOwnerPrechoice,32);
  assert.equal(report.matchingNativeRequests,32);
  assert.equal(report.matchingNativeFirstPlayer,32);
  assert.equal(report.equalControlPublicRootAndStatusRows,8);
  assert.equal(report.equalAllThreePhysicalSourceDealRows,8);
  assert.equal(report.baselineReplayVerdict,
    'PASS-bounded-protected-opening-A-A-control');
  assert.equal(report.allThreeArmsUseSameNumericValidator,true);
  assert.equal(report.certifiedPaperGames,0);
  assert.equal(report.establishedFieldWinRate,null);
});
