'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {runSelectedIssue25V0}=require('./agent36-issue25-selected-v0.cjs');
const {withStewardOwnerPromptFrontier}=
  require('./agent36-issue25-steward-selected-v4.cjs');
const {withStewardInnermostOwnerPrompts}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withCommonOwnerThornsRoot}=
  require('./agent36-issue25-common-v6.cjs');
const {withOwnerVoltAcrossNativeMatches}=
  require('./agent36-issue25-common-v7.cjs');
const {withBilateralOwnerMail}=
  require('../twinleaf/agent38-v8-four-arm-owner-mail-native.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTER=require(
  '../../results/aichi-2026/registrations/agent7-mail-broad-two-source-20261108.json');
const VERSION=REGISTER.schema;
const SOURCE_RANKS=REGISTER.sourceRanks;
const LIMIT=REGISTER.nativeRootActionsPerArm;

function summarizeRow(row,trial) {
  return {
    id:trial.id,rank:trial.rank,candidateSlot:trial.candidateSlot,
    seed:trial.seed,sourceSeat:trial.candidateSlot==='A'?1:0,
    status:row?.status??null,finished:row?.finished??null,
    winner:row?.finished===true?row?.winner??null:null,
    endReason:row?.endReason??null,
    acceptedNativeRoots:row?.actionCount??null,
    finalPrizes:row?.finalPrizes??null,
    nativeAbortCode:row?.error?.code??null,
    nativeAbortStage:row?.nativeAbortEvidence?.failureStage??null
  };
}

function runVariant(withMail) {
  const base=path.join(ROOT,'vendor/twinleaf/ptcg-server/output');
  const native=relative=>require(path.join(base,relative));
  const headless=require('../twinleaf/headless.cjs');
  const {Store}=native('game/store/store');
  const trialIds=REGISTER.trials.map(x=>x.id);
  const storeTrialIds=new WeakMap(),rootTape=[];
  const ownerMailActionRefs=new WeakSet();
  let selectedResult=null,mailAudit=null,abilityAudit=null;
  const execute=()=>withCommonOwnerThornsRoot(()=>{
    selectedResult=runSelectedIssue25V0({
      runner:options=>{
        const development=()=>runDevelopment({
          ...options,
          actorOnlyComposition:true,
          sourceIndependentCommonPolicy:true,
          bilateralSpecialEnergyRoot:true,
          nativeAcceptedTargets:true,
          nativeRootActionLimit:LIMIT,
          registeredTrials:REGISTER.trials.map(t=>({...t})),
          registeredFrameName:REGISTER.registeredFrameName,
          allowAdditionalOriginalSourceRanks:true,
          allowSingleCandidatePerGroup:true,
          nativeSetupCoinChoiceReceipt:true,
          isolatePolicyRandomness:true,
          isolatePhysicalShuffleRandomnessAfterSetup:true,
          onRootStoreCreated:(store,id)=>storeTrialIds.set(store,id),
          onRootActionDispatched:(store,action,ordinal,seat,turn)=>{
            rootTape.push({
              trialId:storeTrialIds.get(store)??null,
              ordinal,seat,turn,
              action:action?.constructor?.name??null,
              ownerMailAfterPassAction:ownerMailActionRefs.has(action)
            });
          }
        });
        const confirmed=()=>{
          const r=require('../twinleaf/agent36-owner-ability-confirm-policy.cjs')
            .withOwnerAbilityConfirmPolicy(development);
          abilityAudit=r.audit;
          return r.result;
        };
        if(!withMail)return confirmed();
        const r=withBilateralOwnerMail(confirmed,{
          headless,Store,
          SimpleTacticsAi:native('simple-bot/simple-tactics-ai').SimpleTacticsAi,
          PlayCardAction:native('game/store/actions/play-card-action').PlayCardAction,
          ResolvePromptAction:native(
            'game/store/actions/resolve-prompt-action').ResolvePromptAction,
          types:native('game/store/card/card-types'),trialIds,
          onMailActionCommitted:action=>ownerMailActionRefs.add(action)
        });
        mailAudit=r.audit;
        return r.result;
      },
      layers:{firstBlockedPromptEnvelope:withStewardOwnerPromptFrontier},
      registeredTrialIds:trialIds,
      nativeRootActionLimit:LIMIT
    });
    return selectedResult;
  });
  const wrapped=withOwnerVoltAcrossNativeMatches(()=>
    withStewardInnermostOwnerPrompts(execute,{headless}),{headless});
  const selected=selectedResult??wrapped.result?.result;
  assert.ok(selected, 'Selected v8 policy must return its native result');
  const returned=selected.rawDevelopment?.rows??[];
  const rows=REGISTER.trials.map(trial=>
    summarizeRow(returned.find(x=>(x.trial?.id??x.id)===trial.id),trial));
  return {
    treatment:withMail,
    rows,rootTape,
    mailAudit:mailAudit===null?null:{
      attempts:mailAudit.attempts,
      ownerRootPassesSeen:mailAudit.ownerRootPassesSeen,
      actualMailItemRootsBySeat:mailAudit.actualMailItemRootsBySeat,
      nativeStoreResolvedBySeat:mailAudit.nativeStoreResolvedBySeat,
      physicalTrainerToHandBySeat:mailAudit.physicalTrainerToHandBySeat,
      actualMailEvents:mailAudit.actualMailEvents,
      revealedTrainers:mailAudit.revealedTrainers,
      noPromptAfterMailBySeat:mailAudit.noPromptAfterMailBySeat,
      rejectedPromptActions:mailAudit.rejectedPromptActions,
      unsettledPromptActions:mailAudit.unsettledPromptActions,
      opponentPrivateZonesRead:mailAudit.opponentPrivateZonesRead
    },
    ownerAbilityConfirmed:abilityAudit?.confirmSettled??null,
    sourceRegistration:selected.rawDevelopment?.sourceRegistration??null,
    sourceRanks:selected.rawDevelopment?.registeredSourceRanks??null,
    returnedNativeRowCount:returned.length,
    rawStateDecoderExecuted:selected.diagnostic?.rawDecoderExecuted??null
  };
}

/** Bound action continuation: a real owner Mail, later opponent, later own root. */
function continuation(mail,roots){
  const idx=roots.findIndex(r=>r.ordinal===mail.ordinal&&
    r.ownerMailAfterPassAction);
  if(idx<0)return {mail,opponent:null,nextSource:null,qualified:false};
  const later=roots.slice(idx+1);
  const mechanical=new Set(['ResolvePromptAction','PassTurnAction',
    'WaitForOpponentAction','WaitPromptAction']);
  const opponent=later.find(x=>x.seat!==mail.seat&&
    !mechanical.has(x.action))??null;
  const nextSource=opponent?later.find(x=>x.seat===mail.seat&&
    x.turn>opponent.turn&&!mechanical.has(x.action))??null:null;
  return {mail,opponent,nextSource,qualified:Boolean(opponent&&nextSource)};
}

function firstDivergence(a,b){
  const n=Math.min(a.length,b.length);
  for(let i=0;i<n;i++){
    const left=a[i],right=b[i];
    if(JSON.stringify([left.action,left.seat,left.turn])!==
       JSON.stringify([right.action,right.seat,right.turn]))
      return {index:i,before:left,after:right};
  }
  return a.length===b.length?null:{
    index:n,before:a[n]??null,after:b[n]??null
  };
}

function run(){
  assert.equal(REGISTER.status,'FROZEN_BEFORE_EXECUTION');
  assert.deepEqual(SOURCE_RANKS,[9,26]);
  assert.equal(REGISTER.trials.length,4);
  const control=runVariant(false),treatment=runVariant(true);
  const panel=REGISTER.trials.map(trial=>{
    const base=control.rows.find(x=>x.id===trial.id);
    const change=treatment.rows.find(x=>x.id===trial.id);
    assert.ok(base&&change);
    const before=control.rootTape.filter(x=>x.trialId===trial.id);
    const after=treatment.rootTape.filter(x=>x.trialId===trial.id);
    const mail=after.filter(x=>x.ownerMailAfterPassAction);
    return {
      trialId:trial.id,rank:trial.rank,seed:trial.seed,
      candidateSeat:trial.candidateSlot,
      control:base,treatment:change,
      firstNativeRootDivergence:firstDivergence(before,after),
      physicalMailRoots:mail,
      ownerMailContinuations:mail.map(x=>continuation(x,after))
    };
  });
  const audit=treatment.mailAudit;
  const accepted=panel.reduce((n,x)=>n+x.physicalMailRoots.length,0);
  const physical=audit.physicalTrainerToHandBySeat.reduce((n,x)=>n+x,0);
  const acceptance={
    nativeOwnerMailRoots:accepted,
    physicalTrainerSearchSettlements:physical,
    noNativeMailPromptFailures:
      audit.rejectedPromptActions===0&&audit.unsettledPromptActions===0,
    atLeastOneOpponentAndLaterOwner:
      panel.some(x=>x.ownerMailContinuations.some(y=>y.qualified)),
    materialActionObserved:accepted>0&&physical>0
  };
  return {
    schema:VERSION,registration:REGISTER,
    enginePin:REGISTER.enginePin,
    exactOriginalPublishedSixtiesUnchanged:true,
    bilateralSourceRanks:SOURCE_RANKS,
    commonDevelopmentPolicy:'v8+ownerAbilityConfirm',
    control:control.rows,treatment:treatment.rows,
    treatmentMailAudit:audit,panel,
    acceptance,competitiveGamesQualified:0,estimatedWinRate:null
  };
}

function save(report){
  const dir=path.join(ROOT,'artifacts/agent7-mail-broad-coverage');
  fs.mkdirSync(dir,{recursive:true});
  const dest=path.join(dir,'rank9-rank26-paired.json');
  const fd=fs.openSync(dest+'.lock','wx');
  const tmp=dest+'.'+process.pid+'.'+randomUUID()+'.tmp';
  try{
    fs.writeFileSync(tmp,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
    fs.renameSync(tmp,dest);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(dest+'.lock');
  }
  return dest;
}

if(require.main===module){
  const report=run(),file=save(report);
  process.stdout.write(JSON.stringify({
    schema:report.schema,file,
    nativeOwnerMailRoots:report.acceptance.nativeOwnerMailRoots,
    physicalTrainerSearchSettlements:
      report.acceptance.physicalTrainerSearchSettlements,
    atLeastOneOpponentAndLaterOwner:
      report.acceptance.atLeastOneOpponentAndLaterOwner,
    panel:report.panel.map(x=>({
      trialId:x.trialId,rank:x.rank,
      controlStatus:x.control.status,
      treatmentStatus:x.treatment.status,
      rootChange:x.firstNativeRootDivergence,
      mailActionRoots:x.physicalMailRoots,
      continuationSuccess:x.ownerMailContinuations.some(y=>y.qualified)
    })),
    competitiveGamesQualified:0
  },null,2)+'\n');
  if(!report.acceptance.materialActionObserved||
    !report.acceptance.noNativeMailPromptFailures)process.exitCode=1;
}

module.exports={VERSION,REGISTER,runVariant,continuation,
  firstDivergence,run,save};
