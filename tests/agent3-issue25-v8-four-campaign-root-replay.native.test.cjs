'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const {createHash}=require('node:crypto');
const {runFourNativeCampaigns,VERSION}=
  require('../simulation/evaluation/agent3-issue25-v8-four-campaign-root-replay.cjs');

const ROOT=path.resolve(__dirname,'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

/**
 * Save even an unfavorable control result, with an exclusive lock and atomic
 * renames. All content is public-root and boolean equality metadata.
 * @param {object} panel
 * @param {string} directory
 * @returns {object}
 */
function archive(panel,directory){
  fs.mkdirSync(directory,{recursive:true});
  const name='issue25-v8-four-campaign-root-replay.json';
  const file=path.join(directory,name);
  const digestFile=file+'.sha256';
  const fd=fs.openSync(path.join(directory,'.agent3-root-replay.lock'),'wx');
  const tmp=file+'.'+process.pid+'.tmp';
  const digestTmp=digestFile+'.'+process.pid+'.tmp';
  const body=Buffer.from(JSON.stringify(panel,null,2)+'\n');
  const digest=sha(body);
  try{
    fs.writeFileSync(tmp,body,{flag:'wx'});
    fs.renameSync(tmp,file);
    fs.writeFileSync(digestTmp,digest+'  '+name+'\n',{flag:'wx'});
    fs.renameSync(digestTmp,digestFile);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(digestTmp))fs.unlinkSync(digestTmp);
    fs.closeSync(fd);
    fs.unlinkSync(path.join(directory,'.agent3-root-replay.lock'));
  }
  return {file,bytes:body.length,sha256:digest};
}

test('native preregistered A/A/B/A eight original rank6/11 arms and public root custody',()=>{
  const panel=runFourNativeCampaigns();
  panel.execution={
    designVersion:VERSION,
    githubRunId:process.env.GITHUB_RUN_ID??null,
    githubCommit:process.env.GITHUB_SHA??null,
    rootPolicySourceSha256:sha(fs.readFileSync(path.join(ROOT,
      'simulation/evaluation/agent3-issue25-v8-four-campaign-root-replay.cjs'))),
    nativeTestSourceSha256:sha(fs.readFileSync(__filename)),
    paperEligibleCompetitiveGames:0
  };
  const directory=process.env.ISSUE25_AGENT3_CONTROL_RECEIPT_DIR;
  const retained=directory?archive(panel,directory):null;
  console.log('AGENT3_ISSUE25_V8_FOUR_CAMPAIGN_NATIVE',JSON.stringify({
    trialCount:panel.registeredTrials.length,
    attemptCount:panel.totalNativeRegisteredAttempts,
    nativePinEqual:panel.sameObservedVendorPin,
    researchPinEqual:panel.sameObservedResearchPin,
    privateInputHmacSession:panel.samePrivateHmacSession,
    matchedInputs:panel.matchingOwnerPrechoiceComparisons,
    matchedRequests:panel.matchingNativeRequestComparisons,
    differentInputs:panel.mismatchingOwnerPrechoiceComparisons,
    differentRequests:panel.mismatchingNativeRequestComparisons,
    controlEqualRows:panel.controlLedgerRowsEqual,
    controlDifferentRows:panel.controlLedgerRowsUnequal,
    controlMissingRows:panel.controlLedgerRowsIncomplete,
    controlVerdict:panel.controlReplayVerdict,
    causalAttribution:panel.causalTreatmentAttribution,
    statusRows:panel.rows.map(r=>({
      id:r.id,baselineStatuses:r.controlStatuses,
      treatmentStatus:r.protectedStatus,
      baselineReplayEqual:r.allThreeControlRootLedgersAndDispositionsEqual,
      protectedRootDifference:r.protectedVsOriginalRootDifference
    })),
    archive:retained
  }));
  assert.equal(panel.totalNativeRegisteredAttempts,32);
  assert.equal(panel.registeredTrials.length,8);
  assert.equal(panel.nativePaperGamesQualified,0);
  assert.equal(panel.causalTreatmentAttribution,'UNRESOLVED');
  assert.ok([
    'PASS-registered-A-A-A-control-replay',
    'FAIL-repeated-control-divergence',
    'UNRESOLVED-input-or-epoch-mismatch',
    'UNRESOLVED-missing-public-root-ledger'
  ].includes(panel.controlReplayVerdict));
});
