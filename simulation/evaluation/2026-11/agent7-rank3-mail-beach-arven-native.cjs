'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {runBranch,pairedMailBeachEvidence,TRIAL_IDS}=
  require('../agent7-v8-rank3-mail-beach-composition.cjs');
const {ARVEN}=require('../../twinleaf/agent7/mail-arven-owner-choice.cjs');

const VERSION='agent7-rank3-original-mail-beach-arven-native-v1';
const OUTPUT=path.resolve(__dirname,
  '../../../artifacts/agent7-mail-beach-arven/paired-native.json');

/** Native originals are unchanged; only Arven follow-through is opt-in. */
function run({treasureBridge=false}={}){
  const opts={mysteriousTreasureRoot:treasureBridge};
  const control=runBranch(true,false,opts);
  const treatment=runBranch(true,true,opts);
  assert.deepEqual(control.output.rows.map(r=>r.trialId),TRIAL_IDS);
  assert.deepEqual(treatment.output.rows.map(r=>r.trialId),TRIAL_IDS);
  assert.equal(control.mailAudit.attempts,2);
  assert.equal(treatment.mailAudit.attempts,2);
  assert.equal(control.mailAudit.arvenFromMailAccepted,0);
  const beachControl=pairedMailBeachEvidence(control);
  const beachTreatment=pairedMailBeachEvidence(treatment);
  const audit=treatment.mailAudit;
  const pairs=beachTreatment.flatMap(beach=>{
    const mailChosen=audit.revealedTrainers.some(e=>
      e.trialId===beach.trialId&&e.seat===beach.sourceSeat&&
      e.printing===ARVEN);
    if(!mailChosen)return [];
    return audit.arvenPlayEvents.filter(e=>
      e.trialId===beach.trialId&&e.seat===beach.sourceSeat&&
      e.turnBefore>beach.globalTurn&&e.printing===ARVEN
    ).map(play=>{
      const searches=audit.arvenSearchEvents.filter(e=>
        e.trialId===play.trialId&&e.seat===play.seat&&
        e.turnBefore===play.turnBefore);
      return {trialId:play.trialId,seat:play.seat,
        mailFirstTurn:beach.globalTurn,
        trainerOriginallySelectedByMail:ARVEN,
        beachPlayedAndUsedFromActualOwnerHand:true,
        laterSupporterTurn:play.turnBefore,
        supporterQuotaSpent:play.supporterTurnAfter>0,
        arvenNativePromptId:play.pendingArvenPromptId,
        actualOwnerDeckSearches:searches,
        physicalItemAndToolTransfer:searches.some(s=>
          s.physicalOwnerDeckToHand===true&&s.selected.length===2)};
    });
  });
  const qualified=pairs.filter(p=>p.supporterQuotaSpent&&
    p.physicalItemAndToolTransfer&&p.arvenNativePromptId!==null);
  const trialStatuses=branch=>branch.output.rows.map(r=>({
    id:r.trialId,status:r.status,candidateSeat:r.candidateSeat,
    sourceSeat:r.sourceSeat,
    activeRegistration:r.activeRunDevelopmentRegistrationValid,
    latestAcceptedRootPrefix:r.nativeAbortEvidence?.acceptedRootPrefix??[],
    firstAcceptedRootPrefix:r.nativeAbortEvidence?.initialAcceptedRootPrefix??[],
    nativeError:r.nativeDirectErrorMessage??null,
    nativeOriginalErrorText:r.nativeErrorText??null,
    nativeDirectErrorCode:r.nativeDirectErrorCode??null,
    nativeDirectErrorStack:r.nativeDirectErrorStack??null,
    policyThrownCode:r.selectedV0?.thrownCode??null,
    policyThrownMessage:r.selectedV0?.thrownMessage??null,
    nativeRootCount:r.nativeAbortEvidence?.rootActionCount??null,
    nativeQuarantineRecords:r.selectedV0?.nativeQuarantineAudit?.records??[],
    blockedPrompt:r.blockedPromptContract??null,
    observedFirstUnsupportedActorRoot:r.firstUnsupportedOwnerRoot?.ownerView?.decisionKind??null
  }));
  return {
    schema:treasureBridge?VERSION+'-with-actor-treasure-v2':VERSION,
    experimentalExistingActorTreasureBridge:treasureBridge,
    originalRank3SourceAndRank13Candidate:true,
    seed:290134,enginePin:control.output.enginePin,
    fullPrintedSixtiesFixed:true,
    actualNativeRootCap:128,
    trialIds:TRIAL_IDS,
    intervention:'After the same genuine Mail+Beach first turn, offer only a physically Mail-selected Arven on an otherwise Pass later root. Resolve its exact owner-deck Item+Tool prompt with native validation.',
    control:{mailEvents:control.mailAudit.actualMailEvents,
      chosenTrainers:control.mailAudit.revealedTrainers,
      beachPairs:beachControl,trialStatuses:trialStatuses(control)},
    treatment:{mailEvents:audit.actualMailEvents,
      chosenTrainers:audit.revealedTrainers,
      beachPairs:beachTreatment,
      arvenOffers:audit.arvenFromMailOffers,
      arvenAccepted:audit.arvenFromMailAccepted,
      arvenRejected:audit.arvenFromMailRejected,
      arvenPromptRejected:audit.arvenSearchRejected,
      arvenNoSearchPrompt:audit.arvenNoSearchPrompt,
      arvenSearchUnsettled:audit.arvenSearchUnsettled,
      arvenPlayEvents:audit.arvenPlayEvents,
      arvenSearchEvents:audit.arvenSearchEvents,
      trialStatuses:trialStatuses(treatment)},
    completeMailBeachArvenPairs:pairs,
    physicallySettledThreeEffectSequence:qualified.length>0,
    status:audit.arvenFromMailRejected>0||audit.arvenSearchRejected>0||
      audit.arvenSearchUnsettled>0?'NATIVE_ARVEN_REJECTED_OR_UNSETTLED':
      qualified.length>0?'NATIVE_THREE_EFFECT_SEQUENCE_SETTLED':
      'NO_MATCHING_NATIVE_ARVEN_ACTIVATION',
    competitiveGamesQualified:0,
    estimatedWinRate:null
  };
}

/** Atomic receipt with an exclusive per-output lock. */
function save(report){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const output=report.experimentalExistingActorTreasureBridge?
    OUTPUT.replace('paired-native.json','paired-native-with-treasure.json'):OUTPUT;
  const lock=output+'.lock';
  const fd=fs.openSync(lock,'wx');
  const tmp=output+'.'+process.pid+'.'+randomUUID()+'.tmp';
  try{
    fs.writeFileSync(tmp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    fs.renameSync(tmp,output);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return output;
}

if(require.main===module){
  let report;
  try{report=run({treasureBridge:process.env.AGENT7_TREASURE_BRIDGE_DEV==='true'});}
  catch(error){
    report={schema:VERSION,status:'NATIVE_OR_ASSERTION_ERROR',
      error:{name:error.name,message:error.message,
        stack:String(error.stack).slice(0,1400)},
      competitiveGamesQualified:0};
  }
  const artifact=save(report);
  process.stdout.write(JSON.stringify({schema:report.schema,artifact,
    status:report.status,pairs:report.completeMailBeachArvenPairs??[],
    nativeArvenActions:report.treatment?.arvenAccepted??0,
    competitiveGamesQualified:0,error:report.error??null},null,2)+'\n');
  if(report.status!=='NATIVE_THREE_EFFECT_SEQUENCE_SETTLED')
    process.exitCode=1;
}

module.exports={VERSION,run,save};
