'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const {createHash}=require('node:crypto');
const {VERSION,runProtectedPromptBaselineAba}=
  require('../simulation/evaluation/agent3-issue25-v13-protected-prompt-aba.cjs');

const ROOT=path.resolve(__dirname,'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

/**
 * Commit all observed positive/negative outcomes atomically behind a writer
 * lock. Native aborts are part of the evaluation denominator.
 * @param {object} panel
 * @param {string} dir
 * @returns {{bytes:number,sha256:string}}
 */
function archive(panel,dir){
  fs.mkdirSync(dir,{recursive:true});
  const name='issue25-v13-protected-modal-prize-aba.json';
  const file=path.join(dir,name);
  const sidecar=file+'.sha256';
  const lock=path.join(dir,'.agent3-v13.lock');
  const fd=fs.openSync(lock,'wx');
  const temp=file+'.'+process.pid+'.tmp';
  const sideTemp=sidecar+'.'+process.pid+'.tmp';
  const body=Buffer.from(JSON.stringify(panel,null,2)+'\n');
  const digest=sha(body);
  try{
    fs.writeFileSync(temp,body,{flag:'wx'});
    fs.renameSync(temp,file);
    fs.writeFileSync(sideTemp,digest+'  '+name+'\n',{flag:'wx'});
    fs.renameSync(sideTemp,sidecar);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    if(fs.existsSync(sideTemp))fs.unlinkSync(sideTemp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return {bytes:body.length,sha256:digest};
}

test('native protected A/B/A: owner modal decline and first occupied own KO Prize',()=>{
  const registrationPath=path.join(ROOT,
    'results/aichi-2026/registrations/agent3-issue25-v8-four-campaign-root-replay-v11-20261105.json');
  const frozenBytes=fs.readFileSync(registrationPath);
  const registration=JSON.parse(frozenBytes.toString('utf8'));
  const panel=runProtectedPromptBaselineAba();
  assert.equal(panel.schema,VERSION);
  assert.deepEqual(panel.sourceTrialIds,registration.trialIds);
  assert.equal(panel.totalRegisteredNativeAttempts,24);
  panel.provenance={
    frozenV11RegistrationSha256:sha(frozenBytes),
    runningGitHubCommit:process.env.GITHUB_SHA??null,
    runningGitHubRunId:process.env.GITHUB_RUN_ID??null,
    v13SourceSha256:sha(fs.readFileSync(path.join(ROOT,
      'simulation/evaluation/agent3-issue25-v13-protected-prompt-aba.cjs'))),
    v13NativeTestSha256:sha(fs.readFileSync(__filename)),
    treatmentType:'opt-in owner-visible prompt-baseline mechanism experiment',
    historicalSourceIDsReused:true,
    heldoutCompetitiveTrial:false
  };
  const dir=process.env.AGENT3_ISSUE25_V13_RECEIPT_DIR;
  const saved=dir?archive(panel,dir):null;
  console.log('AGENT3_ISSUE25_V13_NATIVE',JSON.stringify({
    protectedAbaIdCount:panel.sourceTrialIds.length,
    controls:panel.baselineReplayVerdict,
    prechoiceMatches:panel.matchingNativeOwnerPrechoice,
    requestMatches:panel.matchingNativeRequests,
    sourceControlMatches:panel.equalControlPhysicalSourceDealRows,
    allThreeSourceDealsMatched:panel.equalAllThreePhysicalSourceDealRows,
    actualAcceptedModal:
      panel.treatmentSelectedPromptAudit
        ?.ownerModalPromptBaseline?.accepted??null,
    actualFirstOwnPrize:
      panel.treatmentSelectedPromptAudit
        ?.ownerFirstOccupiedPrizeBaseline?.ownerPrizeChoiceSubmitted??null,
    rootChanges:panel.rows.filter(x=>
      x.firstPromptBaselinePublicRootDifference!==null).map(x=>({
        id:x.id,baseline:x.baseline.status,
        withPrompts:x.promptBaseline.status,
        firstPublicChange:x.firstPromptBaselinePublicRootDifference
      })),
    nativePaperGamesQualified:panel.certifiedPaperGames,
    archive:saved
  }));
  assert.equal(panel.certifiedPaperGames,0);
  assert.equal(panel.causalDeckStrengthEstablished,false);
});
