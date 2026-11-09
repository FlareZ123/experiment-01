'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {arm}=require('./agent20-rank5-gengar-tempo-aba.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const REG=path.join(ROOT,
  'results/aichi-2026/registrations/agent13-first-full-paper-native-20261109.json');
const OUTPUT=path.join(ROOT,
  'artifacts/agent13-first-full-paper-native-rank5-20261109.json');
const sha=value=>createHash('sha256').update(value).digest('hex');

/** Locked, durable, atomic outcome, including failures and censored roots. */
function save(result){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
    const handle=fs.openSync(temp,'r');
    try{fs.fsyncSync(handle);}finally{fs.closeSync(handle);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

/** One fixed prospective original rank-5 native case, no outcome selection. */
function main(){
  const bytes=fs.readFileSync(REG);
  const prereg=JSON.parse(bytes.toString('utf8'));
  assert.equal(prereg.schema,'agent13-prospective-native-full-root-custody-trial-v1');
  assert.equal(prereg.frozenBeforeFirstExecution,true);
  assert.equal(prereg.rootCap,320);
  assert.equal(prereg.registeredTrials.length,1);
  assert.deepEqual(prereg.registeredTrials[0],{
    rank:5,repeat:513001,candidateSlot:'A',seed:732610881,
    candidateId:'new-moon-lockbreaker-v1',
    id:'5:513001:A:new-moon-lockbreaker-v1'
  });
  const registration={
    caseId:prereg.caseId,
    rootCap:prereg.rootCap,
    registeredTrials:prereg.registeredTrials
  };
  const start={
    registrationSha256:sha(bytes),
    pinnedTwinleafCommit:prereg.pinnedTwinleafCommit,
    sourceRank:5,trial:prereg.registeredTrials[0],
    originalSourceAndCandidatePrinted60Unchanged:true,
    paperQualifiedGames:0,competitiveQualifiedGames:0,
    notAnOfficialClockTrial:true,
    type:'prospective native evidence capture without paper admission'
  };
  let record;
  try{
    const native=arm('first-full-paper-custody',false,registration,{
      ownerLillieAfterPass:true,minOpponentHandCount:6,resourceV3:true,
      captureNativeAttackPhysicalTape:true,
      captureFullNativePaperReceipts:true
    });
    const complete=native.fullNativePaperRootReceipts;
    const modality=native.nativeAttackModalityLedger;
    assert.ok(complete,'Full live Store receipt observer absent');
    assert.ok(modality?.physicalTapeAvailable===true,
      'Postgame copied-attack physical roots were not collected');
    const accepted=complete.acceptedStoreRootCount;
    assert.equal(accepted,native.rootCount,
      'Complete live Store receipt count differs from accepted-root ledger');
    assert.equal(complete.originalPhysicalCards.length,120,
      'Native source/candidate card identity partition must be exactly 120');
    assert.equal(native.nativeAttackPhysicalTape.postAcceptedRoots.length,
      native.rootCount,
      'Root-linked lightweight physical audit must cover every accepted root');
    assert.equal(native.rootPhysicalLinked,true,
      'Independent Agent20 full-Store tape must cover the same roots');
    record={
      schema:'agent13-prospective-full-paper-native-source-rank5-v1',
      status:native.nativeError?'native-error':
        native.nativeFinished?'native-terminal':'native-censored-or-capped',
      ...start,
      rootCount:native.rootCount,nativeFinished:native.nativeFinished,
      nativeWinner:native.nativeWinner,
      nativeError:native.nativeError,
      remainingPrizes:native.remainingPrizes,
      originalSourceDeal:native.sourceFingerprint,
      fullPhysicalDeal:native.fullFingerprint,
      physicalIntegrity:native.physicalIntegrity,
      ownerPolicy:native.actorPolicy,
      fullPhysicalTape:native.physicalTape,
      originalFullPhysicalLedgerSha256:native.rootLedgerSha256,
      exactAcceptedRoots:native.roots,
      fullNativePaperRootReceipts:complete,
      nativeAttackPhysicalTape:native.nativeAttackPhysicalTape,
      nativeAttackModalityLedger:modality,
      sourcePerfectionPrizeReceipts:native.sourcePerfectionPrizeReceipts,
      candidatePerfectionPrizeReceipts:native.candidatePerfectionPrizeReceipts,
      paperPaymentCertified:false,ownerStrategicCompetenceCertified:false,
      officialClockVerified:false,independentReviewerSignatures:0,
      prospectiveNativeRun:true,qualifiedGame:false
    };
  }catch(error){
    record={
      schema:'agent13-prospective-full-paper-native-source-rank5-v1',
      status:'native-runner-error',...start,
      errorName:error?.name??null,
      errorMessage:typeof error?.message==='string'?
        error.message.slice(0,1000):'unknown',
      nativeErrorStack:typeof error?.stack==='string'?
        error.stack.slice(0,4000):null,
      prospectiveNativeRun:true,qualifiedGame:false,
      captureIncomplete:true
    };
  }
  save(record);
  process.stdout.write('AGENT13_PREREG_FIRST_FULL_PHYSICAL_ROOT '+
    JSON.stringify({status:record.status,rootCount:record.rootCount??0,
      nativeWinner:record.nativeWinner??null,
      identityCards:record.fullNativePaperRootReceipts?.originalPhysicalCards?.length??null,
      fullAcceptedReceipts:record.fullNativePaperRootReceipts?.acceptedStoreRootCount??null,
      settledPhysicalIdentityClean:
        record.fullNativePaperRootReceipts?.settledPhysicalIdentityClean??null,
      copiedAttacks:record.nativeAttackModalityLedger?.perfectionInitiations??null,
      candidateCopiedPrizeEpisodes:
        record.candidatePerfectionPrizeReceipts?.filter(r=>r.actualPrizesTaken>0).length??null,
      paperQualifiedGames:0,registrationSha256:record.registrationSha256,
      error:record.errorMessage??null})+'\n');
  return record;
}
if(require.main===module)main();
module.exports={main,REG,OUTPUT};
