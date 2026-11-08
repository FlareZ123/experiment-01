'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {randomUUID}=require('node:crypto');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {runSelectedIssue25V0}=
  require('./agent36-issue25-selected-v0.cjs');
const {withStewardOwnerPromptFrontier}=
  require('./agent36-issue25-steward-selected-v4.cjs');
const {withStewardInnermostOwnerPrompts}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {withCommonOwnerThornsRoot}=
  require('./agent36-issue25-common-v6.cjs');
const {withOwnerVoltAcrossNativeMatches}=
  require('./agent36-issue25-common-v7.cjs');
const {withOwnerQuickBallAfterPass}=
  require('../twinleaf/agent7-quick-ball-native-after-pass.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTER=require(
  '../../results/aichi-2026/registrations/agent7-quick-ball-deadvip-rank5-rank26-20261108-v2.json');
const VERSION=REGISTER.schema;
const ROOT_LIMIT=REGISTER.nativeRootActionsPerArm;

/** Freeze one original source list, one reference, and two physical seats. */
function reduceNative(row,trial){
  return {
    id:trial.id,sourceRank:trial.rank,seed:trial.seed,
    candidateSeat:trial.candidateSlot,sourceSeat:
      trial.candidateSlot==='A'?1:0,
    status:row?.status??null,finished:row?.finished??null,
    nativeWinner:row?.finished===true?row.winner??null:null,
    nativeEndReason:row?.endReason??null,
    rootActionsAccepted:row?.actionCount??null,
    finalPrizeCounts:row?.finalPrizes??null,
    error:row?.error?.code??null,
    nativeFailureStage:row?.nativeAbortEvidence?.failureStage??null,
    initialRootActions:row?.rootActionLedger?.slice(0,20)??[]
  };
}

/** The exact same source/opponent frame is run with one explicit opt-in. */
function runVariant(withQuickBall){
  const base=path.join(ROOT,'vendor/twinleaf/ptcg-server/output');
  const native=p=>require(path.join(base,p));
  const headless=require('../twinleaf/headless.cjs');
  const {Store}=native('game/store/store');
  let selectedResult=null,abilityAudit=null,quickBallAudit=null;
  const trials=REGISTER.trials.map(t=>({...t}));
  const trialIds=trials.map(t=>t.id);
  const execute=()=>withCommonOwnerThornsRoot(()=>{
    selectedResult=runSelectedIssue25V0({
      runner:options=>{
        const development=()=>runDevelopment({
          ...options,
          actorOnlyComposition:true,
          sourceIndependentCommonPolicy:true,
          bilateralSpecialEnergyRoot:true,
          nativeAcceptedTargets:true,
          nativeRootActionLimit:ROOT_LIMIT,
          registeredTrials:trials,
          registeredFrameName:REGISTER.registeredFrameName,
          allowAdditionalOriginalSourceRanks:true,
          allowSingleCandidatePerGroup:true,
          paperQuickBallPayment:true,
          nativeSetupCoinChoiceReceipt:true,
          isolatePolicyRandomness:true,
          isolatePhysicalShuffleRandomnessAfterSetup:true
        });
        const confirmed=()=>{
          const r=require('../twinleaf/agent36-owner-ability-confirm-policy.cjs')
            .withOwnerAbilityConfirmPolicy(development);
          abilityAudit=r.audit;
          return r.result;
        };
        if(!withQuickBall)return confirmed();
        const r=withOwnerQuickBallAfterPass(confirmed,{
          headless,Store,
          SimpleTacticsAi:native('simple-bot/simple-tactics-ai').SimpleTacticsAi,
          PlayCardAction:native('game/store/actions/play-card-action').PlayCardAction,
          ResolvePromptAction:native(
            'game/store/actions/resolve-prompt-action').ResolvePromptAction,
          trialIds
        });
        quickBallAudit=r.audit;
        return r.result;
      },
      layers:{firstBlockedPromptEnvelope:withStewardOwnerPromptFrontier},
      registeredTrialIds:trialIds,
      nativeRootActionLimit:ROOT_LIMIT
    });
    return selectedResult;
  });
  const wrapped=withOwnerVoltAcrossNativeMatches(()=>
    withStewardInnermostOwnerPrompts(execute,{headless}),{headless});
  const selected=selectedResult??wrapped.result?.result;
  assert.ok(selected,'Native development returned no selected result');
  const returned=selected.rawDevelopment?.rows??[];
  const rows=REGISTER.trials.map(trial=>
    reduceNative(returned.find(row=>
      (row.trial?.id??row.id)===trial.id),trial));
  return {
    withQuickBall,rows,
    quickBallAudit,
    abilityConfirmations:abilityAudit?.confirmSettled??null,
    registeredSourceRanks:selected.rawDevelopment?.registeredSourceRanks??null,
    registeredTrialCount:selected.rawDevelopment?.registeredTrialCount??null,
    nativeReturnedRows:returned.length,
    originalNativeRawDecoderExecuted:selected.diagnostic?.rawDecoderExecuted??null
  };
}

function run(){
  assert.equal(REGISTER.status,'FROZEN_BEFORE_EXECUTION');
  assert.deepEqual(REGISTER.sourceRanks,[5,26]);
  assert.equal(REGISTER.trials.length,4);
  const before=runVariant(false);
  const after=runVariant(true);
  const audit=after.quickBallAudit;
  assert.ok(audit);
  const byTrial=REGISTER.trials.map(t=>({
    id:t.id,rank:t.rank,sourceSeat:t.candidateSlot==='A'?1:0,
    control:before.rows.find(x=>x.id===t.id),
    treatment:after.rows.find(x=>x.id===t.id),
    quickBallNativeActions:audit.actualEvents.filter(x=>x.trialId===t.id)
  }));
  return {
    schema:VERSION,enginePin:REGISTER.enginePin,
    registrationPath:'results/aichi-2026/registrations/agent7-quick-ball-deadvip-rank5-rank26-20261108-v2.json',
    originalPublishedSixtiesUnchanged:true,
    nativeRootLimit:ROOT_LIMIT,
    control:before.rows,treatment:after.rows,
    nativeQuickBallAudit:audit,byTrial,
    ownerAttemptedRootCount:audit.rootAttempts,
    ownerStoreAcceptedRootCount:audit.rootAccepted,
    physicalVipDiscardCount:audit.physicalDiscardConfirmed,
    physicalBasicToHandCount:audit.physicalBasicToHandConfirmed,
    nativePromptFailureCount:audit.ownerPromptRejected,
    opportunityObserved:audit.rootAccepted>0,
    fullyResolvedQuickBallObserved:
      audit.physicalVipDiscardConfirmed>0&&
      audit.physicalBasicToHandConfirmed>0,
    competitiveGamesQualified:0,estimatedWinRate:null
  };
}

function save(report){
  const dir=path.join(ROOT,'artifacts/agent7-v8-quick-ball');
  fs.mkdirSync(dir,{recursive:true});
  const target=path.join(dir,'rank5-rank26-v2-paired-native.json');
  const lock=target+'.lock',fd=fs.openSync(lock,'wx');
  const tmp=target+'.'+process.pid+'.'+randomUUID()+'.tmp';
  try{
    fs.writeFileSync(tmp,JSON.stringify(report,null,2)+'\n',
      {flag:'wx'});
    fs.renameSync(tmp,target);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
  return target;
}

if(require.main===module){
  const report=run(),file=save(report);
  process.stdout.write(JSON.stringify({
    schema:report.schema,file,
    nativeQuickBallRootProposals:report.ownerAttemptedRootCount,
    nativeQuickBallRootsAccepted:report.ownerStoreAcceptedRootCount,
    physicalVipDiscards:report.physicalVipDiscardCount,
    physicalBasicsToHand:report.physicalBasicToHandCount,
    unknownPromptCount:report.nativeQuickBallAudit.unhandledOwnQuickBallPrompt,
    promptFailures:report.nativePromptFailureCount,
    byTrial:report.byTrial.map(x=>({
      id:x.id,rank:x.rank,
      control:x.control.status,treatment:x.treatment.status,
      nativeQuickBallEvents:x.quickBallNativeActions
    })),competitiveGamesQualified:0
  },null,2)+'\n');
  // The opportunity can be absent in all four natural games. That is a
  // measured negative, never an invented success. Fail on unsafe payments.
  if(report.nativePromptFailureCount>0||
     report.nativeQuickBallAudit.rootRejected>0)process.exitCode=1;
}

module.exports={VERSION,REGISTER,runVariant,run,save};
