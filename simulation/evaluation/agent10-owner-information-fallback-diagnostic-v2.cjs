'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent10-owner-information-fallback-diagnostic-v2';
const SOURCE_RUNNER_PATH=path.resolve(__dirname,
  'agent36-issue25-common-v10b-paired-fresh-aba.cjs');
const SOURCE_REGISTRATION_PATH=path.resolve(__dirname,
  '../../results/aichi-2026/registrations/agent36-issue25-common-v10b-paired-fresh-aba-260root-20261107.json');
const OBSERVER_PATH=path.resolve(__dirname,
  '../twinleaf/agent10-owner-prompt-metadata-observer-v1.cjs');
const ARTIFACT_DIRECTORY=path.resolve(process.cwd(),
  'artifacts/agent3-owner-information-fallback-diagnostic');
const ARTIFACT_PATH=path.join(ARTIFACT_DIRECTORY,
  'agent10-owner-information-fallback-diagnostic-v2.json');

/** @param {string} filePath */
function sha256File(filePath){
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/** @param {object} event */
function safeRootEvent(event){
  const action=event?.actionName??event?.actionType??event?.action??
    event?.type??event?.kind??event?.name??null;
  return {
    ordinal:event?.ordinal??event?.actionOrdinal??null,
    seat:event?.seat??event?.playerSlot??event?.seatIndex??null,
    turnBefore:event?.turnBefore??event?.turn??null,
    phaseBefore:event?.phaseBefore??event?.phase??null,
    action:typeof action==='string'?action:action?.constructor?.name??null,
    promptId:event?.promptId==null?null:String(event.promptId),
    responseKind:event?.responseKind??null,
    resultKind:event?.resultKind??null
  };
}

/** @param {object} row */
function safeAttemptRow(row,rootLedgerFn,summaryById){
  const evidence=row?.nativeAbortEvidence??row?.nativeAbortProvenance??{};
  const ledger=typeof rootLedgerFn==='function'
    ?rootLedgerFn(row)
    :row?.rootActionLedger??evidence?.rootActionLedger??null;
  const trialId=row?.trial?.id??row?.id??null;
  const summary=summaryById.get(trialId)??{};
  const records=row?.error?.nativeRawStateFallbackQuarantine?.records??
    row?.error?.nativeRawStateQuarantine?.records??
    evidence?.nativeRawStateFallbackQuarantine?.records??
    evidence?.nativeRawStateQuarantine?.records??[];
  return {
    trialId,
    rank:row?.trial?.rank??null,
    candidateSlot:row?.trial?.candidateSlot??null,
    candidateId:row?.trial?.candidateId??null,
    seed:row?.trial?.seed??null,
    sourceSeat:summary.sourceSeat??row?.sourceSeat??null,
    candidateSeat:summary.candidateSeat??row?.candidateSeat??null,
    nativeOutcome:summary.nativeOutcome??null,
    acceptedNativeRootCount:summary.acceptedNativeRootCount??null,
    actionCount:summary.actionCount??null,
    finished:summary.finished??null,
    endReason:summary.endReason??null,
    errorName:row?.error?.name??null,
    errorCode:row?.error?.code??null,
    nativeAbortCode:evidence?.code??evidence?.errorCode??null,
    rootActionLedgerLength:Array.isArray(ledger)?ledger.length:null,
    rootActionTail:Array.isArray(ledger)?ledger.slice(-12).map(safeRootEvent):[],
    quarantineRecords:records.map(record=>({
      seat:record.seat??null,
      turn:record.turn??null,
      phase:record.phase??null,
      decisionKind:record.decisionKind??null,
      promptType:record.promptType??null
    }))
  };
}

/** @param {object} phase @param {object|null} thrown */
function buildArtifact(phase,promptAudit,thrown,sourceRunner){
  const diagnostic=phase?.diagnostic??null;
  const quarantine=diagnostic?.audit?.nativeRawStateQuarantine??
    diagnostic?.audit?.nativeRawStateFallbackQuarantine??
    diagnostic?.nativeRawStateQuarantine??
    diagnostic?.nativeRawStateFallbackQuarantine??
    thrown?.nativeRawStateFallbackQuarantine??null;
  const quarantineRecords=Array.isArray(quarantine?.records)
    ?quarantine.records:[];
  const promptEvents=Array.isArray(promptAudit?.events)?promptAudit.events:[];
  const promptMatches=quarantineRecords.map(record=>{
    const matching=promptEvents.filter(event=>
      event.ownerSeat===record.seat&&
      event.turn===record.turn&&
      event.phase===record.phase&&
      event.promptType===record.promptType
    );
    return {
      quarantineRecord:{
        seat:record.seat??null,
        turn:record.turn??null,
        phase:record.phase??null,
        decisionKind:record.decisionKind??null,
        promptType:record.promptType??null
      },
      matchStatus:matching.length===1?'UNIQUE':
        matching.length>1?'MULTIPLE':'NONE',
      matchingPromptCount:matching.length,
      matchingPromptEvents:matching
    };
  });
  const rawRows=phase?.rawDevelopment?.rows??[];
  const nativeAttempts=(diagnostic?.nativeAttempts??[]).map(row=>({
    id:row.id??null,
    nativeOutcome:row.nativeOutcome??null,
    sourceSeat:row.sourceSeat??null,
    candidateSeat:row.candidateSeat??null,
    actualFirstPlayerSeat:row.actualFirstPlayerSeat??null,
    acceptedNativeRootCount:row.acceptedNativeRootCount??null,
    actionCount:row.actionCount??null,
    finished:row.finished??null,
    endReason:row.endReason??null,
    rootLedgerSha256:row.rootLedgerSha256??null
  }));
  const summaryById=new Map(nativeAttempts.map(row=>[row.id,row]));
  const status=quarantineRecords.length>0?'FALLBACK_CAPTURED':
    thrown?'RUNNER_THROWN':'NO_FALLBACK_CAPTURED';
  return {
    manifest:{
      version:VERSION,
      status,
      phase:'A',
      sourceRunnerPath:'simulation/evaluation/agent36-issue25-common-v10b-paired-fresh-aba.cjs',
      sourceRegistrationPath:'results/aichi-2026/registrations/agent36-issue25-common-v10b-paired-fresh-aba-260root-20261107.json',
      sourceRunnerVersion:sourceRunner?.VERSION??phase?.manifest?.version??null,
      sourceRunnerSha256:sha256File(SOURCE_RUNNER_PATH),
      sourceRegistrationSha256:sha256File(SOURCE_REGISTRATION_PATH),
      observerPath:'simulation/twinleaf/agent10-owner-prompt-metadata-observer-v1.cjs',
      observerVersion:promptAudit?.version??null,
      observerSha256:sha256File(OBSERVER_PATH),
      diagnosticRunnerPath:'simulation/evaluation/agent10-owner-information-fallback-diagnostic-v2.cjs',
      diagnosticRunnerSha256:sha256File(__filename),
      diagnosticRunnerCommit:process.env.GITHUB_SHA??null,
      pinnedTwinleafGitCommit:phase?.manifest?.observedTwinleafGitCommit??null,
      nativeAttemptCount:rawRows.length,
      quarantineRecordCount:quarantineRecords.length,
      promptRecordCount:promptEvents.length,
      competitiveGamesQualified:0,
      paperLegalityCertified:false,
      estimatedWinRate:null
    },
    thrown:thrown?{
      name:thrown.name??null,
      code:thrown.code??null
    }:null,
    quarantineRecords,
    promptMatches,
    promptObserverAudit:promptAudit,
    nativeAttempts,
    rawAttemptSummaries:rawRows.map(row=>safeAttemptRow(row,sourceRunner?.rootLedger,summaryById)),
    phaseSummary:phase&&typeof sourceRunner?.phaseSummary==='function'
      ?sourceRunner.phaseSummary(phase):null
  };
}

/** @param {object} artifact */
function writeArtifact(artifact){
  fs.mkdirSync(ARTIFACT_DIRECTORY,{recursive:true});
  const lockPath=ARTIFACT_PATH+'.lock';
  const tempPath=ARTIFACT_PATH+'.tmp-'+process.pid;
  const lockFd=fs.openSync(lockPath,'wx');
  try{
    fs.writeFileSync(tempPath,JSON.stringify(artifact,null,2),{flag:'wx'});
    fs.renameSync(tempPath,ARTIFACT_PATH);
  }finally{
    if(fs.existsSync(tempPath))fs.unlinkSync(tempPath);
    fs.closeSync(lockFd);
    fs.unlinkSync(lockPath);
  }
}

/** Run the frozen v10b phase A with a passive prompt metadata observer. */
function main(){
  assert.ok(fs.existsSync(SOURCE_RUNNER_PATH),'Frozen v10b source runner is required');
  assert.ok(fs.existsSync(SOURCE_REGISTRATION_PATH),'Frozen v10b registration is required');
  const sourceRunner=require(SOURCE_RUNNER_PATH);
  const observer=require(OBSERVER_PATH);
  assert.equal(typeof sourceRunner.runPhase,'function');
  assert.equal(typeof observer.withOwnerPromptMetadataObserver,'function');

  let phase=null;
  let thrown=null;
  let promptAudit=null;
  try{
    const observed=observer.withOwnerPromptMetadataObserver(
      ()=>sourceRunner.runPhase('A'),{maxEvents:512}
    );
    phase=observed.result;
    promptAudit=observed.audit;
  }catch(error){
    thrown=error;
    promptAudit=error?.agent10OwnerPromptMetadataAudit??null;
  }

  const artifact=buildArtifact(phase,promptAudit,thrown,sourceRunner);
  writeArtifact(artifact);
  const output={
    manifest:artifact.manifest,
    thrown:artifact.thrown,
    quarantineRecords:artifact.quarantineRecords,
    promptMatches:artifact.promptMatches,
    nativeAttempts:artifact.nativeAttempts,
    rawAttemptSummaries:artifact.rawAttemptSummaries,
    phaseSummary:artifact.phaseSummary,
    artifactPath:ARTIFACT_PATH
  };
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(artifact.quarantineRecords.length===0)process.exitCode=1;
  return output;
}

if(require.main===module)main();

module.exports={VERSION,buildArtifact,safeAttemptRow,safeRootEvent,main};
