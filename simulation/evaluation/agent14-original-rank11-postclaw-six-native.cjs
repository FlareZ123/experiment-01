'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent36-profile-provenance-gate.cjs');
const {withRegisteredBehindResponse,MODES,VERSION}=
  require('../twinleaf/agent14-behind-counter-response-native.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent14-post-claw-native-v1-20261103.json';
const REGISTRATION_BLOB='cb21990df2922ec0c488c47d57429cf625c109ab';
const JOINT_V2='simulation/evaluation/agent23-selected-joint-v2-manifest.json';
const NATIVE_ADAPTER='simulation/twinleaf/agent14-behind-counter-response-native.cjs';
const ADAPTER_BLOB='0699c949c9cd7950607e7c7a8739a3dcc86b3e4f';
const OUTPUT='agent14-original-rank11-postclaw-native-six.json';

/** @param {string} file @returns {Buffer} */
const bytes=file=>fs.readFileSync(path.join(ROOT,file));
/**
 * Verify prior public preregistration before any native experiment or
 * outcome observation. Registration fixes one exposed, NON-BLIND seed.
 * @returns {{registration:object,profile:object}}
 */
function preflight(){
  assert.equal(gitBlobHash(bytes(REGISTRATION)),REGISTRATION_BLOB);
  assert.equal(gitBlobHash(bytes(NATIVE_ADAPTER)),ADAPTER_BLOB);
  const reg=JSON.parse(bytes(REGISTRATION).toString('utf8'));
  const profile=JSON.parse(bytes(JOINT_V2).toString('utf8'));
  assert.equal(gitBlobHash(bytes(JOINT_V2)),
    reg.existingFrozenJointV2Blob);
  assert.equal(reg.nativeTwinleafCommit,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(reg.expectedAttempts,6);
  assert.equal(reg.expectedModes,3);
  assert.deepEqual(reg.modes.map(m=>m.id),MODES);
  assert.equal(reg.retrospectivelySelected,true);
  assert.equal(reg.symmetricSelectedVipAfterPass,true);
  assert.equal(reg.trials.length,2);
  assert.equal(reg.trials[0].candidateId,'champion-reference');
  assert.equal(reg.trials[1].candidateId,'new-moon-lockbreaker-v1');
  for(const trial of reg.trials){
    assert.equal(trial.rank,11);
    assert.equal(trial.seed,2171744612);
    assert.equal(trial.candidateSlot,'A');
    assert.equal(trial.id,
      [trial.rank,trial.repeat,trial.candidateSlot,trial.candidateId].join(':'));
  }
  assert.equal(profile.policyOptions.actorOnlyComposition,true);
  assert.equal(profile.policyOptions.actorDceMewMobilityRoot,true);
  assert.equal(profile.policyOptions.actorRank9MegaAbsolFundingRoot,true);
  assert.equal(profile.policyOptions.actorActiveMegaClawPriorityRoot,true);
  assert.equal(profile.policyOptions.nativeRootActionLimit,260);
  assert.equal(profile.policyOptions.bilateralKnownDeadAttackRoot,true);
  return {registration:reg,profile};
}

/** @param {object} row @returns {object} */
function summary(row){
  const replies=(row.candidateRepliesAfterSourceAttacks??[])
    .filter(x=>x.sourceAttackName==='Claw of Darkness');
  const settled=(row.sourceAttackSettlement?.attacks??[]);
  return {
    id:row.trial?.id??null,status:row.status??null,
    error:row.error??null,nativeTerminal:row.finished===true,
    nativeWinner:row.finished===true?row.winner??null:null,
    actionCount:row.actionCount??null,
    fullOriginalSourcePhysicalDeal:row.sourceDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    sourceClawDeclarations:settled.filter(x=>
      x.attackName==='Claw of Darkness').length,
    sourceTerminalPeriodDeclarations:settled.filter(x=>
      x.attackName==='Terminal Period').length,
    firstSourceClawResponse:replies[0]??null,
    sourceClawResponseCount:replies.length,
    sourceFinalPrizes:row.finalPrizes??null,
    genuineNativeOwnerRootCount:row.rootActionLedger?.length??0,
    competitiveGameQualified:false
  };
}

/**
 * Select the exact prior common 92-option policy for both seats, changing
 * only the public opportunity reply. Reusable within-candidate source deal
 * fingerprints are required before making any causal claim.
 * @param {(opts:object)=>object} [run] Existing native canonical runner.
 * @returns {object} Full six-attempt native diagnostic.
 */
function runExperiment(run=require('./agent41-bilateral-v2-development.cjs')
  .runDevelopment){
  const {registration:reg,profile}=preflight();
  assert.equal(typeof run,'function');
  const priorVip=process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV;
  const priorPayment=process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
  const modes=[];
  try{
    process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV='true';
    process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV='true';
    for(const mode of MODES){
      const cfg={...profile.policyOptions,registeredTrials:reg.trials,
        registeredFrameName:'agent14-rank11-postclaw-'+mode};
      const wrapped=withRegisteredBehindResponse(
        ()=>run(cfg),reg.trials,mode);
      const rows=wrapped.result.rows;
      assert.equal(rows.length,2,'Registered source pair missing native rows');
      assert.deepEqual(rows.map(r=>r.trial?.id),reg.trials.map(t=>t.id));
      modes.push({id:mode,version:VERSION,
        symmetricPolicy:true,readOnlyMode:mode==='observe',
        audits:wrapped.audit,rows,summary:rows.map(summary)});
    }
  }finally{
    if(priorVip===undefined)delete process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV;
    else process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV=priorVip;
    if(priorPayment===undefined)delete process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV;
    else process.env.AGENT4_NATIVE_PAYMENT_RECEIPT_DEV=priorPayment;
  }
  const paired=reg.trials.map((trial,i)=>{
    const fingerprints=modes.map(mode=>
      mode.rows[i].sourceDealFingerprint??null);
    const starters=modes.map(mode=>
      mode.rows[i].actualStarterSeat??null);
    return {trial,sourceFingerprints:fingerprints,actualStarters:starters,
      withinCandidatePhysicalMatch:
        fingerprints.every(v=>typeof v==='string'&&v.length>0)&&
        new Set(fingerprints).size===1,
      withinCandidateStarterMatch:
        starters.every(v=>Number.isSafeInteger(v))&&
        new Set(starters).size===1,
      sourceClawsPerMode:modes.map(mode=>
        mode.summary[i].sourceClawDeclarations),
      nativeReplyAcceptedPerMode:modes.map(mode=>
        mode.audits.trialAudits[i]?.accepted??null)};
  });
  const result={
    schema:'agent14-source-rank11-postclaw-six-retrospective-native-v1',
    registrationGitBlob:REGISTRATION_BLOB,
    adapterGitBlob:ADAPTER_BLOB,
    selectedJointProfileGitBlob:reg.existingFrozenJointV2Blob,
    enginePin:reg.nativeTwinleafCommit,
    retrospectiveDevelopment:true,
    sourceContexts:2,nativeAttempts:modes.reduce((n,m)=>n+m.rows.length,0),
    modeNames:MODES,modes,paired,
    allWithinCandidateSourceDealMatched:paired.every(x=>
      x.withinCandidatePhysicalMatch&&x.withinCandidateStarterMatch),
    directNativeWinsQualified:0,
    wholePaperRulesCertified:false,opponentPolicyCertified:false,
    twentyFiveMinutePaperClockCertified:false,
    competitiveGameQualified:false
  };
  assert.equal(result.nativeAttempts,reg.expectedAttempts);
  return result;
}

/**
 * Write exactly one artifact atomically under an exclusive lock. An error
 * preserves the original preregistration and any completed logs.
 * @param {object} result
 */
function saveNativeResult(result){
  const dest=path.join(ROOT,OUTPUT);
  const lock=dest+'.lock',temp=dest+'.pending';
  const lockFd=fs.openSync(lock,'wx');
  try{
    const fd=fs.openSync(temp,'wx');
    try{
      fs.writeFileSync(fd,JSON.stringify(result,null,2)+'\n');
      fs.fsyncSync(fd);
    }finally{fs.closeSync(fd);}
    fs.renameSync(temp,dest);
  }finally{fs.closeSync(lockFd);fs.unlinkSync(lock);}
}
function main(){
  const result=runExperiment();
  saveNativeResult(result);
  const compact={
    nativeAttempts:result.nativeAttempts,
    physicalPairs:result.paired.map(x=>x.withinCandidatePhysicalMatch),
    starterPairs:result.paired.map(x=>x.withinCandidateStarterMatch),
    byMode:result.modes.map(m=>({
      id:m.id,status:m.summary.map(x=>x.status),
      sourceClaws:m.summary.map(x=>x.sourceClawDeclarations),
      interventions:m.audits.trialAudits.map(x=>({
        observedEligible:x.observedEligible??null,
        nativeEligible:x.nativeEligible??null,
        accepted:x.accepted??null,rejected:x.rejected??null}))
    })),
    competitiveGameQualified:false
  };
  process.stdout.write('AGENT14_RANK11_RESULT '+JSON.stringify(compact)+'\n');
  assert.equal(result.allWithinCandidateSourceDealMatched,true,
    'Native actual physical source deal diverged across modes; reject comparison');
  return result;
}
if(require.main===module)main();
module.exports={preflight,summary,runExperiment,saveNativeResult,main};
