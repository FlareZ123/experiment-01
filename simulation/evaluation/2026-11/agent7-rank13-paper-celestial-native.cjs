'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {runBranch,TRIAL_IDS}=require('../agent7-v8-rank3-mail-beach-composition.cjs');

const VERSION='agent7-original-rank13-regidrago-paper-celestial-aba-v1';
const OUTPUT=path.resolve(__dirname,
  '../../../artifacts/agent7-paper-celestial/paired-native.json');

/** Two actual original 60s and an identical real-deal source seed. */
function run(){
  const common={mysteriousTreasureRoot:true,ownerConfirm:true,
    arvenNest:true,dedenneTrue:true,celestialRoar:true,
    motivateEnergy:false};
  const control=runBranch(true,true,{...common,paperCelestial:false});
  const patch=runBranch(true,true,{...common,paperCelestial:true});
  assert.deepEqual(control.output.rows.map(x=>x.trialId),TRIAL_IDS);
  assert.deepEqual(patch.output.rows.map(x=>x.trialId),TRIAL_IDS);
  const statuses=arm=>arm.output.rows.map(r=>({
    trialId:r.trialId,candidateSeat:r.candidateSeat,sourceSeat:r.sourceSeat,
    status:r.status,
    nativeRootCount:r.nativeAbortEvidence?.rootActionCount??null,
    lastAcceptedRootPrefix:r.nativeAbortEvidence?.acceptedRootPrefix??[],
    firstAcceptedRootPrefix:r.nativeAbortEvidence?.initialAcceptedRootPrefix??[],
    nativeErrorCode:r.nativeDirectErrorCode??null,
    nativeError:r.nativeErrorText??r.nativeDirectErrorMessage??null,
    policyError:r.selectedV0?.thrownCode??null,
    ownerQuarantine:r.selectedV0?.nativeQuarantineAudit?.records??[]
  }));
  const audit=arm=>({
    physicalDedenneTrue:arm.mailAudit.nativeDedenneTrueEffectSettled,
    DedenneEvents:arm.mailAudit.nativeDedenneTrueEvents,
    CelestialPromptOffers:arm.mailAudit.nativeCelestialRoarOffers,
    CelestialPromptSettled:arm.mailAudit.nativeCelestialRoarSettled,
    CelestialPromptRejected:arm.mailAudit.nativeCelestialRoarRejected,
    CelestialPromptUnsettled:arm.mailAudit.nativeCelestialRoarUnsettled,
    CelestialEvents:arm.mailAudit.nativeCelestialRoarEvents,
    sourceArvenSettled:arm.mailAudit.arvenFromMailAccepted,
    sourceArvenSearches:arm.mailAudit.arvenSearchEvents,
    sourceArvenNestBench:arm.mailAudit.nestFromArvenBenchEvents,
    paperHook:arm.paperAudit??null,
    trialStatuses:statuses(arm)
  });
  const baseline=audit(control),corrected=audit(patch);
  return {
    schema:VERSION,seed:290134,trialIds:TRIAL_IDS,
    enginePin:control.output.enginePin,originalSixtiesUnchanged:true,
    originalAichiSourceRanks:[3,13],nativeRootCap:128,
    contrast:'Same Dedenne-true, owner Celestial prompt, Mail Beach Arven Nest; one difference is reversible source Regidrago V Celestial Roar card-text repair.',
    control:baseline,paperCorrected:corrected,
    nativePaperCelestialPlayed:corrected.paperHook?.interceptedAttacks>0,
    nativeOwnerSpecialEnergyPhysicallyAttached:
      corrected.CelestialEvents.some(event=>
        event.attachedPrintings.includes('Double Dragon Energy ROS')&&
        event.physicalEnergyToOwnActive),
    noStrandedTemporaryCardsUnderPatch:
      corrected.CelestialEvents.every(event=>
        event.otherCardsStrandedInTemporaryPile===0),
    status:corrected.paperHook?.interceptedAttacks>0&&
      corrected.CelestialPromptSettled>0&&
      corrected.CelestialPromptRejected===0&&
      corrected.CelestialPromptUnsettled===0&&
      corrected.CelestialEvents.every(event=>
        event.otherCardsStrandedInTemporaryPile===0)?
      'PAPER_CELESTIAL_NATIVE_SPECIAL_AND_REMAINDER_SETTLED':
      'PAPER_CELESTIAL_NATIVE_NOT_FULLY_SETTLED',
    competitivePaperGamesQualified:0,
    estimatedWinRate:null
  };
}

/** Atomically write with exclusive output lock. */
function save(value){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx');
  const tmp=OUTPUT+'.'+process.pid+'.'+randomUUID()+'.tmp';
  try{
    fs.writeFileSync(tmp,JSON.stringify(value,null,2)+'\n',{flag:'wx'});
    fs.renameSync(tmp,OUTPUT);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
  return OUTPUT;
}
if(require.main===module){
  let value;
  try{value=run();}
  catch(error){value={schema:VERSION,status:'NATIVE_OR_ASSERTION_ERROR',
    error:{name:error.name,message:error.message,stack:String(error.stack).slice(0,1800)},
    competitivePaperGamesQualified:0};}
  save(value);
  process.stdout.write(JSON.stringify({
    schema:value.schema,status:value.status,
    nativePaperCelestialPlayed:value.nativePaperCelestialPlayed??false,
    nativeOwnerSpecialEnergyPhysicallyAttached:
      value.nativeOwnerSpecialEnergyPhysicallyAttached??false,
    noStrandedTemporaryCardsUnderPatch:
      value.noStrandedTemporaryCardsUnderPatch??false,
    paperHook:value.paperCorrected?.paperHook??null,
    competitivePaperGamesQualified:0,
    error:value.error??null
  },null,2)+'\n');
  if(value.status!=='PAPER_CELESTIAL_NATIVE_SPECIAL_AND_REMAINDER_SETTLED')
    process.exitCode=1;
}
module.exports={VERSION,run,save};
