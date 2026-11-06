'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runAgent1Horizon260V14,VERSION,LIMIT}=
  require('../simulation/evaluation/agent1-issue25-common-v14-horizon260.cjs');
const {registeredTrials}=
  require('../simulation/evaluation/agent36-issue25-common-v6.cjs');

/** Exclusive lock, atomic rename of complete public native root histories. */
function writeArchive(report,directory){
  fs.mkdirSync(directory,{recursive:true});
  const file=path.resolve(directory,'agent1-v14-horizon260-full-public-roots.json');
  const lock=file+'.lock',tmp=file+'.'+process.pid+'.tmp';
  const sidecar=file+'.sha256',sidecarTmp=sidecar+'.'+process.pid+'.tmp';
  const fd=fs.openSync(lock,'wx');
  const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');
  const digest=createHash('sha256').update(bytes).digest('hex');
  try{
    fs.writeFileSync(tmp,bytes,{flag:'wx'});
    fs.renameSync(tmp,file);
    fs.writeFileSync(sidecarTmp,digest+'  '+path.basename(file)+'\n',
      {flag:'wx'});
    fs.renameSync(sidecarTmp,sidecar);
    return {file,bytes:bytes.length,sha256:digest};
  }finally{
    for(const p of [tmp,sidecarTmp])if(fs.existsSync(p))fs.unlinkSync(p);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

test('real native original-eight v13 decision policy, only root horizon extended to 260',()=>{
  const execution=runAgent1Horizon260V14();
  const expected=registeredTrials().map(x=>x.id).sort();
  const records=execution.diagnostic.publicNativeRows;
  assert.equal(execution.manifest.version,VERSION);
  assert.equal(execution.manifest.nativeRootActionLimit,LIMIT);
  assert.equal(execution.diagnostic.actualNativeRootLimit,LIMIT);
  assert.equal(records.length,8);
  assert.deepEqual(records.map(x=>x.id).sort(),expected);
  assert.equal(execution.diagnostic.competitiveGamesQualified,0);
  assert.equal(execution.diagnostic.estimatedWinRate,null);
  assert.ok(records.every(x=>x.publicNativeRootCount<=260));
  assert.ok(records.every(x=>x.publicNativeRootActions.length===
    x.publicNativeRootCount));
  const audit={
    schema:VERSION,
    registeredOriginalTrialIds:expected,
    v13BaselinePublicRootSha256:
      '1c87b9151470cf76d626cc82bfe374186048b955329919fa4926d3f52df0e86f',
    nativeRootLimit:LIMIT,
    actualExtendedRunnerInvocation:
      execution.diagnostic.extendedRunnerInvocation,
    sourceRankIndependentPolicy:true,
    physicalOriginalAndContenderSixtiesUnchanged:true,
    nativeRows:records,
    sourceAndPolicyHashes:
      execution.manifest.resolvedSourceAndPolicyHashes,
    originalSourceFieldFullyAuthenticated:false,
    fullyQualifiedPaperGameCount:0,
    officialMatchClockCertified:false,
    independentOpposingPolicyCertified:false,
    competitiveGamesQualified:0,winRateEstimate:null
  };
  const dir=process.env.AGENT1_V14_OUTPUT_DIR;
  const archive=dir?writeArchive(audit,dir):null;
  console.log('AGENT1_V14_HORIZON260_NATIVE',JSON.stringify({
    schema:VERSION,rootCap:LIMIT,
    sourceStatuses:records.map(x=>({
      id:x.id,status:x.status,roots:x.publicNativeRootCount,
      sourceSeat:x.sourceSeat,
      sourcePhysicalDealFingerprint:x.sourcePhysicalDealFingerprint,
      fullPhysicalDealFingerprint:x.fullPhysicalDealFingerprint,
      genuineNativeFinished:x.genuineNativeFinished,
      reportedNativeWinner:x.reportedNativeWinner,
      lastNativeRoot:x.publicNativeRootActions.at(-1)??null
    })),
    nativeReportedTerminalCount:
      execution.diagnostic.nativeTerminalCount,
    archive,competitiveGamesQualified:0
  }));
  assert.equal(execution.manifest.releaseQualified,false);
});
