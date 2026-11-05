'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const test=require('node:test');
const {
  VERSION,runNativePublicDifferenceFollowup
}=require('../simulation/evaluation/agent3-issue25-v12-public-first-difference.cjs');

const ROOT=path.resolve(__dirname,'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

/**
 * Atomically archive the bounded public receipt and its digest under an
 * exclusive lock. The raw owner hands and raw native exception are omitted.
 * @param {object} panel
 * @param {string} directory
 */
function archive(panel,directory){
  fs.mkdirSync(directory,{recursive:true});
  const lock=path.join(directory,'.agent3-issue25-v12.lock');
  const fd=fs.openSync(lock,'wx');
  const base='issue25-v12-public-first-difference.json';
  const file=path.join(directory,base);
  const digestFile=file+'.sha256';
  const tmp=file+'.'+process.pid+'.tmp';
  const digestTmp=digestFile+'.'+process.pid+'.tmp';
  const bytes=Buffer.from(JSON.stringify(panel,null,2)+'\n');
  const digest=sha(bytes);
  try{
    fs.writeFileSync(tmp,bytes,{flag:'wx'});
    fs.renameSync(tmp,file);
    fs.writeFileSync(digestTmp,digest+'  '+base+'\n',{flag:'wx'});
    fs.renameSync(digestTmp,digestFile);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(digestTmp))fs.unlinkSync(digestTmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return {sha256:digest,bytes:bytes.length};
}

test('native v12 follow-up isolates first public card divergence and abort',()=>{
  const input=fs.readFileSync(path.join(ROOT,
    'results/aichi-2026/registrations/agent3-issue25-v8-four-campaign-root-replay-v11-20261105.json'));
  const fixed=JSON.parse(input.toString('utf8'));
  const panel=runNativePublicDifferenceFollowup();
  assert.equal(panel.schema,VERSION);
  assert.deepEqual(panel.registeredTrialIds,fixed.trialIds);
  assert.equal(panel.rows.length,8);
  panel.provenance={
    originalFrozenRegistrationSha256:sha(input),
    observedGitHubRunId:process.env.GITHUB_RUN_ID??null,
    observedGitHubCommit:process.env.GITHUB_SHA??null,
    v12ModuleSha256:sha(fs.readFileSync(path.join(ROOT,
      'simulation/evaluation/agent3-issue25-v12-public-first-difference.cjs'))),
    v12NativeTestSha256:sha(fs.readFileSync(__filename)),
    retrospectiveFollowupToFrozenCI:'41942816143',
    independentHeldoutSample:false
  };
  const output=process.env.AGENT3_ISSUE25_V12_RECEIPT_DIR;
  const saved=output?archive(panel,output):null;
  console.log('AGENT3_ISSUE25_V12_PUBLIC_CAUSE',JSON.stringify({
    registeredTrials:panel.registeredTrialIds,
    controlVerdict:panel.v11BoundedReplayVerdict,
    pairedPrechoice:panel.v11Comparisons.nativePrechoicePairsMatched,
    diffRows:panel.rows.filter(r=>
      r.firstDifferentPublicPostStoreRoot!==null).map(r=>({
        id:r.id,firstDifferentRoot:r.firstDifferentPublicPostStoreRoot,
        protectedStatus:r.actualNative.protected.status,
        protectedAbort:r.actualNative.protected.nativeAbortFailureStage
      })),
    qualifiedCompetitiveGames:panel.paperQualifiedCompetitiveGames,
    archive:saved
  }));
  assert.equal(panel.paperQualifiedCompetitiveGames,0);
  assert.equal(panel.causalProtectedOpeningBenefit,'UNRESOLVED');
});
